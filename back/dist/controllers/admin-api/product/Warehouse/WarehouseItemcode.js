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
exports.listWarehouseByItemCode = exports.removeWarehouseFromItemCode = exports.addWarehouseToItemCode = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class warehouse {
    /**
     * Menambah warehouse ke itemcode (create relasi, restore jika soft-delete)
     * Body: { WarehouseId, ItemCodeId }
     */
    addWarehouseToItemCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { WarehouseId, ItemCodeId } = req.body;
            if (!WarehouseId || !ItemCodeId) {
                res.status(400).json({ message: "WarehouseId dan ItemCodeId wajib diisi." });
                return;
            }
            try {
                const exists = yield prisma.warehouseStock.findFirst({ where: { WarehouseId, ItemCodeId } });
                if (exists) {
                    if (exists.DeletedAt) {
                        yield prisma.warehouseStock.update({
                            where: { Id: exists.Id },
                            data: { DeletedAt: null },
                        });
                        res.status(200).json({ message: "Warehouse berhasil direstore ke ItemCode.", data: exists });
                        return;
                    }
                    res.status(200).json({ message: "Warehouse sudah terkait dengan ItemCode.", data: exists });
                    return;
                }
                const newRel = yield prisma.warehouseStock.create({
                    data: { WarehouseId, ItemCodeId, QtyOnHand: 0 }
                });
                res.status(201).json({ message: "Warehouse berhasil ditambahkan ke ItemCode.", data: newRel });
            }
            catch (error) {
                console.error("Tambah warehouse-itemcode error:", error);
                res.status(500).json({ message: "Gagal menambahkan warehouse ke itemcode.", error });
            }
        });
    }
    /**
     * Menghapus (soft delete) warehouse dari itemcode.
     * Body: { WarehouseId, ItemCodeId }
     */
    removeWarehouseFromItemCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { WarehouseId, ItemCodeId } = req.body;
            if (!WarehouseId || !ItemCodeId) {
                res.status(400).json({ message: "WarehouseId dan ItemCodeId wajib diisi." });
                return;
            }
            try {
                const exists = yield prisma.warehouseStock.findFirst({
                    where: { WarehouseId, ItemCodeId, DeletedAt: null }
                });
                if (!exists) {
                    res.status(404).json({ message: "Warehouse belum terkait dengan ItemCode." });
                    return;
                }
                yield prisma.warehouseStock.update({
                    where: { Id: exists.Id },
                    data: { DeletedAt: new Date() }
                });
                res.status(200).json({ message: "Warehouse berhasil dihapus dari ItemCode." });
            }
            catch (error) {
                console.error("Hapus warehouse-itemcode error:", error);
                res.status(500).json({ message: "Gagal menghapus warehouse dari itemcode.", error });
            }
        });
    }
    /**
     * Menampilkan daftar warehouse yang terkait dengan itemcode (aktif saja).
     * Param: itemCodeId
     */
    listWarehouseByItemCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemCodeId = Number(req.params.itemCodeId);
            if (!itemCodeId) {
                res.status(400).json({ message: "ItemCodeId wajib diisi." });
                return;
            }
            try {
                const data = yield prisma.warehouseStock.findMany({
                    where: { ItemCodeId: itemCodeId, DeletedAt: null },
                    include: { Warehouse: true }
                });
                res.status(200).json({ data });
            }
            catch (error) {
                console.error("List warehouse error:", error);
                res.status(500).json({ message: "Gagal mengambil data warehouse-itemcode.", error });
            }
        });
    }
}
const warehouseController = new warehouse();
exports.addWarehouseToItemCode = warehouseController.addWarehouseToItemCode.bind(warehouseController);
exports.removeWarehouseFromItemCode = warehouseController.removeWarehouseFromItemCode.bind(warehouseController);
exports.listWarehouseByItemCode = warehouseController.listWarehouseByItemCode.bind(warehouseController);
exports.default = {
    addWarehouseToItemCode: exports.addWarehouseToItemCode,
    removeWarehouseFromItemCode: exports.removeWarehouseFromItemCode,
    listWarehouseByItemCode: exports.listWarehouseByItemCode,
};
