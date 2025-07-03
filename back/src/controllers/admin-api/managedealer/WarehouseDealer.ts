import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class Dealer {
  assignWarehouseToDealer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { DealerId, WarehouseId, Priority } = req.body;

      if (!DealerId || !WarehouseId) {
        res.status(400).json({ message: "DealerId and WarehouseId are required." });
        return;
      }

      const existing = await prisma.dealerWarehouse.findUnique({
        where: {
          DealerId_WarehouseId: {
            DealerId,
            WarehouseId,
          },
        },
      });

      if (existing) {
        res.status(400).json({ message: "This dealer is already assigned to this warehouse." });
        return;
      }

      const result = await prisma.dealerWarehouse.create({
        data: {
          DealerId,
          WarehouseId,
          Priority: Priority ?? null,
        },
      });

      res.status(201).json({ message: "Warehouse assigned to dealer successfully.", data: result });
    } catch (error) {
      console.error("Error assigning warehouse to dealer:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };

  unassignWarehouseFromDealer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { DealerId, WarehouseId } = req.body;

      if (!DealerId || !WarehouseId) {
        res.status(400).json({ message: "DealerId and WarehouseId are required." });
        return;
      }

      await prisma.dealerWarehouse.delete({
        where: {
          DealerId_WarehouseId: {
            DealerId,
            WarehouseId,
          },
        },
      });

      res.status(200).json({ message: "Warehouse unassigned from dealer successfully." });
    } catch (error) {
      console.error("Error unassigning warehouse from dealer:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };

  reorderDealerWarehouses = async (req: Request, res: Response): Promise<void> => {
    try {
      const { DealerId, WarehouseOrder } = req.body;

      if (!DealerId || !Array.isArray(WarehouseOrder) || WarehouseOrder.length === 0) {
        res.status(400).json({ message: "DealerId dan WarehouseOrder (array) diperlukan." });
        return;
      }

      const dealerExists = await prisma.dealer.findUnique({
        where: { Id: DealerId },
      });

      if (!dealerExists) {
        res.status(404).json({ message: "Dealer tidak ditemukan." });
        return;
      }

      const current = await prisma.dealerWarehouse.findMany({
        where: { DealerId },
        select: { WarehouseId: true }
      });

      const currentIds = current.map((dw) => dw.WarehouseId);
      const isValid = WarehouseOrder.every((id: number) => currentIds.includes(id));

      if (!isValid) {
        res.status(400).json({ message: "Beberapa WarehouseId tidak valid atau tidak terhubung dengan dealer." });
        return;
      }

      const updates = WarehouseOrder.map((warehouseId: number, index: number) =>
        prisma.dealerWarehouse.update({
          where: {
            DealerId_WarehouseId: {
              DealerId,
              WarehouseId: warehouseId,
            },
          },
          data: { Priority: index },
        })
      );

      await Promise.all(updates);

      res.status(200).json({ message: "Prioritas warehouse berhasil diperbarui." });
    } catch (error) {
      console.error("Error reorder dealer warehouses:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };

  getWarehousesByDealer = async (req: Request, res: Response): Promise<void> => {
    try {
      const DealerId = parseInt(req.body.DealerId);

      if (isNaN(DealerId)) {
        res.status(400).json({ message: "Invalid DealerId" });
        return;
      }

      const dealer = await prisma.dealer.findUnique({
        where: { Id: DealerId },
        include: {
          DealerWarehouse: {
            include: { Warehouse: true },
            orderBy: { Priority: "asc" },
          },
        },
      });

      if (!dealer) {
        res.status(404).json({ message: "Dealer not found" });
        return;
      }

      const warehouses = dealer.DealerWarehouse.map((dw) => ({
        Id: dw.Warehouse.Id,
        BusinessUnit: dw.Warehouse.BusinessUnit,
        Name: dw.Warehouse.Name,
        Priority: dw.Priority ?? null,
      }));

      res.json({ success: true, data: warehouses });
    } catch (error) {
      console.error("Error fetching dealer warehouses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  fetchAllWarehouses = async (req: Request, res: Response): Promise<void> => {
    try {
      const warehouses = await prisma.warehouse.findMany({
        where: { DeletedAt: null },
        orderBy: { BusinessUnit: "asc" },
        select: {
          Id: true,
          Name: true,
          BusinessUnit: true,
          Location: true,
        },
      });

      res.json({ success: true, data: warehouses });
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

const dealerController = new Dealer();

export const assignWarehouseToDealer = dealerController.assignWarehouseToDealer;
export const unassignWarehouseFromDealer = dealerController.unassignWarehouseFromDealer;
export const reorderDealerWarehouses = dealerController.reorderDealerWarehouses;
export const getWarehousesByDealer = dealerController.getWarehousesByDealer;
export const fetchAllWarehouses = dealerController.fetchAllWarehouses;

export default {
  assignWarehouseToDealer,
  unassignWarehouseFromDealer,
  reorderDealerWarehouses,
  getWarehousesByDealer,
  fetchAllWarehouses,
};
