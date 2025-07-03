import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class Dealer {
  validateDealerInput = (input: any) => {
    if (!input.CompanyName || input.CompanyName.length > 100) return 'CompanyName maksimal 100 karakter';
    if (input.Region && input.Region.length > 50) return 'Region maksimal 50 karakter';
    if (!input.StoreCode || input.StoreCode.length > 30) return 'StoreCode maksimal 30 karakter';
    if (input.Address && input.Address.length > 150) return 'Address maksimal 150 karakter';
    if (input.PhoneNumber && input.PhoneNumber.length > 20) return 'PhoneNumber maksimal 20 karakter';
    if (input.fax && input.fax.length > 20) return 'Fax maksimal 20 karakter';
    return null;
  };
  createDealer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        CompanyName,
        Region,
        PriceCategoryId,
        StoreCode,
        SalesIds,
      } = req.body;

      const errorMsg = this.validateDealerInput(req.body);
      if (errorMsg) {
        res.status(400).json({ message: errorMsg });
        return;
      }

      if (!StoreCode || StoreCode.trim() === "") {
        res.status(400).json({ message: "StoreCode is required." });
        return;
      }

      const validSalesIds: number[] = Array.isArray(SalesIds)
        ? SalesIds.map((id: any) => Number(id)).filter((id) => !isNaN(id))
        : SalesIds !== undefined && SalesIds !== null
          ? [Number(SalesIds)].filter((id) => !isNaN(id))
          : [];

      if (validSalesIds.length > 0) {
        const existingSales = await prisma.sales.findMany({
          where: { Id: { in: validSalesIds } },
          select: { Id: true }
        });

        const existingIds = existingSales.map(s => s.Id);
        const missingIds = validSalesIds.filter(id => !existingIds.includes(id));

        if (missingIds.length > 0) {
          res.status(400).json({ message: `Sales ID(s) not found: ${missingIds.join(", ")}` });
          return;
        }
      }

      const newDealer = await prisma.dealer.create({
        data: {
          CompanyName,
          Region,
          StoreCode: StoreCode.trim(),
          PriceCategoryId: PriceCategoryId ? Number(PriceCategoryId) : null,
          Sales: validSalesIds.length > 0
            ? { connect: validSalesIds.map((id) => ({ Id: id })) }
            : undefined,
        },
      });

      res.status(201).json({ message: "Dealer created successfully", data: newDealer });
    } catch (error) {
      console.error("Error creating dealer:", error);
      next(error);
    }
  };

  getDealers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1 } = req.query;
      const take = 30;
      const skip = (Number(page) - 1) * take;

      const dealers = await prisma.dealer.findMany({
        skip,
        take,
        where: {
          DeletedAt: null,
        },
        include: {
          User: true,
          PriceCategory: true,
          Sales: true,
        },
        orderBy: { CreatedAt: "desc" },
      });

      const totalCount = await prisma.dealer.count({
        where: {
          DeletedAt: null,
        },
      });

      const enrichedDealers = dealers.map((dealer) => ({
        ...dealer,
        PriceCategoryName: dealer.PriceCategory ? dealer.PriceCategory.Name : "No Price Category",
      }));

      res.status(200).json({
        data: enrichedDealers,
        meta: {
          total: totalCount,
          page: Number(page),
          pages: Math.ceil(totalCount / take),
        },
      });
    } catch (error) {
      console.error("Error fetching dealers:", error);
      next(error);
    }
  };

  getDealerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Id } = req.params;


      const dealerId = Number(Id);

      const dealer = await prisma.dealer.findUnique({
        where: { Id: dealerId },
        include: {
          User: true,
          PriceCategory: true,
          Sales: {
            include: {
              Admin: {
                select: { Name: true, Email: true }
              }
            }
          }
        }
      });

      if (!dealer) {
        res.status(404).json({ message: "Dealer not found." });
        return;
      }

      const enrichedDealer = {
        ...dealer,
        PriceCategoryName: dealer.PriceCategory ? dealer.PriceCategory.Name : "No Price Category",
        Sales: dealer.Sales?.map(s => ({
          Id: s.Id,
          AdminId: s.AdminId,
          Name: s.Admin?.Name ?? null,
          Email: s.Admin?.Email ?? null,   // HANYA Name saja
        })) ?? [],
      };

      res.status(200).json({ data: enrichedDealer });
    } catch (error) {
      console.error("Error fetching dealer by ID:", error);
      next(error);
    }
  };

  getAllFetchPriceCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const priceCategories = await prisma.priceCategory.findMany({
        include: {
          Price: true,
          Dealer: true,
        },
      });

      res.status(200).json({ data: priceCategories });
    } catch (error) {
      console.error("Error fetching PriceCategories:", error);
      next(error);
    }
  };

  updateDealer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Id } = req.params;
      const { CompanyName, Region, PriceCategoryId, SalesIds, UserIds, StoreCode } = req.body;
      console.log("UPDATE DEALER BODY:", req.body);

      const errorMsg = this.validateDealerInput(req.body);
      if (errorMsg) {
        res.status(400).json({ message: errorMsg });
        return;
      }

      if (!StoreCode || StoreCode.trim() === "") {
        res.status(400).json({ message: "StoreCode is required for update." });
        return;
      }

      const dealerId: number = Number(Id);
      if (isNaN(dealerId)) {
        res.status(400).json({ message: "Invalid dealer ID" });
        return;
      }

      const dealerExists = await prisma.dealer.findUnique({
        where: { Id: dealerId },
      });

      if (!dealerExists) {
        res.status(404).json({ message: "Dealer not found" });
        return;
      }

      const validSalesIds: number[] = (SalesIds || [])
        .filter((id: any): id is number => id !== null && id !== undefined && !isNaN(Number(id)))
        .map((id: any) => Number(id));

      if (validSalesIds.length > 0) {
        const validSales = await prisma.sales.findMany({
          where: { Id: { in: validSalesIds } },
        });

        if (validSales.length !== validSalesIds.length) {
          res.status(400).json({ message: "Some SalesIds do not exist" });
          return;
        }
      }

      const validUserIds: number[] = (UserIds || [])
        .filter((id: any): id is number => id !== null && id !== undefined && !isNaN(Number(id)))
        .map((id: any) => Number(id));

      const updatedDealer = await prisma.dealer.update({
        where: { Id: dealerId },
        data: {
          CompanyName,
          Region,
          StoreCode: StoreCode.trim(),
          PriceCategoryId: PriceCategoryId ? Number(PriceCategoryId) : null,
          Sales: { set: validSalesIds.map((id) => ({ Id: id })) }, // kalau array kosong, set: [] = unassign all
          User: { set: validUserIds.map((id) => ({ Id: id })) },
        },
      });

      res.status(200).json({ message: "Dealer updated successfully", data: updatedDealer });
    } catch (error) {
      console.error("Error updating dealer:", error);
      next(error);
    }
  };

  deleteDealer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Id } = req.params;
      const dealerId = Number(Id);

      const dealer = await prisma.dealer.findUnique({
        where: { Id: dealerId },
      });

      if (!dealer) {
        res.status(404).json({ message: "Dealer tidak ditemukan." });
        return;
      }

      await prisma.user.updateMany({
        where: { DealerId: dealerId },
        data: { DealerId: null },
      });

      await prisma.dealer.update({
        where: { Id: dealerId },
        data: { DeletedAt: new Date() },
      });

      res.status(200).json({ message: "Dealer berhasil dinonaktifkan." });
    } catch (error) {
      console.error("Error saat menonaktifkan dealer:", error);
      next(error);
    }
  };
}

const dealerController = new Dealer();

export const createDealer = dealerController.createDealer;
export const getDealers = dealerController.getDealers;
export const getDealerById = dealerController.getDealerById;
export const getAllFetchPriceCategories = dealerController.getAllFetchPriceCategories;
export const updateDealer = dealerController.updateDealer;
export const deleteDealer = dealerController.deleteDealer;

export default {
  createDealer,
  getDealers,
  getDealerById,
  getAllFetchPriceCategories,
  updateDealer,
  deleteDealer,
};
