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
exports.deleteSalesOrder = exports.updateSalesOrder = exports.getAllSalesOrders = exports.getSalesOrdersBySales = exports.getSalesOrdersByUserDealer = exports.generatePDF = exports.generateExcel = exports.convertCartToSalesOrder = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const Pricing_1 = require("../../../controllers/global/Pricing");
const prisma = new client_1.PrismaClient();
// Direktori penyimpanan file
const EXCEL_DIRECTORY = path_1.default.join(process.cwd(), "public", "dealer", "files", "salesorder", "excel");
const PDF_DIRECTORY = path_1.default.join(process.cwd(), "public", "dealer", "files", "salesorder", "pdf");
const LOGO_PATH = path_1.default.join(process.cwd(), "public", "dealer", "files", "salesorder", "formatexcel", "logosunway.png");
const LOGO_Sunflex = path_1.default.join(process.cwd(), "public", "dealer", "files", "salesorder", "formatexcel", "logoSunflex.png");
const LOGO_SunflexStore = path_1.default.join(process.cwd(), "public", "dealer", "files", "salesorder", "formatexcel", "logoSunflexStore.png");
function renderTemplate(str, obj) {
    return str.replace(/\{\{(.*?)\}\}/g, (_, key) => { var _a; return (_a = obj[key.trim()]) !== null && _a !== void 0 ? _a : ""; });
}
// Pastikan direktori ada
if (!fs_1.default.existsSync(EXCEL_DIRECTORY))
    fs_1.default.mkdirSync(EXCEL_DIRECTORY, { recursive: true });
if (!fs_1.default.existsSync(PDF_DIRECTORY))
    fs_1.default.mkdirSync(PDF_DIRECTORY, { recursive: true });
