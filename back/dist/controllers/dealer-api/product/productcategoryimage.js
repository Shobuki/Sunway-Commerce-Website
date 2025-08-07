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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductCategoryImagesById = void 0;
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Direktori penyimpanan gambar kategori produk
const IMAGE_DIRECTORY = path_1.default.join(process.cwd(), "public", "admin", "images", "product", "productcategoryimage");
// Fungsi untuk menampilkan gambar kategori produk berdasarkan ID kategori produk
const getProductCategoryImagesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id } = req.params;
        // Validasi ID kategori produk
        if (!Id || isNaN(Number(Id))) {
            res.status(400).json({ error: "Invalid Product Category ID" });
            return;
        }
        const categoryIdNumber = parseInt(Id, 10);
        // Mengambil gambar yang terkait kategori produk tertentu dan belum dihapus
        const categoryImages = yield prisma.productCategoryImage.findMany({
            where: { ProductCategoryId: categoryIdNumber, DeletedAt: null },
            select: {
                Id: true,
                Image: true,
                CreatedAt: true,
            },
        });
        if (categoryImages.length === 0) {
            res.status(404).json({ message: "No images found for this product category." });
            return;
        }
        // Menyiapkan URL lengkap untuk akses gambar di frontend
        const imagesData = categoryImages.map((image) => ({
            Id: image.Id,
            ImageUrl: `/admin/images/product/productcategoryimage/${image.Image}`,
            CreatedAt: image.CreatedAt,
        }));
        res.status(200).json({ data: imagesData });
    }
    catch (error) {
        console.error("Error fetching product category images:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getProductCategoryImagesById = getProductCategoryImagesById;
exports.default = {
    getProductCategoryImagesById: exports.getProductCategoryImagesById,
};
