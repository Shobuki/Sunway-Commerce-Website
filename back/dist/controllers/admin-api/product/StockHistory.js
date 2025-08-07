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
exports.getStockHistory = exports.getStockHistoryOptions = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const NOTE_FILTER_OPTIONS = [
    { value: "Stock nulled: ItemCode+Warehouse not found in Excel", label: "Stock nulled: ItemCode+Warehouse not found in Excel" },
    { value: "Stock nulled: ItemCode not found in Excel", label: "Stock nulled: ItemCode not found in Excel" },
    { value: "QtyPO updated from Excel", label: "QtyPO updated from Excel" },
    { value: "QtyPO changed from", label: "QtyPO changed from ..." },
    { value: "Created from Excel upload", label: "Created from Excel upload" }
];
class StockHistory {
    constructor() {
        this.getStockHistory = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { page = "1", perPage = "40", adminId, itemCodeId, productId, productCategoryId, q, type, startDate, endDate, sortBy = "UpdatedAt", sortDir = "desc", note, } = req.query;
                const rawStartDate = startDate;
                const rawEndDate = endDate;
                let startDateObj = undefined;
                let endDateObj = undefined;
                if (rawStartDate) {
                    startDateObj = new Date(rawStartDate + "T00:00:00");
                }
                if (rawEndDate) {
                    endDateObj = new Date(rawEndDate + "T23:59:59.999");
                }
                // Pagination
                const currentPage = parseInt(page) || 1;
                const limit = Math.min(parseInt(perPage) || 40, 100);
                const offset = (currentPage - 1) * limit;
                const filters = Object.assign(Object.assign(Object.assign({ ItemCode: { DeletedAt: null } }, (adminId ? { AdminId: Number(adminId) } : {})), (itemCodeId ? { ItemCodeId: Number(itemCodeId) } : {})), (startDateObj || endDateObj
                    ? {
                        UpdatedAt: Object.assign(Object.assign({}, (startDateObj ? { gte: startDateObj } : {})), (endDateObj ? { lte: endDateObj } : {})),
                    }
                    : {}));
                // Filter by change type (manual/excel)
                let where = Object.assign({}, filters);
                if (note) {
                    where = Object.assign(Object.assign({}, where), { Note: { equals: note } });
                }
                else if (type === "manual") {
                    where = Object.assign(Object.assign({}, where), { Note: { contains: "manual" } });
                }
                else if (type === "excel") {
                    where = Object.assign(Object.assign({}, where), { OR: [
                            { Note: { startsWith: "Stock nulled: ItemCode+Warehouse not found in Excel" } },
                            { Note: { startsWith: "Stock nulled: ItemCode not found in Excel" } },
                            { Note: { startsWith: "QtyPO updated from Excel" } },
                            { Note: { startsWith: "QtyPO changed from" } },
                            { Note: { startsWith: "Created from Excel upload" } }
                        ] });
                }
                // Filter by ProductId (via PartNumber)
                if (productId) {
                    filters.ItemCode.PartNumber = {
                        ProductId: Number(productId),
                        DeletedAt: null,
                    };
                }
                // Filter by ProductCategoryId
                if (productCategoryId) {
                    const prodInCat = yield prisma.productCategory.findUnique({
                        where: { Id: Number(productCategoryId) },
                        include: { Products: { select: { Id: true } } },
                    });
                    const productIds = (_b = (_a = prodInCat === null || prodInCat === void 0 ? void 0 : prodInCat.Products) === null || _a === void 0 ? void 0 : _a.map((p) => p.Id)) !== null && _b !== void 0 ? _b : [];
                    filters.ItemCode.PartNumber = {
                        ProductId: { in: productIds },
                        DeletedAt: null,
                    };
                }
                // Search q (itemcode, product, admin, note)
                let ORsearch = [];
                if (q) {
                    const qstr = q;
                    switch (req.query.searchType) {
                        case "itemcode":
                            ORsearch.push({ ItemCode: { Name: { contains: qstr, mode: "insensitive" } } });
                            break;
                        case "product":
                            ORsearch.push({ ItemCode: { PartNumber: { Product: { Name: { contains: qstr, mode: "insensitive" } } } } });
                            break;
                        case "admin":
                            ORsearch.push({ Admin: { Username: { contains: qstr, mode: "insensitive" } } });
                            ORsearch.push({ Admin: { Name: { contains: qstr, mode: "insensitive" } } });
                            break;
                        case "note":
                            ORsearch.push({ Note: { contains: qstr, mode: "insensitive" } });
                            break;
                        default: // Semua
                            ORsearch = [
                                { ItemCode: { Name: { contains: qstr, mode: "insensitive" } } },
                                { Note: { contains: qstr, mode: "insensitive" } },
                                { Admin: { Username: { contains: qstr, mode: "insensitive" } } },
                                { Admin: { Name: { contains: qstr, mode: "insensitive" } } },
                                { ItemCode: { PartNumber: { Product: { Name: { contains: qstr, mode: "insensitive" } } } } },
                            ];
                    }
                }
                // Gabungkan ke where query jika ORsearch ada isinya:
                if (ORsearch.length > 0) {
                    where = Object.assign(Object.assign({}, where), { OR: ORsearch });
                }
                // Query
                const [totalData, histories] = yield Promise.all([
                    prisma.stockHistory.count({ where }),
                    prisma.stockHistory.findMany({
                        where,
                        include: {
                            Admin: { select: { Id: true, Username: true, Name: true } },
                            ItemCode: {
                                select: {
                                    Id: true,
                                    Name: true,
                                    PartNumber: {
                                        select: {
                                            Id: true,
                                            Name: true,
                                            Product: {
                                                select: {
                                                    Id: true,
                                                    Name: true,
                                                    ProductCategory: {
                                                        select: { Id: true, Name: true },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            WarehouseStock: {
                                select: {
                                    Id: true,
                                    QtyOnHand: true,
                                    Warehouse: { select: { Id: true, Name: true, BusinessUnit: true } },
                                },
                            },
                            UploadLog: {
                                select: { Id: true, FilePath: true, CreatedAt: true },
                            },
                        },
                        orderBy: { [sortBy]: sortDir === "asc" ? "asc" : "desc" },
                        take: limit,
                        skip: offset,
                    }),
                ]);
                // Format output as required (hirarki)
                const result = histories.map((row) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                    return ({
                        Id: row.Id,
                        UpdatedAt: row.UpdatedAt,
                        QtyBefore: row.QtyBefore,
                        QtyAfter: row.QtyAfter,
                        Note: row.Note,
                        ChangeType: row.UploadLogId
                            ? "excel"
                            : ((_a = row.Note) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("manual"))
                                ? "manual"
                                : "unknown",
                        Admin: row.Admin
                            ? {
                                Id: row.Admin.Id,
                                Username: row.Admin.Username,
                                Name: row.Admin.Name,
                            }
                            : null,
                        ProductCategory: (_f = (_e = (_d = (_c = (_b = row.ItemCode) === null || _b === void 0 ? void 0 : _b.PartNumber) === null || _c === void 0 ? void 0 : _c.Product) === null || _d === void 0 ? void 0 : _d.ProductCategory) === null || _e === void 0 ? void 0 : _e.map((cat) => ({
                            Id: cat.Id,
                            Name: cat.Name,
                        }))) !== null && _f !== void 0 ? _f : [],
                        Product: ((_h = (_g = row.ItemCode) === null || _g === void 0 ? void 0 : _g.PartNumber) === null || _h === void 0 ? void 0 : _h.Product)
                            ? {
                                Id: row.ItemCode.PartNumber.Product.Id,
                                Name: row.ItemCode.PartNumber.Product.Name,
                            }
                            : null,
                        PartNumber: ((_j = row.ItemCode) === null || _j === void 0 ? void 0 : _j.PartNumber)
                            ? {
                                Id: row.ItemCode.PartNumber.Id,
                                Name: row.ItemCode.PartNumber.Name,
                            }
                            : null,
                        ItemCode: row.ItemCode
                            ? {
                                Id: row.ItemCode.Id,
                                Name: row.ItemCode.Name,
                            }
                            : null,
                        Warehouse: ((_k = row.WarehouseStock) === null || _k === void 0 ? void 0 : _k.Warehouse)
                            ? {
                                Id: row.WarehouseStock.Warehouse.Id,
                                Name: row.WarehouseStock.Warehouse.Name,
                                BusinessUnit: row.WarehouseStock.Warehouse.BusinessUnit,
                            }
                            : null,
                        QtyOnHand: (_m = (_l = row.WarehouseStock) === null || _l === void 0 ? void 0 : _l.QtyOnHand) !== null && _m !== void 0 ? _m : null,
                        UploadLog: row.UploadLog
                            ? {
                                Id: row.UploadLog.Id,
                                FilePath: row.UploadLog.FilePath,
                                CreatedAt: row.UploadLog.CreatedAt,
                            }
                            : null,
                    });
                });
                res.json({
                    message: "Stock history fetched successfully",
                    currentPage,
                    perPage: limit,
                    totalData,
                    totalPages: Math.ceil(totalData / limit),
                    data: result,
                });
            }
            catch (error) {
                console.error("Error fetching stock history:", error);
                res.status(500).json({ message: "Internal Server Error", error });
            }
        });
        this.getStockHistoryOptions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Semua admin (yang aktif)
                const adminOptions = yield prisma.admin.findMany({
                    where: { DeletedAt: null },
                    select: { Id: true, Username: true, Name: true }
                });
                // Semua item code (yang aktif)
                const itemCodeOptions = yield prisma.itemCode.findMany({
                    where: { DeletedAt: null },
                    select: { Id: true, Name: true }
                });
                // Semua produk (yang aktif)
                const productOptions = yield prisma.product.findMany({
                    where: { DeletedAt: null },
                    select: { Id: true, Name: true }
                });
                // Semua kategori produk (yang aktif)
                const categoryOptions = yield prisma.productCategory.findMany({
                    where: { DeletedAt: null },
                    select: { Id: true, Name: true }
                });
                res.json({
                    adminOptions,
                    itemCodeOptions,
                    productOptions,
                    categoryOptions,
                    noteOptions: NOTE_FILTER_OPTIONS,
                });
            }
            catch (error) {
                console.error("Error fetching stock history options:", error);
                res.status(500).json({ message: "Internal Server Error", error });
            }
        });
    }
}
const stockHistoryController = new StockHistory();
const getStockHistoryController = stockHistoryController.getStockHistoryOptions;
exports.getStockHistoryOptions = getStockHistoryController;
exports.getStockHistory = stockHistoryController.getStockHistory;
exports.default = stockHistoryController;
