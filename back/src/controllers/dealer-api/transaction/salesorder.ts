import { Request, Response } from "express";
import { FulfillmentStatus, PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();

// Direktori penyimpanan file
const EXCEL_DIRECTORY = path.join(process.cwd(), "public", "dealer", "files", "salesorder", "excel");
const PDF_DIRECTORY = path.join(process.cwd(), "public", "dealer", "files", "salesorder", "pdf");
const LOGO_PATH = path.join(process.cwd(), "public", "dealer", "files", "salesorder", "formatexcel", "logosunway.png");
const LOGO_Sunflex = path.join(process.cwd(), "public", "dealer", "files", "salesorder", "formatexcel", "logoSunflex.png");
const LOGO_SunflexStore = path.join(process.cwd(), "public", "dealer", "files", "salesorder", "formatexcel", "logoSunflexStore.png");

// Pastikan direktori ada
if (!fs.existsSync(EXCEL_DIRECTORY)) fs.mkdirSync(EXCEL_DIRECTORY, { recursive: true });
if (!fs.existsSync(PDF_DIRECTORY)) fs.mkdirSync(PDF_DIRECTORY, { recursive: true });


const getTaxPercentage = async (taxId: number): Promise<number> => {
  const tax = await prisma.tax.findUnique({ where: { Id: taxId } });
  return tax?.Percentage ?? 0;
};


export const convertCartToSalesOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginUser = req.user;
    const { UserId } = req.body;

    if (!loginUser || Number(UserId) !== Number(loginUser.Id)) {
      res.status(403).json({ message: "Access denied. Token tidak sesuai user login." });
      return;
    }

    if (!UserId || isNaN(Number(UserId))) {
      res.status(400).json({ message: "Invalid or missing UserId." });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { UserId: Number(UserId) },
      include: { CartItems: { include: { ItemCode: { include: { WarehouseStocks: true } } } } },
    });

    if (!cart || cart.CartItems.length === 0) {
      res.status(404).json({ message: "Cart is empty or does not exist." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { Id: Number(UserId) },
      include: {
        Dealer: {
          include: {
            Sales: { include: { Admin: true } }, // ✅ Include Admin here
            PriceCategory: true,
          }
        }
      },
    });


    if (!user || !user.Dealer) {
      res.status(400).json({ message: "User is not associated with any Dealer." });
      return;
    }

    const dealer = user.Dealer;
    const sales = dealer.Sales.length > 0 ? dealer.Sales[0] : null;

    if (!sales) {
      res.status(400).json({ message: "No Sales assigned to this Dealer." });
      return;
    }

    const newSalesOrder = await prisma.salesOrder.create({
      data: {
        SalesOrderNumber: null,
        JdeSalesOrderNumber: null,
        DealerId: dealer.Id,
        UserId: Number(UserId),
        SalesId: sales.Id,
        Status: "PENDING_APPROVAL",
        Note: null,
        PaymentTerm: null,
        FOB: null,
        CustomerPoNumber: null,
        DeliveryOrderNumber: null,
        TransactionToken: "",
      },
    });

    const salesOrderDetails = [];

    const uniqueItemsMap = new Map<number, typeof cart.CartItems[0]>();

    for (const item of cart.CartItems) {
      if (!uniqueItemsMap.has(item.ItemCodeId)) {
        uniqueItemsMap.set(item.ItemCodeId, item);
      } else {
        const existing = uniqueItemsMap.get(item.ItemCodeId)!;
        existing.Quantity += item.Quantity;
      }
    }


    for (const cartItem of uniqueItemsMap.values()) {
      const itemCode = cartItem.ItemCode;
      const quantityNeeded = cartItem.Quantity;

      if (itemCode.MinOrderQuantity && quantityNeeded < itemCode.MinOrderQuantity) {
        res.status(400).json({ message: `Item ${itemCode.Name} minimal order ${itemCode.MinOrderQuantity}.` });
        return;
      }

      // 1. Ambil prioritas warehouse milik dealer
      const dealerWarehouses = await prisma.dealerWarehouse.findMany({
        where: { DealerId: dealer.Id },
        orderBy: { Priority: 'asc' },
        select: { WarehouseId: true, Priority: true },
      });

      // 2. Buat map prioritas
      const priorityMap = new Map(
        dealerWarehouses.map(dw => [dw.WarehouseId, dw.Priority ?? 999])
      );

      // 3. Filter stock dengan Qty > 0 dan memiliki prioritas
      const prioritizedStocks = itemCode.WarehouseStocks
        .filter(s => s.QtyOnHand > 0 && priorityMap.has(s.WarehouseId))
        .map(s => ({
          ...s,
          Priority: priorityMap.get(s.WarehouseId) ?? 999,
        }))
        .sort((a, b) => a.Priority - b.Priority);

      // 4. Pilih warehouse dengan stok mencukupi berdasarkan prioritas
      let selectedStock = prioritizedStocks.find(s => s.QtyOnHand >= quantityNeeded);

      let fulfillmentStatus: "READY" | "IN_PO" = "READY";

      if (!selectedStock) {
        const totalAvailable = itemCode.WarehouseStocks.reduce((sum, s) => sum + s.QtyOnHand, 0);
        const qtyPO = itemCode.QtyPO ?? 0;

        if ((totalAvailable + qtyPO) >= quantityNeeded) {
          fulfillmentStatus = "IN_PO";
          selectedStock = prioritizedStocks[0] || null; // ✅ ganti dari sortedStocks[0]
        }
        else {
          res.status(400).json({ message: `Insufficient stock and PO for ${itemCode.Name}.` });
          return;
        }
      }

      const itemPrices = await prisma.price.findMany({
        where: {
          ItemCodeId: cartItem.ItemCodeId,
          DeletedAt: null,
        },
        include: {
          WholesalePrices: {
            where: { DeletedAt: null },
            orderBy: { MinQuantity: 'asc' },
            take: 1,
            include: {
              Price: true, // ✅ Tambahkan ini agar relasi Price ikut ter-load
            },
          },
        },
        orderBy: { CreatedAt: 'desc' },
      });


      let resolvedPrice = null;
      let usedPriceCategoryId = null;

      // 1. Cek wholesale price terlebih dahulu
      const wholesalePrice = itemPrices.find(p => p.WholesalePrices.length > 0);
      if (wholesalePrice) {
        resolvedPrice = wholesalePrice.WholesalePrices[0].Price?.Price ?? null;
        usedPriceCategoryId = wholesalePrice.PriceCategoryId ?? null;
      }
      else {
        // 2. Cek dealer-specific
        const dealerSpecific = itemPrices.find(p => p.DealerId === dealer.Id);
        if (dealerSpecific) {
          resolvedPrice = dealerSpecific.Price;
          usedPriceCategoryId = dealerSpecific.PriceCategoryId ?? null;
        } else {
          // 3. Cek price category default
          const categoryPrice = itemPrices.find(p => p.PriceCategoryId === dealer.PriceCategoryId && !p.DealerId);
          if (categoryPrice) {
            resolvedPrice = categoryPrice.Price;
            usedPriceCategoryId = categoryPrice.PriceCategoryId ?? null;
          }
        }
      }

      if (resolvedPrice === null) {
        res.status(400).json({ message: `No valid price found for ItemCode ${itemCode.Name}.` });
        return;
      }

      const tax = await prisma.tax.findFirst({
        where: { IsActive: true },
        orderBy: { CreatedAt: "desc" },
      });

      const taxRate = tax?.Percentage ?? 0;
      const finalPrice = resolvedPrice * (1 + taxRate / 100);

      salesOrderDetails.push({
        SalesOrderId: newSalesOrder.Id,
        ItemCodeId: cartItem.ItemCodeId,
        WarehouseId: selectedStock?.WarehouseId ?? null,
        Quantity: quantityNeeded,
        Price: resolvedPrice,
        FinalPrice: finalPrice,
        PriceCategoryId: usedPriceCategoryId,
        FulfillmentStatus: fulfillmentStatus,
        TaxId: tax?.Id ?? null,
      });

    }


    // Simpan semua SalesOrderDetail
    await prisma.salesOrderDetail.createMany({
      data: salesOrderDetails,
    });

    // Hapus cart
    await prisma.cartItem.deleteMany({ where: { CartId: cart.Id } });
    await prisma.cart.delete({ where: { Id: cart.Id } });



    res.status(201).json({
      message: "Cart successfully converted to Sales Order.",
      data: {
        SalesOrderId: newSalesOrder.Id,
        Dealer: {
          Id: dealer.Id,
          CompanyName: dealer.CompanyName,
          Region: dealer.Region
        },
        Sales: {
          Id: sales.Id,
          Name: sales.Admin?.Name || '-' // ✅ Pakai relasi Admin
        },
        Details: salesOrderDetails.map(d => ({
          ItemCodeId: d.ItemCodeId,
          WarehouseId: d.WarehouseId,
          Quantity: d.Quantity,
          Price: d.Price,
          FinalPrice: d.FinalPrice,
          FulfillmentStatus: d.FulfillmentStatus,
          TaxId: d.TaxId
        }))
      }
    });


  } catch (error) {
    console.error("Error converting cart to sales order:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};


export const generateExcel = async (salesOrderId: number): Promise<string> => {
  const salesOrder = await prisma.salesOrder.findUnique({
    where: { Id: salesOrderId },
    include: {
      SalesOrderDetails: { include: { ItemCode: { include: { PartNumber: true } } } },
      Dealer: true,
      Sales: { include: { Admin: true } },
      User: true,
    },
  });

  if (!salesOrder || !salesOrder.Dealer) throw new Error("Sales Order or Dealer not found.");

  const fileName = `salesorder_${salesOrderId}.xlsx`;
  const filePath = path.join(EXCEL_DIRECTORY, fileName);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sales Order", {
    properties: { tabColor: { argb: 'FFB8CCE4' } }
  });

  // ==== LOGO BERSAMPINGAN ====
  const logoSunwayId = workbook.addImage({ filename: LOGO_PATH, extension: 'png' });
  const logoSunflexId = workbook.addImage({ filename: LOGO_Sunflex, extension: 'png' });
  const logoSunflexStoreId = workbook.addImage({ filename: LOGO_SunflexStore, extension: 'png' });

  // Sunway (), Sunflex (), Sunflex Store ()
  sheet.addImage(logoSunwayId, 'A1:B5'); // Sunway kiri
  sheet.addImage(logoSunflexId, 'F1:G5'); // Sunflex kanan
  sheet.addImage(logoSunflexStoreId, 'H3:I5'); // Sunflex Store kecil bawah

  // === HEADER COMPANY INFO () ===
  sheet.mergeCells('C1:E5');
  sheet.getCell('C1').value =
    'PT. SUNWAY TREK MASINDO\n(A MEMBER OF THE SUNWAY GROUP)\nJL. KOSAMBI TIMUR NO.47\nKOMPLEKS PERGUDANGAN SENTRA KOSAMBI BLOK H1 NO.4 DADAP - TANGERANG\nTELP : 021-55595445 (Hunting)';
  sheet.getCell('C1').alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
  sheet.getCell('C1').font = { size: 10, bold: true };

  // === JUDUL TENGAH ===
  sheet.mergeCells('A6:I6');
  sheet.getCell('A6').value = 'SALES ORDER SUNFLEX STORE';
  sheet.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell('A6').font = { size: 12, bold: true, underline: true };

  // === DEALER INFO KIRI ===
  sheet.getCell('A8').value = 'SOLD TO:';
  sheet.getCell('B8').value = `${salesOrder.Dealer.CompanyName || '-'}${salesOrder.Dealer.Region ? ' - ' + salesOrder.Dealer.Region : ''}`;
  sheet.getCell('A9').value = 'DELIVERED TO:';
  sheet.getCell('B9').value = salesOrder.Dealer.Address || '-';
  sheet.getCell('A10').value = 'PHONE:';
  sheet.getCell('B10').value = salesOrder.Dealer.PhoneNumber || '-';
  sheet.getCell('A11').value = 'FAX:';
  sheet.getCell('B11').value = salesOrder.Dealer.fax || '-';

  for (let r = 8; r <= 11; r++) {
    sheet.getCell(`A${r}`).alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
    sheet.getCell(`B${r}`).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  }
  const maxLabelLength = Math.max(
    (sheet.getCell('A8').value + '').length,
    (sheet.getCell('A9').value + '').length,
    (sheet.getCell('A10').value + '').length,
    (sheet.getCell('A11').value + '').length
  );
  const maxValueLength = Math.max(
    (sheet.getCell('B8').value + '').length,
    (sheet.getCell('B9').value + '').length,
    (sheet.getCell('B10').value + '').length,
    (sheet.getCell('B11').value + '').length
  );
  // Kasih padding biar ga terlalu pas
  sheet.getColumn(1).width = maxLabelLength + 2;
  sheet.getColumn(2).width = maxValueLength + 2;


  // === BLOK INFO KANAN === (sesuai format)
  sheet.getCell('F8').value = 'SO NO';
  sheet.getCell('G8').value = salesOrder.SalesOrderNumber || '-';
  sheet.getCell('F9').value = 'DATE';
  sheet.getCell('G9').value = salesOrder.CreatedAt ? salesOrder.CreatedAt.toLocaleDateString() : '-';
  sheet.getCell('F10').value = 'PAYMENT TERM';
  sheet.getCell('G10').value = salesOrder.PaymentTerm || '-';
  sheet.getCell('F11').value = 'CUSTOMER PO NO';
  sheet.getCell('G11').value = salesOrder.CustomerPoNumber || '-';

  // Baris 12
  sheet.getCell('F12').value = 'NO DO';
  sheet.getCell('G12').value = salesOrder.DeliveryOrderNumber || '-';
  sheet.getCell('H12').value = 'NO SALES ORDER JDE';
  sheet.getCell('I12').value = salesOrder.JdeSalesOrderNumber || '-';

  // === STYLE INFO KANAN ===
  const infoStyleCells = [
    'F8', 'G8', 'F9', 'G9', 'F10', 'G10', 'F11', 'G11', 'F12', 'G12', 'H12', 'I12'
  ];
  for (const c of infoStyleCells) {
    sheet.getCell(c).border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    sheet.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EDF6' } };
    sheet.getCell(c).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    if (c.match(/^F\d+$|^H\d+$/)) sheet.getCell(c).font = { bold: true };
  }

  // ==== HEADER TABEL ITEM ====
  const tableHeaders = [
    'NO', 'PART NO', 'DESCRIPTION', 'QTY', 'UNIT', 'UNIT PRICE', 'PPN - 11%', 'UNIT SELL PRICE IDR', 'TOTAL PRICE'
  ];
  for (let i = 0; i < tableHeaders.length; i++) {
    const col = String.fromCharCode(65 + i); // A, B, ...
    sheet.mergeCells(`${col}14:${col}15`);
    sheet.getCell(`${col}14`).value = tableHeaders[i];
    sheet.getCell(`${col}14`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    sheet.getCell(`${col}14`).font = { bold: true };
    sheet.getCell(`${col}14`).border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    sheet.getCell(`${col}14`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  }

  // ==== DATA ROWS ====
  let row = 16;
  let totalPriceSum = 0;
  salesOrder.SalesOrderDetails.forEach((detail, idx) => {
    const no = idx + 1;
    const partNo = detail.ItemCode.PartNumber?.Name || '-';
    const desc = detail.ItemCode.PartNumber?.Description || 'No Description';
    const qty = detail.Quantity;
    const unit = 'MT';
    const price = detail.Price;
    const ppn = Math.round(price * 0.11);
    const sellPrice = price + ppn;
    const total = sellPrice * qty;

    totalPriceSum += total;

    const dataArr = [no, partNo, desc, qty, unit, price, ppn, sellPrice, total];
    for (let i = 0; i < dataArr.length; i++) {
      const col = String.fromCharCode(65 + i); // A, B, ...
      sheet.getCell(`${col}${row}`).value = dataArr[i];
      sheet.getCell(`${col}${row}`).alignment = { vertical: 'middle', horizontal: i === 2 ? 'left' : 'center', wrapText: true };
      sheet.getCell(`${col}${row}`).font = { size: 10 };
      sheet.getCell(`${col}${row}`).border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      if ([3, 5, 6, 7, 8].includes(i)) {
        sheet.getCell(`${col}${row}`).numFmt = '#,##0';
      }
    }
    row++;
  });

  // ==== TOTAL BARIS BAWAH ====
  sheet.mergeCells(`A${row}:H${row}`);
  sheet.getCell(`A${row}`).value = 'TOTAL';
  sheet.getCell(`A${row}`).alignment = { horizontal: 'right', vertical: 'middle' };
  sheet.getCell(`A${row}`).font = { bold: true, size: 11 };
  sheet.getCell(`A${row}`).border = {
    top: { style: 'thin' }, left: { style: 'thin' },
    bottom: { style: 'thin' }, right: { style: 'thin' }
  };
  sheet.getCell(`I${row}`).value = totalPriceSum;
  sheet.getCell(`I${row}`).alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getCell(`I${row}`).font = { bold: true, size: 11 };
  sheet.getCell(`I${row}`).numFmt = '#,##0';
  sheet.getCell(`I${row}`).border = {
    top: { style: 'thin' }, left: { style: 'thin' },
    bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  row += 2;

  // ORDERED BY dan SALES PERSONNEL vertikal di kolom A/B, baris berbeda
  sheet.getCell(`A${row}`).value = 'ORDERED BY';
  sheet.getCell(`A${row + 1}`).value = 'SALES PERSONNEL';
  sheet.getCell(`A${row}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.getCell(`A${row + 1}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.getCell(`A${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`A${row + 1}`).font = { bold: true, size: 10 };

  sheet.getCell(`B${row}`).value = salesOrder.User?.Username || '-';
  sheet.getCell(`B${row + 1}`).value = salesOrder.Sales?.Admin?.Name || '-';
  sheet.getCell(`B${row}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.getCell(`B${row + 1}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.getCell(`B${row}`).font = { size: 10 };
  sheet.getCell(`B${row + 1}`).font = { size: 10 };

  // CREDIT CONTROL dan APPROVED BY tetap horizontal baris yang sama (misal kolom E dan G)
  sheet.getCell(`C${row}`).value = 'CREDIT CONTROL';
  sheet.getCell(`G${row}`).value = 'APPROVED BY';
  sheet.getCell(`C${row}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.getCell(`G${row}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.getCell(`C${row}`).font = { bold: true, size: 10 };
  sheet.getCell(`G${row}`).font = { bold: true, size: 10 };

  sheet.getCell(`C${row + 1}`).value = '-';
  sheet.getCell(`G${row + 1}`).value = '-';
  sheet.getCell(`C${row + 1}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  for (let r = row; r <= row + 1; r++) {
    for (let colIdx = 3; colIdx <= 6; colIdx++) {
      const cell = sheet.getCell(r, colIdx);
      cell.border = {
        top: (r === row) ? { style: 'thin' } : {},
        bottom: (r === row + 1) ? { style: 'thin' } : {},
        left: (colIdx === 3) ? { style: 'thin' } : {},
        right: (colIdx === 6) ? { style: 'thin' } : {},
      };
    }
  }
  // === Tambahkan kode di sini untuk approved by ===
  for (let r = row; r <= row + 1; r++) {
    for (let colIdx = 7; colIdx <= 9; colIdx++) { // G=7, H=8, I=9
      const cell = sheet.getCell(r, colIdx);
      cell.border = {
        top: (r === row) ? { style: 'thin' } : {},
        bottom: (r === row + 1) ? { style: 'thin' } : {},
        left: (colIdx === 7) ? { style: 'thin' } : {},
        right: (colIdx === 9) ? { style: 'thin' } : {},
      };
    }
  }
  sheet.getCell(`G${row + 1}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  sheet.getCell(`C${row + 1}`).font = { size: 10 };
  sheet.getCell(`G${row + 1}`).font = { size: 10 };

  // Optional: border untuk semua
  for (const r of [row, row + 1]) {
    for (const c of ['A', 'B', 'C', 'G']) {
      sheet.getCell(`${c}${r}`).border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    }
  }

  // ==== LEBAR KOLOM PRESISI SESUAI FILE ====
  // [A,B,C,D,E,F,G,H,I]
  const widths = [undefined, undefined, 17, 17, 17, 17, 17, 17, 15]; // A & B pakai undefined supaya tidak diubah
  for (let i = 3; i <= 9; i++) {
    sheet.getColumn(i).width = widths[i - 1];
  }

  await workbook.xlsx.writeFile(filePath);
  return fileName;
};



export const generatePDF = async (salesOrderId: number): Promise<string> => {
  const salesOrder = await prisma.salesOrder.findUnique({
    where: { Id: salesOrderId },
    include: { SalesOrderDetails: { include: { ItemCode: true } }, Dealer: true },
  });

  if (!salesOrder) throw new Error("Sales Order not found.");

  const fileName = `salesorder_${salesOrderId}.pdf`;
  const filePath = path.join(PDF_DIRECTORY, fileName);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text("Sales Order", { align: "center" });
  doc.moveDown();
  doc.text(`Dealer: ${salesOrder.Dealer?.CompanyName || 'Unknown Dealer'}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();
  doc.text("Items:");

  salesOrder.SalesOrderDetails.forEach((detail) => {
    doc.text(`${detail.ItemCode.Name} - Qty: ${detail.Quantity} - Price: ${detail.Price}`);
  });

  doc.end();
  return fileName;
};

export const getSalesOrdersByUserDealer = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginUser = req.user;
    const { UserId } = req.body;

    // Cek user login & UserId harus sama
    if (!loginUser || !UserId || Number(UserId) !== Number(loginUser.Id)) {
      res.status(403).json({ message: "Access denied. You are not authorized to access this resource." });
      return;
    }

    // Validasi UserId
    if (!UserId) {
      res.status(400).json({ message: "UserId is required." });
      return;
    }

    // Ambil user beserta dealer
    const user = await prisma.user.findUnique({
      where: { Id: UserId },
      include: {
        Dealer: {
          include: {
            Sales: { include: { Admin: true } },
          },
        },
      },
    });

    if (!user || !user.Dealer) {
      res.status(400).json({ message: "User is not associated with any dealer." });
      return;
    }

    const DealerId = user.Dealer.Id;

    // Ambil sales order + detail
    const salesOrders = await prisma.salesOrder.findMany({
      where: { DealerId, DeletedAt: null },
      include: {
        SalesOrderDetails: {
          include: {
            ItemCode: {
              include: {
                PartNumber: {
                  include: { Product: true },
                },
              },
            },
            Tax: true,
          },
        },
        Dealer: true,
        User: true,
        Sales: { include: { Admin: true } },
      },
    });

    // Transform hasil
    const simplifiedData = salesOrders.map(order => {
      // Build product detail sebagai array baru
      const productDetails = order.SalesOrderDetails.map(detail => {
        const itemCode = detail.ItemCode;
        const partNumber = itemCode?.PartNumber;
        const allowSelection = itemCode?.AllowItemCodeSelection ?? false;

        let displayName = '';
        if (allowSelection) {
          displayName = itemCode?.Name ?? 'Unknown';
        } else {
          displayName = partNumber?.Name ?? 'Unknown';
        }

        return {
          DisplayName: displayName,
          ProductName: partNumber?.Product?.Name ?? '-',
          AllowItemCodeSelection: allowSelection,
          Quantity: detail.Quantity,
          Price: detail.Price,
          FinalPrice: detail.FinalPrice,
          TaxId: detail.TaxId,
          TaxPercentage: detail.Tax?.Percentage ?? 0,
          TaxName: detail.Tax?.Name ?? '-',
          FulfillmentStatus: detail.FulfillmentStatus,
          WarehouseId: detail.WarehouseId,
          PriceCategoryId: detail.PriceCategoryId,
          // Tambahkan field lain jika memang perlu, TIDAK ADA ItemCodeId/Name/PartNumberId/Name
        };
      });

      return {
        Id: order.Id,
        SalesOrderNumber: order.SalesOrderNumber,
        JDESalesOrderNumber: order.JdeSalesOrderNumber,
        CustomerPoNumber: order.CustomerPoNumber,
        DeliveryOrderNumber: order.DeliveryOrderNumber,
        Note: order.Note,
        PaymentTerm: order.PaymentTerm,
        FOB: order.FOB,
        Status: order.Status,
        CreatedAt: order.CreatedAt,
        Dealer: {
          Id: order.Dealer.Id,
          CompanyName: order.Dealer.CompanyName,
          Region: order.Dealer.Region || '-',
        },
        Sales: {
          Id: order.Sales?.Id,
          Name: order.Sales?.Admin?.Name || '-',
        },
        User: {
          Id: order.User.Id,
          Username: order.User.Username,
        },
        ProductDetails: productDetails, // GANTI ke nama ini, bukan PartNumberResolved
      };
    });

    res.status(200).json({
      message: "Sales Orders fetched successfully.",
      data: simplifiedData,
    });

  } catch (error) {
    console.error("Error fetching Sales Orders:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getSalesOrdersBySales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { SalesId } = req.body;

    if (!SalesId) {
      res.status(400).json({ message: "SalesId is required." });
      return;
    }

    // 🔸 Cek apakah Sales ada
    const sales = await prisma.sales.findUnique({
      where: { Id: SalesId },
      include: {
        Admin: true,
        Dealers: true,
      },
    });

    if (!sales) {
      res.status(404).json({ message: "Sales not found." });
      return;
    }

    const dealerIds = sales.Dealers.map(dealer => dealer.Id);

    if (dealerIds.length === 0) {
      res.status(404).json({ message: "No dealers associated with this Sales." });
      return;
    }

    // 🔸 Ambil semua SalesOrder dari dealers yang terhubung
    const salesOrders = await prisma.salesOrder.findMany({
      where: {
        DealerId: { in: dealerIds },
        DeletedAt: null,
      },
      include: {
        SalesOrderDetails: {
          include: {
            ItemCode: true,
            Tax: true,
          },
        },
        Dealer: true,
        User: true,
        Sales: { include: { Admin: true } },
      },
    });

    // 🔸 Format response sama persis dengan getSalesOrdersByUserDealer
    const simplifiedData = salesOrders.map(order => ({
      Id: order.Id,
      SalesOrderNumber: order.SalesOrderNumber,
      JDESalesOrderNumber: order.JdeSalesOrderNumber,
      CustomerPoNumber: order.CustomerPoNumber,
      DeliveryOrderNumber: order.DeliveryOrderNumber,
      Note: order.Note,
      PaymentTerm: order.PaymentTerm,
      FOB: order.FOB,
      Status: order.Status,
      CreatedAt: order.CreatedAt,
      Dealer: {
        Id: order.Dealer.Id,
        CompanyName: order.Dealer.CompanyName,
      },
      Sales: {
        Id: order.Sales?.Id,
        Name: order.Sales?.Admin?.Name || '-',
      },
      User: {
        Id: order.User.Id,
        Username: order.User.Username,
      },
      Details: order.SalesOrderDetails.map(detail => ({
        ItemCodeId: detail.ItemCodeId,
        ItemName: detail.ItemCode?.Name || 'Unknown',
        Warehouse: detail.WarehouseId,
        FulfillmentStatus: detail.FulfillmentStatus,
        PriceCategory: detail.PriceCategoryId,
        Quantity: detail.Quantity,
        Price: detail.Price,
        TaxId: detail.TaxId,
        TaxPercentage: detail.Tax?.Percentage ?? 0,
        TaxName: detail.Tax?.Name ?? '-',
        FinalPrice: detail.FinalPrice,
      })),
    }));

    res.status(200).json({
      message: "Sales Orders fetched successfully.",
      data: simplifiedData,
    });

  } catch (error) {
    console.error("Error fetching Sales Orders:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};


export const getAllSalesOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const salesOrders = await prisma.salesOrder.findMany({
      where: {
        DeletedAt: null,
      },
      include: {
        SalesOrderDetails: {
          include: {
            ItemCode: true,
            Tax: true,
          },
        },
        Dealer: true,
        User: true,
        Sales: {
          include: { Admin: true },
        },
      },
    });

    const simplifiedData = salesOrders.map(order => ({
      Id: order.Id,
      SalesOrderNumber: order.SalesOrderNumber,
      JDESalesOrderNumber: order.JdeSalesOrderNumber,
      CustomerPoNumber: order.CustomerPoNumber,
      DeliveryOrderNumber: order.DeliveryOrderNumber,
      Note: order.Note,
      PaymentTerm: order.PaymentTerm,
      FOB: order.FOB,
      Status: order.Status,
      CreatedAt: order.CreatedAt,
      Dealer: {
        Id: order.Dealer.Id,
        CompanyName: order.Dealer.CompanyName,
      },
      Sales: {
        Id: order.Sales?.Id,
        Name: order.Sales?.Admin?.Name || '-',
      },
      User: {
        Id: order.User.Id,
        Username: order.User.Username,
      },
      Details: order.SalesOrderDetails.map(detail => ({
        ItemCodeId: detail.ItemCodeId,
        ItemName: detail.ItemCode?.Name || 'Unknown',
        Warehouse: detail.WarehouseId,
        FulfillmentStatus: detail.FulfillmentStatus,
        PriceCategory: detail.PriceCategoryId,
        Quantity: detail.Quantity,
        Price: detail.Price,
        TaxId: detail.TaxId,
        TaxPercentage: detail.Tax?.Percentage ?? 0,
        TaxName: detail.Tax?.Name ?? '-',
        FinalPrice: detail.FinalPrice,
      })),
    }));

    res.status(200).json({
      message: "All sales orders fetched successfully.",
      data: simplifiedData,
    });
  } catch (error) {
    console.error("Error fetching all sales orders:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};




export const updateSalesOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      SalesOrderId,
      SalesOrderNumber,
      JdeSalesOrderNumber,
      Status,
      Note,
      PaymentTerm,
      FOB,
      CustomerPoNumber,
      DeliveryOrderNumber,
      SalesOrderDetails,
      ForceApplyTax
    } = req.body;

    if (!SalesOrderId || isNaN(Number(SalesOrderId))) {
      res.status(400).json({ message: "Invalid or missing SalesOrderId." });
      return;
    }

    // Fetch old order & detail (include for reversal)
    const existingOrder = await prisma.salesOrder.findUnique({
      where: { Id: SalesOrderId },
      include: {
        SalesOrderDetails: {
          include: { ItemCode: true }
        }
      }
    });

    if (!existingOrder) {
      res.status(404).json({ message: "Sales Order not found." });
      return;
    }

    // === REVERSAL LOGIC ===
    // Jika status sebelumnya APPROVED_EMAIL_SENT, kembalikan stok warehouse
    if (existingOrder.Status === 'APPROVED_EMAIL_SENT') {
      for (const detail of existingOrder.SalesOrderDetails) {
        if (detail.FulfillmentStatus === 'READY' && detail.WarehouseId) {
          // Kembalikan QtyOnHand di warehouse
          const warehouseStock = await prisma.warehouseStock.findFirst({
            where: { WarehouseId: detail.WarehouseId, ItemCodeId: detail.ItemCodeId }
          });
          if (warehouseStock) {
            await prisma.warehouseStock.update({
              where: { Id: warehouseStock.Id },
              data: { QtyOnHand: warehouseStock.QtyOnHand + detail.Quantity }
            });
            await prisma.stockHistory.create({
              data: {
                WarehouseStockId: warehouseStock.Id,
                ItemCodeId: detail.ItemCodeId,
                QtyBefore: warehouseStock.QtyOnHand,
                QtyAfter: warehouseStock.QtyOnHand + detail.Quantity,
                Note: `Reversal stok SalesOrder #${SalesOrderId} dari status APPROVED_EMAIL_SENT`,
              }
            });
          }
        } else if (detail.FulfillmentStatus === 'IN_PO') {
          // Kembalikan QtyPO di ItemCode
          const itemCode = detail.ItemCode;
          await prisma.itemCode.update({
            where: { Id: detail.ItemCodeId },
            data: { QtyPO: (itemCode.QtyPO ?? 0) + detail.Quantity }
          });
          await prisma.stockHistory.create({
            data: {
              WarehouseStockId: null,
              ItemCodeId: detail.ItemCodeId,
              QtyBefore: itemCode.QtyPO,
              QtyAfter: (itemCode.QtyPO ?? 0) + detail.Quantity,
              Note: `Reversal QtyPO SalesOrder #${SalesOrderId} dari status APPROVED_EMAIL_SENT`,
            }
          });
        }
      }
    }
    // === END REVERSAL ===

    // Update SalesOrder Data
    const updateData: any = {};
    if (SalesOrderNumber !== undefined) updateData.SalesOrderNumber = SalesOrderNumber;
    if (JdeSalesOrderNumber !== undefined) updateData.JdeSalesOrderNumber = JdeSalesOrderNumber;
    if (Status !== undefined) updateData.Status = Status;
    if (Note !== undefined) updateData.Note = Note;
    if (PaymentTerm !== undefined) updateData.PaymentTerm = PaymentTerm;
    if (FOB !== undefined) updateData.FOB = FOB;
    if (CustomerPoNumber !== undefined) updateData.CustomerPoNumber = CustomerPoNumber;
    if (DeliveryOrderNumber !== undefined) updateData.DeliveryOrderNumber = DeliveryOrderNumber;

    let updatedOrder = existingOrder;

    if (Object.keys(updateData).length > 0) {
      await prisma.salesOrder.update({
        where: { Id: SalesOrderId },
        data: updateData,
      });

      // Ambil ulang order pakai include
      updatedOrder = await prisma.salesOrder.findUnique({
        where: { Id: SalesOrderId },
        include: { SalesOrderDetails: { include: { ItemCode: true } } }
      }) as typeof existingOrder;
    }

    // SalesOrderDetails logic tetap
    if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
      const activeTax = await prisma.tax.findFirst({
        where: { IsActive: true, DeletedAt: null },
        orderBy: { CreatedAt: 'desc' },
      });

      const defaultTaxRate = activeTax?.Percentage ?? 0;
      const defaultTaxId = activeTax?.Id ?? null;

      const existingDetails = await prisma.salesOrderDetail.findMany({
        where: { SalesOrderId },
      });
      const incomingIds = SalesOrderDetails.map((d: any) => d.Id).filter((id: any) => !!id);
      const existingIds = existingDetails.map((d) => d.Id);
      const toDeleteIds = existingIds.filter(id => !incomingIds.includes(id));

      await prisma.salesOrderDetail.deleteMany({
        where: {
          Id: { in: toDeleteIds },
        },
      });

      for (const detail of SalesOrderDetails) {
        const taxIdToUse = ForceApplyTax ? defaultTaxId : null;
        const taxRateToUse = ForceApplyTax ? defaultTaxRate : 0;
        const finalPrice = detail.Price * detail.Quantity * (1 + taxRateToUse / 100);

        if (detail.Id && detail.Quantity > 0 && detail.Price) {
          await prisma.salesOrderDetail.update({
            where: { Id: detail.Id },
            data: {
              Quantity: detail.Quantity,
              Price: detail.Price,
              FinalPrice: finalPrice,
              TaxId: taxIdToUse,
            },
          });
        } else if (!detail.Id && detail.Quantity > 0 && detail.Price) {
          await prisma.salesOrderDetail.create({
            data: {
              SalesOrderId: SalesOrderId,
              ItemCodeId: detail.ItemCodeId,
              Quantity: detail.Quantity,
              Price: detail.Price,
              FinalPrice: finalPrice,
              TaxId: taxIdToUse,
              WarehouseId: detail.WarehouseId ?? null,
              PriceCategoryId: detail.PriceCategoryId ?? null,
              FulfillmentStatus: detail.FulfillmentStatus ?? 'READY',
            },
          });
        } else if (detail.Id && detail.Quantity === 0) {
          await prisma.salesOrderDetail.delete({
            where: { Id: detail.Id },
          });
        }
      }

      // regenerate file jika detail ikut diubah
      const excelFileName = await generateExcel(SalesOrderId);
      const pdfFileName = await generatePDF(SalesOrderId);

      await prisma.salesOrderFile.updateMany({
        where: { SalesOrderId },
        data: {
          ExcelFile: excelFileName,
          PdfFile: pdfFileName,
        },
      });
    }

    res.status(200).json({
      message: "Sales Order updated successfully.",
      data: updatedOrder,
    });

  } catch (error) {
    console.error("Error updating Sales Order:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};




export const deleteSalesOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { SalesOrderId } = req.body;
    const parsedId = Number(SalesOrderId);

    if (!parsedId || isNaN(parsedId)) {
      res.status(400).json({ message: "Invalid SalesOrderId." });
      return;
    }

    // 1. Ambil sales order & detail (sekalian cek status)
    const existingOrder = await prisma.salesOrder.findUnique({
      where: { Id: parsedId },
      include: {
        SalesOrderDetails: { include: { ItemCode: true } }
      }
    });

    if (!existingOrder) {
      res.status(404).json({ message: "Sales Order not found." });
      return;
    }

    // 2. Reversal stok jika status terakhir sudah mengurangi stok (APPROVED_EMAIL_SENT)
    if (existingOrder.Status === 'APPROVED_EMAIL_SENT') {
      for (const detail of existingOrder.SalesOrderDetails) {
        if (detail.FulfillmentStatus === 'READY' && detail.WarehouseId) {
          // Reversal QtyOnHand di warehouse
          const warehouseStock = await prisma.warehouseStock.findFirst({
            where: { WarehouseId: detail.WarehouseId, ItemCodeId: detail.ItemCodeId }
          });
          if (warehouseStock) {
            await prisma.warehouseStock.update({
              where: { Id: warehouseStock.Id },
              data: { QtyOnHand: warehouseStock.QtyOnHand + detail.Quantity }
            });
            await prisma.stockHistory.create({
              data: {
                WarehouseStockId: warehouseStock.Id,
                ItemCodeId: detail.ItemCodeId,
                QtyBefore: warehouseStock.QtyOnHand,
                QtyAfter: warehouseStock.QtyOnHand + detail.Quantity,
                Note: `Reversal stok SalesOrder #${parsedId} dari penghapusan`,
              }
            });
          }
        } else if (detail.FulfillmentStatus === 'IN_PO') {
          // Reversal QtyPO di ItemCode
          const itemCode = detail.ItemCode;
          await prisma.itemCode.update({
            where: { Id: detail.ItemCodeId },
            data: { QtyPO: (itemCode.QtyPO ?? 0) + detail.Quantity }
          });
          await prisma.stockHistory.create({
            data: {
              WarehouseStockId: null,
              ItemCodeId: detail.ItemCodeId,
              QtyBefore: itemCode.QtyPO,
              QtyAfter: (itemCode.QtyPO ?? 0) + detail.Quantity,
              Note: `Reversal QtyPO SalesOrder #${parsedId} from delete SO`,
            }
          });
        }
      }
    }

    // 3. Soft delete SalesOrder
    await prisma.salesOrder.update({
      where: { Id: parsedId },
      data: { DeletedAt: new Date() },
    });

    // 4. Hapus file Excel & PDF
    const excelFile = path.join(EXCEL_DIRECTORY, `salesorder_${parsedId}.xlsx`);
    const pdfFile = path.join(PDF_DIRECTORY, `salesorder_${parsedId}.pdf`);

    if (fs.existsSync(excelFile)) fs.unlinkSync(excelFile);
    if (fs.existsSync(pdfFile)) fs.unlinkSync(pdfFile);

    res.status(200).json({ message: "Sales Order soft-deleted, stok dikembalikan (jika perlu), file dihapus." });

  } catch (error) {
    console.error("Error soft-deleting Sales Order:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
