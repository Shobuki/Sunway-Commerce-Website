// C:\xampp\htdocs\sunway\sunway-stok\back\src\controllers\dealer-api\product\productspecification.ts

import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

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
  // ===== GET semua file spesifikasi aktif per product (via body) =====
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

  async getLatestProductSpecificationFile(req: Request, res: Response): Promise<void> {
  try {
    const { ProductId } = req.body;
    if (!ProductId || isNaN(Number(ProductId))) {
      res.status(400).json({ message: "Invalid Product ID" });
      return;
    }
    const productIdNum = parseInt(ProductId, 10);

    // Ambil satu file terbaru (DeletedAt: null, UploadedAt terbaru)
    const spec = await prisma.productSpecificationFile.findFirst({
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
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}


  // ===== DOWNLOAD/Preview file original, semua tipe (via body) =====
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
}

const dealerProductSpecController = new ProductSpecification();

export const getLatestProductSpecificationFile = dealerProductSpecController.getLatestProductSpecificationFile.bind(dealerProductSpecController);
export const getAllProductSpecificationFiles = dealerProductSpecController.getAllProductSpecificationFiles.bind(dealerProductSpecController);
export const downloadProductSpecificationFile = dealerProductSpecController.downloadProductSpecificationFile.bind(dealerProductSpecController);

export default {
  getLatestProductSpecificationFile,
  getAllProductSpecificationFiles,
  downloadProductSpecificationFile,
};
