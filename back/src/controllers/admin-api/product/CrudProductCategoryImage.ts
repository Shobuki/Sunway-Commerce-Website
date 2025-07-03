import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import multiparty from "multiparty";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const IMAGE_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "admin",
  "images",
  "product",
  "productcategoryimage"
);

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGE_DIRECTORY);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `category_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

if (!fs.existsSync(IMAGE_DIRECTORY)) {
  fs.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
  console.log("Image directory created:", IMAGE_DIRECTORY);
}

class ProductCategoryImage {
  uploadProductCategoryImage = (req: Request, res: Response): void => {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        res.status(500).json({ message: "Error parsing form data." });
        return;
      }

      const ProductCategoryId = fields.ProductCategoryId?.[0];

      if (!ProductCategoryId || isNaN(Number(ProductCategoryId))) {
        res.status(400).json({ message: "Invalid Product Category ID." });
        return;
      }

      const categoryIdNumber = parseInt(ProductCategoryId, 10);

      const categoryExists = await prisma.productCategory.findUnique({
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
        const fileExtension = path.extname(originalFileName);
        const fileName = `category_${categoryIdNumber}_${Date.now()}${fileExtension}`;
        const filePath = path.join(IMAGE_DIRECTORY, fileName);

        try {
          const tempPath = file.path;

          if (!fs.existsSync(tempPath)) {
            console.error("Temp file not found:", tempPath);
            res.status(500).json({ message: "Temporary file missing." });
            return;
          }

          fs.renameSync(tempPath, filePath);

          const newCategoryImage = await prisma.productCategoryImage.create({
            data: {
              ProductCategoryId: categoryIdNumber,
              Image: fileName,
            },
          });

          uploadedFiles.push(newCategoryImage);
        } catch (error) {
          console.error("Error saving image file:", error);
          res.status(500).json({ message: "Error saving image file." });
          return;
        }
      }

      res.status(201).json({
        message: "Product category images uploaded successfully",
        data: uploadedFiles,
      });
    });
  };

  getProductCategoryImages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Id } = req.params;

      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ error: "Invalid Product Category ID" });
        return;
      }

      const categoryIdNumber = parseInt(Id, 10);

      const images = await prisma.productCategoryImage.findMany({
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
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  deleteProductCategoryImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Id } = req.params;

      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ error: "Invalid Image ID" });
        return;
      }

      const imageId = parseInt(Id, 10);

      const imageRecord = await prisma.productCategoryImage.findUnique({
        where: { Id: imageId },
      });

      if (!imageRecord || !imageRecord.Image) {
        res.status(404).json({ message: "Image not found or missing in database." });
        return;
      }

      await prisma.productCategoryImage.update({
        where: { Id: imageId },
        data: { DeletedAt: new Date() },
      });

      res.status(200).json({ message: "Product category image soft deleted successfully." });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

const productCategoryImageController = new ProductCategoryImage();

export const uploadProductCategoryImage = productCategoryImageController.uploadProductCategoryImage;
export const getProductCategoryImages = productCategoryImageController.getProductCategoryImages;
export const deleteProductCategoryImage = productCategoryImageController.deleteProductCategoryImage;

export default {
  uploadProductCategoryImage,
  getProductCategoryImages,
  deleteProductCategoryImage,
};
