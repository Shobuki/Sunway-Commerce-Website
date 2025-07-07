import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Create Warehouse
export const createWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Name, BusinessUnit, Location } = req.body;

    // Validasi
    if (!BusinessUnit) {
      res.status(400).json({ message: "BusinessUnit is required" });
      return;
    }
    if (typeof BusinessUnit !== "string" || BusinessUnit.length > 10) {
      res.status(400).json({ message: "BusinessUnit must be a string and max 10 characters." });
      return;
    }
    if (Name && (typeof Name !== "string" || Name.length > 50)) {
      res.status(400).json({ message: "Name must be a string and max 50 characters." });
      return;
    }
    if (Location && (typeof Location !== "string" || Location.length > 80)) {
      res.status(400).json({ message: "Location must be a string and max 80 characters." });
      return;
    }

    // Cari warehouse dgn BusinessUnit yang sama (baik aktif maupun sudah soft delete)
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: { BusinessUnit },
      // tidak usah filter DeletedAt
    });

    if (existingWarehouse) {
      // Jika ada, update DeletedAt=null + update field lain
      const updatedWarehouse = await prisma.warehouse.update({
        where: { Id: existingWarehouse.Id },
        data: {
          Name,
          BusinessUnit,
          Location,
          DeletedAt: null,
        },
      });

      res.status(200).json({
        message: "Warehouse already exists. Data has been reactivated/updated.",
        data: updatedWarehouse,
      });
      return;
    }

    // Jika tidak ada, create baru
    const newWarehouse = await prisma.warehouse.create({
      data: {
        Name,
        BusinessUnit,
        Location,
      },
    });

    res.status(201).json({ message: "Warehouse created successfully.", data: newWarehouse });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// ✅ Read/List all Warehouses
export const getWarehouses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: {
        DeletedAt: null,
      },
      orderBy: {
        CreatedAt: "desc",
      },
    });

    res.status(200).json({ message: "Warehouses fetched successfully", data: warehouses });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// ✅ Update Warehouse
export const updateWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Id } = req.params;
    const { Name, BusinessUnit, Location } = req.body;

    if (!Id) {
      res.status(400).json({ message: "Warehouse Id is required" });
      return;
    }

    if (!BusinessUnit) {
      res.status(400).json({ message: "BusinessUnit is required" });
      return;
    }
    // VALIDATION
    if (!BusinessUnit || typeof BusinessUnit !== "string" || BusinessUnit.length > 10) {
      res.status(400).json({ message: "BusinessUnit is required and must be max 10 characters." });
      return;
    }
    if (Name && (typeof Name !== "string" || Name.length > 50)) {
      res.status(400).json({ message: "Name must be a string and max 50 characters." });
      return;
    }
    if (Location && (typeof Location !== "string" || Location.length > 80)) {
      res.status(400).json({ message: "Location must be a string and max 80 characters." });
      return;
    }

    const updatedWarehouse = await prisma.warehouse.update({
      where: { Id: Number(Id) },
      data: {
        Name,
        BusinessUnit,
        Location,
      },
    });

    res.status(200).json({ message: "Warehouse updated successfully", data: updatedWarehouse });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// ✅ Soft Delete Warehouse dengan Validasi Stock Kosong
export const deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Id } = req.params;

    if (!Id) {
      res.status(400).json({ message: "Warehouse Id is required" });
      return;
    }

    const warehouseId = Number(Id);

    // 1. Soft delete warehouse (update DeletedAt)
    await prisma.warehouse.update({
      where: { Id: warehouseId },
      data: { DeletedAt: new Date() },
    });

    // 2. Hapus semua relasi di DealerWarehouse (HARD DELETE)
    await prisma.dealerWarehouse.deleteMany({
      where: { WarehouseId: warehouseId }
    });

    // 3. Hapus semua WarehouseStock (bisa soft/hard delete, pilih salah satu)
    // --- HARD DELETE (hapus record)
    await prisma.warehouseStock.deleteMany({
      where: { WarehouseId: warehouseId }
    });

    // --- SOFT DELETE (hapus secara soft, aktifkan ini jika mau)
    // await prisma.warehouseStock.updateMany({
    //   where: { WarehouseId: warehouseId },
    //   data: { DeletedAt: new Date() }
    // });

    // Tidak menghapus SalesOrderDetail relasi

    res.status(200).json({ message: "Warehouse soft deleted and all related DealerWarehouse & WarehouseStock have been removed." });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

