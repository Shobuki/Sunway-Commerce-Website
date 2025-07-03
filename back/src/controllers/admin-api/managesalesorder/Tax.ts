import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class Tax {
  getAllTax = async (_req: Request, res: Response) => {
    try {
      const taxes = await prisma.tax.findMany({
        where: { DeletedAt: null }, // hanya yang belum dihapus
        orderBy: { CreatedAt: 'desc' },
      });

      res.status(200).json({ message: 'Success', data: taxes });
    } catch (error) {
      console.error('Error fetching all tax:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  getActiveTax = async (_req: Request, res: Response) => {
    try {
      const tax = await prisma.tax.findFirst({
        where: {
          IsActive: true,
          DeletedAt: null,
        },
        orderBy: { CreatedAt: 'desc' },
      });

      if (!tax) {
        res.status(404).json({ message: 'No active tax found' });
        return;
      }

      res.status(200).json({ message: 'Success', data: tax });
    } catch (error) {
      console.error('Error fetching active tax:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  upsertTax = async (req: Request, res: Response) => {
    try {
      const { Name, Percentage } = req.body;

      // Batasi karakter Name maksimal 40 karakter
      if (!Name || Name.length > 50) {
        res.status(400).json({ message: "Name maksimal 50 karakter" });
        return;
      }
      const parsedPercentage = parseFloat(Percentage);

      if (parsedPercentage < 0 || parsedPercentage > 100) {
        res.status(400).json({ message: 'Percentage must be between 0 and 100' });
        return;
      }

      // Tandai semua tax sebelumnya tidak aktif
      await prisma.tax.updateMany({
        where: { IsActive: true, DeletedAt: null },
        data: { IsActive: false },
      });

      // Buat tax baru sebagai aktif
      const newTax = await prisma.tax.create({
        data: {
          Name,
          Percentage: parsedPercentage,
          IsActive: true,
        },
      });

      res.status(201).json({ message: 'Tax successfully set as active', data: newTax });
    } catch (error) {
      console.error('Error upserting tax:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  deleteTax = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;

      const deleted = await prisma.tax.update({
        where: { Id: Number(id) },
        data: {
          DeletedAt: new Date(),
          IsActive: false,
        },
      });

      res.status(200).json({ message: 'Tax soft deleted', data: deleted });
    } catch (error) {
      console.error('Error deleting tax:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

const taxController = new Tax();

export const getAllTax = taxController.getAllTax;
export const getActiveTax = taxController.getActiveTax;
export const upsertTax = taxController.upsertTax;
export const deleteTax = taxController.deleteTax;