function resolvePrice(prices, dealerId, priceCategoryId, quantity) {
    // 1. Cek WholesalePrice (dealer sesuai, dan quantity masuk range)
    for (const p of prices) {
        if (p.DealerId === dealerId && p.WholesalePrices && p.WholesalePrices.length > 0) {
            for (const wp of p.WholesalePrices) {
                if (wp.MinQuantity <= quantity && quantity <= wp.MaxQuantity) {
                    return { price: p.Price, source: "wholesale", min: wp.MinQuantity, max: wp.MaxQuantity, priceId: p.Id };
                }
            }
        }
    }
    // 2. Cek Dealer Specific
    const dealerSpecific = prices.find(p => p.DealerId === dealerId &&
        p.PriceCategoryId == null &&
        (!p.WholesalePrices || p.WholesalePrices.length === 0));
    if (dealerSpecific) {
        return { price: dealerSpecific.Price, source: "dealer", priceId: dealerSpecific.Id };
    }
    // 3. Cek PriceCategory
    const byCategory = prices.find(p => p.DealerId == null &&
        p.PriceCategoryId === priceCategoryId);
    if (byCategory) {
        return { price: byCategory.Price, source: "category", priceId: byCategory.Id };
    }
    // Tidak ada harga
    return { price: 0, source: null, priceId: null };
}
const getTaxPercentage = (taxId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tax = yield prisma.tax.findUnique({ where: { Id: taxId } });
    return (_a = tax === null || tax === void 0 ? void 0 : tax.Percentage) !== null && _a !== void 0 ? _a : 0;
});
const convertCartToSalesOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
        const cart = yield prisma.cart.findUnique({
            where: { UserId: Number(UserId) },
            include: { CartItems: { include: { ItemCode: { include: { WarehouseStocks: true } } } } },
        });
        if (!cart || cart.CartItems.length === 0) {
            res.status(404).json({ message: "Cart is empty or does not exist." });
            return;
        }
        const salesOrderDetails = [];
        const user = yield prisma.user.findUnique({
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
        const partNumberCartMap = new Map();
        for (const item of cart.CartItems) {
            const partNumberId = item.ItemCode.PartNumberId;
            if (partNumberId == null)
                continue;
            if (!partNumberCartMap.has(partNumberId)) {
                partNumberCartMap.set(partNumberId, {
                    quantity: 0,
                    displayItemCodeId: item.ItemCodeId,
                    allowSelection: item.ItemCode.AllowItemCodeSelection,
                    itemCodeId: item.ItemCodeId,
                });
            }
            partNumberCartMap.get(partNumberId).quantity += item.Quantity;
        }
        for (const [partNumberId, { quantity }] of partNumberCartMap.entries()) {
            const allItemCodes = yield prisma.itemCode.findMany({
                where: { PartNumberId: partNumberId, AllowItemCodeSelection: false, DeletedAt: null },
                include: { WarehouseStocks: true }
            });
            const totalAvailableStock = allItemCodes.reduce((sum, ic) => sum + ic.WarehouseStocks.reduce((s, ws) => s + (ws.QtyOnHand > 0 ? ws.QtyOnHand : 0), 0), 0);
            if (quantity > totalAvailableStock) {
                res.status(400).json({
                    message: `Permintaan melebihi stok! Partnumber ${partNumberId} membutuhkan ${quantity}, stok tersedia ${totalAvailableStock}.`
                });
                return;
            }
        }
        const newSalesOrder = yield prisma.salesOrder.create({
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
        const uniqueItemsMap = new Map();
        const allowFalseQtyPerPartnumber = new Map();
        for (const cartItem of cart.CartItems) {
            const itemCode = cartItem.ItemCode;
            const quantity = cartItem.Quantity;
            const partNumberId = itemCode.PartNumberId;
            if (itemCode.AllowItemCodeSelection) {
                const dealerWarehouses = yield prisma.dealerWarehouse.findMany({
                    where: { DealerId: dealer.Id },
                    orderBy: { Priority: "asc" },
                    select: { WarehouseId: true }
                });
                const priorityWarehouseIds = dealerWarehouses.map(dw => dw.WarehouseId);
                // Semua itemCode satu partnumber (tanpa hardcode), include stok di semua warehouse
                const allItemCodes = yield prisma.itemCode.findMany({
                    where: { PartNumberId: itemCode.PartNumberId, DeletedAt: null },
                    include: { WarehouseStocks: true }
                });
                let qtyRemaining = quantity;
                // STEP 1: Habiskan stok dari ItemCode yang diminta user (misal: "BK SJ") di seluruh warehouse sesuai urutan prioritas
                for (const warehouseId of priorityWarehouseIds) {
                    if (qtyRemaining <= 0)
                        break;
                    // 1. Habiskan stok BK SJ (itemCode utama) di gudang ini
                    const wsMain = itemCode.WarehouseStocks.find(w => w.WarehouseId === warehouseId && w.QtyOnHand > 0);
                    if (wsMain && qtyRemaining > 0) {
                        const ambil = Math.min(qtyRemaining, wsMain.QtyOnHand);
                        // ... proses create detail seperti biasa (copy paste dari kode kamu)
                        const itemPrices = yield prisma.price.findMany({
                            where: { ItemCodeId: itemCode.Id, DeletedAt: null },
                            include: { WholesalePrices: { where: { DeletedAt: null } } }
                        });
                        const resolved = resolvePrice(itemPrices, dealer.Id, dealer.PriceCategoryId, ambil);
                        let priceFinal = resolved.price && resolved.price !== 0 ? resolved.price : null;
                        let tax = null, taxRate = 0, finalPrice = null, taxId = null;
                        if (priceFinal !== null) {
                            tax = yield prisma.tax.findFirst({
                                where: { IsActive: true },
                                orderBy: { CreatedAt: "desc" }
                            });
                            taxRate = (_a = tax === null || tax === void 0 ? void 0 : tax.Percentage) !== null && _a !== void 0 ? _a : 0;
                            finalPrice = Math.round(priceFinal * (1 + taxRate / 100));
                            taxId = (_b = tax === null || tax === void 0 ? void 0 : tax.Id) !== null && _b !== void 0 ? _b : null;
                        }
                        else {
                            priceFinal = 0;
                            finalPrice = 0;
                            taxId = null;
                            taxRate = 0;
                        }
                        salesOrderDetails.push({
                            SalesOrderId: newSalesOrder.Id,
                            ItemCodeId: itemCode.Id,
                            WarehouseId: warehouseId,
                            Quantity: ambil,
                            Price: priceFinal,
                            FinalPrice: finalPrice,
                            PriceCategoryId: dealer.PriceCategoryId,
                            FulfillmentStatus: client_1.FulfillmentStatus.READY,
                            TaxId: taxId,
                        });
                        qtyRemaining -= ambil;
                    }
                    // 2. Jika masih kurang, lanjutkan ambil dari itemCode lain DI GUDANG YANG SAMA sebelum pindah gudang berikutnya
                    if (qtyRemaining > 0) {
                        // Semua itemCode lain (kecuali itemCode utama)
                        const otherItemCodes = allItemCodes.filter(ic => ic.Id !== itemCode.Id);
                        // Urutkan per stok terbanyak DI GUDANG INI
                        const sortedItemCodes = otherItemCodes
                            .map(ic => {
                            const ws = ic.WarehouseStocks.find(w => w.WarehouseId === warehouseId && w.QtyOnHand > 0);
                            return ws ? { itemCode: ic, stock: ws.QtyOnHand, ws } : null;
                        })
                            .filter(Boolean)
                            .sort((a, b) => b.stock - a.stock);
                        for (const entry of sortedItemCodes) {
                            if (qtyRemaining <= 0)
                                break;
                            const { itemCode: ic, stock, ws } = entry;
                            const ambil = Math.min(qtyRemaining, stock);
                            // Harga & tax
                            const itemPrices = yield prisma.price.findMany({
                                where: { ItemCodeId: ic.Id, DeletedAt: null },
                                include: { WholesalePrices: { where: { DeletedAt: null } } }
                            });
                            const resolved = resolvePrice(itemPrices, dealer.Id, dealer.PriceCategoryId, ambil);
                            let priceFinal = resolved.price && resolved.price !== 0 ? resolved.price : null;
                            let tax = null, taxRate = 0, finalPrice = null, taxId = null;
                            if (priceFinal !== null) {
                                tax = yield prisma.tax.findFirst({
                                    where: { IsActive: true },
                                    orderBy: { CreatedAt: "desc" }
                                });
                                taxRate = (_c = tax === null || tax === void 0 ? void 0 : tax.Percentage) !== null && _c !== void 0 ? _c : 0;
                                finalPrice = Math.round(priceFinal * (1 + taxRate / 100));
                                taxId = (_d = tax === null || tax === void 0 ? void 0 : tax.Id) !== null && _d !== void 0 ? _d : null;
                            }
                            else {
                                priceFinal = 0;
                                finalPrice = 0;
                                taxId = null;
                                taxRate = 0;
                            }
                            salesOrderDetails.push({
                                SalesOrderId: newSalesOrder.Id,
                                ItemCodeId: ic.Id,
                                WarehouseId: warehouseId,
                                Quantity: ambil,
                                Price: priceFinal,
                                FinalPrice: finalPrice,
                                PriceCategoryId: dealer.PriceCategoryId,
                                FulfillmentStatus: client_1.FulfillmentStatus.READY,
                                TaxId: taxId,
                            });
                            qtyRemaining -= ambil;
                        }
                    }
                }
                if (qtyRemaining > 0) {
                    throw new Error(`Stok tidak cukup untuk partnumber ${itemCode.PartNumberId}`);
                }
                // STEP 2: Jika masih kurang, baru ambil dari ItemCode lain (dalam partnumber sama) urut warehouse prioritas dan stok terbanyak per warehouse
                if (qtyRemaining > 0) {
                    for (const warehouseId of priorityWarehouseIds) {
                        if (qtyRemaining <= 0)
                            break;
                        // Semua itemCode lain (kecuali itemCode utama)
                        const otherItemCodes = allItemCodes.filter(ic => ic.Id !== itemCode.Id);
                        // Urutkan per stok terbanyak di warehouse tsb
                        const sortedItemCodes = otherItemCodes
                            .map(ic => {
                            const ws = ic.WarehouseStocks.find(w => w.WarehouseId === warehouseId && w.QtyOnHand > 0);
                            return ws ? { itemCode: ic, stock: ws.QtyOnHand, ws } : null;
                        })
                            .filter(Boolean)
                            .sort((a, b) => b.stock - a.stock);
                        for (const entry of sortedItemCodes) {
                            if (qtyRemaining <= 0)
                                break;
                            const { itemCode: ic, stock, ws } = entry;
                            const ambil = Math.min(qtyRemaining, stock);
                            // Harga & tax
                            const itemPrices = yield prisma.price.findMany({
                                where: { ItemCodeId: ic.Id, DeletedAt: null },
                                include: { WholesalePrices: { where: { DeletedAt: null } } }
                            });
                            const resolved = resolvePrice(itemPrices, dealer.Id, dealer.PriceCategoryId, ambil);
                            let priceFinal = resolved.price && resolved.price !== 0 ? resolved.price : null;
                            let tax = null, taxRate = 0, finalPrice = null, taxId = null;
                            if (priceFinal !== null) {
                                tax = yield prisma.tax.findFirst({
                                    where: { IsActive: true },
                                    orderBy: { CreatedAt: "desc" }
                                });
                                taxRate = (_e = tax === null || tax === void 0 ? void 0 : tax.Percentage) !== null && _e !== void 0 ? _e : 0;
                                finalPrice = Math.round(priceFinal * (1 + taxRate / 100));
                                taxId = (_f = tax === null || tax === void 0 ? void 0 : tax.Id) !== null && _f !== void 0 ? _f : null;
                            }
                            else {
                                priceFinal = 0;
                                finalPrice = 0;
                                taxId = null;
                                taxRate = 0;
                            }
                            salesOrderDetails.push({
                                SalesOrderId: newSalesOrder.Id,
                                ItemCodeId: ic.Id,
                                WarehouseId: warehouseId,
                                Quantity: ambil,
                                Price: priceFinal,
                                FinalPrice: finalPrice,
                                PriceCategoryId: dealer.PriceCategoryId,
                                FulfillmentStatus: client_1.FulfillmentStatus.READY,
                                TaxId: taxId,
                            });
                            qtyRemaining -= ambil;
                        }
                    }
                }
                if (qtyRemaining > 0) {
                    throw new Error(`Stok tidak cukup untuk partnumber ${itemCode.PartNumberId}`);
                }
            }
            else {
                // ... (blok allow:false tetap pakai urutan stok terbesar, tidak usah diubah)
                if (partNumberId != null) {
                    if (!allowFalseQtyPerPartnumber.has(partNumberId)) {
                        allowFalseQtyPerPartnumber.set(partNumberId, 0);
                    }
                    allowFalseQtyPerPartnumber.set(partNumberId, allowFalseQtyPerPartnumber.get(partNumberId) + quantity);
                }
            }
        }
        // Setelah loop, proses Allow:false per partnumber
        for (const [partNumberId, quantity] of allowFalseQtyPerPartnumber.entries()) {
            const allItemCodes = (yield prisma.itemCode.findMany({
                where: { PartNumberId: partNumberId, DeletedAt: null },
                include: { WarehouseStocks: true }
            }))
                .map(ic => (Object.assign(Object.assign({}, ic), { totalStock: ic.WarehouseStocks.reduce((a, b) => a + (b.QtyOnHand > 0 ? b.QtyOnHand : 0), 0) })))
                .sort((a, b) => b.totalStock - a.totalStock);
            console.log('[ALLITEMCODES] sorted =', allItemCodes.map(x => ({ name: x.Name, totalStock: x.totalStock })));
            const dealerWarehouses = yield prisma.dealerWarehouse.findMany({
                where: { DealerId: dealer.Id },
                orderBy: { Priority: "asc" },
                select: { WarehouseId: true }
            });
            const priorityWarehouseIds = dealerWarehouses.map(dw => dw.WarehouseId);
            let qtyRemaining = quantity;
            for (const warehouseId of priorityWarehouseIds) {
                if (qtyRemaining <= 0)
                    break;
                // --- Patch: Urutkan itemCodesThisWarehouse dari stok terbanyak ---
                const itemCodesThisWarehouse = allItemCodes
                    .map(ic => {
                    const ws = ic.WarehouseStocks.find(s => s.WarehouseId === warehouseId && s.QtyOnHand > 0);
                    return ws ? { itemCode: ic, stock: ws.QtyOnHand } : undefined;
                })
                    .filter((v) => v !== undefined)
                    .sort((a, b) => b.stock - a.stock);
                for (const { itemCode, stock } of itemCodesThisWarehouse) {
                    if (qtyRemaining <= 0)
                        break;
                    const ambil = Math.min(qtyRemaining, stock);
                    const itemPrices = yield prisma.price.findMany({
                        where: { ItemCodeId: itemCode.Id, DeletedAt: null },
                        include: { WholesalePrices: { where: { DeletedAt: null } } }
                    });
                    const resolved = resolvePrice(itemPrices, dealer.Id, dealer.PriceCategoryId, ambil);
                    let priceFinal = resolved.price && resolved.price !== 0 ? resolved.price : null;
                    let tax = null, taxRate = 0, finalPrice = null, taxId = null;
                    if (priceFinal !== null) {
                        tax = yield prisma.tax.findFirst({
                            where: { IsActive: true },
                            orderBy: { CreatedAt: "desc" }
                        });
                        taxRate = (_g = tax === null || tax === void 0 ? void 0 : tax.Percentage) !== null && _g !== void 0 ? _g : 0;
                        finalPrice = Math.round(priceFinal * (1 + taxRate / 100));
                        taxId = (_h = tax === null || tax === void 0 ? void 0 : tax.Id) !== null && _h !== void 0 ? _h : null;
                    }
                    else {
                        priceFinal = 0;
                        finalPrice = 0;
                        taxId = null;
                        taxRate = 0;
                    }
                    salesOrderDetails.push({
                        SalesOrderId: newSalesOrder.Id,
                        ItemCodeId: itemCode.Id,
                        WarehouseId: warehouseId,
                        Quantity: ambil,
                        Price: priceFinal,
                        FinalPrice: finalPrice,
                        PriceCategoryId: dealer.PriceCategoryId,
                        FulfillmentStatus: client_1.FulfillmentStatus.READY,
                        TaxId: taxId,
                    });
                    console.log(`[SO Detail] Part: ${partNumberId}, ChosenItemCode: ${itemCode.Name}, Qty: ${ambil}, WH: ${warehouseId}`);
                    qtyRemaining -= ambil;
                }
            }
            if (qtyRemaining > 0) {
                throw new Error(`Stok tidak cukup untuk partnumber ${partNumberId} (kurang ${qtyRemaining})`);
            }
        }
        // Simpan semua SalesOrderDetail
        yield prisma.salesOrderDetail.createMany({
            data: salesOrderDetails,
        });
        // Hapus cart
        yield prisma.cartItem.deleteMany({ where: { CartId: cart.Id } });
        yield prisma.cart.delete({ where: { Id: cart.Id } });
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
                    Name: ((_j = sales.Admin) === null || _j === void 0 ? void 0 : _j.Name) || '-' // ✅ Pakai relasi Admin
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
        // 1. Cari semua admin penerima (misal: admin dengan role tertentu, atau semua)
        const adminList = yield prisma.admin.findMany({
            where: { DeletedAt: null }
        });
        const emailTemplate = yield prisma.emailTemplate.findFirst({
            where: {
                TemplateType: "ADMIN_NOTIFICATION_SALESORDER",
                DeletedAt: null
            },
            orderBy: { CreatedAt: "desc" }
        });
        // Konfig Email Aktif (assume ambil satu yg aktif)
        const emailConfig = yield prisma.emailConfig.findFirst({
            where: { IsActive: true, DeletedAt: null }
        });
        const pathUrl = "http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder";
        const createdDate = ((_k = newSalesOrder.CreatedAt) !== null && _k !== void 0 ? _k : new Date()).toLocaleDateString('id-ID');
        // 2. Loop semua admin dan buat notifikasi
        for (const admin of adminList) {
            // 1. Lonceng notifikasi
            yield prisma.adminNotification.create({
                data: {
                    AdminId: admin.Id,
                    Type: "SALES_ORDER_NEW",
                    Title: "Sales Order Baru",
                    Body: `Sales Order #${newSalesOrder.Id} berhasil dibuat dari keranjang.`,
                    Path: `/listapprovalsalesorder/approvalsalesorder`,
                    SalesOrderId: newSalesOrder.Id,
                    IsRead: false
                }
            });
            // 2. Kirim Email berdasarkan Template
            if (admin.Email && emailTemplate && emailConfig) {
                // Bind variabel sesuai template kamu
                const binding = {
                    dealer: dealer.CompanyName,
                    sales: ((_l = sales.Admin) === null || _l === void 0 ? void 0 : _l.Name) || "-",
                    sales_order_number: newSalesOrder.Id.toString(),
                    created_date: createdDate,
                    path: pathUrl
                };
                const subject = renderTemplate(emailTemplate.Subject || "Sales Order Baru", binding);
                const body = renderTemplate(emailTemplate.Body || "", binding);
                // Simpan email ke DB (untuk log/queue)
                yield prisma.emailSalesOrder.create({
                    data: {
                        SalesOrderId: newSalesOrder.Id,
                        SenderEmail: emailConfig.Email,
                        RecipientEmail: admin.Email,
                        Subject: subject,
                        Body: body,
                        Status: "PENDING"
                    }
                });
                // Kirim email langsung (sync) pakai nodemailer
                try {
                    const nodemailer = require('nodemailer');
                    const transporter = nodemailer.createTransport({
                        host: emailConfig.Host,
                        port: emailConfig.Port,
                        secure: emailConfig.Secure,
                        auth: {
                            user: emailConfig.Email,
                            pass: emailConfig.Password
                        }
                    });
                    yield transporter.sendMail({
                        from: `"No Reply" <${emailConfig.Email}>`,
                        to: admin.Email,
                        subject: subject,
                        html: body,
                    });
                    // Update status email jika sukses
                    yield prisma.emailSalesOrder.updateMany({
                        where: { SalesOrderId: newSalesOrder.Id, RecipientEmail: admin.Email },
                        data: { Status: "SENT" }
                    });
                }
                catch (err) {
                    // Jika gagal, update status
                    yield prisma.emailSalesOrder.updateMany({
                        where: { SalesOrderId: newSalesOrder.Id, RecipientEmail: admin.Email },
                        data: { Status: "FAILED" }
                    });
                    console.error("Failed send email to admin:", admin.Email, err);
                }
            }
        }
    }
    catch (error) {
        console.error("Error converting cart to sales order:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.convertCartToSalesOrder = convertCartToSalesOrder;
const generateExcel = (salesOrderId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const salesOrder = yield prisma.salesOrder.findUnique({
        where: { Id: salesOrderId },
        include: {
            SalesOrderDetails: {
                include: {
                    ItemCode: { include: { PartNumber: true } },
                    Tax: true
                }
            },
            Dealer: true,
            Sales: { include: { Admin: true } },
            User: true,
        },
    });
    if (!salesOrder || !salesOrder.Dealer)
        throw new Error("Sales Order or Dealer not found.");
    // 1. Mapping data ke PricingItemInput[]
    const pricingInput = salesOrder.SalesOrderDetails.map(detail => {
        var _a, _b, _c;
        return ({
            ItemCodeId: detail.ItemCodeId,
            Quantity: detail.Quantity,
            Price: (_a = detail.Price) !== null && _a !== void 0 ? _a : 0,
            TaxPercentage: (_c = (_b = detail.Tax) === null || _b === void 0 ? void 0 : _b.Percentage) !== null && _c !== void 0 ? _c : 0, // pastikan sesuai property yang diharapkan API
        });
    });
    // 2. Panggil function calculateOrderSummary
    const pricingResult = yield (0, Pricing_1.calculateOrderSummary)(pricingInput, false); // false: tax sesuai di detail DB
    const fileName = `salesorder_${salesOrderId}.xlsx`;
    const filePath = path_1.default.join(EXCEL_DIRECTORY, fileName);
    const workbook = new exceljs_1.default.Workbook();
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
    const maxLabelLength = Math.max((sheet.getCell('A8').value + '').length, (sheet.getCell('A9').value + '').length, (sheet.getCell('A10').value + '').length, (sheet.getCell('A11').value + '').length);
    const maxValueLength = Math.max((sheet.getCell('B8').value + '').length, (sheet.getCell('B9').value + '').length, (sheet.getCell('B10').value + '').length, (sheet.getCell('B11').value + '').length);
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
        if (c.match(/^F\d+$|^H\d+$/))
            sheet.getCell(c).font = { bold: true };
    }
    // ==== HEADER TABEL ITEM ====
    const tableHeaders = [
        'NO', 'PART NO', 'DESCRIPTION', 'QTY', 'UNIT', 'UNIT PRICE', 'PPN%', 'UNIT SELL PRICE IDR', 'TOTAL PRICE'
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
    pricingResult.details.forEach((item, idx) => {
        var _a, _b, _c, _d;
        const detail = salesOrder.SalesOrderDetails[idx];
        const no = idx + 1;
        const partNo = ((_a = detail.ItemCode.PartNumber) === null || _a === void 0 ? void 0 : _a.Name) || '-';
        const desc = ((_b = detail.ItemCode.PartNumber) === null || _b === void 0 ? void 0 : _b.Description) || 'No Description';
        const qty = item.Quantity;
        const unit = 'MT';
        const price = item.Price;
        const taxPercent = (_d = (_c = detail.Tax) === null || _c === void 0 ? void 0 : _c.Percentage) !== null && _d !== void 0 ? _d : 0; // Ambil dari database!
        const ppnPerUnit = Math.round(item.TaxAmount / qty); // Amount per unit, dari API
        const finalPrice = Math.round(item.FinalPrice / qty); // UNIT SELL PRICE, sudah +PPN
        const total = item.FinalPrice;
        totalPriceSum += total;
        const dataArr = [
            no, partNo, desc, qty, unit, price,
            // Format: `${taxPercent}% | ${ppnPerUnit}` atau hanya amount saja
            // Saran: amount saja, label atas sudah "PPN (%)"
            taxPercent,
            finalPrice, total
        ];
        for (let i = 0; i < dataArr.length; i++) {
            const col = String.fromCharCode(65 + i);
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
    sheet.getCell(`B${row}`).value = ((_a = salesOrder.User) === null || _a === void 0 ? void 0 : _a.Username) || '-';
    sheet.getCell(`B${row + 1}`).value = ((_c = (_b = salesOrder.Sales) === null || _b === void 0 ? void 0 : _b.Admin) === null || _c === void 0 ? void 0 : _c.Name) || '-';
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
    yield workbook.xlsx.writeFile(filePath);
    return fileName;
});
exports.generateExcel = generateExcel;
const generatePDF = (salesOrderId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const salesOrder = yield prisma.salesOrder.findUnique({
        where: { Id: salesOrderId },
        include: { SalesOrderDetails: { include: { ItemCode: true } }, Dealer: true },
    });
    if (!salesOrder)
        throw new Error("Sales Order not found.");
    const fileName = `salesorder_${salesOrderId}.pdf`;
    const filePath = path_1.default.join(PDF_DIRECTORY, fileName);
    const doc = new pdfkit_1.default();
    doc.pipe(fs_1.default.createWriteStream(filePath));
    doc.fontSize(16).text("Sales Order", { align: "center" });
    doc.moveDown();
    doc.text(`Dealer: ${((_a = salesOrder.Dealer) === null || _a === void 0 ? void 0 : _a.CompanyName) || 'Unknown Dealer'}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text("Items:");
    salesOrder.SalesOrderDetails.forEach((detail) => {
        doc.text(`${detail.ItemCode.Name} - Qty: ${detail.Quantity} - Price: ${detail.Price}`);
    });
    doc.end();
    return fileName;
});
exports.generatePDF = generatePDF;
const getSalesOrdersByUserDealer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield prisma.user.findUnique({
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
        const salesOrders = yield prisma.salesOrder.findMany({
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
            var _a, _b, _c;
            // Build product detail sebagai array baru
            const productDetails = order.SalesOrderDetails.map(detail => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                const itemCode = detail.ItemCode;
                const partNumber = itemCode === null || itemCode === void 0 ? void 0 : itemCode.PartNumber;
                const allowSelection = (_a = itemCode === null || itemCode === void 0 ? void 0 : itemCode.AllowItemCodeSelection) !== null && _a !== void 0 ? _a : false;
                let displayName = '';
                if (allowSelection) {
                    displayName = (_b = itemCode === null || itemCode === void 0 ? void 0 : itemCode.Name) !== null && _b !== void 0 ? _b : 'Unknown';
                }
                else {
                    displayName = (_c = partNumber === null || partNumber === void 0 ? void 0 : partNumber.Name) !== null && _c !== void 0 ? _c : 'Unknown';
                }
                return {
                    DisplayName: displayName,
                    ProductName: (_e = (_d = partNumber === null || partNumber === void 0 ? void 0 : partNumber.Product) === null || _d === void 0 ? void 0 : _d.Name) !== null && _e !== void 0 ? _e : '-',
                    AllowItemCodeSelection: allowSelection,
                    Quantity: detail.Quantity,
                    Price: detail.Price,
                    FinalPrice: detail.FinalPrice,
                    TaxId: detail.TaxId,
                    TaxPercentage: (_g = (_f = detail.Tax) === null || _f === void 0 ? void 0 : _f.Percentage) !== null && _g !== void 0 ? _g : 0,
                    TaxName: (_j = (_h = detail.Tax) === null || _h === void 0 ? void 0 : _h.Name) !== null && _j !== void 0 ? _j : '-',
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
                    Id: (_a = order.Sales) === null || _a === void 0 ? void 0 : _a.Id,
                    Name: ((_c = (_b = order.Sales) === null || _b === void 0 ? void 0 : _b.Admin) === null || _c === void 0 ? void 0 : _c.Name) || '-',
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
    }
    catch (error) {
        console.error("Error fetching Sales Orders:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.getSalesOrdersByUserDealer = getSalesOrdersByUserDealer;
const getSalesOrdersBySales = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { SalesId } = req.body;
        if (!SalesId) {
            res.status(400).json({ message: "SalesId is required." });
            return;
        }
        // 🔸 Cek apakah Sales ada
        const sales = yield prisma.sales.findUnique({
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
        const salesOrders = yield prisma.salesOrder.findMany({
            where: {
                DealerId: { in: dealerIds },
                DeletedAt: null,
                Status: { in: ["NEEDS_REVISION", "PENDING_APPROVAL"] }, // <-- FILTER STATUS di sini
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
        const simplifiedData = salesOrders.map(order => {
            var _a, _b, _c;
            return ({
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
                    Id: (_a = order.Sales) === null || _a === void 0 ? void 0 : _a.Id,
                    Name: ((_c = (_b = order.Sales) === null || _b === void 0 ? void 0 : _b.Admin) === null || _c === void 0 ? void 0 : _c.Name) || '-',
                },
                User: {
                    Id: order.User.Id,
                    Username: order.User.Username,
                },
                Details: order.SalesOrderDetails.map(detail => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        ItemCodeId: detail.ItemCodeId,
                        ItemName: ((_a = detail.ItemCode) === null || _a === void 0 ? void 0 : _a.Name) || 'Unknown',
                        Warehouse: detail.WarehouseId,
                        FulfillmentStatus: detail.FulfillmentStatus,
                        PriceCategory: detail.PriceCategoryId,
                        Quantity: detail.Quantity,
                        Price: detail.Price,
                        TaxId: detail.TaxId,
                        TaxPercentage: (_c = (_b = detail.Tax) === null || _b === void 0 ? void 0 : _b.Percentage) !== null && _c !== void 0 ? _c : 0,
                        TaxName: (_e = (_d = detail.Tax) === null || _d === void 0 ? void 0 : _d.Name) !== null && _e !== void 0 ? _e : '-',
                        FinalPrice: detail.FinalPrice,
                    });
                }),
            });
        });
        res.status(200).json({
            message: "Sales Orders fetched successfully.",
            data: simplifiedData,
        });
    }
    catch (error) {
        console.error("Error fetching Sales Orders:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.getSalesOrdersBySales = getSalesOrdersBySales;
const getAllSalesOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salesOrders = yield prisma.salesOrder.findMany({
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
        const simplifiedData = salesOrders.map(order => {
            var _a, _b, _c;
            return ({
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
                    Id: (_a = order.Sales) === null || _a === void 0 ? void 0 : _a.Id,
                    Name: ((_c = (_b = order.Sales) === null || _b === void 0 ? void 0 : _b.Admin) === null || _c === void 0 ? void 0 : _c.Name) || '-',
                },
                User: {
                    Id: order.User.Id,
                    Username: order.User.Username,
                },
                Details: order.SalesOrderDetails.map(detail => {
                    var _a, _b, _c, _d, _e;
                    return ({
                        ItemCodeId: detail.ItemCodeId,
                        ItemName: ((_a = detail.ItemCode) === null || _a === void 0 ? void 0 : _a.Name) || 'Unknown',
                        Warehouse: detail.WarehouseId,
                        FulfillmentStatus: detail.FulfillmentStatus,
                        PriceCategory: detail.PriceCategoryId,
                        Quantity: detail.Quantity,
                        Price: detail.Price,
                        TaxId: detail.TaxId,
                        TaxPercentage: (_c = (_b = detail.Tax) === null || _b === void 0 ? void 0 : _b.Percentage) !== null && _c !== void 0 ? _c : 0,
                        TaxName: (_e = (_d = detail.Tax) === null || _d === void 0 ? void 0 : _d.Name) !== null && _e !== void 0 ? _e : '-',
                        FinalPrice: detail.FinalPrice,
                    });
                }),
            });
        });
        res.status(200).json({
            message: "All sales orders fetched successfully.",
            data: simplifiedData,
        });
    }
    catch (error) {
        console.error("Error fetching all sales orders:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.getAllSalesOrders = getAllSalesOrders;
const updateSalesOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const { SalesOrderId, SalesOrderNumber, JdeSalesOrderNumber, Status, Note, PaymentTerm, FOB, CustomerPoNumber, DeliveryOrderNumber, SalesOrderDetails, ForceApplyTax } = req.body;
        if (!SalesOrderId || isNaN(Number(SalesOrderId))) {
            res.status(400).json({ message: "Invalid or missing SalesOrderId." });
            return;
        }
        // Fetch old order & detail (include for reversal)
        const existingOrder = yield prisma.salesOrder.findUnique({
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
                    const warehouseStock = yield prisma.warehouseStock.findFirst({
                        where: { WarehouseId: detail.WarehouseId, ItemCodeId: detail.ItemCodeId }
                    });
                    if (warehouseStock) {
                        yield prisma.warehouseStock.update({
                            where: { Id: warehouseStock.Id },
                            data: { QtyOnHand: warehouseStock.QtyOnHand + detail.Quantity }
                        });
                        yield prisma.stockHistory.create({
                            data: {
                                WarehouseStockId: warehouseStock.Id,
                                ItemCodeId: detail.ItemCodeId,
                                QtyBefore: warehouseStock.QtyOnHand,
                                QtyAfter: warehouseStock.QtyOnHand + detail.Quantity,
                                Note: `Reversal stok SalesOrder #${SalesOrderId} dari status APPROVED_EMAIL_SENT`,
                            }
                        });
                    }
                }
                else if (detail.FulfillmentStatus === 'IN_PO') {
                    // Kembalikan QtyPO di ItemCode
                    const itemCode = detail.ItemCode;
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
                            Note: `Reversal QtyPO SalesOrder #${SalesOrderId} dari status APPROVED_EMAIL_SENT`,
                        }
                    });
                }
            }
        }
        // === END REVERSAL ===
        // Update SalesOrder Data
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
        if (Object.keys(updateData).length > 0) {
            yield prisma.salesOrder.update({
                where: { Id: SalesOrderId },
                data: updateData,
            });
            // Ambil ulang order pakai include
            updatedOrder = (yield prisma.salesOrder.findUnique({
                where: { Id: SalesOrderId },
                include: { SalesOrderDetails: { include: { ItemCode: true } } }
            }));
        }
        // SalesOrderDetails logic tetap
        if (SalesOrderDetails && Array.isArray(SalesOrderDetails)) {
            const activeTax = yield prisma.tax.findFirst({
                where: { IsActive: true, DeletedAt: null },
                orderBy: { CreatedAt: 'desc' },
            });
            const defaultTaxRate = (_c = activeTax === null || activeTax === void 0 ? void 0 : activeTax.Percentage) !== null && _c !== void 0 ? _c : 0;
            const defaultTaxId = (_d = activeTax === null || activeTax === void 0 ? void 0 : activeTax.Id) !== null && _d !== void 0 ? _d : null;
            const existingDetails = yield prisma.salesOrderDetail.findMany({
                where: { SalesOrderId },
            });
            const incomingIds = SalesOrderDetails.map((d) => d.Id).filter((id) => !!id);
            const existingIds = existingDetails.map((d) => d.Id);
            const toDeleteIds = existingIds.filter(id => !incomingIds.includes(id));
            yield prisma.salesOrderDetail.deleteMany({
                where: {
                    Id: { in: toDeleteIds },
                },
            });
            for (const detail of SalesOrderDetails) {
                const taxIdToUse = ForceApplyTax ? defaultTaxId : null;
                const taxRateToUse = ForceApplyTax ? defaultTaxRate : 0;
                const finalPrice = Math.round(detail.Price * detail.Quantity * (1 + taxRateToUse / 100));
                if (detail.Id && detail.Quantity > 0 && detail.Price) {
                    yield prisma.salesOrderDetail.update({
                        where: { Id: detail.Id },
                        data: {
                            Quantity: detail.Quantity,
                            Price: detail.Price,
                            FinalPrice: finalPrice,
                            TaxId: taxIdToUse,
                        },
                    });
                }
                else if (!detail.Id && detail.Quantity > 0 && detail.Price) {
                    yield prisma.salesOrderDetail.create({
                        data: {
                            SalesOrderId: SalesOrderId,
                            ItemCodeId: detail.ItemCodeId,
                            Quantity: detail.Quantity,
                            Price: detail.Price,
                            FinalPrice: finalPrice,
                            TaxId: taxIdToUse,
                            WarehouseId: (_e = detail.WarehouseId) !== null && _e !== void 0 ? _e : null,
                            PriceCategoryId: (_f = detail.PriceCategoryId) !== null && _f !== void 0 ? _f : null,
                            FulfillmentStatus: (_g = detail.FulfillmentStatus) !== null && _g !== void 0 ? _g : 'READY',
                        },
                    });
                }
                else if (detail.Id && detail.Quantity === 0) {
                    yield prisma.salesOrderDetail.delete({
                        where: { Id: detail.Id },
                    });
                }
            }
            // regenerate file jika detail ikut diubah
            const excelFileName = yield (0, exports.generateExcel)(SalesOrderId);
            const pdfFileName = yield (0, exports.generatePDF)(SalesOrderId);
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
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.updateSalesOrder = updateSalesOrder;
const deleteSalesOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { SalesOrderId } = req.body;
        const parsedId = Number(SalesOrderId);
        if (!parsedId || isNaN(parsedId)) {
            res.status(400).json({ message: "Invalid SalesOrderId." });
            return;
        }
        // 1. Ambil sales order & detail (sekalian cek status)
        const existingOrder = yield prisma.salesOrder.findUnique({
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
                    const warehouseStock = yield prisma.warehouseStock.findFirst({
                        where: { WarehouseId: detail.WarehouseId, ItemCodeId: detail.ItemCodeId }
                    });
                    if (warehouseStock) {
                        yield prisma.warehouseStock.update({
                            where: { Id: warehouseStock.Id },
                            data: { QtyOnHand: warehouseStock.QtyOnHand + detail.Quantity }
                        });
                        yield prisma.stockHistory.create({
                            data: {
                                WarehouseStockId: warehouseStock.Id,
                                ItemCodeId: detail.ItemCodeId,
                                QtyBefore: warehouseStock.QtyOnHand,
                                QtyAfter: warehouseStock.QtyOnHand + detail.Quantity,
                                Note: `Reversal stok SalesOrder #${parsedId} dari penghapusan`,
                            }
                        });
                    }
                }
                else if (detail.FulfillmentStatus === 'IN_PO') {
                    // Reversal QtyPO di ItemCode
                    const itemCode = detail.ItemCode;
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
                            Note: `Reversal QtyPO SalesOrder #${parsedId} from delete SO`,
                        }
                    });
                }
            }
        }
        // 3. Soft delete SalesOrder
        yield prisma.salesOrder.update({
            where: { Id: parsedId },
            data: { DeletedAt: new Date() },
        });
        // 4. Hapus file Excel & PDF
        const excelFile = path_1.default.join(EXCEL_DIRECTORY, `salesorder_${parsedId}.xlsx`);
        const pdfFile = path_1.default.join(PDF_DIRECTORY, `salesorder_${parsedId}.pdf`);
        if (fs_1.default.existsSync(excelFile))
            fs_1.default.unlinkSync(excelFile);
        if (fs_1.default.existsSync(pdfFile))
            fs_1.default.unlinkSync(pdfFile);
        res.status(200).json({ message: "Sales Order soft-deleted, stok dikembalikan (jika perlu), file dihapus." });
    }
    catch (error) {
        console.error("Error soft-deleting Sales Order:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.deleteSalesOrder = deleteSalesOrder;
