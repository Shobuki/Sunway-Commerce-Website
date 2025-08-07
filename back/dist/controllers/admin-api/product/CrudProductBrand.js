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
exports.deleteProductBrand = exports.updateProductBrand = exports.getProductBrandById = exports.getAllProductBrands = exports.createProductBrand = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// **Create a Product Brand**
const createProductBrand = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { ProductBrandName, ProductBrandCode } = req.body;
    try {
        const newBrand = yield prisma.productBrand.create({
            data: {
                ProductBrandName,
                ProductBrandCode,
            },
        });
        res.status(201).json({ message: "Product brand created successfully", data: newBrand });
    }
    catch (error) {
        console.error("Error creating product brand:", error);
        next(error);
    }
});
exports.createProductBrand = createProductBrand;
// **Read All Product Brands**
const getAllProductBrands = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brands = yield prisma.productBrand.findMany({
            include: {
                ItemCode: true, // Include related
            },
        });
        res.status(200).json({ data: brands });
    }
    catch (error) {
        console.error("Error fetching product brands:", error);
        next(error);
    }
});
exports.getAllProductBrands = getAllProductBrands;
// **Get Product Brand By ID**
const getProductBrandById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id } = req.params;
        // Konversi Id menjadi angka
        if (!Id || isNaN(Number(Id))) {
            res.status(400).json({ message: "Invalid or missing Id parameter." });
            return;
        }
        const brand = yield prisma.productBrand.findUnique({
            where: {
                Id: Number(Id), // Konversi Id ke tipe Int
            },
            include: {
                ItemCode: true,
            },
        });
        if (!brand) {
            res.status(404).json({ message: "Product brand not found." });
            return;
        }
        res.status(200).json({ data: brand });
    }
    catch (error) {
        console.error("Error fetching product brand by Id:", error);
        next(error); // Forward error ke middleware error handler
    }
});
exports.getProductBrandById = getProductBrandById;
// **Update a Product Brand**
const updateProductBrand = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { ProductBrandName, ProductBrandCode } = req.body;
    try {
        const updatedBrand = yield prisma.productBrand.update({
            where: { Id: parseInt(id, 10) },
            data: {
                ProductBrandName,
                ProductBrandCode,
            },
        });
        res.status(200).json({ message: "Product brand updated successfully", data: updatedBrand });
    }
    catch (error) {
        console.error("Error updating product brand:", error);
        next(error);
    }
});
exports.updateProductBrand = updateProductBrand;
// **Delete a Product Brand**
const deleteProductBrand = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Check for related  records
        const relatedProducts = yield prisma.itemCode.findMany({
            where: { BrandCodeId: parseInt(id, 10) },
        });
        if (relatedProducts.length > 0) {
            res.status(400).json({
                message: "Cannot delete product brand with associated product real records. Please remove the associated records first.",
            });
            return;
        }
        yield prisma.productBrand.delete({
            where: { Id: parseInt(id, 10) },
        });
        res.status(200).json({ message: "Product brand deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting product brand:", error);
        next(error);
    }
});
exports.deleteProductBrand = deleteProductBrand;
// **Export Controllers**
exports.default = {
    createProductBrand: exports.createProductBrand,
    getAllProductBrands: exports.getAllProductBrands,
    getProductBrandById: exports.getProductBrandById,
    updateProductBrand: exports.updateProductBrand,
    deleteProductBrand: exports.deleteProductBrand,
};
