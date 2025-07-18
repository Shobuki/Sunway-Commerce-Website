import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import multiparty from "multiparty";
import fs from "fs";
import path from "path";
const { cropAndResizePdfNode } = require('../../../utils/pdfCropA4');


const prisma = new PrismaClient();

const SPEC_DIR = path.join(
  process.cwd(),
  "public",
  "admin",
  "images",
  "product",
  "productspecification"
);

if (!fs.existsSync(SPEC_DIR)) {
  fs.mkdirSync(SPEC_DIR, { recursive: true });
  console.log("Spec directory created:", SPEC_DIR);
}

class ProductSpecification {
  // ===== UPLOAD satu/lebih file spesifikasi (bisa semua jenis file) =====
  async uploadProductSpecificationFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ message: "Error parsing form data." });
        return;
      }

      const ProductId = fields.ProductId?.[0];
      if (!ProductId || isNaN(Number(ProductId))) {
        res.status(400).json({ message: "Invalid Product ID." });
        return;
      }
      const productIdNum = parseInt(ProductId, 10);

      // Validasi produk
      const product = await prisma.product.findUnique({ where: { Id: productIdNum } });
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
      const prevSpecs = await prisma.productSpecificationFile.findMany({
        where: { ProductId: productIdNum, DeletedAt: null }
      });
      for (const prev of prevSpecs) {
        const prevPath = path.join(SPEC_DIR, prev.FileName);
        if (fs.existsSync(prevPath)) {
          try { fs.unlinkSync(prevPath); } catch { }
        }
        await prisma.productSpecificationFile.update({
          where: { Id: prev.Id },
          data: { DeletedAt: new Date() }
        });
      }

      // 2. Proses upload file baru (hanya simpan satu file saja)
      const savedFiles: any[] = [];
      // Hanya upload 1 file (ambil yang pertama saja, atau sesuai logika)
      const uploadFile = fileField[0];
      if (uploadFile) {
        const originalFileName = uploadFile.originalFilename;
        const ext = path.extname(originalFileName).toLowerCase();
        const fileName = `productspec_${productIdNum}_${Date.now()}_${Math.round(Math.random() * 100000)}${ext}`;
        const destPath = path.join(SPEC_DIR, fileName);

        if (ext === ".pdf") {
          // Simpan temp dulu
          const tmpPath = destPath.replace(ext, "_original.pdf");
          fs.renameSync(uploadFile.path, tmpPath);

          try {
            await cropAndResizePdfNode(tmpPath, destPath);
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
          } catch (e) {
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            res.status(500).json({ message: "PDF crop/resize error", error: (e instanceof Error ? e.message : String(e)) });
            return;
          }
        } else {
          fs.renameSync(uploadFile.path, destPath);
        }

        const mimeType = uploadFile.headers["content-type"] || "application/octet-stream";
        const saved = await prisma.productSpecificationFile.create({
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
    });
  }

  // ===== GET semua file spesifikasi aktif per product =====
  async getAllProductSpecificationFiles(req: Request, res: Response): Promise<void> {
    try {
      const { ProductId } = req.body;
      if (!ProductId || isNaN(Number(ProductId))) {
        res.status(400).json({ message: "Invalid Product ID" });
        return;
      }
      const productIdNum = parseInt(ProductId, 10);

      // Semua file yg belum dihapus (DeletedAt: null)
      const specs = await prisma.productSpecificationFile.findMany({
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
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // ===== GET satu file spesifikasi terbaru per product =====
  async getProductSpecificationFile(req: Request, res: Response): Promise<void> {
    try {
      const { ProductId } = req.body;
      if (!ProductId || isNaN(Number(ProductId))) {
        res.status(400).json({ message: "Invalid Product ID" });
        return;
      }
      const productIdNum = parseInt(ProductId, 10);

      // Ambil file aktif terbaru
      const spec = await prisma.productSpecificationFile.findFirst({
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
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // ===== Download or Preview (all type: pdf, image, doc, dll, kualitas asli) =====
  async downloadProductSpecificationFile(req: Request, res: Response): Promise<void> {
    try {
      const { Id } = req.body;
      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ message: "Invalid File ID" });
        return;
      }
      const file = await prisma.productSpecificationFile.findUnique({
        where: { Id: parseInt(Id, 10) },
      });
      if (!file || file.DeletedAt) {
        res.status(404).json({ message: "Specification file not found." });
        return;
      }
      const fullPath = path.join(SPEC_DIR, file.FileName);
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ message: "File not found on server." });
        return;
      }
      res.setHeader("Content-Type", file.MimeType || "application/octet-stream");
      res.setHeader("Content-Disposition", `inline; filename="${file.FileName}"`);
      fs.createReadStream(fullPath).pipe(res);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // ===== DELETE file (soft delete) =====
  async deleteProductSpecificationFile(req: Request, res: Response): Promise<void> {
    try {
      const { Id } = req.body;
      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ message: "Invalid File ID" });
        return;
      }
      const file = await prisma.productSpecificationFile.findUnique({
        where: { Id: parseInt(Id, 10) },
      });
      if (!file || file.DeletedAt) {
        res.status(404).json({ message: "Specification file not found." });
        return;
      }
      const fullPath = path.join(SPEC_DIR, file.FileName);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch { }
      }
      await prisma.productSpecificationFile.update({
        where: { Id: file.Id },
        data: { DeletedAt: new Date() }
      });
      res.status(200).json({ message: "Specification file deleted." });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

const productSpecController = new ProductSpecification();

export const uploadProductSpecificationFile = productSpecController.uploadProductSpecificationFile.bind(productSpecController);
export const getProductSpecificationFile = productSpecController.getProductSpecificationFile.bind(productSpecController);
export const getAllProductSpecificationFiles = productSpecController.getAllProductSpecificationFiles.bind(productSpecController);
export const downloadProductSpecificationFile = productSpecController.downloadProductSpecificationFile.bind(productSpecController);
export const deleteProductSpecificationFile = productSpecController.deleteProductSpecificationFile.bind(productSpecController);

export default {
  uploadProductSpecificationFile,
  getProductSpecificationFile,
  getAllProductSpecificationFiles,
  downloadProductSpecificationFile,
  deleteProductSpecificationFile,
};
