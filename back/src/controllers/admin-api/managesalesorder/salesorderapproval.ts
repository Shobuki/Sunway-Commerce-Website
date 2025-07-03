import { Request, Response } from "express";
import { PrismaClient, EmailStatus, SalesOrderStatus } from "@prisma/client";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { generateExcel, generatePDF } from "../../../controllers/dealer-api/transaction/salesorder";


import { format } from "date-fns";


function padZero(num: number) {
  return num < 10 ? `0${num}` : `${num}`;
}

const prisma = new PrismaClient();

// ✅ Configure your email transporter

function renderTemplate(str: string, obj: Record<string, any>) {
  return str.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, p1) => (obj[p1] !== undefined ? obj[p1] : ""));
}

// Fungsi helper untuk reversal stok SO (restore ke gudang asal)
async function reversalSalesOrderStock(salesOrderId: number, adminId: number) {

  console.log("reversalSalesOrderStock called with adminId:", adminId);
  if (!adminId) {
    throw new Error("AdminId wajib ada pada reversalSalesOrderStock (jangan biarkan stockHistory tanpa adminId)");
  }
  // Ambil semua detail yg fulfillment READY dan ada warehouseId
  const details = await prisma.salesOrderDetail.findMany({
    where: { SalesOrderId: salesOrderId, FulfillmentStatus: "READY", WarehouseId: { not: null } }
  });
  for (const detail of details) {
    const warehouseStock = await prisma.warehouseStock.findFirst({
      where: { WarehouseId: detail.WarehouseId!, ItemCodeId: detail.ItemCodeId }
    });
    if (warehouseStock) {
      await prisma.warehouseStock.update({
        where: { Id: warehouseStock.Id },
        data: { QtyOnHand: { increment: detail.Quantity } }
      });
      await prisma.stockHistory.create({
        data: {
          WarehouseStockId: warehouseStock.Id,
          ItemCodeId: detail.ItemCodeId,
          QtyBefore: warehouseStock.QtyOnHand,
          QtyAfter: warehouseStock.QtyOnHand + detail.Quantity,
          Note: `Reversal stok ke warehouse asal pada SalesOrder #${salesOrderId} (WarehouseId=${detail.WarehouseId})`,
          AdminId: adminId,
        }
      });
    }
  }
  const inPoDetails = await prisma.salesOrderDetail.findMany({
    where: { SalesOrderId: salesOrderId, FulfillmentStatus: "IN_PO" }
  });
  for (const detail of inPoDetails) {
    const itemCode = await prisma.itemCode.findUnique({ where: { Id: detail.ItemCodeId } });
    if (itemCode) {
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
          Note: `Reversal QtyPO pada SalesOrder #${salesOrderId}`,
          AdminId: adminId,
        }
      });
    }
  }
}

