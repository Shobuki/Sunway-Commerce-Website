import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

class warehouse {
  /**
   * Menambah warehouse ke itemcode (create relasi, restore jika soft-delete)
   * Body: { WarehouseId, ItemCodeId }
   */
  async addWarehouseToItemCode(req: Request, res: Response) {
    const { WarehouseId, ItemCodeId } = req.body;
    if (!WarehouseId || !ItemCodeId) {
      res.status(400).json({ message: "WarehouseId dan ItemCodeId wajib diisi." });
      return;
    }
    try {
      const exists = await prisma.warehouseStock.findFirst({ where: { WarehouseId, ItemCodeId } });
      if (exists) {
        if (exists.DeletedAt) {
          await prisma.warehouseStock.update({
            where: { Id: exists.Id },
            data: { DeletedAt: null },
          });
          res.status(200).json({ message: "Warehouse berhasil direstore ke ItemCode.", data: exists });
          return;
        }
        res.status(200).json({ message: "Warehouse sudah terkait dengan ItemCode.", data: exists });
        return;
      }
      const newRel = await prisma.warehouseStock.create({
        data: { WarehouseId, ItemCodeId, QtyOnHand: 0 }
      });
      res.status(201).json({ message: "Warehouse berhasil ditambahkan ke ItemCode.", data: newRel });
    } catch (error) {
      console.error("Tambah warehouse-itemcode error:", error);
      res.status(500).json({ message: "Gagal menambahkan warehouse ke itemcode.", error });
    }
  }

  /**
   * Menghapus (soft delete) warehouse dari itemcode.
   * Body: { WarehouseId, ItemCodeId }
   */
  async removeWarehouseFromItemCode(req: Request, res: Response) {
    const { WarehouseId, ItemCodeId } = req.body;
    if (!WarehouseId || !ItemCodeId) {
      res.status(400).json({ message: "WarehouseId dan ItemCodeId wajib diisi." });
      return;
    }
    try {
      const exists = await prisma.warehouseStock.findFirst({
        where: { WarehouseId, ItemCodeId, DeletedAt: null }
      });
      if (!exists) {
        res.status(404).json({ message: "Warehouse belum terkait dengan ItemCode." });
        return;
      }
      await prisma.warehouseStock.update({
        where: { Id: exists.Id },
        data: { DeletedAt: new Date() }
      });
      res.status(200).json({ message: "Warehouse berhasil dihapus dari ItemCode." });
    } catch (error) {
      console.error("Hapus warehouse-itemcode error:", error);
      res.status(500).json({ message: "Gagal menghapus warehouse dari itemcode.", error });
    }
  }

  /**
   * Menampilkan daftar warehouse yang terkait dengan itemcode (aktif saja).
   * Param: itemCodeId
   */
  async listWarehouseByItemCode(req: Request, res: Response) {
    const itemCodeId = Number(req.params.itemCodeId);
    if (!itemCodeId) {
      res.status(400).json({ message: "ItemCodeId wajib diisi." });
      return;
    }
    try {
      const data = await prisma.warehouseStock.findMany({
        where: { ItemCodeId: itemCodeId, DeletedAt: null },
        include: { Warehouse: true }
      });
      res.status(200).json({ data });
    } catch (error) {
      console.error("List warehouse error:", error);
      res.status(500).json({ message: "Gagal mengambil data warehouse-itemcode.", error });
    }
  }
}

const warehouseController = new warehouse();

export const addWarehouseToItemCode = warehouseController.addWarehouseToItemCode.bind(warehouseController);
export const removeWarehouseFromItemCode = warehouseController.removeWarehouseFromItemCode.bind(warehouseController);
export const listWarehouseByItemCode = warehouseController.listWarehouseByItemCode.bind(warehouseController);

export default {
  addWarehouseToItemCode,
  removeWarehouseFromItemCode,
  listWarehouseByItemCode,
};
