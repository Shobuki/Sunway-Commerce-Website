import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ItemCode {
  getAllItemCodeWithPartNumbers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partNumbers = await prisma.partNumber.findMany({
        where: { DeletedAt: null },
        include: {
          ItemCode: {
            where: { DeletedAt: null },
            include: {
              ProductBrand: true,
              Price: true,
            }
          }
        },
        orderBy: {
          CreatedAt: "desc",
        },
      });

      res.status(200).json({
        data: partNumbers,
        count: partNumbers.length
      });
    } catch (error) {
      console.error("Error fetching part numbers with associated product reals:", error);
      next(error);
    }
  };

  getItemCodeByPartNumber = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { partNumberId } = req.params;

      if (!partNumberId || isNaN(Number(partNumberId))) {
        res.status(400).json({ error: "Invalid Part Number ID" });
        return;
      }

      const ItemCodeList = await prisma.itemCode.findMany({
        where: {
          PartNumberId: parseInt(partNumberId, 10),
          DeletedAt: null,
        },
        include: {
          PartNumber: true,
          ProductBrand: true,
          Price: true,
        },
      });

      res.status(200).json({
        status: "success",
        message: "ItemCode fetched successfully",
        data: ItemCodeList.map((item) => ({
          ...item,
          AllowItemCodeSelection: item.AllowItemCodeSelection,
          MinOrderQuantity: item.MinOrderQuantity,
          OrderStep: item.OrderStep,
        })),
      });
    } catch (error) {
      console.error("Error fetching product real data by part number ID:", error);
      next(error);
    }
  };

  getItemCodeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { Id } = req.params;

      console.log("Received ID:", Id); // ✅ Debugging: Pastikan ID diterima

      const parsedId = parseInt(Id, 10);
      if (isNaN(parsedId)) {
        res.status(400).json({ error: "Invalid ItemCode ID (not a number)" });
        return;
      }

      const ItemCodeData = await prisma.itemCode.findFirst({
        where: { Id: parsedId, DeletedAt: null },
        include: { ProductBrand: true },
      });

      if (!ItemCodeData) {
        res.status(404).json({ message: "ItemCode not found." });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "ItemCode fetched successfully",
        data: ItemCodeData,
      });
    } catch (error) {
      console.error("Error fetching ItemCode by ID:", error);
      next(error);
    }
  };

  createItemCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        PartNumberId,
        Name,
        BrandCodeId,
        OEM,
        StockingTypeCode,
        Weight,
        AllowItemCodeSelection = false,
        MinOrderQuantity,
        OrderStep
      } = req.body;

      if (!PartNumberId || isNaN(Number(PartNumberId))) {
        res.status(400).json({ message: "Invalid PartNumberId." });
        return;
      }

      if (!Name) {
        res.status(400).json({ message: "Name (ItemCode name) is required." });
        return;
      }

      if (typeof Name !== "string" || Name.length > 50) {
        res.status(400).json({ message: "Name is required & max 50 chars." });
        return;
      }
      if (OEM && (typeof OEM !== "string" || OEM.length > 30)) {
        res.status(400).json({ message: "OEM max 30 chars." });
        return;
      }
      if (Weight !== undefined && (isNaN(Number(Weight)) || Number(Weight) < 0 || String(Weight).length > 10)) {
        res.status(400).json({ message: "Weight must be positive number & max 10 digits." });
        return;
      }
      if (typeof AllowItemCodeSelection !== "boolean" && AllowItemCodeSelection !== "true" && AllowItemCodeSelection !== "false") {
        res.status(400).json({ message: "AllowItemCodeSelection must be boolean." });
        return;
      }
      if (MinOrderQuantity !== undefined && (isNaN(Number(MinOrderQuantity)) || Number(MinOrderQuantity) < 0 || Number(MinOrderQuantity) > 99999999)) {
        res.status(400).json({ message: "MinOrderQuantity max 8 digits, >=0." });
        return;
      }
      if (OrderStep !== undefined && (isNaN(Number(OrderStep)) || Number(OrderStep) < 0 || Number(OrderStep) > 999999)) {
        res.status(400).json({ message: "OrderStep max 6 digits, >=0." });
        return;
      }


      // CARI itemcode dengan nama sama (case-insensitive), apapun DeletedAt-nya
      const existing = await prisma.itemCode.findFirst({
        where: {
          Name: { equals: Name, mode: "insensitive" },
        }
      });

      if (existing) {
        // Reactivate & update field
        const updated = await prisma.itemCode.update({
          where: { Id: existing.Id },
          data: {
            PartNumberId: Number(PartNumberId),
            Name,
            BrandCodeId: BrandCodeId ? Number(BrandCodeId) : null,
            OEM,
            Weight: Weight ? parseFloat(Weight) : null,
            QtyPO: null,
            AllowItemCodeSelection: Boolean(AllowItemCodeSelection),
            MinOrderQuantity: MinOrderQuantity ? Number(MinOrderQuantity) : null,
            OrderStep: OrderStep ? Number(OrderStep) : null,
            DeletedAt: null,
          }
        });
        res.status(200).json({
          message: "ItemCode already exists and has been reactivated/updated.",
          data: updated
        });
        return;
      }

      const newItemCode = await prisma.itemCode.create({
        data: {
          PartNumberId: Number(PartNumberId),
          Name,
          BrandCodeId: BrandCodeId ? Number(BrandCodeId) : null,
          OEM,
          Weight: Weight ? parseFloat(Weight) : null,
          QtyPO: null,
          AllowItemCodeSelection: Boolean(AllowItemCodeSelection),
          MinOrderQuantity: MinOrderQuantity ? Number(MinOrderQuantity) : null,
          OrderStep: OrderStep ? Number(OrderStep) : null
        }
      });

      res.status(201).json({
        message: "ItemCode created successfully",
        data: newItemCode
      });

    } catch (error) {
      console.error("Error creating ItemCode:", error);
      next(error);
    }
  };

  updateItemCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Id } = req.params;
      const { Name, BrandCodeId, OEM, StockingTypeCode, SalesCode, Weight, PartNumberId, AllowItemCodeSelection, MinOrderQuantity, OrderStep } = req.body;

      if (!Id || isNaN(Number(Id))) {
        res.status(400).json({ message: "Invalid Item Code ID." });
        return;
      }

      // VALIDASI FIELD SAMA SEPERTI CREATE
      if (Name !== undefined && (typeof Name !== "string" || Name.length > 50)) {
        res.status(400).json({ message: "Name max 50 chars." });
        return;
      }
      if (OEM !== undefined && (typeof OEM !== "string" || OEM.length > 30)) {
        res.status(400).json({ message: "OEM max 30 chars." });
        return;
      }
      if (Weight !== undefined && (isNaN(Number(Weight)) || Number(Weight) < 0 || String(Weight).length > 10)) {
        res.status(400).json({ message: "Weight must be positive number & max 10 digits." });
        return;
      }
      if (AllowItemCodeSelection !== undefined &&
        typeof AllowItemCodeSelection !== "boolean" &&
        AllowItemCodeSelection !== "true" &&
        AllowItemCodeSelection !== "false") {
        res.status(400).json({ message: "AllowItemCodeSelection must be boolean." });
        return;
      }
      if (MinOrderQuantity !== undefined && (isNaN(Number(MinOrderQuantity)) || Number(MinOrderQuantity) < 0 || Number(MinOrderQuantity) > 99999999)) {
        res.status(400).json({ message: "MinOrderQuantity max 8 digits, >=0." });
        return;
      }
      if (OrderStep !== undefined && (isNaN(Number(OrderStep)) || Number(OrderStep) < 0 || Number(OrderStep) > 999999)) {
        res.status(400).json({ message: "OrderStep max 6 digits, >=0." });
        return;
      }
      if (PartNumberId !== undefined && (isNaN(Number(PartNumberId)) || Number(PartNumberId) <= 0)) {
        res.status(400).json({ message: "Invalid Part Number ID." });
        return;
      }

      let partNumber = null;
      if (PartNumberId) {
        partNumber = await prisma.partNumber.findUnique({
          where: { Id: Number(PartNumberId) },
        });

        if (!partNumber) {
          res.status(400).json({ message: "Invalid Part Number ID." });
          return;
        }
      }

      const updatedItemCode = await prisma.itemCode.update({
        where: { Id: Number(Id) },
        data: {
          Name,
          BrandCodeId: BrandCodeId ? Number(BrandCodeId) : null,
          OEM,
          Weight: Weight ? parseFloat(Weight) : null,
          PartNumberId: PartNumberId ? Number(PartNumberId) : null,
          AllowItemCodeSelection: AllowItemCodeSelection !== undefined ? Boolean(AllowItemCodeSelection) : undefined,
          MinOrderQuantity: MinOrderQuantity !== undefined ? Number(MinOrderQuantity) : undefined,
          OrderStep: OrderStep !== undefined ? Number(OrderStep) : undefined,
        },
      });

      res.status(200).json({ message: "Item Code updated successfully", data: updatedItemCode });
    } catch (error) {
      console.error("Error updating Item Code:", error);
      next(error);
    }
  };

  deleteItemCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { Id } = req.params;

      const ItemCodeId = Number(Id);
      if (!ItemCodeId || isNaN(ItemCodeId)) {
        res.status(400).json({ message: "Invalid ItemCode ID." });
        return;
      }

      const existingItemCode = await prisma.itemCode.findUnique({
        where: { Id: ItemCodeId },
      });

      if (!existingItemCode) {
        res.status(404).json({ message: "ItemCode not found." });
        return;
      }

      // Soft delete (PartNumberId bisa dicabut dulu jika perlu)
      await prisma.itemCode.update({
        where: { Id: ItemCodeId },
        data: { PartNumberId: null, DeletedAt: new Date() },
      });

      // HAPUS semua WarehouseStock terkait ItemCodeId ini
      await prisma.warehouseStock.deleteMany({
        where: { ItemCodeId },
      });

      res.status(200).json({ message: "ItemCode deleted successfully (Soft Delete & All WarehouseStock Deleted)" });
    } catch (error) {
      console.error("Error deleting ItemCode:", error);
      next(error);
    }
  };
}

const itemCodeController = new ItemCode();

export const getAllItemCodeWithPartNumbers = itemCodeController.getAllItemCodeWithPartNumbers;
export const getItemCodeByPartNumber = itemCodeController.getItemCodeByPartNumber;
export const getItemCodeById = itemCodeController.getItemCodeById;
export const createItemCode = itemCodeController.createItemCode;
export const updateItemCode = itemCodeController.updateItemCode;
export const deleteItemCode = itemCodeController.deleteItemCode;

export default {
  getAllItemCodeWithPartNumbers,
  getItemCodeByPartNumber,
  getItemCodeById,
  createItemCode,
  updateItemCode,
  deleteItemCode,
};
