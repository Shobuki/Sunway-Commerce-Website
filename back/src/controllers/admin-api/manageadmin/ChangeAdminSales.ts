import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class Admin {
  changeAdminSalesStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { adminid } = req.params;
      const { isSales } = req.body; // ✅ region dihapus karena sudah tidak digunakan

      const parsedAdminId = parseInt(adminid, 10);
      if (isNaN(parsedAdminId)) {
        res.status(400).json({ message: 'Invalid admin ID format' });
        return;
      }

      const admin = await prisma.admin.findUnique({
        where: { Id: parsedAdminId },
        include: { Sales: true },
      });

      if (!admin) {
        res.status(404).json({ message: 'Admin not found' });
        return;
      }

      if (isSales) {
        if (admin.Sales) {
          // ✅ Tidak lagi update CategoryId
          await prisma.sales.update({
            where: { AdminId: admin.Id },
            data: {}, // Tetap update, walau tidak ada field yang diubah
          });
        } else {
          await prisma.sales.create({
            data: { AdminId: admin.Id }, // ✅ Tidak perlu CategoryId
          });
        }
        res.status(200).json({ message: 'Admin successfully updated to sales' });
      } else {
        if (admin.Sales) {
          const hasDealerAssociation = await prisma.dealer.findFirst({
            where: { Sales: { some: { Id: admin.Sales.Id } } },
          });

          if (hasDealerAssociation) {
            res.status(400).json({
              message: 'Cannot remove sales status. This admin has associated Dealer records.',
            });
            return;
          }

          await prisma.sales.delete({ where: { AdminId: admin.Id } });
        }
        res.status(200).json({ message: 'Admin successfully updated to non-sales' });
      }
    } catch (error) {
      console.error('Error updating admin sales status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  GetListSales = async (req: Request, res: Response): Promise<void> => {
    try {
      const salesList = await prisma.sales.findMany({
        include: {
          Admin: {
            select: {
              Id: true,  // ID dari Admin
              Username: true,
              Email: true,
              Name: true,
              PhoneNumber: true,
              Address: true,
              Gender: true,
              RoleId: true,
            },
          },
        },
      });

      const formattedSalesList = salesList.map((sales) => ({
        SalesId: sales.Id, // ID dari tabel Sales
        Id: sales.Admin.Id, // ID dari Admin (sebelumnya digunakan sebagai ID utama)
        Username: sales.Admin.Username,
        Email: sales.Admin.Email,
        Name: sales.Admin.Name,
        PhoneNumber: sales.Admin.PhoneNumber,
        Address: sales.Admin.Address,
        Gender: sales.Admin.Gender,
        RoleId: sales.Admin.RoleId,
      }));

      res.status(200).json({ data: formattedSalesList });
    } catch (error) {
      console.error("Error fetching sales list:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

// Instansiasi controller agar bisa diekspor per method:
const adminController = new Admin();

export const changeAdminSalesStatus = adminController.changeAdminSalesStatus;
export const GetListSales = adminController.GetListSales;
