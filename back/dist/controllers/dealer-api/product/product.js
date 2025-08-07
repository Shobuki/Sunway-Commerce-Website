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
exports.listProductCategoriesWithProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ List Product Categories with Their Products and Children
const listProductCategoriesWithProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.productCategory.findMany({
            where: { DeletedAt: null, ParentCategoryId: null }, // hanya root
            select: {
                Id: true,
                Name: true,
                ProductCategoryImage: {
                    select: { Image: true },
                },
                Products: {
                    where: { DeletedAt: null },
                    select: {
                        Id: true,
                        Name: true,
                        ProductImage: {
                            select: { Image: true },
                        },
                    },
                },
                SubCategories: {
                    where: { DeletedAt: null },
                    select: {
                        Id: true,
                        Name: true,
                        ProductCategoryImage: {
                            select: { Image: true },
                        },
                        Products: {
                            where: { DeletedAt: null },
                            select: {
                                Id: true,
                                Name: true,
                                ProductImage: {
                                    select: { Image: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        const formattedData = categories.map((category) => ({
            Id: category.Id,
            Name: category.Name,
            CategoryImage: category.ProductCategoryImage.map((img) => img.Image),
            Products: category.Products.map((product) => ({
                Id: product.Id,
                Name: product.Name,
                ProductImages: product.ProductImage.map((img) => img.Image),
            })),
            Children: category.SubCategories.map((child) => ({
                Id: child.Id,
                Name: child.Name,
                CategoryImage: child.ProductCategoryImage.map((img) => img.Image),
                Products: child.Products.map((product) => ({
                    Id: product.Id,
                    Name: product.Name,
                    ProductImages: product.ProductImage.map((img) => img.Image),
                })),
            })),
        }));
        res.status(200).json({
            message: "Product categories with products and children fetched successfully.",
            data: formattedData,
        });
    }
    catch (error) {
        console.error("Error fetching product categories and products:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
});
exports.listProductCategoriesWithProducts = listProductCategoriesWithProducts;
