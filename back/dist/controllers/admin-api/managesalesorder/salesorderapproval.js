"use strict";
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
exports.updateSalesOrderApproval = exports.rejectSalesOrder = exports.needRevisionSalesOrder = exports.approveSalesOrder = void 0;
exports.fetchWarehouseForItemCode = fetchWarehouseForItemCode;
const client_1 = require("@prisma/client");
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const salesorder_1 = require("../../../controllers/dealer-api/transaction/salesorder");
const date_fns_1 = require("date-fns");
function padZero(num) {
    return num < 10 ? `0${num}` : `${num}`;
}
const prisma = new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
// ✅ Configure your email transporter
function renderTemplate(str, obj) {
    return str.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, p1) => (obj[p1] !== undefined ? obj[p1] : ""));
}
// Fungsi helper untuk reversal stok SO (restore ke gudang asal)
function reversalSalesOrderStock(salesOrderId, adminId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("reversalSalesOrderStock called with adminId:", adminId);
        if (!adminId) {
            throw new Error("AdminId wajib ada pada reversalSalesOrderStock (jangan biarkan stockHistory tanpa adminId)");
        }
        // Ambil semua detail yg fulfillment READY dan ada warehouseId
        const details = yield prisma.salesOrderDetail.findMany({
            where: { SalesOrderId: salesOrderId, FulfillmentStatus: "READY", WarehouseId: { not: null } }
        });
        for (const detail of details) {
            const warehouseStock = yield prisma.warehouseStock.findFirst({
                where: { WarehouseId: detail.WarehouseId, ItemCodeId: detail.ItemCodeId }
            });
            if (warehouseStock) {
                yield prisma.warehouseStock.update({
                    where: { Id: warehouseStock.Id },
                    data: { QtyOnHand: { increment: detail.Quantity } }
                });
                yield prisma.stockHistory.create({
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
        const inPoDetails = yield prisma.salesOrderDetail.findMany({
            where: { SalesOrderId: salesOrderId, FulfillmentStatus: "IN_PO" }
        });
        for (const detail of inPoDetails) {
            const itemCode = yield prisma.itemCode.findUnique({ where: { Id: detail.ItemCodeId } });
            if (itemCode) {
                yield prisma.itemCode.update({
                    where: { Id: detail.ItemCodeId },
                    data: { QtyPO: ((_a = itemCode.QtyPO) !== null && _a !== void 0 ? _a : 0) + detail.Quantity }
                });
                yield prisma.stockHistory.create({
                    data: {
                        WarehouseStockId: null,
                        ItemCodeId: detail.ItemCodeId,
                        QtyBefore: itemCode.QtyPO,
                        QtyAfter: ((_b = itemCode.QtyPO) !== null && _b !== void 0 ? _b : 0) + detail.Quantity,
                        Note: `Reversal QtyPO pada SalesOrder #${salesOrderId}`,
                        AdminId: adminId,
                    }
                });
            }
        }
    });
}
//fungsi untuk reversal stok pada sales order detail ketika pindah warehouse
function patchReversalWarehouseChange(details, oldMap, salesOrderId, adminId) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const detail of details) {
            if (!detail.Id || !detail.Quantity || detail.FulfillmentStatus !== "READY")
                continue;
            const old = oldMap.get(detail.Id);
            if (!old)
                continue;
            // ItemCode BERUBAH (dan warehouse asal ada)
            if (old.ItemCodeId &&
                detail.ItemCodeId &&
                old.ItemCodeId !== detail.ItemCodeId &&
                old.WarehouseId) {
                // Kembalikan stok ke warehouse asal untuk ItemCode lama
                const oldStock = yield prisma.warehouseStock.findFirst({
                    where: { WarehouseId: old.WarehouseId, ItemCodeId: old.ItemCodeId }
                });
                if (oldStock) {
                    yield prisma.warehouseStock.update({
                        where: { Id: oldStock.Id },
                        data: { QtyOnHand: { increment: old.Quantity } }
                    });
                    yield prisma.stockHistory.create({
                        data: {
                            WarehouseStockId: oldStock.Id,
                            ItemCodeId: old.ItemCodeId,
                            QtyBefore: oldStock.QtyOnHand,
                            QtyAfter: oldStock.QtyOnHand + old.Quantity,
                            Note: `Reversal karena pindah ItemCode pada Approval SalesOrder #${salesOrderId} dari ItemCodeId ${old.ItemCodeId} ke ${detail.ItemCodeId}`,
                            AdminId: adminId,
                        }
                    });
                }
                // pengurangan stok itemCode baru dilakukan proses normal setelah patch ini!
            }
            // Warehouse BERUBAH, ItemCode SAMA
            else if (old.WarehouseId &&
                detail.WarehouseId &&
                old.WarehouseId !== detail.WarehouseId &&
                old.ItemCodeId === detail.ItemCodeId) {
                // Kembalikan stok ke warehouse lama
                const oldStock = yield prisma.warehouseStock.findFirst({
                    where: { WarehouseId: old.WarehouseId, ItemCodeId: detail.ItemCodeId }
                });
                if (oldStock) {
                    yield prisma.warehouseStock.update({
                        where: { Id: oldStock.Id },
                        data: { QtyOnHand: { increment: detail.Quantity } }
                    });
                    yield prisma.stockHistory.create({
                        data: {
                            WarehouseStockId: oldStock.Id,
                            ItemCodeId: detail.ItemCodeId,
                            QtyBefore: oldStock.QtyOnHand,
                            QtyAfter: oldStock.QtyOnHand + detail.Quantity,
                            Note: `Reversal karena pindah warehouse pada Approval SalesOrder #${salesOrderId} dari warehouseId ${old.WarehouseId} ke ${detail.WarehouseId}`,
                            AdminId: adminId,
                        }
                    });
                }
                // pengurangan stok warehouse baru dilakukan proses normal setelah patch ini!
            }
            // Kasus lain: skip
        }
    });
}
const approveSalesOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    try {
        const { SalesOrderId, SalesId, SalesOrderNumber, JdeSalesOrderNumber, Note, PaymentTerm, FOB, CustomerPoNumber, DeliveryOrderNumber, SalesOrderDetails, ForceApplyTax,
        // ...tambahkan field lain kalau perlu
         } = req.body;
        const parsedSalesOrderId = Number(SalesOrderId);
        const parsedSalesId = Number(SalesId);
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.Id;
        if (!adminId) {
            res.status(200).json({ message: "Unauthorized. AdminId missing." });
            return;
        }
        if (!parsedSalesOrderId || isNaN(parsedSalesOrderId)) {
            res.status(200).json({ message: "SalesOrderId must be a valid number." });
            return;
        }
        if (!parsedSalesId || isNaN(parsedSalesId)) {
            res.status(200).json({ message: "SalesId must be a valid number." });
            return;
        }
        console.log("[DEBUG][ApproveSalesOrder] BODY:", JSON.stringify(req.body, null, 2));
        console.log("[DEBUG][ApproveSalesOrder] adminId:", (_b = req.admin) === null || _b === void 0 ? void 0 : _b.Id);
        console.log("[DEBUG][ApproveSalesOrder] SalesOrderId:", parsedSalesOrderId, "SalesId:", parsedSalesId);
        // === VALIDASI HARGA DULU SEBELUM PROSES ===
        if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
            for (const detail of SalesOrderDetails) {
                if (!detail.WarehouseId || detail.FulfillmentStatus !== 'READY' || detail.Quantity <= 0)
                    continue;
                const stock = yield prisma.warehouseStock.findFirst({
                    where: {
                        WarehouseId: detail.WarehouseId,
                        ItemCodeId: detail.ItemCodeId,
                        DeletedAt: null
                    }
                });
                if (!stock || stock.QtyOnHand < detail.Quantity) {
                    // ===> STOP PROSES DI SINI! RETURN LANGSUNG, JANGAN LANJUT APA2!
                    res.status(400).json({
                        success: false,
                        message: `Stock tidak cukup untuk ItemCodeId ${detail.ItemCodeId} di warehouseId ${detail.WarehouseId}`,
                        itemCodeId: detail.ItemCodeId,
                        warehouseId: detail.WarehouseId,
                        qtyDibutuhkan: detail.Quantity,
                        qtyTersedia: stock ? stock.QtyOnHand : 0
                    });
                    return;
                }
            }
        }
        const updateData = {};
        if (SalesOrderNumber !== undefined)
            updateData.SalesOrderNumber = SalesOrderNumber;
        if (JdeSalesOrderNumber !== undefined)
            updateData.JdeSalesOrderNumber = JdeSalesOrderNumber;
        if (Note !== undefined)
            updateData.Note = Note;
        if (PaymentTerm !== undefined)
            updateData.PaymentTerm = PaymentTerm;
        if (FOB !== undefined)
            updateData.FOB = FOB;
        if (CustomerPoNumber !== undefined)
            updateData.CustomerPoNumber = CustomerPoNumber;
        if (DeliveryOrderNumber !== undefined)
            updateData.DeliveryOrderNumber = DeliveryOrderNumber;
        if (SalesId !== undefined)
            updateData.SalesId = parsedSalesId;
        let updatedOrder = null;
        if (Object.keys(updateData).length > 0) {
            updatedOrder = yield prisma.salesOrder.update({
                where: { Id: parsedSalesOrderId },
                data: updateData,
            });
        }
        // --- Step 2: Fetch ulang salesOrder dengan Sales relasi terbaru
        const salesOrder = yield prisma.salesOrder.findUnique({
            where: { Id: parsedSalesOrderId },
            include: {
                Dealer: true,
                Sales: { include: { Admin: true } },
                SalesOrderFile: true,
            },
        });
        if (!salesOrder) {
            res.status(200).json({ message: "Sales Order not found." });
            return;
        }
        const dealerId = salesOrder.DealerId;
        // --- Step 3: Ambil recipient sesuai SalesId terbaru
        const recipients = yield prisma.emailSalesOrderRecipient.findMany({
            where: {
                SalesId: parsedSalesId,
                DeletedAt: null,
            },
        });
        if (!recipients.length) {
            res.status(200).json({ message: "No recipients found for this Sales." });
            return;
        }
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const storeCode = ((_c = salesOrder.Dealer) === null || _c === void 0 ? void 0 : _c.StoreCode) || "XXXX";
        const day = padZero(now.getDate());
        const month = (0, date_fns_1.format)(now, "MMM").toUpperCase();
        const year = now.getFullYear();
        // Penomoran sales order: Atomic Transaction untuk menghindari double nomor pada hari yang sama
        // Penomoran sales order: Atomic Transaction untuk menghindari double nomor pada hari yang sama
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Cek dulu, jika sales order sudah punya nomor, jangan diubah
            const currentOrder = yield tx.salesOrder.findUnique({
                where: { Id: parsedSalesOrderId },
                select: { SalesOrderNumber: true }
            });
            let updateData = {
                Status: client_1.SalesOrderStatus.APPROVED_EMAIL_SENT
            };
            // Hanya generate nomor jika kosong/belum ada
            if (!(currentOrder === null || currentOrder === void 0 ? void 0 : currentOrder.SalesOrderNumber) || currentOrder.SalesOrderNumber.trim() === "") {
                // Loop: cari nomor yang pasti unik
                let found = false;
                let trySeq = 1;
                let generatedNumber = "";
                while (!found) {
                    const seqStr = padZero(trySeq);
                    generatedNumber = `SS-${seqStr}/${storeCode}/${day}/${month}/${year}`;
                    // Cari sales order hari ini dengan nomor ini
                    const exists = yield tx.salesOrder.findFirst({
                        where: {
                            SalesOrderNumber: generatedNumber,
                            CreatedAt: { gte: startOfDay, lte: endOfDay }
                        }
                    });
                    if (!exists) {
                        found = true;
                    }
                    else {
                        trySeq++;
                    }
                }
                updateData.SalesOrderNumber = generatedNumber;
            }
            yield tx.salesOrder.update({
                where: { Id: parsedSalesOrderId },
                data: updateData,
            });
        }));
        if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
            const activeTax = yield prisma.tax.findFirst({
                where: { IsActive: true, DeletedAt: null },
                orderBy: { CreatedAt: 'desc' },
            });
            const defaultTaxRate = (_d = activeTax === null || activeTax === void 0 ? void 0 : activeTax.Percentage) !== null && _d !== void 0 ? _d : 0;
            const defaultTaxId = (_e = activeTax === null || activeTax === void 0 ? void 0 : activeTax.Id) !== null && _e !== void 0 ? _e : null;
            const existingDetails = yield prisma.salesOrderDetail.findMany({
                where: { SalesOrderId: parsedSalesOrderId },
            });
            const incomingIds = SalesOrderDetails.map((d) => d.Id).filter((id) => !!id);
            const existingIds = existingDetails.map((d) => d.Id);
            const toDeleteIds = existingIds.filter(id => !incomingIds.includes(id));
            // Reversal stok untuk setiap detail yang akan dihapus (deleteMany)
            const currentStatus = salesOrder.Status; // setelah fetch salesOrder di atas
            if (toDeleteIds.length > 0 && currentStatus === client_1.SalesOrderStatus.APPROVED_EMAIL_SENT) {
                const toBeDeletedDetails = existingDetails.filter(d => toDeleteIds.includes(d.Id));
                for (const old of toBeDeletedDetails) {
                    if (old.FulfillmentStatus === "READY" && old.WarehouseId) {
                        const oldStock = yield prisma.warehouseStock.findFirst({
                            where: { WarehouseId: old.WarehouseId, ItemCodeId: old.ItemCodeId }
                        });
                        if (oldStock) {
                            yield prisma.warehouseStock.update({
                                where: { Id: oldStock.Id },
                                data: { QtyOnHand: { increment: old.Quantity } }
                            });
                            yield prisma.stockHistory.create({
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
            yield prisma.salesOrderDetail.deleteMany({
                where: { Id: { in: toDeleteIds } },
            });
            // ========================
            // FOR LOOP utama SalesOrderDetails:
            for (const detail of SalesOrderDetails) {
                const isTax = ForceApplyTax === true;
                const taxIdToUse = isTax ? defaultTaxId : null;
                const taxRateToUse = isTax ? defaultTaxRate : 0;
                const finalPrice = detail.Price * detail.Quantity * (1 + taxRateToUse / 100);
                if (detail.Id && detail.Quantity > 0) {
                    yield prisma.salesOrderDetail.update({
                        where: { Id: detail.Id },
                        data: {
                            Quantity: detail.Quantity,
                            Price: detail.Price,
                            FinalPrice: finalPrice,
                            TaxId: taxIdToUse,
                            WarehouseId: (_f = detail.WarehouseId) !== null && _f !== void 0 ? _f : null,
                            PriceCategoryId: (_g = detail.PriceCategoryId) !== null && _g !== void 0 ? _g : null,
                            FulfillmentStatus: (_h = detail.FulfillmentStatus) !== null && _h !== void 0 ? _h : 'READY',
                        },
                    });
                    continue; // langsung lanjut ke detail berikutnya (skip blok create/delete)
                }
                else if (!detail.Id && detail.Quantity > 0 && detail.Price) {
                    // Jika WarehouseId dari FE null, cari algoritma gudang
                    let warehouseIdToUse = (_j = detail.WarehouseId) !== null && _j !== void 0 ? _j : null;
                    if (!warehouseIdToUse) {
                        // --- ALGORITMA PILIH GUDANG ---
                        const dealerWarehouses = yield prisma.dealerWarehouse.findMany({
                            where: { DealerId: dealerId },
                            orderBy: [{ Priority: "asc" }]
                        });
                        let selectedWarehouse = null;
                        for (const dw of dealerWarehouses) {
                            const stock = yield prisma.warehouseStock.findFirst({
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
                            const stock = yield prisma.warehouseStock.findFirst({
                                where: { ItemCodeId: detail.ItemCodeId, QtyOnHand: { gte: detail.Quantity } },
                                orderBy: { QtyOnHand: "desc" }
                            });
                            if (stock) {
                                selectedWarehouse = { WarehouseId: stock.WarehouseId };
                            }
                        }
                        if (!selectedWarehouse) {
                            res.status(200).json({
                                success: false,
                                message: `Stock tidak cukup untuk ItemCodeId ${detail.ItemCodeId} pada semua gudang`,
                                itemCodeId: detail.ItemCodeId,
                                quantity: detail.Quantity
                            });
                            return; // Stop proses lebih lanjut
                        }
                        warehouseIdToUse = selectedWarehouse.WarehouseId;
                    }
                    // CREATE dengan WarehouseId hasil algoritma
                    yield prisma.salesOrderDetail.create({
                        data: {
                            SalesOrderId: parsedSalesOrderId,
                            ItemCodeId: detail.ItemCodeId,
                            Quantity: detail.Quantity,
                            Price: detail.Price,
                            FinalPrice: finalPrice,
                            TaxId: taxIdToUse,
                            WarehouseId: warehouseIdToUse,
                            PriceCategoryId: (_k = detail.PriceCategoryId) !== null && _k !== void 0 ? _k : null,
                            FulfillmentStatus: (_l = detail.FulfillmentStatus) !== null && _l !== void 0 ? _l : 'READY',
                        },
                    });
                }
                else if (detail.Id && detail.Quantity === 0) {
                    // PATCH: reversal di sini, di dalam loop
                    const old = existingDetails.find(d => d.Id === detail.Id);
                    if (old && old.FulfillmentStatus === "READY" && old.WarehouseId) {
                        const oldStock = yield prisma.warehouseStock.findFirst({
                            where: { WarehouseId: old.WarehouseId, ItemCodeId: old.ItemCodeId }
                        });
                        if (oldStock) {
                            yield prisma.warehouseStock.update({
                                where: { Id: oldStock.Id },
                                data: { QtyOnHand: { increment: old.Quantity } }
                            });
                            yield prisma.stockHistory.create({
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
                    yield prisma.salesOrderDetail.delete({
                        where: { Id: detail.Id },
                    });
                    continue;
                }
            }
            // --- Step X: VALIDASI HARGA --- //
            const details = yield prisma.salesOrderDetail.findMany({
                where: { SalesOrderId: parsedSalesOrderId },
            });
            const hasNoPrice = details.some(d => !d.Price || d.Price === 0);
            console.log('DEBUG: Akan generateExcel/PDF untuk SO:', parsedSalesOrderId);
            // Regenerate file jika detail ikut diubah
            console.log("[DEBUG] MULAI generateExcel");
            const excelFileName = yield (0, salesorder_1.generateExcel)(parsedSalesOrderId);
            console.log("[DEBUG] SELESAI generateExcel:", excelFileName);
            const pdfFileName = yield (0, salesorder_1.generatePDF)(parsedSalesOrderId);
            console.log('DEBUG: excelFileName:', excelFileName, 'pdfFileName:', pdfFileName);
            yield prisma.salesOrderFile.updateMany({
                where: { SalesOrderId: parsedSalesOrderId },
                data: {
                    ExcelFile: excelFileName,
                    PdfFile: pdfFileName,
                },
            });
        }
        // === Tambahan PATCH untuk mengembalikan stok jika warehouse berubah saat approval ===
        if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
            const oldDetails = yield prisma.salesOrderDetail.findMany({
                where: { SalesOrderId: parsedSalesOrderId },
            });
            const oldMap = new Map();
            oldDetails.forEach(d => oldMap.set(d.Id, d));
            // ⬇️ reversal patch HANYA SEKALI di sini!
            if (salesOrder.Status !== client_1.SalesOrderStatus.APPROVED_EMAIL_SENT) {
                yield patchReversalWarehouseChange(SalesOrderDetails, oldMap, parsedSalesOrderId, adminId);
            }
            // UPDATE, CREATE, DELETE detail tanpa reversal manual
        }
        const dbDetails = yield prisma.salesOrderDetail.findMany({
            where: { SalesOrderId: parsedSalesOrderId },
        });
        // Cek semua stok dulu
        for (const detail of dbDetails) {
            if (detail.FulfillmentStatus === "READY" &&
                detail.WarehouseId &&
                detail.Quantity > 0) {
                console.log("MASUK PENGURANGAN STOK:", detail);
                const stock = yield prisma.warehouseStock.findFirst({
                    where: {
                        WarehouseId: detail.WarehouseId,
                        ItemCodeId: detail.ItemCodeId,
                        QtyOnHand: { gte: detail.Quantity }
                    }
                });
                if (!stock) {
                    // ERROR: stok tidak cukup atau tidak ditemukan
                    res.status(400).json({
                        success: false,
                        message: `Stock tidak ditemukan atau stok kurang untuk ItemCodeId ${detail.ItemCodeId} di warehouseId ${detail.WarehouseId}`,
                        itemCodeId: detail.ItemCodeId,
                        warehouseId: detail.WarehouseId,
                        qtyDibutuhkan: detail.Quantity
                    });
                    return;
                }
                console.log('PENGURANGAN STOK', {
                    warehouseStockId: stock.Id,
                    warehouseId: detail.WarehouseId,
                    itemCodeId: detail.ItemCodeId,
                    qtyBefore: stock.QtyOnHand,
                    qtyKurang: detail.Quantity
                });
                yield prisma.warehouseStock.update({
                    where: { Id: stock.Id },
                    data: { QtyOnHand: { decrement: detail.Quantity } }
                });
                yield prisma.stockHistory.create({
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
        // Cek apakah file sudah ada
        let salesOrderFile = yield prisma.salesOrderFile.findUnique({
            where: { SalesOrderId: parsedSalesOrderId }
        });
        let excelFileName = salesOrderFile === null || salesOrderFile === void 0 ? void 0 : salesOrderFile.ExcelFile;
        let pdfFileName = salesOrderFile === null || salesOrderFile === void 0 ? void 0 : salesOrderFile.PdfFile;
        // Tentukan path file
        const excelPath = path_1.default.join(process.cwd(), "public/dealer/files/salesorder/excel", excelFileName || "");
        const pdfPath = path_1.default.join(process.cwd(), "public/dealer/files/salesorder/pdf", pdfFileName || "");
        // Cek file fisik (harus exist di folder)
        const excelExists = !!excelFileName && fs_1.default.existsSync(excelPath);
        const pdfExists = !!pdfFileName && fs_1.default.existsSync(pdfPath);
        // Kalau file DB **atau** file fisik **tidak ada** => generate baru
        if (!excelExists || !pdfExists) {
            // generate file baru (nama bisa sama, biarkan file lama ketimpa)
            excelFileName = yield (0, salesorder_1.generateExcel)(parsedSalesOrderId);
            pdfFileName = yield (0, salesorder_1.generatePDF)(parsedSalesOrderId);
            if (salesOrderFile) {
                yield prisma.salesOrderFile.update({
                    where: { SalesOrderId: parsedSalesOrderId },
                    data: {
                        ExcelFile: excelFileName,
                        PdfFile: pdfFileName,
                    },
                });
            }
            else {
                yield prisma.salesOrderFile.create({
                    data: {
                        SalesOrderId: parsedSalesOrderId,
                        ExcelFile: excelFileName,
                        PdfFile: pdfFileName,
                    },
                });
            }
        }
        // Fetch ulang sales order (data sudah pasti paling update, termasuk nomor dan file)
        const updatedSalesOrder = yield prisma.salesOrder.findUnique({
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
        const template = yield prisma.emailTemplate.findFirst({
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
            user: ((_o = (_m = updatedSalesOrder.Sales) === null || _m === void 0 ? void 0 : _m.Admin) === null || _o === void 0 ? void 0 : _o.Name) || "-",
            dealer: ((_p = updatedSalesOrder.Dealer) === null || _p === void 0 ? void 0 : _p.CompanyName) || "-",
            sales_order_number: updatedSalesOrder.SalesOrderNumber || "-",
            created_date: updatedSalesOrder.CreatedAt.toLocaleDateString(),
            sales: ((_r = (_q = updatedSalesOrder.Sales) === null || _q === void 0 ? void 0 : _q.Admin) === null || _r === void 0 ? void 0 : _r.Name) || "-",
            JDE: updatedSalesOrder.JdeSalesOrderNumber || "-",
            // Tambahkan variabel lain jika diperlukan oleh template
        };
        console.log('DEBUG: updatedSalesOrder for email:', JSON.stringify(updatedSalesOrder, null, 2));
        console.log('DEBUG: email template:', template);
        console.log('DEBUG: email body mapping data:', data);
        // --- 4. Render template dengan data
        const emailBody = renderTemplate((template === null || template === void 0 ? void 0 : template.Body) || defaultBody, data);
        const emailSubject = renderTemplate((template === null || template === void 0 ? void 0 : template.Subject) || defaultSubject, data);
        const emailTemplateId = (_s = template === null || template === void 0 ? void 0 : template.Id) !== null && _s !== void 0 ? _s : null; // Simpan ke EmailSalesOrder
        const attachments = [];
        if ((_t = updatedSalesOrder.SalesOrderFile) === null || _t === void 0 ? void 0 : _t.ExcelFile) {
            const basePath = process.cwd();
            const excelPath = path_1.default.join(basePath, "public/dealer/files/salesorder/excel", updatedSalesOrder.SalesOrderFile.ExcelFile);
            if (fs_1.default.existsSync(excelPath)) {
                attachments.push({ filename: updatedSalesOrder.SalesOrderFile.ExcelFile, path: excelPath });
            }
        }
        // 🔍 Ambil konfigurasi email dari DB
        const emailConfig = yield prisma.emailConfig.findFirst({
            where: { DeletedAt: null },
        });
        if (!emailConfig || !emailConfig.Email || !emailConfig.Password) {
            res.status(500).json({ message: "Email configuration not found or incomplete." });
            return;
        }
        console.log('DEBUG: Akan kirim email ke:', recipients.map(r => r.RecipientEmail));
        // 🛠 Buat transporter secara dinamis berdasarkan DB
        const transporter = nodemailer_1.default.createTransport({
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
        console.log("[DEBUG] EmailConfig:", emailConfig);
        // VARIABEL UNTUK TRACKING
        let allEmailSent = true;
        const emailResults = yield Promise.all(recipients.map((recipient) => __awaiter(void 0, void 0, void 0, function* () {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipient.RecipientEmail,
                subject: emailSubject,
                html: emailBody,
                attachments,
            };
            let status = client_1.EmailStatus.SENT;
            try {
                yield transporter.sendMail(mailOptions);
                console.log("Email sent to", recipient.RecipientEmail);
            }
            catch (error) {
                status = client_1.EmailStatus.FAILED;
                allEmailSent = false;
                console.log("Email send failed to", recipient.RecipientEmail, error);
                // log error jika mau
            }
            yield prisma.emailSalesOrder.create({
                data: {
                    SalesOrderId: parsedSalesOrderId,
                    RecipientEmail: recipient.RecipientEmail,
                    Subject: mailOptions.subject,
                    Status: status,
                    Body: emailBody,
                    ApprovedAt: status === client_1.EmailStatus.SENT ? new Date() : undefined,
                    EmailTemplateId: emailTemplateId,
                },
            });
            return status;
        })));
        if (allEmailSent) {
            res.status(200).json({
                success: true,
                message: "Approve berhasil! Sales Order telah di-approve dan email telah dikirim.",
            });
            console.log("[API END] approveSalesOrder SUKSES:", parsedSalesOrderId);
            return;
        }
        res.status(400).json({ message: "Stock sudah berhasil update, tetapi ada email yang gagal terkirim. Status tidak berubah." });
        console.log("[API END] approveSalesOrder EMAIL GAGAL:", parsedSalesOrderId);
        return;
    }
    catch (error) {
        // 1. Logging detail tetap di console/server
        console.error("[ERROR approveSalesOrder]", error);
        // 2. Cek apakah response sudah pernah dikirim
        if (res.headersSent) {
            console.warn("WARNING: Response sudah dikirim sebelum error ini terjadi!");
            return;
        }
    }
});
exports.approveSalesOrder = approveSalesOrder;
const needRevisionSalesOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const SalesOrderId = Number(req.body.SalesOrderId);
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.Id; // pastikan ini ada!
        if (!SalesOrderId || isNaN(SalesOrderId)) {
            res.status(400).json({ message: "SalesOrderId must be a valid number." });
            return;
        }
        const salesOrder = yield prisma.salesOrder.findUnique({ where: { Id: SalesOrderId } });
        if (!salesOrder) {
            res.status(404).json({ message: "Sales Order not found." });
            return;
        }
        // Cek status lama, reversal jika perlu
        if (salesOrder.Status === client_1.SalesOrderStatus.APPROVED_EMAIL_SENT) {
            if (typeof adminId !== "number") {
                res.status(401).json({ message: "Unauthorized. AdminId missing." });
                return;
            }
            yield reversalSalesOrderStock(SalesOrderId, adminId);
        }
        yield prisma.salesOrder.update({
            where: { Id: SalesOrderId },
            data: { Status: client_1.SalesOrderStatus.NEEDS_REVISION },
        });
        res.status(200).json({ message: "Sales Order marked as needing revision." });
    }
    catch (error) {
        console.error("Error marking revision:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.needRevisionSalesOrder = needRevisionSalesOrder;
const rejectSalesOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const SalesOrderId = Number(req.body.SalesOrderId);
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.Id;
        if (!adminId) {
            res.status(401).json({ message: "Unauthorized. AdminId missing." });
            return;
        }
        if (!SalesOrderId || isNaN(SalesOrderId)) {
            res.status(400).json({ message: "SalesOrderId must be a valid number." });
            return;
        }
        // Cek status lama
        const oldOrder = yield prisma.salesOrder.findUnique({ where: { Id: SalesOrderId } });
        if (!oldOrder) {
            res.status(404).json({ message: "Sales Order not found." });
            return;
        }
        // **Perbaikan:** reversal hanya jika status sebelumnya APPROVED_EMAIL_SENT
        if (oldOrder.Status === client_1.SalesOrderStatus.APPROVED_EMAIL_SENT) {
            yield reversalSalesOrderStock(SalesOrderId, adminId);
        }
        yield prisma.salesOrder.update({
            where: { Id: SalesOrderId },
            data: { Status: client_1.SalesOrderStatus.REJECTED },
        });
        res.status(200).json({ message: "Sales Order rejected successfully." });
    }
    catch (error) {
        console.error("Error rejecting Sales Order:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.rejectSalesOrder = rejectSalesOrder;
const updateSalesOrderApproval = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const { SalesOrderId, SalesOrderNumber, JdeSalesOrderNumber, Status, Note, PaymentTerm, FOB, CustomerPoNumber, DeliveryOrderNumber, SalesOrderDetails, ForceApplyTax } = req.body;
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.Id;
        if (!adminId) {
            res.status(401).json({ message: "Unauthorized. AdminId missing." });
            return;
        }
        console.log('DEBUG: req.admin =', req.admin);
        if (!SalesOrderId || isNaN(Number(SalesOrderId))) {
            res.status(400).json({ message: "Invalid or missing SalesOrderId." });
            return;
        }
        const existingOrder = yield prisma.salesOrder.findUnique({
            where: { Id: SalesOrderId },
        });
        if (!existingOrder) {
            res.status(404).json({ message: "Sales Order not found." });
            return;
        }
        const oldOrder = yield prisma.salesOrder.findUnique({
            where: { Id: SalesOrderId },
        });
        if (!oldOrder) {
            res.status(404).json({ message: "Sales Order not found." });
            return;
        }
        // ------------ FIX DI SINI ------------
        // Ambil old detail (sebelum proses update apapun)
        let oldMap = new Map();
        let oldDetails = [];
        if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
            oldDetails = yield prisma.salesOrderDetail.findMany({ where: { SalesOrderId } });
            oldDetails.forEach(d => oldMap.set(d.Id, d));
            // PATCH REVERSAL HANYA JIKA STATUS BERUBAH KE APPROVED_EMAIL_SENT DARI BUKAN
            if (Status === client_1.SalesOrderStatus.APPROVED_EMAIL_SENT && oldOrder.Status !== client_1.SalesOrderStatus.APPROVED_EMAIL_SENT) {
                yield patchReversalWarehouseChange(SalesOrderDetails, oldMap, SalesOrderId, adminId);
            }
        }
        // Cek jika butuh reversal: status lama APPROVED_EMAIL_SENT, status baru bukan APPROVED_EMAIL_SENT
        if (oldOrder.Status === client_1.SalesOrderStatus.APPROVED_EMAIL_SENT && Status !== client_1.SalesOrderStatus.APPROVED_EMAIL_SENT) {
            console.log('DEBUG: Akan reversal dengan adminId =', adminId);
            yield reversalSalesOrderStock(SalesOrderId, adminId);
            console.log('DEBUG: Selesai reversal');
        }
        const updateData = {};
        if (SalesOrderNumber !== undefined)
            updateData.SalesOrderNumber = SalesOrderNumber;
        if (JdeSalesOrderNumber !== undefined)
            updateData.JdeSalesOrderNumber = JdeSalesOrderNumber;
        if (Status !== undefined)
            updateData.Status = Status;
        if (Note !== undefined)
            updateData.Note = Note;
        if (PaymentTerm !== undefined)
            updateData.PaymentTerm = PaymentTerm;
        if (FOB !== undefined)
            updateData.FOB = FOB;
        if (CustomerPoNumber !== undefined)
            updateData.CustomerPoNumber = CustomerPoNumber;
        if (DeliveryOrderNumber !== undefined)
            updateData.DeliveryOrderNumber = DeliveryOrderNumber;
        let updatedOrder = existingOrder;
        // 🔸 Update main SalesOrder if any field is changed
        if (Object.keys(updateData).length > 0) {
            updatedOrder = yield prisma.salesOrder.update({
                where: { Id: SalesOrderId },
                data: updateData,
            });
        }
        // 🔸 Process SalesOrderDetails if provided
        if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
            const activeTax = yield prisma.tax.findFirst({
                where: { IsActive: true, DeletedAt: null },
                orderBy: { CreatedAt: 'desc' },
            });
            const defaultTaxRate = (_b = activeTax === null || activeTax === void 0 ? void 0 : activeTax.Percentage) !== null && _b !== void 0 ? _b : 0;
            const defaultTaxId = (_c = activeTax === null || activeTax === void 0 ? void 0 : activeTax.Id) !== null && _c !== void 0 ? _c : null;
            const existingDetails = yield prisma.salesOrderDetail.findMany({
                where: { SalesOrderId },
            });
            const incomingIds = SalesOrderDetails.map((d) => d.Id).filter((id) => !!id);
            const existingIds = existingDetails.map((d) => d.Id);
            const toDeleteIds = existingIds.filter(id => !incomingIds.includes(id));
            // --- Reversal stok untuk setiap detail yang akan dihapus (deleteMany)
            const previousStatus = oldOrder.Status; // setelah fetch oldOrder
            yield prisma.salesOrderDetail.deleteMany({
                where: { Id: { in: toDeleteIds } },
            });
            for (const detail of SalesOrderDetails) {
                const isTax = ForceApplyTax === true;
                const taxIdToUse = isTax ? defaultTaxId : null;
                const taxRateToUse = isTax ? defaultTaxRate : 0;
                const finalPrice = detail.Price * detail.Quantity * (1 + taxRateToUse / 100);
                // PATCH (update existing)
                if (detail.Id && detail.Quantity > 0) {
                    yield prisma.salesOrderDetail.update({
                        where: { Id: detail.Id },
                        data: {
                            Quantity: detail.Quantity,
                            Price: detail.Price,
                            FinalPrice: finalPrice,
                            TaxId: taxIdToUse,
                            WarehouseId: (_d = detail.WarehouseId) !== null && _d !== void 0 ? _d : null,
                            PriceCategoryId: (_e = detail.PriceCategoryId) !== null && _e !== void 0 ? _e : null,
                            FulfillmentStatus: (_f = detail.FulfillmentStatus) !== null && _f !== void 0 ? _f : 'READY',
                        },
                    });
                    continue;
                }
                // CREATE (insert new)
                else if (!detail.Id && detail.Quantity > 0 && detail.Price) {
                    yield prisma.salesOrderDetail.create({
                        data: {
                            SalesOrderId: SalesOrderId,
                            ItemCodeId: detail.ItemCodeId,
                            Quantity: detail.Quantity,
                            Price: detail.Price,
                            FinalPrice: finalPrice,
                            TaxId: taxIdToUse,
                            WarehouseId: (_g = detail.WarehouseId) !== null && _g !== void 0 ? _g : null,
                            PriceCategoryId: (_h = detail.PriceCategoryId) !== null && _h !== void 0 ? _h : null,
                            FulfillmentStatus: (_j = detail.FulfillmentStatus) !== null && _j !== void 0 ? _j : 'READY',
                        },
                    });
                }
                // DELETE (hapus jika quantity = 0)
                else if (detail.Id && detail.Quantity === 0) {
                    yield prisma.salesOrderDetail.delete({
                        where: { Id: detail.Id },
                    });
                    continue;
                }
            }
            // Hanya regenerate file jika detail ikut diubah
            const excelFileName = yield (0, salesorder_1.generateExcel)(SalesOrderId);
            const pdfFileName = yield (0, salesorder_1.generatePDF)(SalesOrderId);
            yield prisma.salesOrderFile.updateMany({
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
    }
    catch (error) {
        console.error("Error updating Sales Order:", error);
        if (error instanceof Error) {
            res.status(400).json({ message: error.message || "Internal Server Error." });
        }
        else {
            res.status(400).json({ message: "Internal Server Error." });
        }
    }
});
exports.updateSalesOrderApproval = updateSalesOrderApproval;
function fetchWarehouseForItemCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { ItemCodeId } = req.body;
            if (!ItemCodeId) {
                res.status(400).json({ message: "ItemCodeId is required" });
                return;
            }
            // Ambil warehouse yang punya stok (QtyOnHand > 0)
            const stocks = yield prisma.warehouseStock.findMany({
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
            // Ambil SEMUA warehouse aktif yang memiliki baris di warehouseStock (termasuk QtyOnHand = 0)
            const allWarehouseStocks = yield prisma.warehouseStock.findMany({
                where: {
                    ItemCodeId: ItemCodeId,
                    DeletedAt: null,
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
            // Gabungkan, utamakan QtyOnHand asli jika sudah ada, sisanya tambahkan QtyOnHand = 0 jika memang kosong
            const warehouseMap = {};
            // Masukkan semua stocks (yang QtyOnHand > 0)
            for (const s of stocks) {
                if (s.Warehouse && s.Warehouse.Id) {
                    warehouseMap[s.Warehouse.Id] = {
                        Id: s.Warehouse.Id,
                        Name: (_a = s.Warehouse.Name) !== null && _a !== void 0 ? _a : "",
                        QtyOnHand: s.QtyOnHand
                    };
                }
            }
            // Tambahkan semua warehouse lain (yang QtyOnHand = 0 dan belum masuk di atas)
            for (const s of allWarehouseStocks) {
                if (s.Warehouse && s.Warehouse.Id && !warehouseMap[s.Warehouse.Id]) {
                    warehouseMap[s.Warehouse.Id] = {
                        Id: s.Warehouse.Id,
                        Name: (_b = s.Warehouse.Name) !== null && _b !== void 0 ? _b : "",
                        QtyOnHand: s.QtyOnHand // sudah 0
                    };
                }
            }
            // Jadikan array
            const result = Object.values(warehouseMap);
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error("fetchWarehouseForItemCode error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}
