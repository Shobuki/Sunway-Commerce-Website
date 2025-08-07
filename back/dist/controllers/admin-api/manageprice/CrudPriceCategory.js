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
exports.deletePriceCategory = exports.updatePriceCategory = exports.getAllPriceCategories = exports.createPriceCategory = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ProductCategory {
    constructor() {
        this.validatePriceCategoryInput = (input) => {
            if (!input.Name || input.Name.length > 40)
                return 'Nama kategori maksimal 40 karakter';
            return null;
        };
        this.createPriceCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { Name } = req.body;
            const errorMsg = this.validatePriceCategoryInput(req.body);
            if (errorMsg) {
                res.status(400).json({ message: errorMsg });
                return;
            }
            try {
                if (!Name) {
                    res.status(400).json({ message: "Name is required." });
                    return;
                }
                const newPriceCategory = yield prisma.priceCategory.create({
                    data: {
                        Name,
                    },
                });
                res.status(201).json({ message: "PriceCategory created successfully.", data: newPriceCategory });
            }
            catch (error) {
                console.error("Error creating PriceCategory:", error);
                next(error);
            }
        });
        this.getAllPriceCategories = (_req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const priceCategories = yield prisma.priceCategory.findMany({
                    include: {
                        Price: true, // Include related prices
                        Dealer: true, // Include related dealers
                    },
                });
                res.status(200).json({ data: priceCategories });
            }
            catch (error) {
                console.error("Error fetching PriceCategories:", error);
                next(error);
            }
        });
        this.updatePriceCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { Id } = req.params;
            const { Name } = req.body;
            try {
                if (!Name) {
                    res.status(400).json({ message: "Name is required." });
                    return;
                }
                const updatedPriceCategory = yield prisma.priceCategory.update({
                    where: { Id: parseInt(Id, 10) },
                    data: { Name },
                });
                res.status(200).json({ message: "PriceCategory updated successfully.", data: updatedPriceCategory });
            }
            catch (error) {
                console.error("Error updating PriceCategory:", error);
                next(error);
            }
        });
        this.deletePriceCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { Id } = req.params;
            try {
                // Check if PriceCategory is linked to any Price or Dealer
                const relatedPrices = yield prisma.price.findMany({
                    where: { PriceCategoryId: parseInt(Id, 10) },
                });
                const relatedDealers = yield prisma.dealer.findMany({
                    where: { PriceCategoryId: parseInt(Id, 10) },
                });
                if (relatedPrices.length > 0 || relatedDealers.length > 0) {
                    res.status(400).json({
                        message: "Cannot delete PriceCategory with related Prices or Dealers.",
                    });
                    return;
                }
                yield prisma.priceCategory.delete({
                    where: { Id: parseInt(Id, 10) },
                });
                res.status(200).json({ message: "PriceCategory deleted successfully." });
            }
            catch (error) {
                console.error("Error deleting PriceCategory:", error);
                next(error);
            }
        });
    }
}
const productCategoryController = new ProductCategory();
exports.createPriceCategory = productCategoryController.createPriceCategory;
exports.getAllPriceCategories = productCategoryController.getAllPriceCategories;
exports.updatePriceCategory = productCategoryController.updatePriceCategory;
exports.deletePriceCategory = productCategoryController.deletePriceCategory;
