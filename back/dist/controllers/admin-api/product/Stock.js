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
exports.updateStock = exports.getStockData = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class WarehouseStock {
    constructor() {
        this.getStockData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let { sortBy, filterProduct, filterPartNumber, filterItemCode } = req.query;
                let orderBy = {};
                if (sortBy === "product") {
                    orderBy = { Name: "asc" };
                }
                else if (sortBy === "partnumber_itemcode") {
                    orderBy = {
                        PartNumber: {
                            Name: "asc",
                        },
                    };
                }
                const stockData = yield prisma.product.findMany({
                    where: {
                        DeletedAt: null,
                        Name: filterProduct ? { contains: filterProduct, mode: "insensitive" } : undefined,
                        PartNumber: {
                            some: {
                                DeletedAt: null,
                                Name: filterPartNumber ? { contains: filterPartNumber, mode: "insensitive" } : undefined,
                                ItemCode: filterItemCode
                                    ? {
                                        some: {
                                            DeletedAt: null,
                                            Name: { contains: filterItemCode, mode: "insensitive" },
                                        },
                                    }
                                    : undefined,
                            },
                        },
                    },
                    include: {
                        PartNumber: {
                            where: {
                                DeletedAt: null,
                            },
                            include: {
                                ItemCode: {
                                    where: {
                                        DeletedAt: null,
                                    },
                                    include: {
                                        WarehouseStocks: {
                                            where: {
                                                DeletedAt: null,
                                                Warehouse: { DeletedAt: null }
                                            },
                                            include: {
                                                Warehouse: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        ProductCategory: true,
                    },
                    orderBy,
                    // Tidak pakai take & skip
                });
                res.json({
                    message: "Stock data fetched successfully",
                    data: stockData,
                });
            }
            catch (error) {
                console.error("Error fetching stock data:", error);
                res.status(500).json({ message: "Internal Server Error", error });
            }
        });
        this.updateStock = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { ItemCodeId, WarehouseId, QtyOnHand, QtyPO } = req.body;
            const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.Id;
            if (!adminId) {
                res.status(401).json({ message: "Unauthorized. AdminId missing." });
                return;
            }
            if (!ItemCodeId) {
                res.status(400).json({ message: "ItemCodeId required" });
                return;
            }
            // ==== HANDLE PO SAJA (TANPA WAREHOUSE) ====
            if (!WarehouseId && QtyPO !== undefined) {
                const before = yield prisma.itemCode.findUnique({
                    where: { Id: ItemCodeId },
                    select: { QtyPO: true }
                });
                if ((before === null || before === void 0 ? void 0 : before.QtyPO) !== QtyPO) {
                    yield prisma.itemCode.update({
                        where: { Id: ItemCodeId },
                        data: { QtyPO },
                    });
                    yield prisma.stockHistory.create({
                        data: {
                            WarehouseStockId: null,
                            ItemCodeId,
                            QtyBefore: before === null || before === void 0 ? void 0 : before.QtyPO,
                            QtyAfter: QtyPO,
                            Note: "QtyPO updated manually",
                            UpdatedAt: new Date(),
                            AdminId: adminId,
                        },
                    });
                }
                res.status(200).json({ message: "QtyPO updated successfully" });
                return;
            }
            // ===== HANDLE UPDATE STOCK (WAJIB WarehouseId) =====
            if (!WarehouseId) {
                res.status(400).json({ message: "WarehouseId required for stock update" });
                return;
            }
            // ---- VALIDASI QTYONHAND HANYA UNTUK UPDATE STOCK WAREHOUSE
            const qtyOnHandNum = Number(QtyOnHand);
            if (isNaN(qtyOnHandNum) ||
                qtyOnHandNum < 0 ||
                qtyOnHandNum > 1e15 // Float(20), hard cap for sanity
            ) {
                res.status(400).json({ message: "QtyOnHand must be a number between 0 until 20 character" });
                return;
            }
            // ---- VALIDASI QTYPO JIKA DIKIRIM (opsional)
            if (QtyPO !== undefined && QtyPO !== null) {
                const qtyPONum = Number(QtyPO);
                if (isNaN(qtyPONum) || qtyPONum < 0 || qtyPONum > 1e15) {
                    res.status(400).json({ message: "QtyPO must be a number between 0 and 20 character." });
                    return;
                }
            }
            try {
                const existing = yield prisma.warehouseStock.findUnique({
                    where: {
                        WarehouseId_ItemCodeId: {
                            WarehouseId,
                            ItemCodeId,
                        },
                    },
                });
                const itemCode = yield prisma.itemCode.findUnique({
                    where: { Id: ItemCodeId },
                    select: { QtyPO: true }
                });
                const beforeQtyPO = (_b = itemCode === null || itemCode === void 0 ? void 0 : itemCode.QtyPO) !== null && _b !== void 0 ? _b : 0;
                let warehouseStockId = null;
                // ==== HANDLE STOCK ====
                if (!existing) {
                    if (QtyOnHand > 0) {
                        const created = yield prisma.warehouseStock.create({
                            data: {
                                ItemCodeId,
                                WarehouseId,
                                QtyOnHand,
                                CreatedAt: new Date(),
                                DeletedAt: null,
                            },
                        });
                        warehouseStockId = created.Id;
                        // Catat log stok baru
                        yield prisma.stockHistory.create({
                            data: {
                                WarehouseStockId: warehouseStockId,
                                ItemCodeId,
                                QtyBefore: 0,
                                QtyAfter: QtyOnHand,
                                Note: "QtyOnHand created manually",
                                UpdatedAt: new Date(),
                                AdminId: adminId,
                            },
                        });
                    }
                    else {
                        res.status(400).json({ message: "Cannot create stock with QtyOnHand = 0" });
                        return;
                    }
                }
                else {
                    warehouseStockId = existing.Id;
                    if (QtyOnHand !== existing.QtyOnHand) {
                        yield prisma.warehouseStock.update({
                            where: {
                                WarehouseId_ItemCodeId: {
                                    ItemCodeId,
                                    WarehouseId,
                                },
                            },
                            data: {
                                QtyOnHand,
                                DeletedAt: QtyOnHand === 0 ? new Date() : null,
                                UpdatedAt: new Date(),
                            },
                        });
                        // Log perubahan QtyOnHand
                        yield prisma.stockHistory.create({
                            data: {
                                WarehouseStockId: warehouseStockId,
                                ItemCodeId,
                                QtyBefore: existing.QtyOnHand,
                                QtyAfter: QtyOnHand,
                                Note: "QtyOnHand updated manually",
                                UpdatedAt: new Date(),
                                AdminId: adminId,
                            },
                        });
                    }
                }
                res.status(200).json({ message: "Stock updated successfully" });
            }
            catch (error) {
                console.error("Error updating stock:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
const warehouseStockController = new WarehouseStock();
exports.getStockData = warehouseStockController.getStockData;
exports.updateStock = warehouseStockController.updateStock;
exports.default = {
    getStockData: exports.getStockData,
    updateStock: exports.updateStock,
};
