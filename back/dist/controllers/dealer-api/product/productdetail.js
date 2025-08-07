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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPartNumberFromProduct = exports.getProductImages = exports.getProductDetail = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const resolvePrice2 = (prices, dealerId, priceCategoryId) => {
    var _a;
    // Cari dealer specific (priority)
    const dealerSpecific = prices.find(p => p.DealerId === dealerId &&
        p.PriceCategoryId == null &&
        (!p.WholesalePrices || p.WholesalePrices.length === 0));
    // Cari price category (priority kedua)
    const byCategory = prices.find(p => p.DealerId == null &&
        p.PriceCategoryId === priceCategoryId &&
        (!p.WholesalePrices || p.WholesalePrices.length === 0));
    // Cari wholesale price jika ada
    for (const p of prices) {
        if ((_a = p.WholesalePrices) === null || _a === void 0 ? void 0 : _a.length) {
            // Ambil semua wholesaleprice valid
            const grosir = p.WholesalePrices[0];
            return {
                NormalPrice: (dealerSpecific === null || dealerSpecific === void 0 ? void 0 : dealerSpecific.Price) || (byCategory === null || byCategory === void 0 ? void 0 : byCategory.Price) || 0,
                WholesalePrice: grosir.Price.Price,
                MinQtyWholesale: grosir.MinQuantity,
                MaxQtyWholesale: grosir.MaxQuantity,
            };
        }
    }
    // Kalau tidak ada grosir, tetap return normal
    return {
        NormalPrice: (dealerSpecific === null || dealerSpecific === void 0 ? void 0 : dealerSpecific.Price) || (byCategory === null || byCategory === void 0 ? void 0 : byCategory.Price) || 0,
        WholesalePrice: null,
        MinQtyWholesale: null,
        MaxQtyWholesale: null,
    };
};
// ✅ Fetch Product Detail by ID (Include Product Images and Part Numbers)
const getProductDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ message: "Invalid Product ID." });
            return;
        }
        const product = yield prisma.product.findUnique({
            where: { Id: Number(id), DeletedAt: null },
            select: {
                Id: true,
                Name: true,
                CodeName: true,
                Description: true,
                CreatedAt: true,
                ProductImage: {
                    where: { DeletedAt: null },
                    select: { Image: true },
                },
                PartNumber: {
                    where: { DeletedAt: null },
                    select: {
                        Id: true,
                        Name: true,
                        Dash: true,
                        InnerDiameter: true,
                        OuterDiameter: true,
                        WorkingPressure: true,
                        BurstingPressure: true,
                        BendingRadius: true,
                        HoseWeight: true,
                        CreatedAt: true,
                    },
                },
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        res.status(200).json({
            message: "Product detail fetched successfully.",
            data: product,
        });
    }
    catch (error) {
        console.error("Error fetching product detail:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.getProductDetail = getProductDetail;
const getProductImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ message: "Invalid Product ID." });
            return;
        }
        const productImages = yield prisma.productImage.findMany({
            where: {
                ProductId: Number(id),
                DeletedAt: null,
            },
            select: {
                Id: true,
                Image: true,
                CreatedAt: true,
            },
        });
        if (!productImages.length) {
            res.status(404).json({ message: "No images found for this product." });
            return;
        }
        // Tambahkan URL lengkap gambar
        const imagesWithUrls = productImages.map((image) => (Object.assign(Object.assign({}, image), { ImageUrl: `/images/product/productimage/${image.Image}` })));
        res.status(200).json({
            message: "Product images fetched successfully.",
            data: imagesWithUrls,
        });
    }
    catch (error) {
        console.error("Error fetching product images:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.getProductImages = getProductImages;
const fetchPartNumberFromProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, userId } = req.body;
        if (!productId || isNaN(Number(productId))) {
            res.status(400).json({ message: "Invalid or missing Product ID." });
            return;
        }
        if (!userId || isNaN(Number(userId))) {
            res.status(400).json({ message: "Invalid or missing User ID." });
            return;
        }
        const parsedProductId = Number(productId);
        const parsedUserId = Number(userId);
        const product = yield prisma.product.findFirst({
            where: { Id: parsedProductId },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { Id: parsedUserId },
            include: { Dealer: true },
        });
        if (!user || !user.Dealer) {
            res.status(404).json({ message: "Dealer not found for this user." });
            return;
        }
        const dealerId = user.Dealer.Id;
        const priceCategoryId = user.Dealer.PriceCategoryId;
        const resolvePrice = (prices) => {
            var _a;
            for (const p of prices) {
                if ((_a = p.WholesalePrices) === null || _a === void 0 ? void 0 : _a.length) {
                    return { price: p.WholesalePrices[0].Price.Price, isWholesale: true };
                }
            }
            for (const p of prices) {
                if (p.DealerId !== null) {
                    return { price: p.Price, isWholesale: false };
                }
            }
            for (const p of prices) {
                if (p.PriceCategoryId !== null) {
                    return { price: p.Price, isWholesale: false };
                }
            }
            return { price: null, isWholesale: false };
        };
        const partNumbers = yield prisma.partNumber.findMany({
            where: {
                ProductId: parsedProductId,
                DeletedAt: null,
            },
            select: {
                Id: true,
                Name: true,
                ItemCode: {
                    where: {
                        DeletedAt: null,
                    },
                    select: {
                        Id: true,
                        AllowItemCodeSelection: true,
                        Name: true,
                        OEM: true,
                        Weight: true,
                        MinOrderQuantity: true,
                        OrderStep: true,
                        WarehouseStocks: {
                            select: {
                                QtyOnHand: true,
                                Warehouse: {
                                    select: { Name: true }
                                }
                            }
                        },
                        Price: {
                            where: { DeletedAt: null },
                            select: {
                                Price: true,
                                DealerId: true,
                                PriceCategoryId: true,
                                WholesalePrices: {
                                    select: {
                                        Price: { select: { Price: true } },
                                        MinQuantity: true,
                                        MaxQuantity: true
                                    }
                                }
                            },
                            orderBy: {
                                CreatedAt: "desc"
                            }
                        },
                        ItemCodeImage: {
                            where: { DeletedAt: null },
                            select: { Image: true },
                            take: 1,
                        },
                    },
                },
            },
        });
        // ✅ Tambahkan default MinOrder dan OrderStep jika null
        const withDefaults = partNumbers.map(part => (Object.assign(Object.assign({}, part), { ItemCode: part.ItemCode.map(item => {
                var _a, _b;
                return (Object.assign(Object.assign({}, item), { MinOrderQuantity: (_a = item.MinOrderQuantity) !== null && _a !== void 0 ? _a : 1, OrderStep: (_b = item.OrderStep) !== null && _b !== void 0 ? _b : 1 }));
            }) })));
        if (withDefaults.length === 0) {
            res.status(404).json({ message: "No part numbers or item codes found for this product." });
            return;
        }
        const resolveStockPerWarehouse = (itemCodes) => {
            var _a, _b, _c;
            // Kumpulkan data stok per warehouse untuk setiap itemcode
            // Output: [{ Warehouse: 'Jakarta', QtyOnHand: 20 }, { Warehouse: 'Surabaya', QtyOnHand: 15 }, ...]
            const stockList = [];
            for (const ic of itemCodes) {
                for (const ws of ic.WarehouseStocks || []) {
                    stockList.push({
                        warehouse: (_b = (_a = ws.Warehouse) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : 'Unknown',
                        qty: (_c = ws.QtyOnHand) !== null && _c !== void 0 ? _c : 0
                    });
                }
            }
            return stockList;
        };
        const result = [];
        withDefaults.forEach(part => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            const allItemCodes = part.ItemCode;
            const itemCodeTrue = allItemCodes.filter(ic => ic.AllowItemCodeSelection);
            const itemCodeFalse = allItemCodes.filter(ic => !ic.AllowItemCodeSelection);
            // --- 1. Jika ADA itemCodeTrue, tampilkan itemcode true satu per satu ---
            for (const ic of itemCodeTrue) {
                // >>>> DI SINI <<<<
                // Ganti dari resolvePrice(ic.Price) menjadi resolvePrice2(ic.Price, dealerId, priceCategoryId)
                const resolved = resolvePrice2(ic.Price, dealerId, priceCategoryId);
                result.push({
                    IdPartNumber: part.Id,
                    Name: ic.Name,
                    AllowItemCodeSelection: true,
                    IdItemCode: ic.Id,
                    PriceResolved: (_a = resolved.NormalPrice) !== null && _a !== void 0 ? _a : 0,
                    NormalPrice: (_b = resolved.NormalPrice) !== null && _b !== void 0 ? _b : 0,
                    WholesalePrice: (_c = resolved.WholesalePrice) !== null && _c !== void 0 ? _c : null,
                    MinQtyWholesale: (_d = resolved.MinQtyWholesale) !== null && _d !== void 0 ? _d : null,
                    MaxQtyWholesale: (_e = resolved.MaxQtyWholesale) !== null && _e !== void 0 ? _e : null,
                    MinOrderQuantity: ic.MinOrderQuantity,
                    OrderStep: ic.OrderStep,
                    IsWholesalePrice: resolvePrice(ic.Price).isWholesale,
                    StockResolved: (ic.WarehouseStocks || []).map(ws => {
                        var _a, _b, _c;
                        return ({
                            warehouse: (_b = (_a = ws.Warehouse) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : 'Unknown',
                            qty: (_c = ws.QtyOnHand) !== null && _c !== void 0 ? _c : 0
                        });
                    })
                });
            }
            // --- 2. Jika ADA itemCodeFalse, gabungkan/jadikan satu partnumber untuk semua itemcode false (akumulasi warehouse) ---
            if (itemCodeFalse.length > 0) {
                // Akumulasi stok per warehouse
                const stockMap = {};
                itemCodeFalse.forEach(ic => {
                    (ic.WarehouseStocks || []).forEach(ws => {
                        var _a, _b, _c, _d;
                        const name = (_b = (_a = ws.Warehouse) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : 'Unknown';
                        stockMap[name] = ((_c = stockMap[name]) !== null && _c !== void 0 ? _c : 0) + ((_d = ws.QtyOnHand) !== null && _d !== void 0 ? _d : 0);
                    });
                });
                const stockResolved = Object.entries(stockMap).map(([warehouse, qty]) => ({
                    warehouse, qty
                }));
                // Pilih itemcode paling optimal (algoritma mirip addUpdateCart, harga valid + stok valid + dsb)
                // 1. Filter harga valid
                const validItemCodes = itemCodeFalse.filter(item => item.Price.some(p => (p.DealerId === dealerId && p.PriceCategoryId == null) ||
                    (p.DealerId == null && p.PriceCategoryId === priceCategoryId) ||
                    (p.WholesalePrices && p.WholesalePrices.length > 0)));
                // 2. Pilih stok terbanyak
                validItemCodes.sort((a, b) => {
                    const stokA = (a.WarehouseStocks || []).reduce((s, ws) => { var _a; return s + ((_a = ws.QtyOnHand) !== null && _a !== void 0 ? _a : 0); }, 0);
                    const stokB = (b.WarehouseStocks || []).reduce((s, ws) => { var _a; return s + ((_a = ws.QtyOnHand) !== null && _a !== void 0 ? _a : 0); }, 0);
                    return stokB - stokA;
                });
                // 3. Pakai itemcode pertama hasil sort sebagai representative (untuk IdItemCode, harga, minOrder, dsb)
                const best = validItemCodes[0] || itemCodeFalse[0];
                const resolved = resolvePrice2(best.Price, dealerId, priceCategoryId);
                result.push({
                    IdPartNumber: part.Id,
                    Name: part.Name,
                    AllowItemCodeSelection: false,
                    IdItemCode: best.Id,
                    PriceResolved: (_f = resolved.NormalPrice) !== null && _f !== void 0 ? _f : 0,
                    NormalPrice: (_g = resolved.NormalPrice) !== null && _g !== void 0 ? _g : 0,
                    WholesalePrice: (_h = resolved.WholesalePrice) !== null && _h !== void 0 ? _h : null,
                    MinQtyWholesale: (_j = resolved.MinQtyWholesale) !== null && _j !== void 0 ? _j : null,
                    MaxQtyWholesale: (_k = resolved.MaxQtyWholesale) !== null && _k !== void 0 ? _k : null,
                    MinOrderQuantity: best.MinOrderQuantity,
                    OrderStep: best.OrderStep,
                    IsWholesalePrice: resolvePrice(best.Price).isWholesale,
                    StockResolved: stockResolved // sudah akumulasi semua itemcode di partnumber
                });
            }
        });
        res.status(200).json({
            message: "Part Numbers and Item Codes with Prices fetched successfully.",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching part numbers and item codes:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.fetchPartNumberFromProduct = fetchPartNumberFromProduct;
