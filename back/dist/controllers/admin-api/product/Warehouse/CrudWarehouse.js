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
exports.deleteWarehouse = exports.updateWarehouse = exports.getWarehouses = exports.createWarehouse = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Create Warehouse
const createWarehouse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Name, BusinessUnit, Location } = req.body;
        // Validasi
        if (!BusinessUnit) {
            res.status(400).json({ message: "BusinessUnit is required" });
            return;
        }
        if (typeof BusinessUnit !== "string" || BusinessUnit.length > 10) {
            res.status(400).json({ message: "BusinessUnit must be a string and max 10 characters." });
            return;
        }
        if (Name && (typeof Name !== "string" || Name.length > 50)) {
            res.status(400).json({ message: "Name must be a string and max 50 characters." });
            return;
        }
        if (Location && (typeof Location !== "string" || Location.length > 80)) {
            res.status(400).json({ message: "Location must be a string and max 80 characters." });
            return;
        }
        // Cari warehouse dgn BusinessUnit yang sama (baik aktif maupun sudah soft delete)
        const existingWarehouse = yield prisma.warehouse.findFirst({
            where: { BusinessUnit },
            // tidak usah filter DeletedAt
        });
        if (existingWarehouse) {
            // Jika ada, update DeletedAt=null + update field lain
            const updatedWarehouse = yield prisma.warehouse.update({
                where: { Id: existingWarehouse.Id },
                data: {
                    Name,
                    BusinessUnit,
                    Location,
                    DeletedAt: null,
                },
            });
            res.status(200).json({
                message: "Warehouse already exists. Data has been reactivated/updated.",
                data: updatedWarehouse,
            });
            return;
        }
        // Jika tidak ada, create baru
        const newWarehouse = yield prisma.warehouse.create({
            data: {
                Name,
                BusinessUnit,
                Location,
            },
        });
        res.status(201).json({ message: "Warehouse created successfully.", data: newWarehouse });
    }
    catch (error) {
        console.error("Error creating warehouse:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
exports.createWarehouse = createWarehouse;
// ✅ Read/List all Warehouses
const getWarehouses = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const warehouses = yield prisma.warehouse.findMany({
            where: {
                DeletedAt: null,
            },
            orderBy: {
                CreatedAt: "desc",
            },
        });
        res.status(200).json({ message: "Warehouses fetched successfully", data: warehouses });
    }
    catch (error) {
        console.error("Error fetching warehouses:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
exports.getWarehouses = getWarehouses;
// ✅ Update Warehouse
const updateWarehouse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id } = req.params;
        const { Name, BusinessUnit, Location } = req.body;
        if (!Id) {
            res.status(400).json({ message: "Warehouse Id is required" });
            return;
        }
        if (!BusinessUnit) {
            res.status(400).json({ message: "BusinessUnit is required" });
            return;
        }
        // VALIDATION
        if (!BusinessUnit || typeof BusinessUnit !== "string" || BusinessUnit.length > 10) {
            res.status(400).json({ message: "BusinessUnit is required and must be max 10 characters." });
            return;
        }
        if (Name && (typeof Name !== "string" || Name.length > 50)) {
            res.status(400).json({ message: "Name must be a string and max 50 characters." });
            return;
        }
        if (Location && (typeof Location !== "string" || Location.length > 80)) {
            res.status(400).json({ message: "Location must be a string and max 80 characters." });
            return;
        }
        const updatedWarehouse = yield prisma.warehouse.update({
            where: { Id: Number(Id) },
            data: {
                Name,
                BusinessUnit,
                Location,
            },
        });
        res.status(200).json({ message: "Warehouse updated successfully", data: updatedWarehouse });
    }
    catch (error) {
        console.error("Error updating warehouse:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
exports.updateWarehouse = updateWarehouse;
// ✅ Soft Delete Warehouse dengan Validasi Stock Kosong
const deleteWarehouse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id } = req.params;
        if (!Id) {
            res.status(400).json({ message: "Warehouse Id is required" });
            return;
        }
        const warehouseId = Number(Id);
        // 1. Soft delete warehouse (update DeletedAt)
        yield prisma.warehouse.update({
            where: { Id: warehouseId },
            data: { DeletedAt: new Date() },
        });
        // 2. Hapus semua relasi di DealerWarehouse (HARD DELETE)
        yield prisma.dealerWarehouse.deleteMany({
            where: { WarehouseId: warehouseId }
        });
        // 3. Hapus semua WarehouseStock (bisa soft/hard delete, pilih salah satu)
        // --- HARD DELETE (hapus record)
        yield prisma.warehouseStock.deleteMany({
            where: { WarehouseId: warehouseId }
        });
        // --- SOFT DELETE (hapus secara soft, aktifkan ini jika mau)
        // await prisma.warehouseStock.updateMany({
        //   where: { WarehouseId: warehouseId },
        //   data: { DeletedAt: new Date() }
        // });
        // Tidak menghapus SalesOrderDetail relasi
        res.status(200).json({ message: "Warehouse soft deleted and all related DealerWarehouse & WarehouseStock have been removed." });
    }
    catch (error) {
        console.error("Error deleting warehouse:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});
exports.deleteWarehouse = deleteWarehouse;
