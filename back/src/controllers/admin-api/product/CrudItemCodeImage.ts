import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import multiparty from "multiparty";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Tentukan direktori penyimpanan gambar
const IMAGE_DIRECTORY = path.join(process.cwd(), "public", "admin", "images", "product", "itemcodeimage");
const form = new multiparty.Form();

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGE_DIRECTORY);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `itemcode_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Buat folder jika belum ada
if (!fs.existsSync(IMAGE_DIRECTORY)) {
  fs.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
  console.log("Image directory created:", IMAGE_DIRECTORY);
}

// ✅ **Upload atau Perbarui Gambar ItemCode**
export const uploadOrUpdateItemCodeImage = (req: Request, res: Response, next: NextFunction): void => {
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ message: "Error parsing form data." });
    }

    const ItemCodeId = fields.ItemCodeId?.[0];

    if (!ItemCodeId || isNaN(Number(ItemCodeId))) {
      return res.status(400).json({ message: "Invalid Item Code ID." });
    }

    const itemCodeIdNumber = parseInt(ItemCodeId, 10);

    // Validasi keberadaan ItemCode
    const itemCodeExists = await prisma.itemCode.findUnique({
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
      const fileExtension = path.extname(originalFileName);
      const fileName = `itemcode_${itemCodeIdNumber}_${Date.now()}${fileExtension}`;
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
        const newItemCodeImage = await prisma.itemCodeImage.create({
          data: {
            ItemCodeId: itemCodeIdNumber,
            Image: fileName,
          },
        });

        uploadedFiles.push(newItemCodeImage);
      } catch (error) {
        console.error("Error processing image upload:", error);
        return res.status(500).json({ message: "Error saving image file." });
      }
    }

    res.status(201).json({ message: "Item Code images uploaded successfully", data: uploadedFiles });
  });
};

// ✅ **Dapatkan Gambar Berdasarkan Item Code ID**
export const getItemCodeImagesByItemCodeId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Id } = req.params;

    // Validasi ItemCode ID
    if (!Id || isNaN(Number(Id))) {
      res.status(400).json({ error: "Invalid Item Code ID" });
      return;
    }

    const itemCodeIdNumber = parseInt(Id, 10);

    // Ambil hanya gambar yang belum dihapus (DeletedAt IS NULL)
    const itemCodeImages = await prisma.itemCodeImage.findMany({
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
  } catch (error) {
    console.error("Error fetching Item Code images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ **Soft Delete Gambar Item Code (Update DeletedAt)**
export const deleteItemCodeImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Id } = req.params; // Gunakan 'Id' sebagai parameter

    // Validasi ID
    if (!Id || isNaN(Number(Id))) {
      res.status(400).json({ error: "Invalid Image ID" });
      return;
    }

    const imageId = parseInt(Id, 10);

    // Cek apakah gambar ada di database
    const imageRecord = await prisma.itemCodeImage.findUnique({
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
    await prisma.itemCodeImage.update({
      where: { Id: imageId },
      data: {
        DeletedAt: new Date(), // Menandai gambar sebagai terhapus
      },
    });

    console.log(`Soft deleted image record from database with Id: ${imageId}`);
    res.status(200).json({ message: "Item Code image marked as deleted (soft delete)." });
  } catch (error) {
    console.error("Error marking Item Code image as deleted:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ **Export Semua Fungsi**
export default {
  uploadOrUpdateItemCodeImage,
  getItemCodeImagesByItemCodeId,
  deleteItemCodeImage,
};
