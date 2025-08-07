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
exports.deleteItemCodeImage = exports.getItemCodeImagesByItemCodeId = exports.uploadOrUpdateItemCodeImage = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const multiparty_1 = __importDefault(require("multiparty"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Tentukan direktori penyimpanan gambar
const IMAGE_DIRECTORY = path_1.default.join(process.cwd(), "public", "admin", "images", "product", "itemcodeimage");
const form = new multiparty_1.default.Form();
// Konfigurasi multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGE_DIRECTORY);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `itemcode_${Date.now()}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// Buat folder jika belum ada
if (!fs_1.default.existsSync(IMAGE_DIRECTORY)) {
    fs_1.default.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
    console.log("Image directory created:", IMAGE_DIRECTORY);
}
// ✅ **Upload atau Perbarui Gambar ItemCode**
const uploadOrUpdateItemCodeImage = (req, res, next) => {
    const form = new multiparty_1.default.Form();
    form.parse(req, (err, fields, files) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (err) {
            console.error("Error parsing form:", err);
            return res.status(500).json({ message: "Error parsing form data." });
        }
        const ItemCodeId = (_a = fields.ItemCodeId) === null || _a === void 0 ? void 0 : _a[0];
        if (!ItemCodeId || isNaN(Number(ItemCodeId))) {
            return res.status(400).json({ message: "Invalid Item Code ID." });
        }
        const itemCodeIdNumber = parseInt(ItemCodeId, 10);
        // Validasi keberadaan ItemCode
        const itemCodeExists = yield prisma.itemCode.findUnique({
            where: { Id: itemCodeIdNumber },
        });
        if (!itemCodeExists) {
            return res.status(404).json({ message: "Item Code not found." });
        }
        // Validasi keberadaan file
        if (!files.image || files.image.length === 0) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        const uploadedFiles = [];
        for (const file of files.image) {
            const originalFileName = file.originalFilename;
            const fileExtension = path_1.default.extname(originalFileName);
            const fileName = `itemcode_${itemCodeIdNumber}_${Date.now()}${fileExtension}`;
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
                const newItemCodeImage = yield prisma.itemCodeImage.create({
                    data: {
                        ItemCodeId: itemCodeIdNumber,
                        Image: fileName,
                    },
                });
                uploadedFiles.push(newItemCodeImage);
            }
            catch (error) {
                console.error("Error processing image upload:", error);
                return res.status(500).json({ message: "Error saving image file." });
            }
        }
        res.status(201).json({ message: "Item Code images uploaded successfully", data: uploadedFiles });
    }));
};
exports.uploadOrUpdateItemCodeImage = uploadOrUpdateItemCodeImage;
// ✅ **Dapatkan Gambar Berdasarkan Item Code ID**
const getItemCodeImagesByItemCodeId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id } = req.params;
        // Validasi ItemCode ID
        if (!Id || isNaN(Number(Id))) {
            res.status(400).json({ error: "Invalid Item Code ID" });
            return;
        }
        const itemCodeIdNumber = parseInt(Id, 10);
        // Ambil hanya gambar yang belum dihapus (DeletedAt IS NULL)
        const itemCodeImages = yield prisma.itemCodeImage.findMany({
            where: { ItemCodeId: itemCodeIdNumber, DeletedAt: null },
            select: {
                Id: true,
                Image: true,
                CreatedAt: true,
            },
        });
        if (itemCodeImages.length === 0) {
            res.status(404).json({ message: "No images found for this Item Code." });
            return;
        }
        // Kembalikan data dengan URL gambar yang bisa diakses
        const imagesData = itemCodeImages.map((image) => ({
            Id: image.Id,
            ImageUrl: `images/product/itemcode/itemcodeimage/${image.Image}`,
            CreatedAt: image.CreatedAt,
        }));
        res.status(200).json({ data: imagesData });
    }
    catch (error) {
        console.error("Error fetching Item Code images:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getItemCodeImagesByItemCodeId = getItemCodeImagesByItemCodeId;
// ✅ **Soft Delete Gambar Item Code (Update DeletedAt)**
const deleteItemCodeImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id } = req.params; // Gunakan 'Id' sebagai parameter
        // Validasi ID
        if (!Id || isNaN(Number(Id))) {
            res.status(400).json({ error: "Invalid Image ID" });
            return;
        }
        const imageId = parseInt(Id, 10);
        // Cek apakah gambar ada di database
        const imageRecord = yield prisma.itemCodeImage.findUnique({
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
        // Soft delete dengan mengisi DeletedAt
        yield prisma.itemCodeImage.update({
            where: { Id: imageId },
            data: {
                DeletedAt: new Date(), // Menandai gambar sebagai terhapus
            },
        });
        console.log(`Soft deleted image record from database with Id: ${imageId}`);
        res.status(200).json({ message: "Item Code image marked as deleted (soft delete)." });
    }
    catch (error) {
        console.error("Error marking Item Code image as deleted:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.deleteItemCodeImage = deleteItemCodeImage;
// ✅ **Export Semua Fungsi**
exports.default = {
    uploadOrUpdateItemCodeImage: exports.uploadOrUpdateItemCodeImage,
    getItemCodeImagesByItemCodeId: exports.getItemCodeImagesByItemCodeId,
    deleteItemCodeImage: exports.deleteItemCodeImage,
};
