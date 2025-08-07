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
exports.deleteProductSpecificationFile = exports.downloadProductSpecificationFile = exports.getAllProductSpecificationFiles = exports.getProductSpecificationFile = exports.uploadProductSpecificationFile = void 0;
const client_1 = require("@prisma/client");
const multiparty_1 = __importDefault(require("multiparty"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { cropAndResizePdfNode } = require('../../../utils/pdfCropA4');
const prisma = new client_1.PrismaClient();
const SPEC_DIR = path_1.default.join(process.cwd(), "public", "admin", "images", "product", "productspecification");
if (!fs_1.default.existsSync(SPEC_DIR)) {
    fs_1.default.mkdirSync(SPEC_DIR, { recursive: true });
    console.log("Spec directory created:", SPEC_DIR);
}
class ProductSpecification {
    // ===== UPLOAD satu/lebih file spesifikasi (bisa semua jenis file) =====
    uploadProductSpecificationFile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = new multiparty_1.default.Form();
            form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (err) {
                    res.status(500).json({ message: "Error parsing form data." });
                    return;
                }
                const ProductId = (_a = fields.ProductId) === null || _a === void 0 ? void 0 : _a[0];
                if (!ProductId || isNaN(Number(ProductId))) {
                    res.status(400).json({ message: "Invalid Product ID." });
                    return;
                }
                const productIdNum = parseInt(ProductId, 10);
                // Validasi produk
                const product = yield prisma.product.findUnique({ where: { Id: productIdNum } });
                if (!product) {
                    res.status(404).json({ message: "Product not found." });
                    return;
                }
                // Ambil semua file yg diupload
                const fileField = files.file || [];
                if (!fileField.length) {
                    res.status(400).json({ message: "No file uploaded. Use field name 'file'." });
                    return;
                }
                // 1. Cari semua spesifikasi aktif product ini, hapus file fisik & soft delete database
                const prevSpecs = yield prisma.productSpecificationFile.findMany({
                    where: { ProductId: productIdNum, DeletedAt: null }
                });
                for (const prev of prevSpecs) {
                    const prevPath = path_1.default.join(SPEC_DIR, prev.FileName);
                    if (fs_1.default.existsSync(prevPath)) {
                        try {
                            fs_1.default.unlinkSync(prevPath);
                        }
                        catch (_b) { }
                    }
                    yield prisma.productSpecificationFile.update({
                        where: { Id: prev.Id },
                        data: { DeletedAt: new Date() }
                    });
                }
                // 2. Proses upload file baru (hanya simpan satu file saja)
                const savedFiles = [];
                // Hanya upload 1 file (ambil yang pertama saja, atau sesuai logika)
                const uploadFile = fileField[0];
                if (uploadFile) {
                    const originalFileName = uploadFile.originalFilename;
                    const ext = path_1.default.extname(originalFileName).toLowerCase();
                    const fileName = `productspec_${productIdNum}_${Date.now()}_${Math.round(Math.random() * 100000)}${ext}`;
                    const destPath = path_1.default.join(SPEC_DIR, fileName);
                    if (ext === ".pdf") {
                        // Simpan temp dulu
                        const tmpPath = destPath.replace(ext, "_original.pdf");
                        fs_1.default.renameSync(uploadFile.path, tmpPath);
                        try {
                            yield cropAndResizePdfNode(tmpPath, destPath);
                            if (fs_1.default.existsSync(tmpPath))
                                fs_1.default.unlinkSync(tmpPath);
                        }
                        catch (e) {
                            if (fs_1.default.existsSync(tmpPath))
                                fs_1.default.unlinkSync(tmpPath);
                            res.status(500).json({ message: "PDF crop/resize error", error: (e instanceof Error ? e.message : String(e)) });
                            return;
                        }
                    }
                    else {
                        fs_1.default.renameSync(uploadFile.path, destPath);
                    }
                    const mimeType = uploadFile.headers["content-type"] || "application/octet-stream";
                    const saved = yield prisma.productSpecificationFile.create({
                        data: {
                            ProductId: productIdNum,
                            FileName: fileName,
                            FilePath: `/images/product/productspecification/${fileName}`,
                            MimeType: mimeType,
                        }
                    });
                    savedFiles.push({
                        Id: saved.Id,
                        FileName: saved.FileName,
                        FilePath: saved.FilePath,
                        MimeType: saved.MimeType,
                        UploadedAt: saved.UploadedAt
                    });
                }
                res.status(201).json({
                    message: `Uploaded ${savedFiles.length} specification file(s).`,
                    data: savedFiles
                });
            }));
        });
    }
    // ===== GET semua file spesifikasi aktif per product =====
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
    // ===== GET satu file spesifikasi terbaru per product =====
    getProductSpecificationFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { ProductId } = req.body;
                if (!ProductId || isNaN(Number(ProductId))) {
                    res.status(400).json({ message: "Invalid Product ID" });
                    return;
                }
                const productIdNum = parseInt(ProductId, 10);
                // Ambil file aktif terbaru
                const spec = yield prisma.productSpecificationFile.findFirst({
                    where: { ProductId: productIdNum, DeletedAt: null },
                    orderBy: { UploadedAt: "desc" },
                });
                if (!spec) {
                    res.status(404).json({ message: "No specification file found for this product." });
                    return;
                }
                res.status(200).json({
                    Id: spec.Id,
                    FileName: spec.FileName,
                    FilePath: spec.FilePath,
                    MimeType: spec.MimeType,
                    UploadedAt: spec.UploadedAt
                });
            }
            catch (err) {
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    // ===== Download or Preview (all type: pdf, image, doc, dll, kualitas asli) =====
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
    // ===== DELETE file (soft delete) =====
    deleteProductSpecificationFile(req, res) {
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
                if (fs_1.default.existsSync(fullPath)) {
                    try {
                        fs_1.default.unlinkSync(fullPath);
                    }
                    catch (_a) { }
                }
                yield prisma.productSpecificationFile.update({
                    where: { Id: file.Id },
                    data: { DeletedAt: new Date() }
                });
                res.status(200).json({ message: "Specification file deleted." });
            }
            catch (err) {
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
const productSpecController = new ProductSpecification();
exports.uploadProductSpecificationFile = productSpecController.uploadProductSpecificationFile.bind(productSpecController);
exports.getProductSpecificationFile = productSpecController.getProductSpecificationFile.bind(productSpecController);
exports.getAllProductSpecificationFiles = productSpecController.getAllProductSpecificationFiles.bind(productSpecController);
exports.downloadProductSpecificationFile = productSpecController.downloadProductSpecificationFile.bind(productSpecController);
exports.deleteProductSpecificationFile = productSpecController.deleteProductSpecificationFile.bind(productSpecController);
exports.default = {
    uploadProductSpecificationFile: exports.uploadProductSpecificationFile,
    getProductSpecificationFile: exports.getProductSpecificationFile,
    getAllProductSpecificationFiles: exports.getAllProductSpecificationFiles,
    downloadProductSpecificationFile: exports.downloadProductSpecificationFile,
    deleteProductSpecificationFile: exports.deleteProductSpecificationFile,
};
