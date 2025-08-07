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
exports.deleteProductImage = exports.getProductImagesByProductId = exports.uploadOrUpdateProductImage = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const multiparty_1 = __importDefault(require("multiparty"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Tentukan direktori penyimpanan gambar
const IMAGE_DIRECTORY = path_1.default.join(process.cwd(), "public", "admin", "images", "product", "productimage");
// Konfigurasi multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGE_DIRECTORY);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
if (!fs_1.default.existsSync(IMAGE_DIRECTORY)) {
    fs_1.default.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
    console.log("Image directory created:", IMAGE_DIRECTORY);
}
class ProductImage {
    constructor() {
        this.uploadOrUpdateProductImage = (req, res, next) => {
            const form = new multiparty_1.default.Form();
            form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (err) {
                    console.error("Error parsing form:", err);
                    return res.status(500).json({ message: "Error parsing form data." });
                }
                const ProductId = (_a = fields.ProductId) === null || _a === void 0 ? void 0 : _a[0];
                if (!ProductId || isNaN(Number(ProductId))) {
                    return res.status(400).json({ message: "Invalid Product ID." });
                }
                const productIdNumber = parseInt(ProductId, 10);
                // Validasi keberadaan produk
                const productExists = yield prisma.product.findUnique({
                    where: { Id: productIdNumber },
                });
                if (!productExists) {
                    return res.status(404).json({ message: "Product not found." });
                }
                // Validasi keberadaan file
                if (!files.image || files.image.length === 0) {
                    return res.status(400).json({ message: "No file uploaded." });
                }
                const uploadedFiles = [];
                for (const file of files.image) {
                    const originalFileName = file.originalFilename;
                    const fileExtension = path_1.default.extname(originalFileName);
                    const fileName = `product_${productIdNumber}_${Date.now()}${fileExtension}`;
                    const filePath = path_1.default.join(IMAGE_DIRECTORY, fileName);
                    try {
                        const tempPath = file.path;
                        if (!fs_1.default.existsSync(tempPath)) {
                            console.error("Temp file not found:", tempPath);
                            return res.status(500).json({ message: "Temporary file missing." });
                        }
                        fs_1.default.renameSync(tempPath, filePath);
                        console.log("File successfully moved to:", filePath);
                        // Simpan data gambar di database
                        const newProductImage = yield prisma.productImage.create({
                            data: {
                                ProductId: productIdNumber,
                                Image: fileName,
                            },
                        });
                        uploadedFiles.push(newProductImage);
                    }
                    catch (error) {
                        console.error("Error processing image upload:", error);
                        return res.status(500).json({ message: "Error saving image file." });
                    }
                }
                res.status(201).json({ message: "Product images uploaded successfully", data: uploadedFiles });
            }));
        };
        this.getProductImagesByProductId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.params;
                // Validasi Product ID
                if (!Id || isNaN(Number(Id))) {
                    res.status(400).json({ error: "Invalid Product ID" });
                    return;
                }
                const productIdNumber = parseInt(Id, 10);
                // Ambil hanya gambar yang belum dihapus (DeletedAt IS NULL)
                const productImages = yield prisma.productImage.findMany({
                    where: { ProductId: productIdNumber, DeletedAt: null },
                    select: {
                        Id: true,
                        Image: true,
                        CreatedAt: true,
                    },
                });
                if (productImages.length === 0) {
                    res.status(404).json({ message: "No images found for this product." });
                    return;
                }
                // Kembalikan data dengan URL gambar yang bisa diakses
                const imagesData = productImages.map((image) => ({
                    Id: image.Id,
                    ImageUrl: `/images/product/productimage/${image.Image}`,
                    CreatedAt: image.CreatedAt,
                }));
                res.status(200).json({ data: imagesData });
            }
            catch (error) {
                console.error("Error fetching product images:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
        this.deleteProductImage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.params;
                // Validasi ID
                if (!Id || isNaN(Number(Id))) {
                    res.status(400).json({ error: "Invalid Image ID" });
                    return;
                }
                const imageId = parseInt(Id, 10);
                // Cek apakah gambar ada di database
                const imageRecord = yield prisma.productImage.findUnique({
                    where: { Id: imageId },
                });
                if (!imageRecord) {
                    res.status(404).json({ message: "Image not found." });
                    return;
                }
                if (!imageRecord.Image) {
                    res.status(400).json({ message: "Image path is missing in database." });
                    return;
                }
                // === Hapus file fisik dari komputer ===
                const imagePath = path_1.default.join(IMAGE_DIRECTORY, imageRecord.Image);
                if (fs_1.default.existsSync(imagePath)) {
                    try {
                        fs_1.default.unlinkSync(imagePath); // SINKRON agar langsung hilang, atau pakai unlinkAsync
                        console.log(`Deleted image file from disk: ${imagePath}`);
                    }
                    catch (fileError) {
                        // Optional: Catat error, lanjutkan proses soft delete
                        console.error(`Failed to delete image file: ${imagePath}`, fileError);
                    }
                }
                // Soft delete dengan mengisi DeletedAt
                yield prisma.productImage.update({
                    where: { Id: imageId },
                    data: {
                        DeletedAt: new Date(),
                    },
                });
                console.log(`Soft deleted image record from database with Id: ${imageId}`);
                res.status(200).json({ message: "Product image deleted successfully." });
            }
            catch (error) {
                console.error("Error deleting product image:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
}
const productImageController = new ProductImage();
exports.uploadOrUpdateProductImage = productImageController.uploadOrUpdateProductImage;
exports.getProductImagesByProductId = productImageController.getProductImagesByProductId;
exports.deleteProductImage = productImageController.deleteProductImage;
exports.default = {
    uploadOrUpdateProductImage: exports.uploadOrUpdateProductImage,
    getProductImagesByProductId: exports.getProductImagesByProductId,
    deleteProductImage: exports.deleteProductImage,
};
