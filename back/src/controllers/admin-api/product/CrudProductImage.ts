import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import multiparty from "multiparty";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Tentukan direktori penyimpanan gambar
const IMAGE_DIRECTORY = path.join(process.cwd(), "public", "admin", "images", "product", "productimage");

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGE_DIRECTORY);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

if (!fs.existsSync(IMAGE_DIRECTORY)) {
  fs.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
  console.log("Image directory created:", IMAGE_DIRECTORY);
}

class ProductImage {
  uploadOrUpdateProductImage = (req: Request, res: Response, next: NextFunction): void => {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ message: "Error parsing form data." });
      }

      const ProductId = fields.ProductId?.[0];

      if (!ProductId || isNaN(Number(ProductId))) {
        return res.status(400).json({ message: "Invalid Product ID." });
      }

      const productIdNumber = parseInt(ProductId, 10);

      // Validasi keberadaan produk
      const productExists = await prisma.product.findUnique({
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
        const fileExtension = path.extname(originalFileName);
        const fileName = `product_${productIdNumber}_${Date.now()}${fileExtension}`;
        const filePath = path.join(IMAGE_DIRECTORY, fileName);

        try {
          const tempPath = file.path;

          if (!fs.existsSync(tempPath)) {
            console.error("Temp file not found:", tempPath);
            return res.status(500).json({ message: "Temporary file missing." });
          }

          fs.renameSync(tempPath, filePath);
          console.log("File successfully moved to:", filePath);

          // Simpan data gambar di database
          const newProductImage = await prisma.productImage.create({
            data: {
              ProductId: productIdNumber,
              Image: fileName,
            },
          });

          uploadedFiles.push(newProductImage);
        } catch (error) {
          console.error("Error processing image upload:", error);
          return res.status(500).json({ message: "Error saving image file." });
        }
      }

      res.status(201).json({ message: "Product images uploaded successfully", data: uploadedFiles });
    });
  };

  getProductImagesByProductId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Id } = req.params;

      // Validasi Product ID
      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ error: "Invalid Product ID" });
        return;
      }

      const productIdNumber = parseInt(Id, 10);

      // Ambil hanya gambar yang belum dihapus (DeletedAt IS NULL)
      const productImages = await prisma.productImage.findMany({
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
    } catch (error) {
      console.error("Error fetching product images:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  deleteProductImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Id } = req.params;

      // Validasi ID
      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ error: "Invalid Image ID" });
        return;
      }

      const imageId = parseInt(Id, 10);

      // Cek apakah gambar ada di database
      const imageRecord = await prisma.productImage.findUnique({
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
      await prisma.productImage.update({
        where: { Id: imageId },
        data: {
          DeletedAt: new Date(),
        },
      });

      console.log(`Soft deleted image record from database with Id: ${imageId}`);
      res.status(200).json({ message: "Product image marked as deleted (soft delete)." });
    } catch (error) {
      console.error("Error marking product image as deleted:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

const productImageController = new ProductImage();

export const uploadOrUpdateProductImage = productImageController.uploadOrUpdateProductImage;
export const getProductImagesByProductId = productImageController.getProductImagesByProductId;
export const deleteProductImage = productImageController.deleteProductImage;

export default {
  uploadOrUpdateProductImage,
  getProductImagesByProductId,
  deleteProductImage,
};
