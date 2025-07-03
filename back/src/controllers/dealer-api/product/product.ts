import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ List Product Categories with Their Products and Children
export const listProductCategoriesWithProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { DeletedAt: null, ParentCategoryId: null }, // hanya root
      select: {
        Id: true,
        Name: true,
        ProductCategoryImage: {
          select: { Image: true },
        },
        Products: {
          where: { DeletedAt: null },
          select: {
            Id: true,
            Name: true,
            ProductImage: {
              select: { Image: true },
            },
          },
        },
        SubCategories: {
          where: { DeletedAt: null },
          select: {
            Id: true,
            Name: true,
            ProductCategoryImage: {
              select: { Image: true },
            },
            Products: {
              where: { DeletedAt: null },
              select: {
                Id: true,
                Name: true,
                ProductImage: {
                  select: { Image: true },
                },
              },
            },
          },
        },
      },
    });

    const formattedData = categories.map((category) => ({
      Id: category.Id,
      Name: category.Name,
      CategoryImage: category.ProductCategoryImage.map((img) => img.Image),
      Products: category.Products.map((product) => ({
        Id: product.Id,
        Name: product.Name,
        ProductImages: product.ProductImage.map((img) => img.Image),
      })),
      Children: category.SubCategories.map((child) => ({
        Id: child.Id,
        Name: child.Name,
        CategoryImage: child.ProductCategoryImage.map((img) => img.Image),
        Products: child.Products.map((product) => ({
          Id: product.Id,
          Name: product.Name,
          ProductImages: product.ProductImage.map((img) => img.Image),
        })),
      })),
    }));

    res.status(200).json({
      message: "Product categories with products and children fetched successfully.",
      data: formattedData,
    });

  } catch (error) {
    console.error("Error fetching product categories and products:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
