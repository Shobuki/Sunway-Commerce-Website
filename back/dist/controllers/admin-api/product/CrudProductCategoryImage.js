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
exports.deleteProductCategoryImage = exports.getProductCategoryImages = exports.uploadProductCategoryImage = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const multiparty_1 = __importDefault(require("multiparty"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const IMAGE_DIRECTORY = path_1.default.join(process.cwd(), "public", "admin", "images", "product", "productcategoryimage");
// Konfigurasi multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGE_DIRECTORY);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `category_${Date.now()}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
if (!fs_1.default.existsSync(IMAGE_DIRECTORY)) {
    fs_1.default.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
    console.log("Image directory created:", IMAGE_DIRECTORY);
}
class ProductCategoryImage {
    constructor() {
        this.uploadProductCategoryImage = (req, res) => {
            const form = new multiparty_1.default.Form();
            form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (err) {
                    console.error("Error parsing form:", err);
                    res.status(500).json({ message: "Error parsing form data." });
                    return;
                }
                const ProductCategoryId = (_a = fields.ProductCategoryId) === null || _a === void 0 ? void 0 : _a[0];
                if (!ProductCategoryId || isNaN(Number(ProductCategoryId))) {
                    res.status(400).json({ message: "Invalid Product Category ID." });
                    return;
                }
                const categoryIdNumber = parseInt(ProductCategoryId, 10);
                const categoryExists = yield prisma.productCategory.findUnique({
                    where: { Id: categoryIdNumber, DeletedAt: null },
                });
                if (!categoryExists) {
                    res.status(404).json({ message: "Product category not found." });
                    return;
                }
                if (!files.image || files.image.length === 0) {
                    res.status(400).json({ message: "No file uploaded." });
                    return;
                }
                const uploadedFiles = [];
                for (const file of files.image) {
                    const originalFileName = file.originalFilename;
                    const fileExtension = path_1.default.extname(originalFileName);
                    const fileName = `category_${categoryIdNumber}_${Date.now()}${fileExtension}`;
                    const filePath = path_1.default.join(IMAGE_DIRECTORY, fileName);
                    try {
                        const tempPath = file.path;
                        if (!fs_1.default.existsSync(tempPath)) {
                            console.error("Temp file not found:", tempPath);
                            res.status(500).json({ message: "Temporary file missing." });
                            return;
                        }
                        fs_1.default.renameSync(tempPath, filePath);
                        const newCategoryImage = yield prisma.productCategoryImage.create({
                            data: {
                                ProductCategoryId: categoryIdNumber,
                                Image: fileName,
                            },
                        });
                        uploadedFiles.push(newCategoryImage);
                    }
                    catch (error) {
                        console.error("Error saving image file:", error);
                        res.status(500).json({ message: "Error saving image file." });
                        return;
                    }
                }
                res.status(201).json({
                    message: "Product category images uploaded successfully",
                    data: uploadedFiles,
                });
            }));
        };
        this.getProductCategoryImages = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.params;
                if (!Id || isNaN(Number(Id))) {
                    res.status(400).json({ error: "Invalid Product Category ID" });
                    return;
                }
                const categoryIdNumber = parseInt(Id, 10);
                const images = yield prisma.productCategoryImage.findMany({
                    where: {
                        ProductCategoryId: categoryIdNumber,
                        DeletedAt: null,
                    },
                    select: {
                        Id: true,
                        Image: true,
                        CreatedAt: true,
                    },
                });
                if (images.length === 0) {
                    res.status(404).json({ message: "No images found for this category." });
                    return;
                }
                const imagesData = images.map((img) => ({
                    Id: img.Id,
                    ImageUrl: `/images/product/productcategoryimage/${img.Image}`,
                    CreatedAt: img.CreatedAt,
                }));
                res.status(200).json({ data: imagesData });
            }
            catch (error) {
                console.error("Error fetching images:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
        this.deleteProductCategoryImage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.params;
                if (!Id || isNaN(Number(Id))) {
                    res.status(400).json({ error: "Invalid Image ID" });
                    return;
                }
                const imageId = parseInt(Id, 10);
                const imageRecord = yield prisma.productCategoryImage.findUnique({
                    where: { Id: imageId },
                });
                if (!imageRecord || !imageRecord.Image) {
                    res.status(404).json({ message: "Image not found or missing in database." });
                    return;
                }
                yield prisma.productCategoryImage.update({
                    where: { Id: imageId },
                    data: { DeletedAt: new Date() },
                });
                res.status(200).json({ message: "Product category image soft deleted successfully." });
            }
            catch (error) {
                console.error("Error deleting image:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
}
const productCategoryImageController = new ProductCategoryImage();
exports.uploadProductCategoryImage = productCategoryImageController.uploadProductCategoryImage;
exports.getProductCategoryImages = productCategoryImageController.getProductCategoryImages;
exports.deleteProductCategoryImage = productCategoryImageController.deleteProductCategoryImage;
exports.default = {
    uploadProductCategoryImage: exports.uploadProductCategoryImage,
    getProductCategoryImages: exports.getProductCategoryImages,
    deleteProductCategoryImage: exports.deleteProductCategoryImage,
};
