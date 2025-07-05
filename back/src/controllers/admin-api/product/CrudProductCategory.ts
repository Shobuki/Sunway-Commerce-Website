import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ProductCategory {
  upsertProductCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { Id, Name, ParentCategoryId } = req.body;

    if (!Name && !Id && typeof Name !== "string") {
      res.status(400).json({ message: "Name is required for creating a new ProductCategory." });
      return;
    }

    // VALIDATION
    if (Name.length > 40) {
      res.status(400).json({ message: "Name  must be max 40 characters." });
      return;
    }
    if (ParentCategoryId !== undefined && ParentCategoryId !== null && (!Number.isInteger(Number(ParentCategoryId)) || Number(ParentCategoryId) <= 0)) {
      res.status(400).json({ message: "ParentCategoryId must be a valid positive integer or null." });
      return;
    }

    try {
      const data = {
        Name,
        ParentCategoryId: ParentCategoryId ? parseInt(ParentCategoryId, 10) : null,
      };

      const result = Id
        ? await prisma.productCategory.update({
          where: { Id: parseInt(Id, 10) },
          data,
        })
        : await prisma.productCategory.create({ data });

      res.status(Id ? 200 : 201).json({
        message: `ProductCategory ${Id ? 'updated' : 'created'} successfully`,
        data: result,
      });
    } catch (error) {
      console.error(`Error ${Id ? 'updating' : 'creating'} ProductCategory:`, error);
      next(error);
    }
  };

  deleteProductCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { Id } = req.params;

    try {
      const categoryId = parseInt(Id, 10);

      // Cek kategori
      const existingCategory = await prisma.productCategory.findUnique({
        where: { Id: categoryId },
      });

      if (!existingCategory) {
        res.status(404).json({ message: "ProductCategory not found." });
        return;
      }

      // 1. Cek subkategori
      const subCategoryCount = await prisma.productCategory.count({
        where: {
          ParentCategoryId: categoryId,
          DeletedAt: null,
        }
      });

      // 2. Cek produk
      const productCount = await prisma.product.count({
        where: {
          ProductCategory: {
            some: {
              Id: categoryId,
              DeletedAt: null,
            }
          },
          DeletedAt: null,
        }
      });

      if (subCategoryCount > 0 || productCount > 0) {
        res.status(400).json({
          message: "Cannot delete: Category still has subcategories or products attached.",
        });
        return;
      }

      // Soft delete: update deletedAt field
      await prisma.productCategory.update({
        where: { Id: categoryId },
        data: {
          DeletedAt: new Date(),
        },
      });

      res.status(200).json({ message: "ProductCategory soft-deleted successfully" });
    } catch (error) {
      console.error("Error soft-deleting ProductCategory:", error);
      next(error);
    }
  };

  getAllProductCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: {
        DeletedAt: null,
      },
      include: {
        SubCategories: {
          where: {
            DeletedAt: null,
          },
        },
        Products: true,
        ParentCategory: true, // ← Tambahkan ini untuk include parent
      },
    });

    res.status(200).json({ data: categories });
  } catch (error) {
    console.error("Error fetching ProductCategories:", error);
    next(error);
  }
};

  getCategoryWithHierarchy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { Id } = req.params;

    try {
      const categoryId = parseInt(Id, 10);

      if (isNaN(categoryId)) {
        res.status(400).json({ message: "Invalid category ID provided." });
        return;
      }

      const category = await prisma.productCategory.findFirst({
        where: {
          Id: categoryId,
          DeletedAt: null,
        },
        include: {
          SubCategories: {
            where: { DeletedAt: null },
            include: {
              SubCategories: {
                where: { DeletedAt: null },
              },
            },
          },
          Products: true,
        },
      });

      if (!category) {
        res.status(404).json({ message: "Category not found or has been deleted." });
        return;
      }

      res.status(200).json({ data: category });
    } catch (error) {
      console.error("Error fetching category hierarchy:", error);
      next(error);
    }
  };
}

const productCategoryController = new ProductCategory();

export const upsertProductCategory = productCategoryController.upsertProductCategory;
export const deleteProductCategory = productCategoryController.deleteProductCategory;
export const getAllProductCategories = productCategoryController.getAllProductCategories;
export const getCategoryWithHierarchy = productCategoryController.getCategoryWithHierarchy;

export default {
  upsertProductCategory,
  deleteProductCategory,
  getAllProductCategories,
  getCategoryWithHierarchy,
};
