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
exports.deleteTax = exports.upsertTax = exports.getActiveTax = exports.getAllTax = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class Tax {
    constructor() {
        this.getAllTax = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const taxes = yield prisma.tax.findMany({
                    where: { DeletedAt: null }, // hanya yang belum dihapus
                    orderBy: { CreatedAt: 'desc' },
                });
                res.status(200).json({ message: 'Success', data: taxes });
            }
            catch (error) {
                console.error('Error fetching all tax:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
        this.getActiveTax = (_req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tax = yield prisma.tax.findFirst({
                    where: {
                        IsActive: true,
                        DeletedAt: null,
                    },
                    orderBy: { CreatedAt: 'desc' },
                });
                if (!tax) {
                    res.status(404).json({ message: 'No active tax found' });
                    return;
                }
                res.status(200).json({ message: 'Success', data: tax });
            }
            catch (error) {
                console.error('Error fetching active tax:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
        this.upsertTax = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Name, Percentage } = req.body;
                // Batasi karakter Name maksimal 40 karakter
                if (!Name || Name.length > 50) {
                    res.status(400).json({ message: "Name maksimal 50 karakter" });
                    return;
                }
                const parsedPercentage = parseFloat(Percentage);
                if (parsedPercentage < 0 || parsedPercentage > 100) {
                    res.status(400).json({ message: 'Percentage must be between 0 and 100' });
                    return;
                }
                // Tandai semua tax sebelumnya tidak aktif
                yield prisma.tax.updateMany({
                    where: { IsActive: true, DeletedAt: null },
                    data: { IsActive: false },
                });
                // Buat tax baru sebagai aktif
                const newTax = yield prisma.tax.create({
                    data: {
                        Name,
                        Percentage: parsedPercentage,
                        IsActive: true,
                    },
                });
                res.status(201).json({ message: 'Tax successfully set as active', data: newTax });
            }
            catch (error) {
                console.error('Error upserting tax:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
        this.deleteTax = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                const deleted = yield prisma.tax.update({
                    where: { Id: Number(id) },
                    data: {
                        DeletedAt: new Date(),
                        IsActive: false,
                    },
                });
                res.status(200).json({ message: 'Tax soft deleted', data: deleted });
            }
            catch (error) {
                console.error('Error deleting tax:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
const taxController = new Tax();
exports.getAllTax = taxController.getAllTax;
exports.getActiveTax = taxController.getActiveTax;
exports.upsertTax = taxController.upsertTax;
exports.deleteTax = taxController.deleteTax;
