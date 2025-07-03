import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// **Create a Product Brand**
export const createProductBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { ProductBrandName, ProductBrandCode } = req.body;

  try {
    const newBrand = await prisma.productBrand.create({
      data: {
        ProductBrandName,
        ProductBrandCode,
      },
    });

    res.status(201).json({ message: "Product brand created successfully", data: newBrand });
  } catch (error) {
    console.error("Error creating product brand:", error);
    next(error);
  }
};

// **Read All Product Brands**
export const getAllProductBrands = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brands = await prisma.productBrand.findMany({
      include: {
        ItemCode: true, // Include related
      },
    });

    res.status(200).json({ data: brands });
  } catch (error) {
    console.error("Error fetching product brands:", error);
    next(error);
  }
};



// **Get Product Brand By ID**
export const getProductBrandById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { Id } = req.params;

    // Konversi Id menjadi angka
    if (!Id || isNaN(Number(Id))) {
      res.status(400).json({ message: "Invalid or missing Id parameter." });
      return;
    }

    const brand = await prisma.productBrand.findUnique({
      where: {
        Id: Number(Id), // Konversi Id ke tipe Int
      },
      include: {
        ItemCode: true, 
      },
    });

    if (!brand) {
      res.status(404).json({ message: "Product brand not found." });
      return;
    }

    res.status(200).json({ data: brand });
  } catch (error) {
    console.error("Error fetching product brand by Id:", error);
    next(error); // Forward error ke middleware error handler
  }
};


// **Update a Product Brand**
export const updateProductBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const { ProductBrandName, ProductBrandCode } = req.body;

  try {
    const updatedBrand = await prisma.productBrand.update({
      where: { Id: parseInt(id, 10) },
      data: {
        ProductBrandName,
        ProductBrandCode,
      },
    });

    res.status(200).json({ message: "Product brand updated successfully", data: updatedBrand });
  } catch (error) {
    console.error("Error updating product brand:", error);
    next(error);
  }
};

// **Delete a Product Brand**
export const deleteProductBrand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    // Check for related  records
    const relatedProducts = await prisma.itemCode.findMany({
      where: { BrandCodeId: parseInt(id, 10) },
    });

    if (relatedProducts.length > 0) {
      res.status(400).json({
        message: "Cannot delete product brand with associated product real records. Please remove the associated records first.",
      });
      return;
    }

    await prisma.productBrand.delete({
      where: { Id: parseInt(id, 10) },
    });

    res.status(200).json({ message: "Product brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting product brand:", error);
    next(error);
  }
};

// **Export Controllers**
export default {
  createProductBrand,
  getAllProductBrands,
  getProductBrandById,
  updateProductBrand,
  deleteProductBrand,
};
