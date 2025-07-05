import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class WarehouseStock {
  getStockData = async (req: Request, res: Response) => {
    try {
      let { page, perPage, sortBy, filterProduct, filterPartNumber, filterItemCode } = req.query;

      const currentPage = parseInt(page as string) || 1;
      const limit = Math.min(parseInt(perPage as string) || 40, 40);
      const offset = (currentPage - 1) * limit;

      let orderBy = {};
      if (sortBy === "product") {
        orderBy = { Name: "asc" };
      } else if (sortBy === "partnumber_itemcode") {
        orderBy = {
          PartNumber: {
            Name: "asc",
          },
        };
      }

      const stockData = await prisma.product.findMany({
        where: {
          DeletedAt: null,
          Name: filterProduct ? { contains: filterProduct as string, mode: "insensitive" } : undefined,
          PartNumber: {
            some: {
              DeletedAt: null,
              Name: filterPartNumber ? { contains: filterPartNumber as string, mode: "insensitive" } : undefined,
              ItemCode: filterItemCode
                ? {
                  some: {
                    DeletedAt: null,
                    Name: { contains: filterItemCode as string, mode: "insensitive" },
                  },
                }
                : undefined,
            },
          },
        },
        include: {
          PartNumber: {
            where: {
              DeletedAt: null,
            },
            include: {
              ItemCode: {
                where: {
                  DeletedAt: null,
                },
                include: {
                  // PERBAIKI di sini:
                  WarehouseStocks: {
                    where: {
                      DeletedAt: null,              // Hanya WarehouseStock aktif
                      Warehouse: { DeletedAt: null } // Hanya warehouse aktif
                    },
                    include: {
                      Warehouse: true,              // Dapatkan detail warehouse
                    },
                  },
                },
              },
            },
          },
          ProductCategory: true,
        },
        orderBy,
        take: limit,
        skip: offset,
      });

      const totalData = await prisma.product.count({
        where: {
          DeletedAt: null,
          Name: filterProduct ? { contains: filterProduct as string, mode: "insensitive" } : undefined,
          PartNumber: {
            some: {
              DeletedAt: null,
              Name: filterPartNumber ? { contains: filterPartNumber as string, mode: "insensitive" } : undefined,
              ItemCode: filterItemCode
                ? {
                  some: {
                    DeletedAt: null,
                    Name: { contains: filterItemCode as string, mode: "insensitive" },
                  },
                }
                : undefined,
            },
          },
        },
      });

      res.json({
        message: "Stock data fetched successfully",
        currentPage,
        perPage: limit,
        totalData,
        totalPages: Math.ceil(totalData / limit),
        data: stockData,
      });
    } catch (error) {
      console.error("Error fetching stock data:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };

  updateStock = async (req: Request, res: Response): Promise<void> => {
    const { ItemCodeId, WarehouseId, QtyOnHand, QtyPO } = req.body;

    const adminId = req.admin?.Id;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized. AdminId missing." });
      return;
    }

    if (!ItemCodeId) {
      res.status(400).json({ message: "ItemCodeId required" });
      return;
    }


    // ==== HANDLE PO SAJA (TANPA WAREHOUSE) ====
    if (!WarehouseId && QtyPO !== undefined) {
      const before = await prisma.itemCode.findUnique({
        where: { Id: ItemCodeId },
        select: { QtyPO: true }
      });

      if (before?.QtyPO !== QtyPO) {
        await prisma.itemCode.update({
          where: { Id: ItemCodeId },
          data: { QtyPO },
        });
        await prisma.stockHistory.create({
          data: {
            WarehouseStockId: null,
            ItemCodeId,
            QtyBefore: before?.QtyPO,
            QtyAfter: QtyPO,
            Note: "QtyPO updated manually",
            UpdatedAt: new Date(),
            AdminId: adminId,
          },
        });
      }
      res.status(200).json({ message: "QtyPO updated successfully" });
      return;
    }

    // ===== HANDLE UPDATE STOCK (WAJIB WarehouseId) =====
    if (!WarehouseId) {
      res.status(400).json({ message: "WarehouseId required for stock update" });
      return;
    }

    // ---- VALIDASI QTYONHAND HANYA UNTUK UPDATE STOCK WAREHOUSE
    const qtyOnHandNum = Number(QtyOnHand);
    if (
      isNaN(qtyOnHandNum) ||
      qtyOnHandNum < 0 ||
      qtyOnHandNum > 1e15 // Float(20), hard cap for sanity
    ) {
      res.status(400).json({ message: "QtyOnHand must be a number between 0 until 20 character" });
      return;
    }

    // ---- VALIDASI QTYPO JIKA DIKIRIM (opsional)
    if (QtyPO !== undefined && QtyPO !== null) {
      const qtyPONum = Number(QtyPO);
      if (isNaN(qtyPONum) || qtyPONum < 0 || qtyPONum > 1e15) {
        res.status(400).json({ message: "QtyPO must be a number between 0 and 20 character." });
        return;
      }
    }

    try {
      const existing = await prisma.warehouseStock.findUnique({
        where: {
          WarehouseId_ItemCodeId: {
            WarehouseId,
            ItemCodeId,
          },
        },
      });

      const itemCode = await prisma.itemCode.findUnique({
        where: { Id: ItemCodeId },
        select: { QtyPO: true }
      });

      const beforeQtyPO = itemCode?.QtyPO ?? 0;
      let warehouseStockId: number | null = null;

      // ==== HANDLE STOCK ====
      if (!existing) {
        if (QtyOnHand > 0) {
          const created = await prisma.warehouseStock.create({
            data: {
              ItemCodeId,
              WarehouseId,
              QtyOnHand,
              CreatedAt: new Date(),
              DeletedAt: null,
            },
          });
          warehouseStockId = created.Id;

          // Catat log stok baru
          await prisma.stockHistory.create({
            data: {
              WarehouseStockId: warehouseStockId,
              ItemCodeId,
              QtyBefore: 0,
              QtyAfter: QtyOnHand,
              Note: "QtyOnHand created manually",
              UpdatedAt: new Date(),
              AdminId: adminId,
            },
          });
        } else {
          res.status(400).json({ message: "Cannot create stock with QtyOnHand = 0" });
          return;
        }
      } else {
        warehouseStockId = existing.Id;

        if (QtyOnHand !== existing.QtyOnHand) {
          await prisma.warehouseStock.update({
            where: {
              WarehouseId_ItemCodeId: {
                ItemCodeId,
                WarehouseId,
              },
            },
            data: {
              QtyOnHand,
              DeletedAt: QtyOnHand === 0 ? new Date() : null,
              UpdatedAt: new Date(),
            },
          });

          // Log perubahan QtyOnHand
          await prisma.stockHistory.create({
            data: {
              WarehouseStockId: warehouseStockId,
              ItemCodeId,
              QtyBefore: existing.QtyOnHand,
              QtyAfter: QtyOnHand,
              Note: "QtyOnHand updated manually",
              UpdatedAt: new Date(),
              AdminId: adminId,
            },
          });
        }
      }

      res.status(200).json({ message: "Stock updated successfully" });

    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
}

const warehouseStockController = new WarehouseStock();

export const getStockData = warehouseStockController.getStockData;
export const updateStock = warehouseStockController.updateStock;

export default {
  getStockData,
  updateStock,
};
