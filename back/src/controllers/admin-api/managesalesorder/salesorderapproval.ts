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

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

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

      // Reversal stok untuk setiap detail yang akan dihapus (deleteMany)
      const currentStatus = salesOrder.Status; // setelah fetch salesOrder di atas

      if (toDeleteIds.length > 0 && currentStatus === SalesOrderStatus.APPROVED_EMAIL_SENT) {
        const toBeDeletedDetails = existingDetails.filter(d => toDeleteIds.includes(d.Id));
        for (const old of toBeDeletedDetails) {
          if (old.FulfillmentStatus === "READY" && old.WarehouseId) {
            const oldStock = await prisma.warehouseStock.findFirst({
              where: { WarehouseId: old.WarehouseId, ItemCodeId: old.ItemCodeId }
            });
            if (oldStock) {
              await prisma.warehouseStock.update({
                where: { Id: oldStock.Id },
                data: { QtyOnHand: { increment: old.Quantity } }
              });
              await prisma.stockHistory.create({
                data: {
                  WarehouseStockId: oldStock.Id,
                  ItemCodeId: old.ItemCodeId,
                  QtyBefore: oldStock.QtyOnHand,
                  QtyAfter: oldStock.QtyOnHand + old.Quantity,
                  Note: `Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #${parsedSalesOrderId}`,
                  AdminId: adminId,
                }
              });
            }
          }
        }
      }
      // Setelah reversal, deleteMany
      await prisma.salesOrderDetail.deleteMany({
        where: { Id: { in: toDeleteIds } },
      });




      // ========================
      // FOR LOOP utama SalesOrderDetails:
      for (const detail of SalesOrderDetails) {
        const taxIdToUse = ForceApplyTax ? defaultTaxId : null;
        const taxRateToUse = ForceApplyTax ? defaultTaxRate : 0;
        const finalPrice = detail.Price * detail.Quantity * (1 + taxRateToUse / 100);

        if (detail.Id && detail.Quantity === 0 && currentStatus === SalesOrderStatus.APPROVED_EMAIL_SENT) {
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
          // Jika WarehouseId dari FE null, cari algoritma gudang
          let warehouseIdToUse = detail.WarehouseId ?? null;
          if (!warehouseIdToUse) {
            // --- ALGORITMA PILIH GUDANG ---
            const dealerWarehouses = await prisma.dealerWarehouse.findMany({
              where: { DealerId: dealerId },
              orderBy: [{ Priority: "asc" }]
            });
            let selectedWarehouse = null;
            for (const dw of dealerWarehouses) {
              const stock = await prisma.warehouseStock.findFirst({
                where: {
                  WarehouseId: dw.WarehouseId,
                  ItemCodeId: detail.ItemCodeId,
                  QtyOnHand: { gte: detail.Quantity }
                }
              });
              if (stock) {
                selectedWarehouse = { WarehouseId: dw.WarehouseId };
                break;
              }
            }
            if (!selectedWarehouse) {
              // fallback ke stok terbanyak
              const stock = await prisma.warehouseStock.findFirst({
                where: { ItemCodeId: detail.ItemCodeId, QtyOnHand: { gte: detail.Quantity } },
                orderBy: { QtyOnHand: "desc" }
              });
              if (stock) {
                selectedWarehouse = { WarehouseId: stock.WarehouseId };
              }
            }
            if (!selectedWarehouse) {
              throw new Error(
                `Stock tidak cukup untuk ItemCodeId ${detail.ItemCodeId} pada semua gudang`
              );
            }
            warehouseIdToUse = selectedWarehouse.WarehouseId;
          }

          // CREATE dengan WarehouseId hasil algoritma
          await prisma.salesOrderDetail.create({
            data: {
              SalesOrderId: parsedSalesOrderId,
              ItemCodeId: detail.ItemCodeId,
              Quantity: detail.Quantity,
              Price: detail.Price,
              FinalPrice: finalPrice,
              TaxId: taxIdToUse,
              WarehouseId: warehouseIdToUse,
              PriceCategoryId: detail.PriceCategoryId ?? null,
              FulfillmentStatus: detail.FulfillmentStatus ?? 'READY',
            },
          });
        } else if (detail.Id && detail.Quantity === 0) {
          // PATCH: reversal di sini, di dalam loop
          const old = existingDetails.find(d => d.Id === detail.Id);
          if (old && old.FulfillmentStatus === "READY" && old.WarehouseId) {
            const oldStock = await prisma.warehouseStock.findFirst({
              where: { WarehouseId: old.WarehouseId, ItemCodeId: old.ItemCodeId }
            });
            if (oldStock) {
              await prisma.warehouseStock.update({
                where: { Id: oldStock.Id },
                data: { QtyOnHand: { increment: old.Quantity } }
              });
              await prisma.stockHistory.create({
                data: {
                  WarehouseStockId: oldStock.Id,
                  ItemCodeId: old.ItemCodeId,
                  QtyBefore: oldStock.QtyOnHand,
                  QtyAfter: oldStock.QtyOnHand + old.Quantity,
                  Note: `Reversal stok karena SalesOrderDetail dihapus (qty=0) pada SalesOrder #${parsedSalesOrderId}`,
                  AdminId: adminId,
                }
              });
            }
          }
          // Delete setelah reversal
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

    // === Tambahan PATCH untuk mengembalikan stok jika warehouse berubah saat approval ===
    if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
      // Ambil detail lama dari database (sebelum update)
      const oldDetails = await prisma.salesOrderDetail.findMany({
        where: { SalesOrderId: parsedSalesOrderId },
      });
      const oldMap = new Map();
      oldDetails.forEach(d => oldMap.set(d.Id, d));

      for (const detail of SalesOrderDetails) {
        if (!detail.Quantity) continue;
        if (detail.FulfillmentStatus !== "READY") continue;

        const old = oldMap.get(detail.Id);
        if (!old) continue;

        // --- Kasus: ItemCode BERUBAH ---
        if (
          old.ItemCodeId &&
          detail.ItemCodeId &&
          old.ItemCodeId !== detail.ItemCodeId &&
          old.WarehouseId
        ) {
          // Kembalikan stok ke warehouse asal untuk ItemCode lama
          const oldStock = await prisma.warehouseStock.findFirst({
            where: { WarehouseId: old.WarehouseId, ItemCodeId: old.ItemCodeId }
          });
          if (oldStock) {
            await prisma.warehouseStock.update({
              where: { Id: oldStock.Id },
              data: { QtyOnHand: { increment: old.Quantity } }
            });
            await prisma.stockHistory.create({
              data: {
                WarehouseStockId: oldStock.Id,
                ItemCodeId: old.ItemCodeId,
                QtyBefore: oldStock.QtyOnHand,
                QtyAfter: oldStock.QtyOnHand + old.Quantity,
                Note: `Reversal karena pindah ItemCode pada Approval SalesOrder #${parsedSalesOrderId} dari ItemCodeId ${old.ItemCodeId} ke ${detail.ItemCodeId}`,
                AdminId: adminId,
              }
            });
          }
          // **Pengurangan stok untuk ItemCode baru** akan dilakukan pada proses normal setelah patch ini!
        }

        // --- Kasus: Warehouse BERUBAH, ItemCode SAMA ---
        else if (
          old.WarehouseId &&
          detail.WarehouseId &&
          old.WarehouseId !== detail.WarehouseId &&
          old.ItemCodeId === detail.ItemCodeId
        ) {
          // Kembalikan stok ke warehouse lama
          const oldStock = await prisma.warehouseStock.findFirst({
            where: { WarehouseId: old.WarehouseId, ItemCodeId: detail.ItemCodeId }
          });
          if (oldStock) {
            await prisma.warehouseStock.update({
              where: { Id: oldStock.Id },
              data: { QtyOnHand: { increment: detail.Quantity } }
            });
            await prisma.stockHistory.create({
              data: {
                WarehouseStockId: oldStock.Id,
                ItemCodeId: detail.ItemCodeId,
                QtyBefore: oldStock.QtyOnHand,
                QtyAfter: oldStock.QtyOnHand + detail.Quantity,
                Note: `Reversal karena pindah warehouse pada Approval SalesOrder #${parsedSalesOrderId} dari warehouseId ${old.WarehouseId} ke ${detail.WarehouseId}`,
                AdminId: adminId,
              }
            });
          }
          // **Pengurangan stok untuk warehouse baru** akan dilakukan pada proses normal setelah patch ini!
        }

        // --- Kasus lain: tidak reversal (skip) ---
      }
    }

    // Ambil detail sales order lengkap untuk update stok
    const dbDetails = await prisma.salesOrderDetail.findMany({
      where: { SalesOrderId: parsedSalesOrderId },
    });

    console.log("========= DEBUG DETAIL DB FOR STOCK ==========");
    console.log("dbDetails:", JSON.stringify(dbDetails, null, 2));

    for (const detail of dbDetails) {
      if (
        detail.FulfillmentStatus === "READY" &&
        detail.WarehouseId &&
        detail.Quantity > 0
      ) {
        console.log("MASUK PENGURANGAN STOK:", detail);
        const stock = await prisma.warehouseStock.findFirst({
          where: {
            WarehouseId: detail.WarehouseId,
            ItemCodeId: detail.ItemCodeId,
            QtyOnHand: { gte: detail.Quantity }
          }
        });
        console.log('PENGURANGAN STOK', {
          warehouseStockId: stock?.Id,
          warehouseId: detail.WarehouseId,
          itemCodeId: detail.ItemCodeId,
          qtyBefore: stock?.QtyOnHand,
          qtyKurang: detail.Quantity
        });
        if (!stock) {
          throw new Error(
            `Stock tidak cukup di warehouseId ${detail.WarehouseId} untuk ItemCodeId ${detail.ItemCodeId}`
          );
        }
        console.log('PENGURANGAN STOK', {
          warehouseStockId: stock?.Id,
          warehouseId: detail.WarehouseId,
          itemCodeId: detail.ItemCodeId,
          qtyBefore: stock?.QtyOnHand,
          qtyKurang: detail.Quantity
        });
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
        console.log(`[STOK BERHASIL DIKURANGI] ${detail.ItemCodeId} - ${detail.Quantity} dari Warehouse ${detail.WarehouseId}`);
      }
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


    // VARIABEL UNTUK TRACKING
    let allEmailSent = true;

    const emailResults = await Promise.all(
      recipients.map(async (recipient) => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient.RecipientEmail,
          subject: emailSubject,
          html: emailBody,
          attachments,
        };

        let status: EmailStatus = EmailStatus.SENT;

        try {
          await transporter.sendMail(mailOptions);
        } catch (error) {
          status = EmailStatus.FAILED;
          allEmailSent = false;
          // log error jika mau
        }

        await prisma.emailSalesOrder.create({
          data: {
            SalesOrderId: parsedSalesOrderId,
            RecipientEmail: recipient.RecipientEmail,
            Subject: mailOptions.subject,
            Status: status,
            Body: emailBody,
            ApprovedAt: status === EmailStatus.SENT ? new Date() : undefined,
            EmailTemplateId: emailTemplateId,
          },
        });

        return status;
      })
    );

    // UPDATE STATUS HANYA JIKA SEMUA EMAIL SENT
    if (allEmailSent) {
      await prisma.salesOrder.update({
        where: { Id: parsedSalesOrderId },
        data: {
          Status: SalesOrderStatus.APPROVED_EMAIL_SENT,
          SalesOrderNumber: generatedNumber,
        },
      });
      res.status(200).json({ message: "Sales Order approved and email process completed." });
    } else {
      res.status(400).json({ message: "Stock sudah berhasil update, tetapi ada email yang gagal terkirim. Status tidak berubah." });
    }
    console.log("========= END DEBUG ==========");
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

      // --- Reversal stok untuk setiap detail yang akan dihapus (deleteMany)
      const previousStatus = oldOrder.Status; // setelah fetch oldOrder

      if (toDeleteIds.length > 0 && previousStatus === SalesOrderStatus.APPROVED_EMAIL_SENT) {
        const toBeDeletedDetails = existingDetails.filter(d => toDeleteIds.includes(d.Id));
        for (const old of toBeDeletedDetails) {
          if (old.FulfillmentStatus === "READY" && old.WarehouseId) {
            const oldStock = await prisma.warehouseStock.findFirst({
              where: { WarehouseId: old.WarehouseId, ItemCodeId: old.ItemCodeId }
            });
            if (oldStock) {
              await prisma.warehouseStock.update({
                where: { Id: oldStock.Id },
                data: { QtyOnHand: { increment: old.Quantity } }
              });
              await prisma.stockHistory.create({
                data: {
                  WarehouseStockId: oldStock.Id,
                  ItemCodeId: old.ItemCodeId,
                  QtyBefore: oldStock.QtyOnHand,
                  QtyAfter: oldStock.QtyOnHand + old.Quantity,
                  Note: `Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #${SalesOrderId}`,
                  AdminId: adminId,
                }
              });
            }
          }
        }
      }
      await prisma.salesOrderDetail.deleteMany({
        where: { Id: { in: toDeleteIds } },
      });


      for (const detail of SalesOrderDetails) {
        const taxIdToUse = ForceApplyTax ? defaultTaxId : null;
        const taxRateToUse = ForceApplyTax ? defaultTaxRate : 0;
        const finalPrice = detail.Price * detail.Quantity * (1 + taxRateToUse / 100);

        if (detail.Id && detail.Quantity === 0 && previousStatus === SalesOrderStatus.APPROVED_EMAIL_SENT) {
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
          console.log('CREATE NEW SALESORDERDETAIL:', detail);
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
          const old = existingDetails.find(d => d.Id === detail.Id);
          if (old && old.FulfillmentStatus === "READY" && old.WarehouseId) {
            const oldStock = await prisma.warehouseStock.findFirst({
              where: { WarehouseId: old.WarehouseId, ItemCodeId: old.ItemCodeId }
            });
            if (oldStock) {
              await prisma.warehouseStock.update({
                where: { Id: oldStock.Id },
                data: { QtyOnHand: { increment: old.Quantity } }
              });
              await prisma.stockHistory.create({
                data: {
                  WarehouseStockId: oldStock.Id,
                  ItemCodeId: old.ItemCodeId,
                  QtyBefore: oldStock.QtyOnHand,
                  QtyAfter: oldStock.QtyOnHand + old.Quantity,
                  Note: `Reversal stok karena SalesOrderDetail dihapus (qty=0) pada SalesOrder #${SalesOrderId}`,
                  AdminId: adminId,
                }
              });
            }
          }
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
    if (Status === SalesOrderStatus.APPROVED_EMAIL_SENT && oldOrder.Status !== SalesOrderStatus.APPROVED_EMAIL_SENT) {
      // Ambil detail lama dan baru
      const oldDetails = await prisma.salesOrderDetail.findMany({
        where: { SalesOrderId },
      });

      // Buat map by ItemCodeId (atau pakai Id jika unique)
      const oldMap = new Map();
      oldDetails.forEach(d => oldMap.set(d.Id, d));

      for (const detail of SalesOrderDetails) {
        if (!detail.Quantity || !detail.ItemCodeId) continue;

        // Hanya fulfillment READY yang boleh mengubah stok
        if (detail.FulfillmentStatus !== "READY") continue;

        const old = oldMap.get(detail.Id);
        const oldWarehouseId = old?.WarehouseId || null;
        const newWarehouseId = detail.WarehouseId || null;

        // --- Jika warehouse berbeda ---
        if (oldWarehouseId && newWarehouseId && oldWarehouseId !== newWarehouseId) {
          // 1. Kembalikan stok ke warehouse lama
          const oldStock = await prisma.warehouseStock.findFirst({
            where: { WarehouseId: oldWarehouseId, ItemCodeId: detail.ItemCodeId }
          });
          if (oldStock) {
            await prisma.warehouseStock.update({
              where: { Id: oldStock.Id },
              data: { QtyOnHand: { increment: detail.Quantity } }
            });
            await prisma.stockHistory.create({
              data: {
                WarehouseStockId: oldStock.Id,
                ItemCodeId: detail.ItemCodeId,
                QtyBefore: oldStock.QtyOnHand,
                QtyAfter: oldStock.QtyOnHand + detail.Quantity,
                Note: `Reversal update sales order karena pindah warehouse pada SalesOrder #${SalesOrderId} dari warehouseId ${oldWarehouseId}`,
                AdminId: adminId,
              }
            });
          }
          // 2. Kurangi stok di warehouse baru
          const newStock = await prisma.warehouseStock.findFirst({
            where: { WarehouseId: newWarehouseId, ItemCodeId: detail.ItemCodeId }
          });
          if (!newStock || newStock.QtyOnHand < detail.Quantity) {
            throw new Error(`Stock tidak cukup di warehouseId ${newWarehouseId} untuk ItemCodeId ${detail.ItemCodeId}`);
          }
          await prisma.warehouseStock.update({
            where: { Id: newStock.Id },
            data: { QtyOnHand: { decrement: detail.Quantity } }
          });
          await prisma.stockHistory.create({
            data: {
              WarehouseStockId: newStock.Id,
              ItemCodeId: detail.ItemCodeId,
              QtyBefore: newStock.QtyOnHand,
              QtyAfter: newStock.QtyOnHand - detail.Quantity,
              Note: `Pengambilan stok pada Approval SalesOrder #${SalesOrderId} di warehouseId ${newWarehouseId}`,
              AdminId: adminId,
            }
          });
        }
        // --- Jika warehouse sama atau baru pertama approve ---
        else if (newWarehouseId) {
          const stock = await prisma.warehouseStock.findFirst({
            where: { WarehouseId: newWarehouseId, ItemCodeId: detail.ItemCodeId }
          });
          if (!stock || stock.QtyOnHand < detail.Quantity) {
            throw new Error(
              `Stock tidak cukup di warehouseId ${newWarehouseId} untuk ItemCodeId ${detail.ItemCodeId}`
            );
          }
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
              Note: `Pengambilan stok pada Approval SalesOrder #${SalesOrderId} (warehouseId ${newWarehouseId})`,
              AdminId: adminId,
            }
          });
        }
        // Jika warehouseId null, biarkan saja (atau tambahkan logic fallback dealerWarehouse jika mau)
      }
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

export async function fetchWarehouseForItemCode(req: Request, res: Response) {
  try {
    const { ItemCodeId } = req.body;
    if (!ItemCodeId) {
      res.status(400).json({ message: "ItemCodeId is required" });
      return;
    }

    const stocks = await prisma.warehouseStock.findMany({
      where: {
        ItemCodeId: ItemCodeId,
        DeletedAt: null,
        QtyOnHand: { gt: 0 },
        Warehouse: { DeletedAt: null },
      },
      select: {
        Warehouse: {
          select: {
            Id: true,
            Name: true,
          }
        },
        QtyOnHand: true
      }
    });

    const result = stocks
      .filter(s => s.Warehouse && s.Warehouse.Id)
      .map(s => ({
        Id: s.Warehouse.Id,
        Name: s.Warehouse.Name,
        QtyOnHand: s.QtyOnHand
      }));

    res.json({ success: true, data: result }); // ⬅️ tanpa return
  } catch (error) {
    console.error("fetchWarehouseForItemCode error:", error);
    res.status(500).json({ message: "Internal server error" }); // ⬅️ tanpa return
  }
}