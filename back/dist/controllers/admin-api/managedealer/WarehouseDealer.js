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
exports.fetchAllWarehouses = exports.getWarehousesByDealer = exports.reorderDealerWarehouses = exports.unassignWarehouseFromDealer = exports.assignWarehouseToDealer = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Dealer {
    constructor() {
        this.assignWarehouseToDealer = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { DealerId, WarehouseId, Priority } = req.body;
                if (!DealerId || !WarehouseId) {
                    res.status(400).json({ message: "DealerId and WarehouseId are required." });
                    return;
                }
                const existing = yield prisma.dealerWarehouse.findUnique({
                    where: {
                        DealerId_WarehouseId: {
                            DealerId,
                            WarehouseId,
                        },
                    },
                });
                if (existing) {
                    res.status(400).json({ message: "This dealer is already assigned to this warehouse." });
                    return;
                }
                const result = yield prisma.dealerWarehouse.create({
                    data: {
                        DealerId,
                        WarehouseId,
                        Priority: Priority !== null && Priority !== void 0 ? Priority : null,
                    },
                });
                res.status(201).json({ message: "Warehouse assigned to dealer successfully.", data: result });
            }
            catch (error) {
                console.error("Error assigning warehouse to dealer:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
        this.unassignWarehouseFromDealer = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { DealerId, WarehouseId } = req.body;
                if (!DealerId || !WarehouseId) {
                    res.status(400).json({ message: "DealerId and WarehouseId are required." });
                    return;
                }
                yield prisma.dealerWarehouse.delete({
                    where: {
                        DealerId_WarehouseId: {
                            DealerId,
                            WarehouseId,
                        },
                    },
                });
                res.status(200).json({ message: "Warehouse unassigned from dealer successfully." });
            }
            catch (error) {
                console.error("Error unassigning warehouse from dealer:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
        this.reorderDealerWarehouses = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { DealerId, WarehouseOrder } = req.body;
                if (!DealerId || !Array.isArray(WarehouseOrder) || WarehouseOrder.length === 0) {
                    res.status(400).json({ message: "DealerId dan WarehouseOrder (array) diperlukan." });
                    return;
                }
                const dealerExists = yield prisma.dealer.findUnique({
                    where: { Id: DealerId },
                });
                if (!dealerExists) {
                    res.status(404).json({ message: "Dealer tidak ditemukan." });
                    return;
                }
                const current = yield prisma.dealerWarehouse.findMany({
                    where: { DealerId },
                    select: { WarehouseId: true }
                });
                const currentIds = current.map((dw) => dw.WarehouseId);
                const isValid = WarehouseOrder.every((id) => currentIds.includes(id));
                if (!isValid) {
                    res.status(400).json({ message: "Beberapa WarehouseId tidak valid atau tidak terhubung dengan dealer." });
                    return;
                }
                const updates = WarehouseOrder.map((warehouseId, index) => prisma.dealerWarehouse.update({
                    where: {
                        DealerId_WarehouseId: {
                            DealerId,
                            WarehouseId: warehouseId,
                        },
                    },
                    data: { Priority: index },
                }));
                yield Promise.all(updates);
                res.status(200).json({ message: "Prioritas warehouse berhasil diperbarui." });
            }
            catch (error) {
                console.error("Error reorder dealer warehouses:", error);
                res.status(500).json({ message: "Internal server error." });
            }
        });
        this.getWarehousesByDealer = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const DealerId = parseInt(req.body.DealerId);
                if (isNaN(DealerId)) {
                    res.status(400).json({ message: "Invalid DealerId" });
                    return;
                }
                const dealer = yield prisma.dealer.findUnique({
                    where: { Id: DealerId },
                    include: {
                        DealerWarehouse: {
                            include: { Warehouse: true },
                            orderBy: { Priority: "asc" },
                        },
                    },
                });
                if (!dealer) {
                    res.status(404).json({ message: "Dealer not found" });
                    return;
                }
                const warehouses = dealer.DealerWarehouse.map((dw) => {
                    var _a;
                    return ({
                        Id: dw.Warehouse.Id,
                        BusinessUnit: dw.Warehouse.BusinessUnit,
                        Name: dw.Warehouse.Name,
                        Priority: (_a = dw.Priority) !== null && _a !== void 0 ? _a : null,
                    });
                });
                res.json({ success: true, data: warehouses });
            }
            catch (error) {
                console.error("Error fetching dealer warehouses:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
        this.fetchAllWarehouses = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const warehouses = yield prisma.warehouse.findMany({
                    where: { DeletedAt: null },
                    orderBy: { BusinessUnit: "asc" },
                    select: {
                        Id: true,
                        Name: true,
                        BusinessUnit: true,
                        Location: true,
                    },
                });
                res.json({ success: true, data: warehouses });
            }
            catch (error) {
                console.error("Error fetching warehouses:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
const dealerController = new Dealer();
exports.assignWarehouseToDealer = dealerController.assignWarehouseToDealer;
exports.unassignWarehouseFromDealer = dealerController.unassignWarehouseFromDealer;
exports.reorderDealerWarehouses = dealerController.reorderDealerWarehouses;
exports.getWarehousesByDealer = dealerController.getWarehousesByDealer;
exports.fetchAllWarehouses = dealerController.fetchAllWarehouses;
exports.default = {
    assignWarehouseToDealer: exports.assignWarehouseToDealer,
    unassignWarehouseFromDealer: exports.unassignWarehouseFromDealer,
    reorderDealerWarehouses: exports.reorderDealerWarehouses,
    getWarehousesByDealer: exports.getWarehousesByDealer,
    fetchAllWarehouses: exports.fetchAllWarehouses,
};
