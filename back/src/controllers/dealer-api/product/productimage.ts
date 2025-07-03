import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ambil gambar berdasarkan kategori produk
export const getCategoryImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || isNaN(Number(categoryId))) {
      res.status(400).json({ error: "Invalid category ID." });
      return;
    }

    const category = await prisma.productCategory.findUnique({
      where: { Id: Number(categoryId), DeletedAt: null },
      include: {
        ProductCategoryImage: {
          where: { DeletedAt: null },
          select: {
            Id: true,
            Image: true,
            CreatedAt: true,
          },
        },
        SubCategories: {
          where: { DeletedAt: null },
          select: {
            Id: true,
            Name: true,
            ProductCategoryImage: {
              where: { DeletedAt: null },
              select: {
                Id: true,
                Image: true,
                CreatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      res.status(404).json({ message: "Category not found." });
      return;
    }

    const data = {
      Id: category.Id,
      Name: category.Name,
      Images: category.ProductCategoryImage.map(img => ({
        Id: img.Id,
        ImageUrl: `/images/productcategory/${img.Image}`,
        CreatedAt: img.CreatedAt,
      })),
      SubCategories: category.SubCategories.map(sub => ({
        Id: sub.Id,
        Name: sub.Name,
        Images: sub.ProductCategoryImage.map(img => ({
          Id: img.Id,
          ImageUrl: `/images/productcategory/${img.Image}`,
          CreatedAt: img.CreatedAt,
        })),
      })),
    };

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching category images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
