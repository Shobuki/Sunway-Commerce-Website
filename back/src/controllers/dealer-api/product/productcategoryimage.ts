import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// Direktori penyimpanan gambar kategori produk
const IMAGE_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "admin",
  "images",
  "product",
  "productcategoryimage"
);

// Fungsi untuk menampilkan gambar kategori produk berdasarkan ID kategori produk
export const getProductCategoryImagesById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { Id } = req.params;

    // Validasi ID kategori produk
    if (!Id || isNaN(Number(Id))) {
      res.status(400).json({ error: "Invalid Product Category ID" });
      return;
    }

    const categoryIdNumber = parseInt(Id, 10);

    // Mengambil gambar yang terkait kategori produk tertentu dan belum dihapus
    const categoryImages = await prisma.productCategoryImage.findMany({
      where: { ProductCategoryId: categoryIdNumber, DeletedAt: null },
      select: {
        Id: true,
        Image: true,
        CreatedAt: true,
      },
    });

    if (categoryImages.length === 0) {
      res.status(404).json({ message: "No images found for this product category." });
      return;
    }

    // Menyiapkan URL lengkap untuk akses gambar di frontend
    const imagesData = categoryImages.map((image) => ({
      Id: image.Id,
      ImageUrl: `/admin/images/product/productcategoryimage/${image.Image}`,
      CreatedAt: image.CreatedAt,
    }));

    res.status(200).json({ data: imagesData });
  } catch (error) {
    console.error("Error fetching product category images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default {
  getProductCategoryImagesById,
};
