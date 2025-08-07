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
exports.getCategoryImages = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Ambil gambar berdasarkan kategori produk
const getCategoryImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        if (!categoryId || isNaN(Number(categoryId))) {
            res.status(400).json({ error: "Invalid category ID." });
            return;
        }
        const category = yield prisma.productCategory.findUnique({
            where: { Id: Number(categoryId), DeletedAt: null },
            include: {
                ProductCategoryImage: {
                    where: { DeletedAt: null },
                    select: {
                        Id: true,
                        Image: true,
                        CreatedAt: true,
                    },
                },
                SubCategories: {
                    where: { DeletedAt: null },
                    select: {
                        Id: true,
                        Name: true,
                        ProductCategoryImage: {
                            where: { DeletedAt: null },
                            select: {
                                Id: true,
                                Image: true,
                                CreatedAt: true,
                            },
                        },
                    },
                },
            },
        });
        if (!category) {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        const data = {
            Id: category.Id,
            Name: category.Name,
            Images: category.ProductCategoryImage.map(img => ({
                Id: img.Id,
                ImageUrl: `/images/productcategory/${img.Image}`,
                CreatedAt: img.CreatedAt,
            })),
            SubCategories: category.SubCategories.map(sub => ({
                Id: sub.Id,
                Name: sub.Name,
                Images: sub.ProductCategoryImage.map(img => ({
                    Id: img.Id,
                    ImageUrl: `/images/productcategory/${img.Image}`,
                    CreatedAt: img.CreatedAt,
                })),
            })),
        };
        res.status(200).json({ data });
    }
    catch (error) {
        console.error("Error fetching category images:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getCategoryImages = getCategoryImages;
