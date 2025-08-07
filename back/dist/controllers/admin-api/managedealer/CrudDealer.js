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
exports.deleteDealer = exports.updateDealer = exports.getAllFetchPriceCategories = exports.getDealerById = exports.getDealers = exports.createDealer = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Dealer {
    constructor() {
        this.validateDealerInput = (input) => {
            if (!input.CompanyName || input.CompanyName.length > 100)
                return 'CompanyName maksimal 100 karakter';
            if (input.Region && input.Region.length > 50)
                return 'Region maksimal 50 karakter';
            if (!input.StoreCode || input.StoreCode.length > 30)
                return 'StoreCode maksimal 30 karakter';
            if (input.Address && input.Address.length > 150)
                return 'Address maksimal 150 karakter';
            if (input.PhoneNumber && input.PhoneNumber.length > 20)
                return 'PhoneNumber maksimal 20 karakter';
            if (input.fax && input.fax.length > 20)
                return 'Fax maksimal 20 karakter';
            return null;
        };
        this.createDealer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { CompanyName, Region, PriceCategoryId, StoreCode, SalesIds, } = req.body;
                const errorMsg = this.validateDealerInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ message: errorMsg });
                    return;
                }
                if (!StoreCode || StoreCode.trim() === "") {
                    res.status(400).json({ message: "StoreCode is required." });
                    return;
                }
                const validSalesIds = Array.isArray(SalesIds)
                    ? SalesIds.map((id) => Number(id)).filter((id) => !isNaN(id))
                    : SalesIds !== undefined && SalesIds !== null
                        ? [Number(SalesIds)].filter((id) => !isNaN(id))
                        : [];
                if (validSalesIds.length > 0) {
                    const existingSales = yield prisma.sales.findMany({
                        where: { Id: { in: validSalesIds } },
                        select: { Id: true }
                    });
                    const existingIds = existingSales.map(s => s.Id);
                    const missingIds = validSalesIds.filter(id => !existingIds.includes(id));
                    if (missingIds.length > 0) {
                        res.status(400).json({ message: `Sales ID(s) not found: ${missingIds.join(", ")}` });
                        return;
                    }
                }
                const newDealer = yield prisma.dealer.create({
                    data: {
                        CompanyName,
                        Region,
                        StoreCode: StoreCode.trim(),
                        PriceCategoryId: PriceCategoryId ? Number(PriceCategoryId) : null,
                        Sales: validSalesIds.length > 0
                            ? { connect: validSalesIds.map((id) => ({ Id: id })) }
                            : undefined,
                    },
                });
                res.status(201).json({ message: "Dealer created successfully", data: newDealer });
            }
            catch (error) {
                console.error("Error creating dealer:", error);
                next(error);
            }
        });
        this.getDealers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
        this.getDealerById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { Id } = req.params;
                const dealerId = Number(Id);
                const dealer = yield prisma.dealer.findUnique({
                    where: { Id: dealerId },
                    include: {
                        User: true,
                        PriceCategory: true,
                        Sales: {
                            include: {
                                Admin: {
                                    select: { Name: true, Email: true }
                                }
                            }
                        }
                    }
                });
                if (!dealer) {
                    res.status(404).json({ message: "Dealer not found." });
                    return;
                }
                const enrichedDealer = Object.assign(Object.assign({}, dealer), { PriceCategoryName: dealer.PriceCategory ? dealer.PriceCategory.Name : "No Price Category", Sales: (_b = (_a = dealer.Sales) === null || _a === void 0 ? void 0 : _a.map(s => {
                        var _a, _b, _c, _d;
                        return ({
                            Id: s.Id,
                            AdminId: s.AdminId,
                            Name: (_b = (_a = s.Admin) === null || _a === void 0 ? void 0 : _a.Name) !== null && _b !== void 0 ? _b : null,
                            Email: (_d = (_c = s.Admin) === null || _c === void 0 ? void 0 : _c.Email) !== null && _d !== void 0 ? _d : null, // HANYA Name saja
                        });
                    })) !== null && _b !== void 0 ? _b : [] });
                res.status(200).json({ data: enrichedDealer });
            }
            catch (error) {
                console.error("Error fetching dealer by ID:", error);
                next(error);
            }
        });
        this.getAllFetchPriceCategories = (_req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const priceCategories = yield prisma.priceCategory.findMany({
                    include: {
                        Price: true,
                        Dealer: true,
                    },
                });
                res.status(200).json({ data: priceCategories });
            }
            catch (error) {
                console.error("Error fetching PriceCategories:", error);
                next(error);
            }
        });
        this.updateDealer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.params;
                const { CompanyName, Region, PriceCategoryId, SalesIds, UserIds, StoreCode } = req.body;
                console.log("UPDATE DEALER BODY:", req.body);
                const errorMsg = this.validateDealerInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ message: errorMsg });
                    return;
                }
                if (!StoreCode || StoreCode.trim() === "") {
                    res.status(400).json({ message: "StoreCode is required for update." });
                    return;
                }
                const dealerId = Number(Id);
                if (isNaN(dealerId)) {
                    res.status(400).json({ message: "Invalid dealer ID" });
                    return;
                }
                const dealerExists = yield prisma.dealer.findUnique({
                    where: { Id: dealerId },
                });
                if (!dealerExists) {
                    res.status(404).json({ message: "Dealer not found" });
                    return;
                }
                const validSalesIds = (SalesIds || [])
                    .filter((id) => id !== null && id !== undefined && !isNaN(Number(id)))
                    .map((id) => Number(id));
                if (validSalesIds.length > 0) {
                    const validSales = yield prisma.sales.findMany({
                        where: { Id: { in: validSalesIds } },
                    });
                    if (validSales.length !== validSalesIds.length) {
                        res.status(400).json({ message: "Some SalesIds do not exist" });
                        return;
                    }
                }
                const validUserIds = (UserIds || [])
                    .filter((id) => id !== null && id !== undefined && !isNaN(Number(id)))
                    .map((id) => Number(id));
                const updatedDealer = yield prisma.dealer.update({
                    where: { Id: dealerId },
                    data: {
                        CompanyName,
                        Region,
                        StoreCode: StoreCode.trim(),
                        PriceCategoryId: PriceCategoryId ? Number(PriceCategoryId) : null,
                        Sales: { set: validSalesIds.map((id) => ({ Id: id })) }, // kalau array kosong, set: [] = unassign all
                        User: { set: validUserIds.map((id) => ({ Id: id })) },
                    },
                });
                res.status(200).json({ message: "Dealer updated successfully", data: updatedDealer });
            }
            catch (error) {
                console.error("Error updating dealer:", error);
                next(error);
            }
        });
        this.deleteDealer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.params;
                const dealerId = Number(Id);
                const dealer = yield prisma.dealer.findUnique({
                    where: { Id: dealerId },
                });
                if (!dealer) {
                    res.status(404).json({ message: "Dealer tidak ditemukan." });
                    return;
                }
                yield prisma.user.updateMany({
                    where: { DealerId: dealerId },
                    data: { DealerId: null },
                });
                yield prisma.dealer.update({
                    where: { Id: dealerId },
                    data: { DeletedAt: new Date() },
                });
                res.status(200).json({ message: "Dealer berhasil dinonaktifkan." });
            }
            catch (error) {
                console.error("Error saat menonaktifkan dealer:", error);
                next(error);
            }
        });
    }
}
const dealerController = new Dealer();
exports.createDealer = dealerController.createDealer;
exports.getDealers = dealerController.getDealers;
exports.getDealerById = dealerController.getDealerById;
exports.getAllFetchPriceCategories = dealerController.getAllFetchPriceCategories;
exports.updateDealer = dealerController.updateDealer;
exports.deleteDealer = dealerController.deleteDealer;
exports.default = {
    createDealer: exports.createDealer,
    getDealers: exports.getDealers,
    getDealerById: exports.getDealerById,
    getAllFetchPriceCategories: exports.getAllFetchPriceCategories,
    updateDealer: exports.updateDealer,
    deleteDealer: exports.deleteDealer,
};
