import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class PartNumber {
  getAllProductsWithPartNumbers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await prisma.product.findMany({
        where: { DeletedAt: null },
        include: {
          PartNumber: true,
        },
        orderBy: { CreatedAt: "desc" },
      });

      res.status(200).json({ data: products });
    } catch (error) {
      console.error("Error fetching products with part numbers:", error);
      next(error);
    }
  };

  getPartNumbersByProductId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Id } = req.params;

      const productId = Number(Id);
      if (isNaN(productId) || productId <= 0) {
        res.status(400).json({ message: "Invalid Product ID." });
        return;
      }

      const product = await prisma.product.findUnique({
        where: { Id: productId },
        include: {
          PartNumber: true,
        },
      });

      if (!product) {
        res.status(404).json({ message: "Product not found." });
        return;
      }

      res.status(200).json({ data: product });
    } catch (error) {
      console.error("Error fetching part numbers by product ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getPartNumberById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Id } = req.params;

      const partNumberId = Number(Id);
      if (isNaN(partNumberId) || partNumberId <= 0) {
        res.status(400).json({ message: "Invalid Part Number ID." });
        return;
      }

      const partNumber = await prisma.partNumber.findUnique({
        where: { Id: partNumberId },
      });

      if (!partNumber) {
        res.status(404).json({ message: "Part Number not found." });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "Part Number fetched successfully",
        data: partNumber,
      });
    } catch (error) {
      console.error("Error fetching Part Number by ID:", error);
      next(error);
    }
  };

  createPartNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        ProductId,
        Name,
        Description,
        Dash,
        InnerDiameter,
        OuterDiameter,
        WorkingPressure,
        BurstingPressure,
        BendingRadius,
        HoseWeight,
      } = req.body;

      // --- Validasi Utama ---
      if (!ProductId || isNaN(Number(ProductId)) || Number(ProductId) <= 0) {
        res.status(400).json({ message: "Invalid Product ID." });
        return;
      }
      if (!Name || typeof Name !== "string" || Name.length > 40) {
        res.status(400).json({ message: "Name is required & max 40 chars." });
        return;
      }
      // Tidak perlu cek angka harus positif! Hanya panjang digit saja:
      if (Dash !== undefined && (String(Dash).replace('.', '').replace('-', '').length > 7)) {
        res.status(400).json({ message: "Dash max 7 digits." });
        return;
      }
      if (InnerDiameter !== undefined && (String(InnerDiameter).replace('.', '').replace('-', '').length > 7)) {
        res.status(400).json({ message: "InnerDiameter max 7 digits." });
        return;
      }
      if (OuterDiameter !== undefined && (String(OuterDiameter).replace('.', '').replace('-', '').length > 7)) {
        res.status(400).json({ message: "OuterDiameter max 7 digits." });
        return;
      }
      if (WorkingPressure !== undefined && (String(WorkingPressure).replace('.', '').replace('-', '').length > 10)) {
        res.status(400).json({ message: "WorkingPressure max 10 digits." });
        return;
      }
      if (BurstingPressure !== undefined && (String(BurstingPressure).replace('.', '').replace('-', '').length > 10)) {
        res.status(400).json({ message: "BurstingPressure max 10 digits." });
        return;
      }
      if (BendingRadius !== undefined && (String(BendingRadius).replace('.', '').replace('-', '').length > 10)) {
        res.status(400).json({ message: "BendingRadius max 10 digits." });
        return;
      }
      if (HoseWeight !== undefined && (String(HoseWeight).replace('.', '').replace('-', '').length > 10)) {
        res.status(400).json({ message: "HoseWeight max 10 digits." });
        return;
      }

      const newPartNumber = await prisma.partNumber.create({
        data: {
          ProductId: parseInt(ProductId, 10),
          Name,
          Description,
          Dash: Dash ? parseInt(Dash, 10) : null,
          InnerDiameter: InnerDiameter ? parseFloat(InnerDiameter) : null,
          OuterDiameter: OuterDiameter ? parseFloat(OuterDiameter) : null,
          WorkingPressure: WorkingPressure ? parseFloat(WorkingPressure) : null,
          BurstingPressure: BurstingPressure ? parseFloat(BurstingPressure) : null,
          BendingRadius: BendingRadius ? parseFloat(BendingRadius) : null,
          HoseWeight: HoseWeight ? parseFloat(HoseWeight) : null,
        },
      });

      res.status(201).json({ message: "Part Number created successfully", data: newPartNumber });
    } catch (error) {
      console.error("Error creating Part Number:", error);
      next(error);
    }
  };

  updatePartNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        Id,
        Name,
        Description,
        Dash,
        InnerDiameter,
        OuterDiameter,
        WorkingPressure,
        BurstingPressure,
        BendingRadius,
        HoseWeight,
        ProductId,
      } = req.body;

      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ message: "Invalid Part Number ID." });
        return;
      }
      if (Name !== undefined && (typeof Name !== "string" || Name.length > 40)) {
        res.status(400).json({ message: "Name max 40 chars." });
        return;
      }
      // Hanya validasi jumlah digit/karakter saja
      if (Dash !== undefined && (String(Dash).replace('.', '').replace('-', '').length > 7)) {
        res.status(400).json({ message: "Dash max 7 digits." });
        return;
      }
      if (InnerDiameter !== undefined && (String(InnerDiameter).replace('.', '').replace('-', '').length > 7)) {
        res.status(400).json({ message: "InnerDiameter max 7 digits." });
        return;
      }
      if (OuterDiameter !== undefined && (String(OuterDiameter).replace('.', '').replace('-', '').length > 7)) {
        res.status(400).json({ message: "OuterDiameter max 7 digits." });
        return;
      }
      if (WorkingPressure !== undefined && (String(WorkingPressure).replace('.', '').replace('-', '').length > 10)) {
        res.status(400).json({ message: "WorkingPressure max 10 digits." });
        return;
      }
      if (BurstingPressure !== undefined && (String(BurstingPressure).replace('.', '').replace('-', '').length > 10)) {
        res.status(400).json({ message: "BurstingPressure max 10 digits." });
        return;
      }
      if (BendingRadius !== undefined && (String(BendingRadius).replace('.', '').replace('-', '').length > 10)) {
        res.status(400).json({ message: "BendingRadius max 10 digits." });
        return;
      }
      if (HoseWeight !== undefined && (String(HoseWeight).replace('.', '').replace('-', '').length > 10)) {
        res.status(400).json({ message: "HoseWeight max 10 digits." });
        return;
      }
      if (ProductId !== undefined && (isNaN(Number(ProductId)) || Number(ProductId) <= 0)) {
        res.status(400).json({ message: "Invalid Product ID." });
        return;
      }

      const updatedPartNumber = await prisma.partNumber.update({
        where: { Id: parseInt(Id, 10) },
        data: {
          Name,
          Description,
          Dash: Dash ? parseInt(Dash, 10) : null,
          InnerDiameter: InnerDiameter ? parseFloat(InnerDiameter) : null,
          OuterDiameter: OuterDiameter ? parseFloat(OuterDiameter) : null,
          WorkingPressure: WorkingPressure ? parseFloat(WorkingPressure) : null,
          BurstingPressure: BurstingPressure ? parseFloat(BurstingPressure) : null,
          BendingRadius: BendingRadius ? parseFloat(BendingRadius) : null,
          HoseWeight: HoseWeight ? parseFloat(HoseWeight) : null,
          ProductId: ProductId ? parseInt(ProductId, 10) : null,
        },
      });

      res.status(200).json({ message: "Part Number updated successfully", data: updatedPartNumber });
    } catch (error) {
      console.error("Error updating Part Number:", error);
      next(error);
    }
  };

  deletePartNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Id } = req.params;
      const partNumberId = Number(Id);
      if (!partNumberId || isNaN(partNumberId)) {
        res.status(400).json({ message: "Invalid Part Number ID." });
        return;
      }

      const existingPartNumber = await prisma.partNumber.findUnique({
        where: { Id: partNumberId },
        include: { ItemCode: true },
      });

      if (!existingPartNumber) {
        res.status(404).json({ message: "Part Number not found." });
        return;
      }

      // CEK jika ada ItemCode turunan yang masih aktif (DeletedAt = null)
      const activeItemCode = await prisma.itemCode.findFirst({
        where: {
          PartNumberId: partNumberId,
          DeletedAt: null,
        },
      });

      if (activeItemCode) {
        res.status(400).json({
          message: "Cannot delete PartNumber. It still has active ItemCode(s).",
        });
        return;
      }


      await prisma.partNumber.update({
        where: { Id: partNumberId },
        data: { DeletedAt: new Date() },
      });

      await prisma.itemCode.updateMany({
        where: { PartNumberId: partNumberId },
        data: { PartNumberId: null },
      });

      const relatedProducts = await prisma.product.findMany({
        where: { PartNumber: { some: { Id: partNumberId } } },
      });

      for (const product of relatedProducts) {
        await prisma.product.update({
          where: { Id: product.Id },
          data: {
            PartNumber: {
              disconnect: { Id: partNumberId },
            },
          },
        });
      }

      res.status(200).json({
        message: "Part Number deleted successfully (Soft Delete & Relations Removed)",
      });
    } catch (error) {
      console.error("Error deleting Part Number:", error);
      next(error);
    }
  };
}

const partNumberController = new PartNumber();

export const getAllProductsWithPartNumbers = partNumberController.getAllProductsWithPartNumbers;
export const getPartNumbersByProductId = partNumberController.getPartNumbersByProductId;
export const getPartNumberById = partNumberController.getPartNumberById;
export const createPartNumber = partNumberController.createPartNumber;
export const updatePartNumber = partNumberController.updatePartNumber;
export const deletePartNumber = partNumberController.deletePartNumber;

export default {
  getAllProductsWithPartNumbers,
  getPartNumbersByProductId,
  getPartNumberById,
  createPartNumber,
  updatePartNumber,
  deletePartNumber,
};
