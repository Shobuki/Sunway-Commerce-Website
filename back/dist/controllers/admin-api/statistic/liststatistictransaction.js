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
exports.getStatisticFilterOptions = exports.getTransactionReportHandler = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const reportRequestSchema = zod_1.z.object({
    timeRange: zod_1.z.enum(['all', 'day', 'week', 'month', 'year', 'custom']).default('all'),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    DealerId: zod_1.z.number().optional(),
    UserId: zod_1.z.number().optional(),
    ItemCodeId: zod_1.z.number().optional(),
    ProductCategoryId: zod_1.z.number().optional(),
    ProductId: zod_1.z.number().optional(),
    PartNumberId: zod_1.z.number().optional(),
    Status: zod_1.z.enum(['APPROVED_EMAIL_SENT', 'REJECTED', 'PENDING_APPROVAL']).optional()
});
class SalesOrder {
    constructor() {
        this.getTransactionReportHandler = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const filters = reportRequestSchema.parse((_a = req.body.filters) !== null && _a !== void 0 ? _a : {});
                const daysMap = { day: 1, week: 7, month: 30, year: 365 };
                const createdAtFilter = (() => {
                    if (filters.timeRange === 'custom' && filters.startDate && filters.endDate) {
                        return {
                            CreatedAt: {
                                gte: new Date(filters.startDate),
                                lte: new Date(filters.endDate),
                            },
                        };
                    }
                    else if (filters.timeRange in daysMap) {
                        const now = new Date();
                        if (filters.timeRange in daysMap) {
                            now.setDate(now.getDate() - daysMap[filters.timeRange]);
                        }
                        return {
                            CreatedAt: {
                                gte: now,
                            },
                        };
                    }
                    return null;
                })();
                const detailFilters = [];
                if (filters.ItemCodeId) {
                    detailFilters.push({ ItemCodeId: filters.ItemCodeId });
                }
                if (filters.PartNumberId) {
                    detailFilters.push({ ItemCode: { PartNumberId: filters.PartNumberId } });
                }
                if (filters.ProductId) {
                    detailFilters.push({
                        ItemCode: {
                            PartNumber: { ProductId: filters.ProductId }
                        }
                    });
                }
                if (filters.ProductCategoryId) {
                    detailFilters.push({
                        ItemCode: {
                            PartNumber: {
                                Product: {
                                    ProductCategory: { some: { Id: filters.ProductCategoryId } }
                                }
                            }
                        }
                    });
                }
                const whereClause = {
                    AND: [
                        filters.DealerId && { DealerId: filters.DealerId },
                        filters.UserId && { UserId: filters.UserId },
                        filters.Status && { Status: filters.Status },
                        createdAtFilter,
                        detailFilters.length > 0 && {
                            SalesOrderDetails: {
                                some: {
                                    AND: detailFilters
                                }
                            }
                        }
                    ].filter(Boolean),
                };
                const transactions = yield prisma.salesOrder.findMany({
                    where: whereClause,
                    include: {
                        Dealer: true,
                        User: true,
                        SalesOrderDetails: {
                            include: {
                                ItemCode: {
                                    include: {
                                        ProductBrand: true,
                                        PartNumber: {
                                            include: {
                                                Product: {
                                                    include: {
                                                        ProductCategory: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                PriceCategory: true,
                            },
                        },
                    },
                    orderBy: { CreatedAt: 'desc' },
                });
                const result = transactions.map(tx => {
                    var _a, _b, _c, _d, _e, _f;
                    return ({
                        Id: tx.Id,
                        SalesOrderNumber: tx.SalesOrderNumber,
                        CreatedAt: tx.CreatedAt,
                        Status: tx.Status,
                        Dealer: {
                            Id: (_a = tx.Dealer) === null || _a === void 0 ? void 0 : _a.Id,
                            Name: (_b = tx.Dealer) === null || _b === void 0 ? void 0 : _b.CompanyName,
                            Region: (_c = tx.Dealer) === null || _c === void 0 ? void 0 : _c.Region,
                        },
                        User: {
                            Id: (_d = tx.User) === null || _d === void 0 ? void 0 : _d.Id,
                            Name: (_e = tx.User) === null || _e === void 0 ? void 0 : _e.Name,
                            Email: (_f = tx.User) === null || _f === void 0 ? void 0 : _f.Email,
                        },
                        TotalAmount: tx.SalesOrderDetails.reduce((acc, d) => acc + d.FinalPrice * d.Quantity, 0),
                        Details: tx.SalesOrderDetails.map(d => {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                            return ({
                                ItemCode: (_a = d.ItemCode) === null || _a === void 0 ? void 0 : _a.Name,
                                Brand: (_c = (_b = d.ItemCode) === null || _b === void 0 ? void 0 : _b.ProductBrand) === null || _c === void 0 ? void 0 : _c.ProductBrandName,
                                PartNumber: (_e = (_d = d.ItemCode) === null || _d === void 0 ? void 0 : _d.PartNumber) === null || _e === void 0 ? void 0 : _e.Name,
                                Product: (_h = (_g = (_f = d.ItemCode) === null || _f === void 0 ? void 0 : _f.PartNumber) === null || _g === void 0 ? void 0 : _g.Product) === null || _h === void 0 ? void 0 : _h.Name,
                                Categories: (_m = (_l = (_k = (_j = d.ItemCode) === null || _j === void 0 ? void 0 : _j.PartNumber) === null || _k === void 0 ? void 0 : _k.Product) === null || _l === void 0 ? void 0 : _l.ProductCategory) === null || _m === void 0 ? void 0 : _m.map(c => c.Name),
                                Quantity: d.Quantity,
                                Price: {
                                    Final: d.FinalPrice,
                                    Original: d.Price,
                                    Category: (_o = d.PriceCategory) === null || _o === void 0 ? void 0 : _o.Name,
                                },
                                Total: d.Quantity * d.FinalPrice,
                            });
                        }),
                    });
                });
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        errors: error.errors.map(e => ({
                            path: e.path.join('.'),
                            message: e.message,
                        })),
                    });
                }
                console.error('[Transaction Report Error]', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal Server Error',
                });
            }
        });
        this.getStatisticFilterOptions = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [dealers, users, itemCodes, partNumbers, products, categories] = yield Promise.all([
                    prisma.dealer.findMany({ select: { Id: true, CompanyName: true } }),
                    prisma.user.findMany({ select: { Id: true, Name: true } }),
                    prisma.itemCode.findMany({ select: { Id: true, Name: true } }),
                    prisma.partNumber.findMany({ select: { Id: true, Name: true } }),
                    prisma.product.findMany({ select: { Id: true, Name: true } }),
                    prisma.productCategory.findMany({ select: { Id: true, Name: true } }),
                ]);
                res.status(200).json({
                    success: true,
                    data: {
                        dealers: dealers.map(d => ({ Id: d.Id, Name: d.CompanyName })),
                        users: users.map(u => ({ Id: u.Id, Name: u.Name })),
                        itemCodes: itemCodes.map(i => ({ Id: i.Id, Name: i.Name })),
                        partNumbers: partNumbers.map(p => ({ Id: p.Id, Name: p.Name })),
                        products: products.map(p => ({ Id: p.Id, Name: p.Name })),
                        categories: categories.map(c => ({ Id: c.Id, Name: c.Name })),
                    },
                });
            }
            catch (error) {
                console.error('[GetStatisticFilterOptions Error]', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal Server Error',
                });
            }
        });
    }
}
const salesOrderController = new SalesOrder();
exports.getTransactionReportHandler = salesOrderController.getTransactionReportHandler;
exports.getStatisticFilterOptions = salesOrderController.getStatisticFilterOptions;
exports.default = salesOrderController;