export const approveSalesOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      SalesOrderId,
      SalesId,
      SalesOrderNumber,
      JdeSalesOrderNumber,
      Note,
      PaymentTerm,
      FOB,
      CustomerPoNumber,
      DeliveryOrderNumber,
      SalesOrderDetails,
      ForceApplyTax,
      // ...tambahkan field lain kalau perlu
    } = req.body;
    const parsedSalesOrderId = Number(SalesOrderId);
    const parsedSalesId = Number(SalesId);

    const adminId = req.admin?.Id;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized. AdminId missing." });
      return;
    }

    if (!parsedSalesOrderId || isNaN(parsedSalesOrderId)) {
      res.status(400).json({ message: "SalesOrderId must be a valid number." });
      return;
    }
    if (!parsedSalesId || isNaN(parsedSalesId)) {
      res.status(400).json({ message: "SalesId must be a valid number." });
      return;
    }
    const updateData: any = {};
    if (SalesOrderNumber !== undefined) updateData.SalesOrderNumber = SalesOrderNumber;
    if (JdeSalesOrderNumber !== undefined) updateData.JdeSalesOrderNumber = JdeSalesOrderNumber;
    if (Note !== undefined) updateData.Note = Note;
    if (PaymentTerm !== undefined) updateData.PaymentTerm = PaymentTerm;
    if (FOB !== undefined) updateData.FOB = FOB;
    if (CustomerPoNumber !== undefined) updateData.CustomerPoNumber = CustomerPoNumber;
    if (DeliveryOrderNumber !== undefined) updateData.DeliveryOrderNumber = DeliveryOrderNumber;
    if (SalesId !== undefined) updateData.SalesId = parsedSalesId;

    let updatedOrder = null;
    if (Object.keys(updateData).length > 0) {
      updatedOrder = await prisma.salesOrder.update({
        where: { Id: parsedSalesOrderId },
        data: updateData,
      });
    }




    // --- Step 2: Fetch ulang salesOrder dengan Sales relasi terbaru
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { Id: parsedSalesOrderId },
      include: {
        Dealer: true,
        Sales: { include: { Admin: true } },
        SalesOrderFile: true,
      },
    });

    if (!salesOrder) {
      res.status(404).json({ message: "Sales Order not found." });
      return;
    }
    const dealerId = salesOrder.DealerId;

    // --- Step 3: Ambil recipient sesuai SalesId terbaru
    const recipients = await prisma.emailSalesOrderRecipient.findMany({
      where: {
        SalesId: parsedSalesId,
        DeletedAt: null,
      },
    });

    if (!recipients.length) {
      res.status(400).json({ message: "No recipients found for this Sales." });
      return;
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const countToday = await prisma.salesOrder.count({
      where: {
        Status: SalesOrderStatus.APPROVED_EMAIL_SENT,
        CreatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const storeCode = salesOrder.Dealer?.StoreCode || "XXXX";
    const sequence = padZero(countToday + 1);
    const day = padZero(now.getDate());
    const month = format(now, "MMM").toUpperCase();
    const year = now.getFullYear();
    const generatedNumber = `SS-${sequence}/${storeCode}/${day}/${month}/${year}`;

    if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
      const activeTax = await prisma.tax.findFirst({
        where: { IsActive: true, DeletedAt: null },
        orderBy: { CreatedAt: 'desc' },
      });

      const defaultTaxRate = activeTax?.Percentage ?? 0;
      const defaultTaxId = activeTax?.Id ?? null;

      const existingDetails = await prisma.salesOrderDetail.findMany({
        where: { SalesOrderId: parsedSalesOrderId },
      });
      const incomingIds = SalesOrderDetails.map((d: any) => d.Id).filter((id: any) => !!id);
      const existingIds = existingDetails.map((d) => d.Id);
      const toDeleteIds = existingIds.filter(id => !incomingIds.includes(id));

      await prisma.salesOrderDetail.deleteMany({
        where: { Id: { in: toDeleteIds } },
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
              SalesOrderId: parsedSalesOrderId,
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

      // Regenerate file jika detail ikut diubah
      const excelFileName = await generateExcel(parsedSalesOrderId);
      const pdfFileName = await generatePDF(parsedSalesOrderId);

      await prisma.salesOrderFile.updateMany({
        where: { SalesOrderId: parsedSalesOrderId },
        data: {
          ExcelFile: excelFileName,
          PdfFile: pdfFileName,
        },
      });
    }

    // Ambil detail sales order lengkap untuk update stok
    const salesOrderDetails = await prisma.salesOrderDetail.findMany({
      where: { SalesOrderId: parsedSalesOrderId },
      include: { ItemCode: true }
    });

    for (const detail of salesOrderDetails) {
      if (detail.FulfillmentStatus !== "READY") continue;

      // 1. Jika sudah ada WarehouseId, cek cukup tidak
      if (detail.WarehouseId) {
        const stock = await prisma.warehouseStock.findFirst({
          where: {
            WarehouseId: detail.WarehouseId,
            ItemCodeId: detail.ItemCodeId,
            QtyOnHand: { gte: detail.Quantity }
          }
        });
        if (!stock) {
          throw new Error(
            `Stock tidak cukup di warehouseId ${detail.WarehouseId} untuk ItemCodeId ${detail.ItemCodeId}`
          );
        }
        // Kurangi stok
        await prisma.warehouseStock.update({
          where: { Id: stock.Id },
          data: { QtyOnHand: { decrement: detail.Quantity } }
        });
        await prisma.stockHistory.create({
          data: {
            WarehouseStockId: stock.Id,
            ItemCodeId: detail.ItemCodeId,
            QtyBefore: stock.QtyOnHand,
            QtyAfter: stock.QtyOnHand - detail.Quantity,
            Note: `Kurangi stok saat Approval SalesOrder #${parsedSalesOrderId} (warehouseId ${stock.WarehouseId})`,
            AdminId: adminId,
          }
        });
        continue;
      }

      // 2. Jika WarehouseId null, cari dealerWarehouse dengan prioritas dan stok cukup
      const dealerWarehouses = await prisma.dealerWarehouse.findMany({
        where: { DealerId: dealerId },
        orderBy: [{ Priority: "asc" }]
      });

      let selectedWarehouse: { WarehouseId: number, QtyOnHand: number, stockId: number } | null = null;

      for (const dw of dealerWarehouses) {
        const stock = await prisma.warehouseStock.findFirst({
          where: {
            WarehouseId: dw.WarehouseId,
            ItemCodeId: detail.ItemCodeId,
            QtyOnHand: { gte: detail.Quantity }
          }
        });
        if (stock) {
          selectedWarehouse = { WarehouseId: dw.WarehouseId, QtyOnHand: stock.QtyOnHand, stockId: stock.Id };
          break;
        }
      }

      // 3. Kalau tidak ada di dealerWarehouse, cari warehouse stok terbanyak yg cukup
      if (!selectedWarehouse) {
        const stock = await prisma.warehouseStock.findFirst({
          where: {
            ItemCodeId: detail.ItemCodeId,
            QtyOnHand: { gte: detail.Quantity }
          },
          orderBy: { QtyOnHand: "desc" }
        });
        if (stock) {
          selectedWarehouse = { WarehouseId: stock.WarehouseId, QtyOnHand: stock.QtyOnHand, stockId: stock.Id };
        }
      }

      // 4. Kalau tetap tidak ada, error
      if (!selectedWarehouse) {
        throw new Error(
          `Stock tidak cukup untuk ItemCodeId ${detail.ItemCodeId} pada semua gudang`
        );
      }

      // 5. Update SalesOrderDetail supaya WarehouseId terisi
      await prisma.salesOrderDetail.update({
        where: { Id: detail.Id },
        data: { WarehouseId: selectedWarehouse.WarehouseId }
      });

      // 6. Kurangi stok
      await prisma.warehouseStock.update({
        where: { Id: selectedWarehouse.stockId },
        data: { QtyOnHand: { decrement: detail.Quantity } }
      });
      await prisma.stockHistory.create({
        data: {
          WarehouseStockId: selectedWarehouse.stockId,
          ItemCodeId: detail.ItemCodeId,
          QtyBefore: selectedWarehouse.QtyOnHand,
          QtyAfter: selectedWarehouse.QtyOnHand - detail.Quantity,
          Note: `Kurangi stok saat Approval SalesOrder #${parsedSalesOrderId} (warehouseId ${selectedWarehouse.WarehouseId})`,
          AdminId: adminId,
        }
      });
    }

    await prisma.salesOrder.update({
      where: { Id: parsedSalesOrderId },
      data: {
        Status: SalesOrderStatus.APPROVED_EMAIL_SENT,
        SalesOrderNumber: generatedNumber,
      },
    });

    // Cek apakah file sudah ada
    let salesOrderFile = await prisma.salesOrderFile.findUnique({
      where: { SalesOrderId: parsedSalesOrderId }
    });

    let excelFileName = salesOrderFile?.ExcelFile;
    let pdfFileName = salesOrderFile?.PdfFile;

    // Tentukan path file
    const excelPath = path.join(process.cwd(), "public/dealer/files/salesorder/excel", excelFileName || "");
    const pdfPath = path.join(process.cwd(), "public/dealer/files/salesorder/pdf", pdfFileName || "");

    // Cek file fisik (harus exist di folder)
    const excelExists = !!excelFileName && fs.existsSync(excelPath);
    const pdfExists = !!pdfFileName && fs.existsSync(pdfPath);

    // Kalau file DB **atau** file fisik **tidak ada** => generate baru
    if (!excelExists || !pdfExists) {
      // generate file baru (nama bisa sama, biarkan file lama ketimpa)
      excelFileName = await generateExcel(parsedSalesOrderId);
      pdfFileName = await generatePDF(parsedSalesOrderId);

      if (salesOrderFile) {
        await prisma.salesOrderFile.update({
          where: { SalesOrderId: parsedSalesOrderId },
          data: {
            ExcelFile: excelFileName,
            PdfFile: pdfFileName,
          },
        });
      } else {
        await prisma.salesOrderFile.create({
          data: {
            SalesOrderId: parsedSalesOrderId,
            ExcelFile: excelFileName,
            PdfFile: pdfFileName,
          },
        });
      }
    }

    // Fetch ulang sales order (data sudah pasti paling update, termasuk nomor dan file)
    const updatedSalesOrder = await prisma.salesOrder.findUnique({
      where: { Id: parsedSalesOrderId },
      include: {
        Dealer: true,
        Sales: { include: { Admin: true } },
        SalesOrderFile: true,
      },
    });

    // Pastikan updatedSalesOrder tidak null
    if (!updatedSalesOrder) {
      res.status(500).json({ message: "Sales Order update fetch failed." });
      return;
    }


    // --- 1. Ambil email template SALES_ORDER dari DB
    const template = await prisma.emailTemplate.findFirst({
      where: { TemplateType: "SALES_ORDER", DeletedAt: null },
    });

    // --- 2. Fallback ke hardcoded jika belum ada template (opsional, jika template null)
    const defaultBody = `
  Nomor Sales Order: {{sales_order_number}}
  Tanggal Order: {{created_date}}
  Nama Pelanggan: {{dealer}}
  Sales Representative: {{sales}}
  Nomor Sales Order JDE: {{JDE}}

  PT. SUNWAY TREK MASINDO
  Jl. Kosambi Timur No.47
  Komplek Pergudangan Sentra Kosambi Blok H1 No.A
  15211 Dadap – Tangerang, Indonesia

  📞 Tel: +62 55955445
  📠 Fax: +62 55963153
  📱 Mobile: +62 81398388788
  ✉️ Email: steven@sunway.com.my
  🌐 Web: www.sunway.com.sg

  ⚠️ This is an auto-generated e-mail
  ...
`;

    const defaultSubject = "[SALES ORDER] - {{sales_order_number}}";

    // --- 3. Mapping data variable ke object
    const data = {
      user: updatedSalesOrder.Sales?.Admin?.Name || "-",
      dealer: updatedSalesOrder.Dealer?.CompanyName || "-",
      sales_order_number: updatedSalesOrder.SalesOrderNumber || "-",
      created_date: updatedSalesOrder.CreatedAt.toLocaleDateString(),
      sales: updatedSalesOrder.Sales?.Admin?.Name || "-",
      JDE: updatedSalesOrder.JdeSalesOrderNumber || "-",
      // Tambahkan variabel lain jika diperlukan oleh template
    };

    // --- 4. Render template dengan data
    const emailBody = renderTemplate(template?.Body || defaultBody, data);
    const emailSubject = renderTemplate(template?.Subject || defaultSubject, data);
    const emailTemplateId = template?.Id ?? null; // Simpan ke EmailSalesOrder

    const attachments: Array<{ filename: string; path: string }> = [];

    if (updatedSalesOrder.SalesOrderFile?.ExcelFile) {
      const basePath = process.cwd();
      const excelPath = path.join(
        basePath,
        "public/dealer/files/salesorder/excel",
        updatedSalesOrder.SalesOrderFile.ExcelFile
      );
      if (fs.existsSync(excelPath)) {
        attachments.push({ filename: updatedSalesOrder.SalesOrderFile.ExcelFile, path: excelPath });
      }
    }


    // 🔍 Ambil konfigurasi email dari DB
    const emailConfig = await prisma.emailConfig.findFirst({
      where: { DeletedAt: null },
    });

    if (!emailConfig || !emailConfig.Email || !emailConfig.Password) {
      res.status(500).json({ message: "Email configuration not found or incomplete." });
      return;
    }

    // 🛠 Buat transporter secara dinamis berdasarkan DB
    const transporter = nodemailer.createTransport({
      host: emailConfig.Host,
      port: emailConfig.Port,
      secure: emailConfig.Secure,
      auth: {
        user: emailConfig.Email,
        pass: emailConfig.Password,
      },
      tls: {
        rejectUnauthorized: false, // ⛔ bypass TLS validation (sementara)
      },
    });



    const emailPromises = recipients.map(async (recipient) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient.RecipientEmail,
        subject: emailSubject,
        html: emailBody,
        attachments,
      };

      let status: EmailStatus = EmailStatus.SENT;
      let errorMessage = ""; // ✅ deklarasi yang benar

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        status = EmailStatus.FAILED;
        errorMessage = (error as Error).message;
        console.error(`Failed to send email to ${recipient.RecipientEmail}:`, errorMessage);
      }




      await prisma.emailSalesOrder.create({
        data: {
          SalesOrderId: parsedSalesOrderId,
          RecipientEmail: recipient.RecipientEmail,
          Subject: mailOptions.subject,
          Status: status,
          Body: emailBody,
          ApprovedAt: status === EmailStatus.SENT ? new Date() : undefined,
          EmailTemplateId: emailTemplateId, // <-- simpan id template jika ada
        },
      });
    });

    await Promise.all(emailPromises);

    res.status(200).json({ message: "Sales Order approved and email process completed." });

  } catch (error) {
    console.error("Error approving Sales Order:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const needRevisionSalesOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const SalesOrderId = Number(req.body.SalesOrderId);
    const adminId = req.admin?.Id; // pastikan ini ada!
    if (!SalesOrderId || isNaN(SalesOrderId)) {
      res.status(400).json({ message: "SalesOrderId must be a valid number." });
      return;
    }
    const salesOrder = await prisma.salesOrder.findUnique({ where: { Id: SalesOrderId } });
    if (!salesOrder) {
      res.status(404).json({ message: "Sales Order not found." });
      return;
    }

    // Cek status lama, reversal jika perlu
    if (salesOrder.Status === SalesOrderStatus.APPROVED_EMAIL_SENT) {
      if (typeof adminId !== "number") {
        res.status(401).json({ message: "Unauthorized. AdminId missing." });
        return;
      }
      await reversalSalesOrderStock(SalesOrderId, adminId);
    }

    await prisma.salesOrder.update({
      where: { Id: SalesOrderId },
      data: { Status: SalesOrderStatus.NEEDS_REVISION },
    });

    res.status(200).json({ message: "Sales Order marked as needing revision." });
  } catch (error) {
    console.error("Error marking revision:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};


export const rejectSalesOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const SalesOrderId = Number(req.body.SalesOrderId);
    const adminId = req.admin?.Id;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized. AdminId missing." });
      return;
    }
    if (!SalesOrderId || isNaN(SalesOrderId)) {
      res.status(400).json({ message: "SalesOrderId must be a valid number." });
      return;
    }

    // Cek status lama
    const oldOrder = await prisma.salesOrder.findUnique({ where: { Id: SalesOrderId } });

    if (!oldOrder) {
      res.status(404).json({ message: "Sales Order not found." });
      return;
    }

    // **Perbaikan:** reversal hanya jika status sebelumnya APPROVED_EMAIL_SENT
    if (oldOrder.Status === SalesOrderStatus.APPROVED_EMAIL_SENT) {
      await reversalSalesOrderStock(SalesOrderId, adminId);
    }

    await prisma.salesOrder.update({
      where: { Id: SalesOrderId },
      data: { Status: SalesOrderStatus.REJECTED },
    });

    res.status(200).json({ message: "Sales Order rejected successfully." });
  } catch (error) {
    console.error("Error rejecting Sales Order:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};


export const updateSalesOrderApproval = async (req: Request, res: Response): Promise<void> => {
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
    const adminId = req.admin?.Id;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized. AdminId missing." });
      return;
    }
    console.log('DEBUG: req.admin =', req.admin)

    if (!SalesOrderId || isNaN(Number(SalesOrderId))) {
      res.status(400).json({ message: "Invalid or missing SalesOrderId." });
      return;
    }

    const existingOrder = await prisma.salesOrder.findUnique({
      where: { Id: SalesOrderId },
    });
    if (!existingOrder) {
      res.status(404).json({ message: "Sales Order not found." });
      return;
    }

    // --- Penambahan reversal stok --- //
    const oldOrder = await prisma.salesOrder.findUnique({
      where: { Id: SalesOrderId },
    });

    if (!oldOrder) {
      res.status(404).json({ message: "Sales Order not found." });
      return;
    }

    // Cek jika butuh reversal: status lama APPROVED_EMAIL_SENT, status baru bukan APPROVED_EMAIL_SENT
    if (oldOrder.Status === SalesOrderStatus.APPROVED_EMAIL_SENT && Status !== SalesOrderStatus.APPROVED_EMAIL_SENT) {
      console.log('DEBUG: Akan reversal dengan adminId =', adminId);
      await reversalSalesOrderStock(SalesOrderId, adminId);
      console.log('DEBUG: Selesai reversal');
    }


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

    // 🔸 Update main SalesOrder if any field is changed
    if (Object.keys(updateData).length > 0) {
      updatedOrder = await prisma.salesOrder.update({
        where: { Id: SalesOrderId },
        data: updateData,
      });
    }

    // 🔸 Process SalesOrderDetails if provided
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

      // Hanya regenerate file jika detail ikut diubah
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
    if (error instanceof Error) {
      res.status(400).json({ message: error.message || "Internal Server Error." });
    } else {
      res.status(400).json({ message: "Internal Server Error." });
    }
  }
};