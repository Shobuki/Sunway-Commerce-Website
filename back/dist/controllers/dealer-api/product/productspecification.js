"use strict";
// C:\xampp\htdocs\sunway\sunway-stok\back\src\controllers\dealer-api\product\productspecification.ts
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
exports.downloadProductSpecificationFile = exports.getAllProductSpecificationFiles = exports.getLatestProductSpecificationFile = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const SPEC_DIR = path_1.default.join(process.cwd(), "public", "admin", "images", "product", "productspecification");
if (!fs_1.default.existsSync(SPEC_DIR)) {
    fs_1.default.mkdirSync(SPEC_DIR, { recursive: true });
    console.log("Spec directory created:", SPEC_DIR);
}
class ProductSpecification {
    // ===== GET semua file spesifikasi aktif per product (via body) =====
    getAllProductSpecificationFiles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ProductId } = req.body;
                if (!ProductId || isNaN(Number(ProductId))) {
                    res.status(400).json({ message: "Invalid Product ID" });
                    return;
                }
                const productIdNum = parseInt(ProductId, 10);
                // Semua file yg belum dihapus (DeletedAt: null)
                const specs = yield prisma.productSpecificationFile.findMany({
                    where: { ProductId: productIdNum, DeletedAt: null },
                    orderBy: { UploadedAt: "desc" }
                });
                if (!specs.length) {
                    res.status(404).json({ message: "No specification file found for this product." });
                    return;
                }
                res.status(200).json({
                    files: specs.map(spec => ({
                        Id: spec.Id,
                        FileName: spec.FileName,
                        FilePath: spec.FilePath,
                        MimeType: spec.MimeType,
                        UploadedAt: spec.UploadedAt
                    }))
                });
            }
            catch (err) {
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    getLatestProductSpecificationFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ProductId } = req.body;
                if (!ProductId || isNaN(Number(ProductId))) {
                    res.status(400).json({ message: "Invalid Product ID" });
                    return;
                }
                const productIdNum = parseInt(ProductId, 10);
                // Ambil satu file terbaru (DeletedAt: null, UploadedAt terbaru)
                const spec = yield prisma.productSpecificationFile.findFirst({
                    where: { ProductId: productIdNum, DeletedAt: null },
                    orderBy: { UploadedAt: "desc" }
                });
                if (!spec) {
                    res.status(404).json({ message: "No specification file found for this product." });
                    return;
                }
                res.status(200).json({
                    file: {
                        Id: spec.Id,
                        FileName: spec.FileName,
                        FilePath: spec.FilePath,
                        MimeType: spec.MimeType,
                        UploadedAt: spec.UploadedAt
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // ===== DOWNLOAD/Preview file original, semua tipe (via body) =====
    downloadProductSpecificationFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.body;
                if (!Id || isNaN(Number(Id))) {
                    res.status(400).json({ message: "Invalid File ID" });
                    return;
                }
                const file = yield prisma.productSpecificationFile.findUnique({
                    where: { Id: parseInt(Id, 10) },
                });
                if (!file || file.DeletedAt) {
                    res.status(404).json({ message: "Specification file not found." });
                    return;
                }
                const fullPath = path_1.default.join(SPEC_DIR, file.FileName);
                if (!fs_1.default.existsSync(fullPath)) {
                    res.status(404).json({ message: "File not found on server." });
                    return;
                }
                res.setHeader("Content-Type", file.MimeType || "application/octet-stream");
                res.setHeader("Content-Disposition", `inline; filename="${file.FileName}"`);
                fs_1.default.createReadStream(fullPath).pipe(res);
            }
            catch (err) {
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
const dealerProductSpecController = new ProductSpecification();
exports.getLatestProductSpecificationFile = dealerProductSpecController.getLatestProductSpecificationFile.bind(dealerProductSpecController);
exports.getAllProductSpecificationFiles = dealerProductSpecController.getAllProductSpecificationFiles.bind(dealerProductSpecController);
exports.downloadProductSpecificationFile = dealerProductSpecController.downloadProductSpecificationFile.bind(dealerProductSpecController);
exports.default = {
    getLatestProductSpecificationFile: exports.getLatestProductSpecificationFile,
    getAllProductSpecificationFiles: exports.getAllProductSpecificationFiles,
    downloadProductSpecificationFile: exports.downloadProductSpecificationFile,
};
