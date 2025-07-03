import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class Product {
  getProductCategoriesWithProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1 } = req.query;
      const limit = 20;
      const offset = (Number(page) - 1) * limit;

      const categories = await prisma.productCategory.findMany({
        where: { DeletedAt: null, ParentCategoryId: null },
        include: {
          Products: {
            where: { DeletedAt: null },
            include: {
              ProductImage: true,
              PartNumber: true,
            },
            orderBy: { CreatedAt: "desc" },
          },
          SubCategories: {
            where: { DeletedAt: null },
            include: {
              Products: {
                where: { DeletedAt: null },
                include: {
                  ProductImage: true,
                  PartNumber: true,
                },
                orderBy: { CreatedAt: "desc" },
              },
              SubCategories: {
                where: { DeletedAt: null },
                include: {
                  Products: {
                    where: { DeletedAt: null },
                    include: {
                      ProductImage: true,
                      PartNumber: true,
                    },
                    orderBy: { CreatedAt: "desc" },
                  },
                },
              },
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { CreatedAt: "desc" },
      });

      const totalCategories = await prisma.productCategory.count({
        where: { DeletedAt: null, ParentCategoryId: null },
      });

      res.status(200).json({
        data: categories,
        total: totalCategories,
        totalPages: Math.ceil(totalCategories / limit),
        currentPage: Number(page),
      });
    } catch (error) {
      console.error("Error fetching categories with products:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({ message: "Invalid Category ID." });
        return;
      }

      const products = await prisma.product.findMany({
        where: {
          ProductCategory: { some: { Id: parseInt(id, 10) } },
          DeletedAt: null,
        },
        include: {
          ProductImage: true,
          PartNumber: true,
        },
        orderBy: { CreatedAt: "desc" },
      });

      res.status(200).json({
        data: products,
        total: products.length,
      });
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, search = "", sort = "asc" } = req.query;
      const limit = 20;
      const offset = (Number(page) - 1) * limit;

      const products = await prisma.product.findMany({
        where: {
          DeletedAt: null,
          Name: { contains: String(search), mode: "insensitive" },
        },
        include: {
          ProductImage: true,
          PartNumber: true,
        },
        skip: offset,
        take: limit,
        orderBy: { Name: sort === "desc" ? "desc" : "asc" },
      });

      const totalProducts = await prisma.product.count({
        where: {
          DeletedAt: null,
          Name: { contains: String(search), mode: "insensitive" },
        },
      });

      res.status(200).json({
        data: products,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: Number(page),
      });
    } catch (error) {
      console.error("Error fetching all products:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Id } = req.params;

      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ message: "Invalid Product ID." });
        return;
      }

      const product = await prisma.product.findFirst({
        where: { Id: parseInt(Id, 10), DeletedAt: null },
        include: {
          ProductImage: true,
          PartNumber: true,
        },
      });

      if (!product) {
        res.status(404).json({ message: "Product not found." });
        return;
      }

      res.status(200).json({ data: product });
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Name, Description, ProductCategoryId, CodeName } = req.body;

      if (!Name || Name.trim() === "") {
        res.status(400).json({ message: "Product Name is required." });
        return;
      }
      // VALIDATION
      if (!Name || typeof Name !== "string" || Name.length > 80) {
        res.status(400).json({ message: "Name is required and must be max 80 characters." });
        return;
      }
      if (!ProductCategoryId || isNaN(Number(ProductCategoryId)) || Number(ProductCategoryId) <= 0) {
        res.status(400).json({ message: "ProductCategoryId is required and must be a valid positive integer." });
        return;
      }
      if (CodeName !== undefined && (typeof CodeName !== "string" || CodeName.length > 50)) {
        res.status(400).json({ message: "CodeName must be max 50 characters." });
        return;
      }
      if (Description !== undefined && (typeof Description !== "string" || Description.length > 800)) {
        res.status(400).json({ message: "Description must be max 800 characters." });
        return;
      }

      const newProduct = await prisma.product.create({
        data: {
          Name,
          CodeName,
          Description,
          ProductCategory: { connect: { Id: parseInt(ProductCategoryId, 10) } }
        },
        include: { PartNumber: true, ProductImage: true },
      });

      res.status(201).json({ message: "Product created successfully", data: newProduct });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, Name, CodeName, Description } = req.body;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({ message: "Invalid Product ID." });
        return;
      }

      if (!Name || Name.trim() === "") {
        res.status(400).json({ message: "Product Name is required." });
        return;
      }

      // VALIDATION
      if (Name !== undefined && (typeof Name !== "string" || Name.length > 80)) {
        res.status(400).json({ message: "Name must be max 80 characters." });
        return;
      }
      if (CodeName !== undefined && (typeof CodeName !== "string" || CodeName.length > 50)) {
        res.status(400).json({ message: "CodeName must be max 50 characters." });
        return;
      }
      if (Description !== undefined && (typeof Description !== "string" || Description.length > 800)) {
        res.status(400).json({ message: "Description must be max 800 characters." });
        return;
      }


      const dataToUpdate: any = { Name };

      if (CodeName !== undefined) dataToUpdate.CodeName = CodeName;
      if (Description !== undefined) dataToUpdate.Description = Description;

      const updatedProduct = await prisma.product.update({
        where: { Id: parseInt(id, 10) },
        data: dataToUpdate,
        include: { PartNumber: true },
      });

      res.status(200).json({ message: "Product updated successfully", data: updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Id } = req.params;

      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ message: "Invalid Product ID." });
        return;
      }

      // 1. Cek masih ada PartNumber aktif (dan itemcode di dalamnya)
      const partNumbers = await prisma.partNumber.findMany({
        where: {
          ProductId: parseInt(Id, 10),
          DeletedAt: null,
        },
        include: {
          ItemCode: {
            where: { DeletedAt: null },
          }
        }
      });

      if (partNumbers.length > 0) {
        for (const pn of partNumbers) {
          if (pn.ItemCode && pn.ItemCode.length > 0) {
            res.status(400).json({ message: "Product tidak bisa dihapus karena masih ada ItemCode aktif di bawah PartNumber." });
            return;
          }
        }
        res.status(400).json({ message: "Product tidak bisa dihapus karena masih ada PartNumber aktif." });
        return;
      }

      // 2. Pastikan tidak ada ItemCode yang orphan (tanpa partnumber) ke produk ini
      const orphanItemCodes = await prisma.itemCode.findMany({
        where: {
          PartNumber: { ProductId: parseInt(Id, 10) },
          DeletedAt: null,
        }
      });
      if (orphanItemCodes.length > 0) {
        res.status(400).json({ message: "Product tidak bisa dihapus karena masih ada ItemCode aktif yang terhubung ke produk ini." });
        return;
      }

      // 3. Jika lolos semua, soft delete
      await prisma.product.update({
        where: { Id: parseInt(Id, 10) },
        data: { DeletedAt: new Date() },
      });

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

const productController = new Product();

export const getAllProducts = productController.getAllProducts;
export const getProductCategoriesWithProducts = productController.getProductCategoriesWithProducts;
export const getProductsByCategory = productController.getProductsByCategory;
export const getProductById = productController.getProductById;
export const createProduct = productController.createProduct;
export const updateProduct = productController.updateProduct;
export const deleteProduct = productController.deleteProduct;

export default {
  getAllProducts,
  getProductCategoriesWithProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
