import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import stringSimilarity from "string-similarity";
import path from "path";
import fs from "fs";
import multer from "multer";

const prisma = new PrismaClient();

function formatDateForFilename(date: Date) {
  // Misal: 2024-07-05 20.35.55
  return date
    .toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')
    .replace(/:/g, '.');
}

function formatDateForFilenameJakarta(date: Date) {
  // Offset Jakarta UTC+7
  const jakartaOffsetMs = 7 * 60 * 60 * 1000;
  const jakarta = new Date(date.getTime() + jakartaOffsetMs);

  const yyyy = jakarta.getFullYear();
  const mm = String(jakarta.getMonth() + 1).padStart(2, '0');
  const dd = String(jakarta.getDate()).padStart(2, '0');
  const HH = String(jakarta.getHours()).padStart(2, '0');
  const MM = String(jakarta.getMinutes()).padStart(2, '0');
  const SS = String(jakarta.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${HH}.${MM}.${SS}`;
}


class WarehouseStock {
  // Konfigurasi Multer
  upload = multer({ storage: multer.memoryStorage() });

  // Fungsi normalisasi string untuk matching
  normalizeString = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .trim();
  };


  updateStockFromExcel = async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ message: "Excel file is required." });
        return;
      }
      const tempFilename = `stock_temp_${Date.now()}.xlsx`;
      const uploadDir = path.join(__dirname, '../../uploads/excel');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      // Ganti penamaan file:
      const filePath = path.join(uploadDir, tempFilename);
      fs.writeFileSync(filePath, file.buffer);

      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Ambil data per baris mentah (array of array)
      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Cari baris header: harus ada "Item Code" dan/atau "Business Unit"
      let headerIndex = rawRows.findIndex(row => {
        if (!Array.isArray(row)) return false;
        const joined = row.map(cell => (cell || '').toString().toLowerCase()).join('|');
        return joined.includes('item code') && joined.includes('business unit');
      });
      if (headerIndex === -1) {
        res.status(400).json({ message: "Header 'Item Code' dan 'Business Unit' tidak ditemukan di Excel." });
        return;
      }

      // Ambil header dan data setelahnya saja
      const headerRow = rawRows[headerIndex];
      const dataRows = rawRows.slice(headerIndex + 1);

      // Konversi ke array of object (untuk sheet_to_json)
      const normalizedSheet = [headerRow, ...dataRows];
      const sheetData = XLSX.utils.sheet_to_json<any>(XLSX.utils.aoa_to_sheet(normalizedSheet));

      const allItemCodes = await prisma.itemCode.findMany({
        where: { DeletedAt: null },
        select: { Id: true, Name: true, PartNumberId: true }
      });


      const allWarehouses = await prisma.warehouse.findMany({
        where: { DeletedAt: null },
        select: { Id: true, BusinessUnit: true }
      });

      const adminId = req.admin?.Id || null;

      const uploadLog = await prisma.stockHistoryExcelUploadLog.create({
        data: {
          FilePath: filePath,
          CreatedAt: new Date(),
        },
      });


      const updatedItems: any[] = [];
      const updatedPOs: any[] = [];
      const failedUpdates: any[] = [];

      const qtyPOMap = new Map<string, number>();

      for (const [index, row] of sheetData.entries()) {
        try {
          const excelItemCode = row["Item Code"]?.toString().trim();
          const businessUnit = row["Business Unit"]?.toString().trim();
          const rawQtyOnHand = row["Qty On Hand"];
          const rawQtyPO = row["Qty On PO"];

          if (!excelItemCode || !businessUnit) {
            failedUpdates.push({ row: index + 2, reason: "Missing Item Code or Business Unit" });
            continue;
          }

          const normalizedItemCode = this.normalizeString(excelItemCode);
          const qtyOnHand = Number(rawQtyOnHand) || 0;
          const qtyPO = Number(rawQtyPO) || 0;
          qtyPOMap.set(normalizedItemCode, qtyPO);

          let matchedItem = allItemCodes.find(item =>
            this.normalizeString(item.Name) === normalizedItemCode
          );

          if (!matchedItem) {
            // 🔎 CARI PARTNUMBER yang mirip prefix
            const allPartNumbers = await prisma.partNumber.findMany({
              where: { DeletedAt: null },
              select: { Id: true, Name: true }
            });

            const foundPart = allPartNumbers.find(pn =>
              this.normalizeString(pn.Name) &&
              normalizedItemCode.startsWith(this.normalizeString(pn.Name))
            );

            if (foundPart) {
              // Buatkan itemcode baru dan konekkan ke partnumber tsb
              const created = await prisma.itemCode.create({
                data: {
                  Name: excelItemCode,
                  PartNumberId: foundPart.Id,
                  CreatedAt: new Date(),
                }
              });
              allItemCodes.push({ Id: created.Id, Name: created.Name, PartNumberId: foundPart.Id });
              matchedItem = created;
            }
          }
          if (matchedItem && !matchedItem.PartNumberId) {
            // PATCH: jika itemcode belum punya PartNumberId, coba cari dari prefix
            const allPartNumbers = await prisma.partNumber.findMany({
              where: { DeletedAt: null },
              select: { Id: true, Name: true }
            });

            const foundPart = allPartNumbers.find(pn =>
              this.normalizeString(pn.Name) &&
              normalizedItemCode.startsWith(this.normalizeString(pn.Name))
            );

            if (foundPart) {
              await prisma.itemCode.update({
                where: { Id: matchedItem.Id },
                data: { PartNumberId: foundPart.Id }
              });
              // Update juga di allItemCodes supaya cache ID nya ikut update
              const idx = allItemCodes.findIndex(it => it.Id === matchedItem.Id);
              if (idx !== -1) allItemCodes[idx].PartNumberId = foundPart.Id;
              matchedItem.PartNumberId = foundPart.Id;
            }
          }


          if (!matchedItem) {
            failedUpdates.push({ row: index + 2, item: excelItemCode, reason: "ItemCode not found and no matching PartNumber" });
            continue;
          }

          // Ganti blok pencarian warehouse dengan:
          const matchedWarehouse =
            allWarehouses.find(wh =>
              this.normalizeString(wh.BusinessUnit) === this.normalizeString(businessUnit)
            ) ||
            await prisma.warehouse.create({
              data: {
                BusinessUnit: businessUnit,
                Name: null,
                CreatedAt: new Date()
              }
            });

          // Tambahkan ke cache agar tidak dibuat lagi
          if (!allWarehouses.some(wh => this.normalizeString(wh.BusinessUnit) === this.normalizeString(businessUnit))) {
            allWarehouses.push(matchedWarehouse);
          }

          const warehouseStock = await prisma.warehouseStock.findFirst({
            where: {
              ItemCodeId: matchedItem.Id,
              WarehouseId: matchedWarehouse.Id
            }
          });

          const itemBefore = await prisma.itemCode.findUnique({
            where: { Id: matchedItem.Id },
            select: { QtyPO: true }
          });

          const beforeQtyPO = itemBefore?.QtyPO ?? 0;

          if (warehouseStock) {
            const beforeQty = warehouseStock.QtyOnHand;

            const noteParts = [];

            if (qtyOnHand !== beforeQty) {
              await prisma.warehouseStock.update({
                where: { Id: warehouseStock.Id },
                data: {
                  QtyOnHand: qtyOnHand,
                  UpdatedAt: new Date()
                }
              });

              noteParts.push("Updated from Excel upload");
              await prisma.stockHistory.create({
                data: {
                  WarehouseStockId: warehouseStock.Id,
                  ItemCodeId: matchedItem.Id,
                  QtyBefore: beforeQty,
                  QtyAfter: qtyOnHand,
                  Note: noteParts.join(" | "),
                  UploadLogId: uploadLog.Id,
                  AdminId: adminId,
                }
              });
            }



            if (qtyOnHand !== beforeQty) {
              updatedItems.push({
                itemCode: excelItemCode,
                businessUnit,
                beforeQty,
                afterQty: qtyOnHand,
                updatedQtyPO: qtyPO
              });
            }
          } else {
            const newWarehouseStock = await prisma.warehouseStock.create({
              data: {
                ItemCodeId: matchedItem.Id,
                WarehouseId: matchedWarehouse.Id,
                QtyOnHand: qtyOnHand,
                CreatedAt: new Date(),
                DeletedAt: qtyOnHand === 0 ? new Date() : null
              }
            });

            await prisma.stockHistory.create({
              data: {
                WarehouseStockId: newWarehouseStock.Id,
                ItemCodeId: matchedItem.Id,
                QtyBefore: 0,
                QtyAfter: qtyOnHand,
                Note: `Created from Excel upload` + (qtyPO !== 0 ? ` | QtyPO: ${qtyPO}` : ""),
                UploadLogId: uploadLog.Id,
                AdminId: adminId,
              }
            });

            await prisma.itemCode.update({
              where: { Id: matchedItem.Id },
              data: {
                QtyPO: qtyPO
              }
            });

            updatedItems.push({
              itemCode: excelItemCode,
              businessUnit,
              beforeQty: 0,
              afterQty: qtyOnHand,
              updatedQtyPO: qtyPO
            });
          }
        } catch (innerError) {
          console.error(`Error processing row ${index + 2}:`, innerError);
          failedUpdates.push({ row: index + 2, reason: `Error: ${(innerError as Error).message}` });
        }
      }
      for (const [normItemCode, qtyPO] of qtyPOMap.entries()) {
        const itemCodeObj = allItemCodes.find(ic => this.normalizeString(ic.Name) === normItemCode);
        if (!itemCodeObj) continue;

        const beforeItemCode = await prisma.itemCode.findUnique({
          where: { Id: itemCodeObj.Id },
          select: { QtyPO: true }
        });
        const beforeQtyPO = beforeItemCode?.QtyPO ?? 0;

        if (beforeQtyPO !== qtyPO) {
          await prisma.itemCode.update({
            where: { Id: itemCodeObj.Id },
            data: { QtyPO: qtyPO }
          });
          await prisma.stockHistory.create({
            data: {
              WarehouseStockId: null,
              ItemCodeId: itemCodeObj.Id,
              QtyBefore: beforeQtyPO,
              QtyAfter: qtyPO,
              Note: "QtyPO updated from Excel (global)",
              UpdatedAt: new Date(),
              UploadLogId: uploadLog.Id,
              AdminId: adminId,
            }
          });
          updatedPOs.push({
            itemCode: itemCodeObj.Name,
            beforeQtyPO,
            afterQtyPO: qtyPO
          });
        }
      }
      // 🔁 Ambil semua ItemCode dari Excel dalam bentuk normalisasi
      const itemCodesInExcel = new Set<string>(
        sheetData
          .map(row => row["Item Code"])
          .filter(Boolean)
          .map(val => this.normalizeString(val.toString().trim()))
      );

      // 🔁 Ambil semua kombinasi item+warehouse dari Excel juga
      const itemWarehouseInExcel = new Set<string>(
        sheetData
          .map(row => {
            const item = row["Item Code"]?.toString().trim();
            const bu = row["Business Unit"]?.toString().trim();
            return item && bu ? `${this.normalizeString(item)}___${this.normalizeString(bu)}` : null;
          })
          .filter(Boolean) as string[]
      );

      sheetData.forEach((row) => {
        const item = this.normalizeString(row["Item Code"]?.toString() || "");
        const bu = this.normalizeString(row["Business Unit"]?.toString() || "");
        if (item) itemCodesInExcel.add(item);
        if (item && bu) itemWarehouseInExcel.add(`${item}___${bu}`);
      });

      const allStocks = await prisma.warehouseStock.findMany({
        where: { DeletedAt: null },
        include: {
          ItemCode: { select: { Name: true, QtyPO: true } },
          Warehouse: { select: { BusinessUnit: true } }
        }
      });

      for (const stock of allStocks) {
        const itemNorm = this.normalizeString(stock.ItemCode.Name);
        const buNorm = this.normalizeString(stock.Warehouse.BusinessUnit || "");
        const comboKey = `${itemNorm}___${buNorm}`;

        // Langkah 1: Jika ItemCode tidak ditemukan di Excel → semua cabang = 0
        if (!itemCodesInExcel.has(itemNorm)) {
          if (stock.QtyOnHand !== 0) {
            await prisma.warehouseStock.update({
              where: { Id: stock.Id },
              data: {
                QtyOnHand: 0,
                UpdatedAt: new Date()
              }
            });

            await prisma.stockHistory.create({
              data: {
                WarehouseStockId: stock.Id,
                ItemCodeId: stock.ItemCodeId,
                QtyBefore: stock.QtyOnHand,
                QtyAfter: 0,
                Note: "Stock nulled: ItemCode not found in Excel",
                UploadLogId: uploadLog.Id,
                AdminId: adminId,
              }
            });

            updatedItems.push({
              itemCode: stock.ItemCode.Name,
              businessUnit: stock.Warehouse.BusinessUnit,
              beforeQty: stock.QtyOnHand,
              afterQty: 0,
              updatedQtyPO: stock.ItemCode.QtyPO
            });
          }

          continue;
        }

        // Langkah 2: Jika warehouse untuk ItemCode ini tidak ditemukan di Excel
        if (!itemWarehouseInExcel.has(comboKey)) {
          if (stock.QtyOnHand !== 0) {
            await prisma.warehouseStock.update({
              where: { Id: stock.Id },
              data: {
                QtyOnHand: 0,
                UpdatedAt: new Date()
              }
            });

            await prisma.stockHistory.create({
              data: {
                WarehouseStockId: stock.Id,
                ItemCodeId: stock.ItemCodeId,
                QtyBefore: stock.QtyOnHand,
                QtyAfter: 0,
                Note: "Stock nulled: ItemCode+Warehouse not found in Excel",
                UploadLogId: uploadLog.Id,
                AdminId: adminId,
              }
            });

            updatedItems.push({
              itemCode: stock.ItemCode.Name,
              businessUnit: stock.Warehouse.BusinessUnit,
              beforeQty: stock.QtyOnHand,
              afterQty: 0,
              updatedQtyPO: stock.ItemCode.QtyPO
            });
          }
        }
      }
      // Ambil Admin dan waktu dari stockHistory log
      const historyWithAdmin = await prisma.stockHistory.findFirst({
        where: { UploadLogId: uploadLog.Id },
        include: { Admin: true },
      });

      function pad2(val: number | string): string { return String(val).padStart(2, "0"); }
      function formatDateLikeStockHistory(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = pad2(date.getMonth() + 1);
        const dd = pad2(date.getDate());
        const HH = pad2(date.getHours());
        const MM = pad2(date.getMinutes());
        const SS = pad2(date.getSeconds());
        return `${yyyy}-${mm}-${dd} ${HH}.${MM}.${SS}`;
      }

      const adminName = (historyWithAdmin?.Admin?.Name || "unknown").replace(/\s+/g, '_');
      const wkt = formatDateLikeStockHistory(historyWithAdmin?.UpdatedAt || new Date());
      const finalFilename = `stock_${adminName} ${wkt}.xlsx`;
      const finalFilePath = path.join(uploadDir, finalFilename);

      // Rename file temp ke nama final
      fs.renameSync(filePath, finalFilePath);

      // Update FilePath di uploadLog
      await prisma.stockHistoryExcelUploadLog.update({
        where: { Id: uploadLog.Id },
        data: { FilePath: finalFilePath }
      });

      res.json({
        success: true,
        message: "Excel stock update completed",
        stats: {
          totalProcessed: updatedItems.length + failedUpdates.length,
          updated: updatedItems.length,
          failed: failedUpdates.length,
          updatedPO: updatedPOs.length
        },
        details: {
          updatedItems,
          updatedPOs,
          failedMatches: failedUpdates
        }
      });
    } catch (error) {
      console.error("Global error:", error);
      res.status(500).json({ success: false, message: "Internal server error", error: (error as Error).message });
    }
  };
}

const warehouseStockController = new WarehouseStock();

// Untuk di-route
export const updateStockFromExcel = warehouseStockController.updateStockFromExcel;
export const upload = warehouseStockController.upload;

export default warehouseStockController;
