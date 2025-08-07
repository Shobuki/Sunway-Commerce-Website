"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.updateStockFromExcel = void 0;
const client_1 = require("@prisma/client");
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const prisma = new client_1.PrismaClient();
function formatDateForFilename(date) {
    // Misal: 2024-07-05 20.35.55
    return date
        .toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '')
        .replace(/:/g, '.');
}
function formatDateForFilenameJakarta(date) {
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
    constructor() {
        // Konfigurasi Multer
        this.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
        // Fungsi normalisasi string untuk matching
        this.normalizeString = (str) => {
            return str
                .replace(/[^a-zA-Z0-9]/g, '')
                .toLowerCase()
                .trim();
        };
        this.updateStockFromExcel = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            console.log("[DEBUG] Mulai proses updateStockFromExcel");
            try {
                const file = req.file;
                if (!file) {
                    console.error("[ERROR] Tidak ada file Excel di req.file");
                    res.status(400).json({ message: "Excel file is required." });
                    return;
                }
                console.log("[DEBUG] File upload:", file.originalname, "Size:", file.size);
                const tempFilename = `stock_temp_${Date.now()}.xlsx`;
                const uploadDir = path_1.default.join(__dirname, '../../uploads/excel');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                // Ganti penamaan file:
                const filePath = path_1.default.join(uploadDir, tempFilename);
                fs_1.default.writeFileSync(filePath, file.buffer);
                const workbook = XLSX.read(file.buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                console.log("[DEBUG] Sheet terbaca:", sheetName);
                // Ambil data per baris mentah (array of array)
                const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                console.log("[DEBUG] Jumlah row file:", rawRows.length);
                // Cari baris header: harus ada "Item Code" dan/atau "Business Unit"
                let headerIndex = rawRows.findIndex(row => {
                    if (!Array.isArray(row))
                        return false;
                    const joined = row.map(cell => (cell || '').toString().toLowerCase()).join('|');
                    return joined.includes('item code') && joined.includes('business unit');
                });
                if (headerIndex === -1) {
                    res.status(400).json({ message: "Header 'Item Code' dan 'Business Unit' tidak ditemukan di Excel." });
                    return;
                }
                console.log("[DEBUG] Header di row:", headerIndex);
                // Ambil header dan data setelahnya saja
                const headerRow = rawRows[headerIndex];
                const dataRows = rawRows.slice(headerIndex + 1);
                // Konversi ke array of object (untuk sheet_to_json)
                const normalizedSheet = [headerRow, ...dataRows];
                const sheetData = XLSX.utils.sheet_to_json(XLSX.utils.aoa_to_sheet(normalizedSheet));
                console.log("[DEBUG] Data sheetData:", sheetData.length, "baris");
                if (sheetData.length)
                    console.log("[DEBUG] Contoh data pertama:", sheetData[0]);
                const allItemCodes = yield prisma.itemCode.findMany({
                    where: { DeletedAt: null },
                    select: { Id: true, Name: true, PartNumberId: true }
                });
                const allWarehouses = yield prisma.warehouse.findMany({
                    where: { DeletedAt: null },
                    select: { Id: true, BusinessUnit: true }
                });
                console.log("[DEBUG] DB ItemCode:", allItemCodes.length, "Warehouse:", allWarehouses.length);
                const adminId = ((_a = req.admin) === null || _a === void 0 ? void 0 : _a.Id) || null;
                console.log("[DEBUG] AdminID:", adminId);
                const uploadLog = yield prisma.stockHistoryExcelUploadLog.create({
                    data: {
                        FilePath: filePath,
                        CreatedAt: new Date(),
                    },
                });
                console.log("[DEBUG] UploadLog ID:", uploadLog.Id);
                const updatedItems = [];
                const updatedPOs = [];
                const failedUpdates = [];
                const qtyPOMap = new Map();
                for (const [index, row] of sheetData.entries()) {
                    try {
                        const excelItemCode = (_b = row["Item Code"]) === null || _b === void 0 ? void 0 : _b.toString().trim();
                        const businessUnit = (_c = row["Business Unit"]) === null || _c === void 0 ? void 0 : _c.toString().trim();
                        const rawQtyOnHand = row["Qty On Hand"];
                        const rawQtyPO = row["Qty On PO"];
                        if (!excelItemCode || !businessUnit) {
                            // console.warn(`[WARN] Row ${index + 2} missing Item Code / Business Unit`);
                            failedUpdates.push({ row: index + 2, reason: "Missing Item Code or Business Unit" });
                            continue;
                        }
                        const normalizedItemCode = this.normalizeString(excelItemCode);
                        const qtyOnHand = Number(rawQtyOnHand) || 0;
                        const qtyPO = Number(rawQtyPO) || 0;
                        qtyPOMap.set(normalizedItemCode, qtyPO);
                        let matchedItem = allItemCodes.find(item => this.normalizeString(item.Name) === normalizedItemCode);
                        if (!matchedItem) {
                            // 🔎 CARI PARTNUMBER yang mirip prefix
                            const allPartNumbers = yield prisma.partNumber.findMany({
                                where: { DeletedAt: null },
                                select: { Id: true, Name: true }
                            });
                            const foundPart = allPartNumbers.find(pn => this.normalizeString(pn.Name) &&
                                normalizedItemCode.startsWith(this.normalizeString(pn.Name)));
                            if (foundPart) {
                                // Buatkan itemcode baru dan konekkan ke partnumber tsb
                                const created = yield prisma.itemCode.create({
                                    data: {
                                        Name: excelItemCode,
                                        PartNumberId: foundPart.Id,
                                        CreatedAt: new Date(),
                                    }
                                });
                                allItemCodes.push({ Id: created.Id, Name: created.Name, PartNumberId: foundPart.Id });
                                matchedItem = created;
                                console.log(`[INFO] Baris ${index + 2}: ItemCode baru dibuat, id=${created.Id}`);
                            }
                            else {
                                failedUpdates.push({ row: index + 2, item: excelItemCode, reason: "ItemCode not found and no matching PartNumber" });
                                //  console.warn(`[WARN] Row ${index + 2}: Tidak ditemukan matching ItemCode/PartNumber`);
                                continue;
                            }
                        }
                        if (matchedItem && !matchedItem.PartNumberId) {
                            // PATCH: jika itemcode belum punya PartNumberId, coba cari dari prefix
                            const allPartNumbers = yield prisma.partNumber.findMany({
                                where: { DeletedAt: null },
                                select: { Id: true, Name: true }
                            });
                            const foundPart = allPartNumbers.find(pn => this.normalizeString(pn.Name) &&
                                normalizedItemCode.startsWith(this.normalizeString(pn.Name)));
                            if (foundPart) {
                                yield prisma.itemCode.update({
                                    where: { Id: matchedItem.Id },
                                    data: { PartNumberId: foundPart.Id }
                                });
                                // Update juga di allItemCodes supaya cache ID nya ikut update
                                const idx = allItemCodes.findIndex(it => it.Id === matchedItem.Id);
                                if (idx !== -1)
                                    allItemCodes[idx].PartNumberId = foundPart.Id;
                                matchedItem.PartNumberId = foundPart.Id;
                                console.log(`[DEBUG] Baris ${index + 2}: ItemCode patch PartNumberId => ${foundPart.Id}`);
                            }
                        }
                        if (!matchedItem) {
                            failedUpdates.push({ row: index + 2, item: excelItemCode, reason: "ItemCode not found and no matching PartNumber" });
                            continue;
                        }
                        // Ganti blok pencarian warehouse dengan:
                        const matchedWarehouse = allWarehouses.find(wh => this.normalizeString(wh.BusinessUnit) === this.normalizeString(businessUnit)) ||
                            (yield prisma.warehouse.create({
                                data: {
                                    BusinessUnit: businessUnit,
                                    Name: null,
                                    CreatedAt: new Date()
                                }
                            }));
                        // Tambahkan ke cache agar tidak dibuat lagi
                        if (!allWarehouses.some(wh => this.normalizeString(wh.BusinessUnit) === this.normalizeString(businessUnit))) {
                            allWarehouses.push(matchedWarehouse);
                            console.log(`[INFO] Warehouse baru dibuat:`, matchedWarehouse.Id, businessUnit);
                        }
                        const warehouseStock = yield prisma.warehouseStock.findFirst({
                            where: {
                                ItemCodeId: matchedItem.Id,
                                WarehouseId: matchedWarehouse.Id
                            }
                        });
                        const itemBefore = yield prisma.itemCode.findUnique({
                            where: { Id: matchedItem.Id },
                            select: { QtyPO: true }
                        });
                        const beforeQtyPO = (_d = itemBefore === null || itemBefore === void 0 ? void 0 : itemBefore.QtyPO) !== null && _d !== void 0 ? _d : 0;
                        if (warehouseStock) {
                            const beforeQty = warehouseStock.QtyOnHand;
                            const noteParts = [];
                            if (qtyOnHand !== beforeQty) {
                                yield prisma.warehouseStock.update({
                                    where: { Id: warehouseStock.Id },
                                    data: {
                                        QtyOnHand: qtyOnHand,
                                        UpdatedAt: new Date()
                                    }
                                });
                                noteParts.push("Updated from Excel upload");
                                yield prisma.stockHistory.create({
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
                                //  console.log(`[INFO] Row ${index + 2}: Update stok ${excelItemCode} @${businessUnit} => ${beforeQty} -> ${qtyOnHand}`);
                            }
                        }
                        else {
                            const newWarehouseStock = yield prisma.warehouseStock.create({
                                data: {
                                    ItemCodeId: matchedItem.Id,
                                    WarehouseId: matchedWarehouse.Id,
                                    QtyOnHand: qtyOnHand,
                                    CreatedAt: new Date(),
                                    DeletedAt: qtyOnHand === 0 ? new Date() : null
                                }
                            });
                            yield prisma.stockHistory.create({
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
                            yield prisma.itemCode.update({
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
                            console.log(`[INFO] Row ${index + 2}: INSERT stok baru ${excelItemCode} @${businessUnit} => ${qtyOnHand}`);
                        }
                    }
                    catch (innerError) {
                        console.error(`Error processing row ${index + 2}:`, innerError);
                        failedUpdates.push({ row: index + 2, reason: `Error: ${innerError.message}` });
                    }
                }
                for (const [normItemCode, qtyPO] of qtyPOMap.entries()) {
                    const itemCodeObj = allItemCodes.find(ic => this.normalizeString(ic.Name) === normItemCode);
                    if (!itemCodeObj)
                        continue;
                    const beforeItemCode = yield prisma.itemCode.findUnique({
                        where: { Id: itemCodeObj.Id },
                        select: { QtyPO: true }
                    });
                    const beforeQtyPO = (_e = beforeItemCode === null || beforeItemCode === void 0 ? void 0 : beforeItemCode.QtyPO) !== null && _e !== void 0 ? _e : 0;
                    if (beforeQtyPO !== qtyPO) {
                        yield prisma.itemCode.update({
                            where: { Id: itemCodeObj.Id },
                            data: { QtyPO: qtyPO }
                        });
                        yield prisma.stockHistory.create({
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
                const itemCodesInExcel = new Set(sheetData
                    .map(row => row["Item Code"])
                    .filter(Boolean)
                    .map(val => this.normalizeString(val.toString().trim())));
                // 🔁 Ambil semua kombinasi item+warehouse dari Excel juga
                const itemWarehouseInExcel = new Set(sheetData
                    .map(row => {
                    var _a, _b;
                    const item = (_a = row["Item Code"]) === null || _a === void 0 ? void 0 : _a.toString().trim();
                    const bu = (_b = row["Business Unit"]) === null || _b === void 0 ? void 0 : _b.toString().trim();
                    return item && bu ? `${this.normalizeString(item)}___${this.normalizeString(bu)}` : null;
                })
                    .filter(Boolean));
                sheetData.forEach((row) => {
                    var _a, _b;
                    const item = this.normalizeString(((_a = row["Item Code"]) === null || _a === void 0 ? void 0 : _a.toString()) || "");
                    const bu = this.normalizeString(((_b = row["Business Unit"]) === null || _b === void 0 ? void 0 : _b.toString()) || "");
                    if (item)
                        itemCodesInExcel.add(item);
                    if (item && bu)
                        itemWarehouseInExcel.add(`${item}___${bu}`);
                });
                const allStocks = yield prisma.warehouseStock.findMany({
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
                            yield prisma.warehouseStock.update({
                                where: { Id: stock.Id },
                                data: {
                                    QtyOnHand: 0,
                                    UpdatedAt: new Date()
                                }
                            });
                            yield prisma.stockHistory.create({
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
                            yield prisma.warehouseStock.update({
                                where: { Id: stock.Id },
                                data: {
                                    QtyOnHand: 0,
                                    UpdatedAt: new Date()
                                }
                            });
                            yield prisma.stockHistory.create({
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
                const historyWithAdmin = yield prisma.stockHistory.findFirst({
                    where: { UploadLogId: uploadLog.Id },
                    include: { Admin: true },
                });
                function pad2(val) { return String(val).padStart(2, "0"); }
                function formatDateLikeStockHistory(date) {
                    const yyyy = date.getFullYear();
                    const mm = pad2(date.getMonth() + 1);
                    const dd = pad2(date.getDate());
                    const HH = pad2(date.getHours());
                    const MM = pad2(date.getMinutes());
                    const SS = pad2(date.getSeconds());
                    return `${yyyy}-${mm}-${dd} ${HH}.${MM}.${SS}`;
                }
                const adminName = (((_f = historyWithAdmin === null || historyWithAdmin === void 0 ? void 0 : historyWithAdmin.Admin) === null || _f === void 0 ? void 0 : _f.Name) || "unknown").replace(/\s+/g, '_');
                const wkt = formatDateLikeStockHistory((historyWithAdmin === null || historyWithAdmin === void 0 ? void 0 : historyWithAdmin.UpdatedAt) || new Date());
                const finalFilename = `stock_${adminName} ${wkt}.xlsx`;
                const finalFilePath = path_1.default.join(uploadDir, finalFilename);
                // Rename file temp ke nama final
                fs_1.default.renameSync(filePath, finalFilePath);
                // Update FilePath di uploadLog
                yield prisma.stockHistoryExcelUploadLog.update({
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
                return;
            }
            catch (error) {
                console.error("Global error:", error);
                console.error("[ERROR UPLOAD EXCEL]", error);
                res.status(500).json({ success: false, message: "Internal server?? error", error: error.message });
            }
        });
    }
}
const warehouseStockController = new WarehouseStock();
// Untuk di-route
exports.updateStockFromExcel = warehouseStockController.updateStockFromExcel;
exports.upload = warehouseStockController.upload;
exports.default = warehouseStockController;
