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
exports.deletePrice = exports.updatePrice = exports.createWholesalePrice = exports.createDealerSpecificPrice = exports.createOrUpdatePriceCategory = exports.getDealersFetchPrice = exports.getPricesByCategory = exports.getItemCodeWithPriceCategory = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Price {
    constructor() {
        this.getItemCodeWithPriceCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield prisma.product.findMany({
                    include: {
                        PartNumber: {
                            include: {
                                ItemCode: {
                                    select: {
                                        Id: true,
                                        Name: true,
                                        Price: {
                                            where: { DeletedAt: null },
                                            select: {
                                                Id: true,
                                                Price: true,
                                                PriceCategory: {
                                                    select: {
                                                        Id: true,
                                                        Name: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });
                res.status(200).json({ data: products });
            }
            catch (error) {
                console.error("Error fetching products with price categories:", error);
                next(error);
            }
        });
        this.getPricesByCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { itemCodeId } = req.params;
                const prices = yield prisma.price.findMany({
                    where: {
                        ItemCodeId: Number(itemCodeId),
                        DeletedAt: null,
                    },
                    include: {
                        ItemCode: { select: { Name: true } },
                        Dealer: { select: { Id: true, CompanyName: true } },
                        PriceCategory: { select: { Id: true, Name: true } },
                        // hanya ambil wholesalePrice yang DeletedAt: null
                        WholesalePrices: { where: { DeletedAt: null } },
                    },
                });
                const structuredData = {};
                prices.forEach((price) => {
                    var _a, _b, _c;
                    const itemCodeName = ((_a = price.ItemCode) === null || _a === void 0 ? void 0 : _a.Name) || 'Unknown Item';
                    const dealerName = ((_b = price.Dealer) === null || _b === void 0 ? void 0 : _b.CompanyName) || null;
                    // Inisialisasi ItemCode
                    if (!structuredData[itemCodeName]) {
                        structuredData[itemCodeName] = {
                            ItemCode: itemCodeName,
                            PriceCategories: {},
                        };
                    }
                    // ⏩ Wholesale Prices
                    if (price.WholesalePrices && price.WholesalePrices.length > 0) {
                        const categoryName = "Wholesale Price";
                        if (!structuredData[itemCodeName].PriceCategories[categoryName]) {
                            structuredData[itemCodeName].PriceCategories[categoryName] = {
                                PriceCategory: categoryName,
                                Prices: [],
                            };
                        }
                        price.WholesalePrices.forEach((wholesalePrice) => {
                            structuredData[itemCodeName].PriceCategories[categoryName].Prices.push({
                                Id: price.Id,
                                Dealer: dealerName,
                                Price: price.Price,
                                MinQuantity: wholesalePrice.MinQuantity,
                                MaxQuantity: wholesalePrice.MaxQuantity,
                            });
                        });
                    }
                    // ⏩ Custom Dealer Specific Price (Tanpa Wholesale)
                    else if (price.Dealer && price.WholesalePrices.length === 0) {
                        const categoryName = "Custom Price";
                        if (!structuredData[itemCodeName].PriceCategories[categoryName]) {
                            structuredData[itemCodeName].PriceCategories[categoryName] = {
                                PriceCategory: categoryName,
                                Prices: [],
                            };
                        }
                        structuredData[itemCodeName].PriceCategories[categoryName].Prices.push({
                            Id: price.Id,
                            Dealer: dealerName,
                            Price: price.Price,
                        });
                    }
                    // ⏩ Default Price (Tanpa Dealer dan Tanpa Wholesale)
                    else if (!price.Dealer && price.WholesalePrices.length === 0) {
                        const priceCategoryName = ((_c = price.PriceCategory) === null || _c === void 0 ? void 0 : _c.Name) || 'Unknown Price';
                        if (!structuredData[itemCodeName].PriceCategories[priceCategoryName]) {
                            structuredData[itemCodeName].PriceCategories[priceCategoryName] = {
                                PriceCategory: priceCategoryName,
                                Prices: [],
                            };
                        }
                        structuredData[itemCodeName].PriceCategories[priceCategoryName].Prices.push({
                            Id: price.Id,
                            Dealer: null,
                            Price: price.Price,
                        });
                    }
                });
                const responseArray = Object.values(structuredData).map((item) => ({
                    ItemCode: item.ItemCode,
                    PriceCategories: Object.values(item.PriceCategories),
                }));
                res.status(200).json({ data: responseArray });
            }
            catch (error) {
                console.error('Error fetching prices by category and item code:', error);
                next(error);
            }
        });
        this.validateCreateOrUpdatePriceCategory = (input) => {
            if (!input.ItemCodeId || isNaN(Number(input.ItemCodeId)))
                return "ItemCodeId wajib diisi (angka)";
            if (!input.PriceCategoryId || isNaN(Number(input.PriceCategoryId)))
                return "PriceCategoryId wajib diisi (angka)";
            if (input.Price === undefined || input.Price === null || isNaN(Number(input.Price)))
                return "Price wajib diisi (angka)";
            if (Number(input.Price) < 0)
                return "Price tidak boleh negatif";
            if (input.Price > 100000000000)
                return "Price maksimal 100 miliar";
            return null;
        };
        this.createOrUpdatePriceCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // ✅ Validasi input di sini
                const errorMsg = this.validateCreateOrUpdatePriceCategory(req.body);
                if (errorMsg) {
                    res.status(400).json({ message: errorMsg });
                    return;
                }
                const { ItemCodeId, PriceCategoryId, Price } = req.body;
                if (!ItemCodeId || !PriceCategoryId || Price === undefined) {
                    res.status(400).json({ message: "ItemCodeId, PriceCategoryId, and Price are required." });
                    return;
                }
                const existingPrice = yield prisma.price.findFirst({
                    where: {
                        ItemCodeId: Number(ItemCodeId),
                        PriceCategoryId: Number(PriceCategoryId),
                        DealerId: null,
                        DeletedAt: null,
                    },
                });
                if (existingPrice) {
                    const updatedPrice = yield prisma.price.update({
                        where: { Id: existingPrice.Id },
                        data: { Price: Number(Price) },
                    });
                    res.status(200).json({ message: "Price updated successfully", data: updatedPrice });
                }
                else {
                    const newPrice = yield prisma.price.create({
                        data: {
                            Price: Number(Price),
                            ItemCodeId: Number(ItemCodeId),
                            PriceCategoryId: Number(PriceCategoryId),
                            DealerId: null,
                        },
                    });
                    res.status(201).json({ message: "Price created successfully", data: newPrice });
                }
            }
            catch (error) {
                console.error("Error creating/updating price:", error);
                next(error);
            }
        });
        this.getDealersFetchPrice = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1 } = req.query;
                const take = 30;
                const skip = (Number(page) - 1) * take;
                const dealers = yield prisma.dealer.findMany({
                    skip,
                    take,
                    where: {
                        DeletedAt: null,
                    },
                    include: {
                        User: true,
                        PriceCategory: true,
                        Sales: true,
                    },
                    orderBy: { CreatedAt: "desc" },
                });
                const totalCount = yield prisma.dealer.count({
                    where: {
                        DeletedAt: null,
                    },
                });
                const enrichedDealers = dealers.map((dealer) => (Object.assign(Object.assign({}, dealer), { PriceCategoryName: dealer.PriceCategory ? dealer.PriceCategory.Name : "No Price Category" })));
                res.status(200).json({
                    data: enrichedDealers,
                    meta: {
                        total: totalCount,
                        page: Number(page),
                        pages: Math.ceil(totalCount / take),
                    },
                });
            }
            catch (error) {
                console.error("Error fetching dealers:", error);
                next(error);
            }
        });
        this.validateDealerSpecificPriceInput = (input) => {
            if (!input.ItemCodeId || isNaN(Number(input.ItemCodeId)))
                return "ItemCodeId wajib diisi (angka)";
            if (!input.DealerId || isNaN(Number(input.DealerId)))
                return "DealerId wajib diisi (angka)";
            if (input.Price === undefined || input.Price === null || isNaN(Number(input.Price)))
                return "Price wajib diisi (angka)";
            if (Number(input.Price) < 0)
                return "Price tidak boleh negatif";
            if (input.Price > 100000000000)
                return "Price maksimal 100 miliar";
            if (input.MinQuantity !== undefined || input.MaxQuantity !== undefined)
                return "Gunakan endpoint /prices/wholesale untuk harga grosir";
            return null;
        };
        this.createDealerSpecificPrice = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errorMsg = this.validateDealerSpecificPriceInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ message: errorMsg });
                    return;
                }
                const { ItemCodeId, DealerId, Price, MinQuantity, MaxQuantity } = req.body;
                if (MinQuantity !== undefined || MaxQuantity !== undefined) {
                    res.status(400).json({
                        message: "Use /prices/wholesale for wholesale prices.",
                    });
                    return;
                }
                if (!ItemCodeId || !DealerId || Price === undefined) {
                    res.status(400).json({ message: "ItemCodeId, DealerId, and Price are required." });
                    return;
                }
                // *** HAPUS pengecekan existingPrice ini ***
                // const existingPrice = await prisma.price.findFirst({
                //   where: {
                //     ItemCodeId: Number(ItemCodeId),
                //     DealerId: Number(DealerId),
                //     DeletedAt: null,
                //   },
                // });
                // if (existingPrice) {
                //   res.status(403).json({ message: "A price for this dealer already exists." });
                //   return;
                // }
                // Cek hanya price specific (tanpa wholesale)
                const existingSpecific = yield prisma.price.findFirst({
                    where: {
                        ItemCodeId: Number(ItemCodeId),
                        DealerId: Number(DealerId),
                        DeletedAt: null,
                        WholesalePrices: { none: {} }, // TIDAK ADA data wholesale
                    },
                });
                if (existingSpecific) {
                    res.status(403).json({ message: "Specific price untuk dealer dan item code ini sudah ada." });
                    return;
                }
                // Jika tidak ada, boleh create
                const newPrice = yield prisma.price.create({
                    data: {
                        ItemCodeId: Number(ItemCodeId),
                        DealerId: Number(DealerId),
                        Price: Number(Price),
                    },
                });
                res.status(201).json({ message: "Dealer-specific price created successfully", data: newPrice });
            }
            catch (error) {
                console.error("❌ Error creating dealer-specific price:", error);
                next(error);
            }
        });
        this.validateWholesalePriceInput = (input) => {
            if (!input.ItemCodeId || isNaN(Number(input.ItemCodeId)))
                return "ItemCodeId wajib diisi (angka)";
            if (!input.DealerId || isNaN(Number(input.DealerId)))
                return "DealerId wajib diisi (angka)";
            if (input.Price === undefined || input.Price === null || isNaN(Number(input.Price)))
                return "Price wajib diisi (angka)";
            if (Number(input.Price) < 0)
                return "Price tidak boleh negatif";
            if (input.Price > 100000000000)
                return "Price maksimal 100 miliar";
            if (!input.MinQuantity || isNaN(Number(input.MinQuantity)))
                return "MinQuantity wajib diisi (angka)";
            if (!input.MaxQuantity || isNaN(Number(input.MaxQuantity)))
                return "MaxQuantity wajib diisi (angka)";
            if (Number(input.MinQuantity) < 0)
                return "MinQuantity tidak boleh negatif";
            if (Number(input.MaxQuantity) < Number(input.MinQuantity))
                return "MaxQuantity harus lebih besar atau sama dengan MinQuantity";
            return null;
        };
        this.createWholesalePrice = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errorMsg = this.validateWholesalePriceInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ message: errorMsg });
                    return;
                }
                const { ItemCodeId, DealerId, Price, MinQuantity, MaxQuantity } = req.body;
                if (!ItemCodeId || !DealerId || Price === undefined || !MinQuantity || !MaxQuantity) {
                    res.status(400).json({
                        message: "ItemCodeId, DealerId, Price, MinQuantity, and MaxQuantity are required.",
                    });
                    return;
                }
                // CUKUP CEK SEKALI SAJA DISINI
                const existingWholesale = yield prisma.price.findFirst({
                    where: {
                        ItemCodeId: Number(ItemCodeId),
                        DealerId: Number(DealerId),
                        PriceCategoryId: null,
                        DeletedAt: null,
                        WholesalePrices: {
                            some: {
                                DeletedAt: null,
                            },
                        },
                    },
                });
                if (existingWholesale) {
                    res.status(403).json({
                        message: "A wholesale price for this dealer and item already exists.",
                    });
                    return;
                }
                // lanjut create price
                const newPrice = yield prisma.price.create({
                    data: {
                        ItemCodeId: Number(ItemCodeId),
                        DealerId: Number(DealerId),
                        Price: Number(Price),
                        PriceCategoryId: null,
                    },
                });
                const newWholesalePrice = yield prisma.wholesalePrice.create({
                    data: {
                        PriceId: newPrice.Id,
                        MinQuantity: Number(MinQuantity),
                        MaxQuantity: Number(MaxQuantity),
                    },
                });
                res.status(201).json({
                    message: "Wholesale price created successfully.",
                    data: {
                        price: newPrice,
                        wholesalePrice: newWholesalePrice,
                    },
                });
            }
            catch (error) {
                console.error("❌ Error creating wholesale price:", error);
                next(error);
            }
        });
        this.validateUpdatePriceInput = (input) => {
            if (!input.Id || isNaN(Number(input.Id)))
                return "Id wajib diisi (angka)";
            if (input.Price === undefined || input.Price === null || isNaN(Number(input.Price)))
                return "Price wajib diisi (angka)";
            const price = Number(input.Price);
            if (price < 0)
                return "Price tidak boleh negatif";
            if (price > 100000000000)
                return "Price maksimal 100 miliar";
            if (input.MinQuantity !== undefined && input.MaxQuantity !== undefined) {
                if (isNaN(Number(input.MinQuantity)) || isNaN(Number(input.MaxQuantity)))
                    return "Min/MaxQuantity wajib angka";
                if (Number(input.MinQuantity) < 0)
                    return "MinQuantity tidak boleh negatif";
                if (Number(input.MaxQuantity) < Number(input.MinQuantity))
                    return "MaxQuantity harus lebih besar atau sama dengan MinQuantity";
            }
            return null;
        };
        this.updatePrice = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                // ✅ Tambahkan validasi di awal
                const errorMsg = this.validateUpdatePriceInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ message: errorMsg });
                    return;
                }
                const { Id, Price, MinQuantity, MaxQuantity } = req.body;
                if (!Id || Price === undefined) {
                    res.status(400).json({ message: "Id dan Price harus disertakan" });
                    return;
                }
                const existingPrice = yield prisma.price.findUnique({
                    where: { Id: Number(Id) },
                });
                if (!existingPrice) {
                    res.status(404).json({ message: "Data harga tidak ditemukan" });
                    return;
                }
                if (MinQuantity !== undefined && MaxQuantity !== undefined) {
                    const existingWholesale = yield prisma.wholesalePrice.findFirst({
                        where: { PriceId: Number(Id), DeletedAt: null },
                    });
                    if (!existingWholesale) {
                        res.status(404).json({ message: "Wholesale price tidak ditemukan." });
                        return;
                    }
                    const updatedWholesale = yield prisma.wholesalePrice.update({
                        where: { Id: existingWholesale.Id },
                        data: {
                            MinQuantity: Number(MinQuantity),
                            MaxQuantity: Number(MaxQuantity),
                        },
                    });
                    const updatedPrice = yield prisma.price.update({
                        where: { Id: Number(Id) },
                        data: { Price: Number(Price) },
                    });
                    res.status(200).json({
                        message: "Harga wholesale berhasil diperbarui",
                        data: {
                            price: updatedPrice,
                            wholesale: updatedWholesale,
                        },
                    });
                }
                else {
                    const updatedPrice = yield prisma.price.update({
                        where: { Id: Number(Id) },
                        data: { Price: Number(Price) },
                    });
                    res.status(200).json({
                        message: "Harga berhasil diperbarui",
                        data: updatedPrice,
                    });
                }
            }
            catch (error) {
                console.error("Error updating price:", error);
                next(error);
            }
        });
        this.deletePrice = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.params;
                // 1. Soft delete price
                yield prisma.price.update({
                    where: { Id: Number(Id) },
                    data: { DeletedAt: new Date() },
                });
                // 2. Soft delete semua wholesalePrice yang terkait dengan price ini
                yield prisma.wholesalePrice.updateMany({
                    where: { PriceId: Number(Id), DeletedAt: null },
                    data: { DeletedAt: new Date() },
                });
                res.status(200).json({ message: "Price & related wholesale prices deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting price:", error);
                next(error);
            }
        });
    }
}
const priceController = new Price();
exports.getItemCodeWithPriceCategory = priceController.getItemCodeWithPriceCategory;
exports.getPricesByCategory = priceController.getPricesByCategory;
exports.getDealersFetchPrice = priceController.getDealersFetchPrice;
exports.createOrUpdatePriceCategory = priceController.createOrUpdatePriceCategory;
exports.createDealerSpecificPrice = priceController.createDealerSpecificPrice;
exports.createWholesalePrice = priceController.createWholesalePrice;
exports.updatePrice = priceController.updatePrice;
exports.deletePrice = priceController.deletePrice;
exports.default = {
    getItemCodeWithPriceCategory: exports.getItemCodeWithPriceCategory,
    getPricesByCategory: exports.getPricesByCategory,
    getDealersFetchPrice: exports.getDealersFetchPrice,
    createOrUpdatePriceCategory: exports.createOrUpdatePriceCategory,
    createDealerSpecificPrice: exports.createDealerSpecificPrice,
    createWholesalePrice: exports.createWholesalePrice,
    updatePrice: exports.updatePrice,
    deletePrice: exports.deletePrice,
};
