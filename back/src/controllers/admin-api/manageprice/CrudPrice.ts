import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Dealer {
  Id: number;
  CompanyName: string | null;
}

interface Price {
  Price: number;
  Dealer: string | null;
}

interface PriceCategory {
  PriceCategory: string;
  Prices: Price[];
  Dealers: Dealer[];
}

interface ItemCode {
  ItemCode: string;
  PriceCategories: Record<string, PriceCategory>;
}

class Price {
  getItemCodeWithPriceCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await prisma.product.findMany({
        include: {
          PartNumber: {
            include: {
              ItemCode: {
                select: {
                  Id: true,
                  Name: true,
                  Price: {
                    where: { DeletedAt: null },
                    select: {
                      Id: true,
                      Price: true,
                      PriceCategory: {
                        select: {
                          Id: true,
                          Name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      res.status(200).json({ data: products });
    } catch (error) {
      console.error("Error fetching products with price categories:", error);
      next(error);
    }
  };

  getPricesByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { itemCodeId } = req.params;

      const prices = await prisma.price.findMany({
        where: {
          ItemCodeId: Number(itemCodeId),
          DeletedAt: null,
        },
        include: {
          ItemCode: { select: { Name: true } },
          Dealer: { select: { Id: true, CompanyName: true } },
          PriceCategory: { select: { Id: true, Name: true } },
          // hanya ambil wholesalePrice yang DeletedAt: null
          WholesalePrices: { where: { DeletedAt: null } },
        },
      });

      const structuredData: Record<string, any> = {};

      prices.forEach((price) => {
        const itemCodeName = price.ItemCode?.Name || 'Unknown Item';
        const dealerName = price.Dealer?.CompanyName || null;

        // Inisialisasi ItemCode
        if (!structuredData[itemCodeName]) {
          structuredData[itemCodeName] = {
            ItemCode: itemCodeName,
            PriceCategories: {},
          };
        }

        // ⏩ Wholesale Prices
        if (price.WholesalePrices && price.WholesalePrices.length > 0) {
          const categoryName = "Wholesale Price";

          if (!structuredData[itemCodeName].PriceCategories[categoryName]) {
            structuredData[itemCodeName].PriceCategories[categoryName] = {
              PriceCategory: categoryName,
              Prices: [],
            };
          }

          price.WholesalePrices.forEach((wholesalePrice) => {
            structuredData[itemCodeName].PriceCategories[categoryName].Prices.push({
              Id: price.Id,
              Dealer: dealerName,
              Price: price.Price,
              MinQuantity: wholesalePrice.MinQuantity,
              MaxQuantity: wholesalePrice.MaxQuantity,
            });
          });
        }

        // ⏩ Custom Dealer Specific Price (Tanpa Wholesale)
        else if (price.Dealer && price.WholesalePrices.length === 0) {
          const categoryName = "Custom Price";

          if (!structuredData[itemCodeName].PriceCategories[categoryName]) {
            structuredData[itemCodeName].PriceCategories[categoryName] = {
              PriceCategory: categoryName,
              Prices: [],
            };
          }

          structuredData[itemCodeName].PriceCategories[categoryName].Prices.push({
            Id: price.Id,
            Dealer: dealerName,
            Price: price.Price,
          });
        }

        // ⏩ Default Price (Tanpa Dealer dan Tanpa Wholesale)
        else if (!price.Dealer && price.WholesalePrices.length === 0) {
          const priceCategoryName = price.PriceCategory?.Name || 'Unknown Price';

          if (!structuredData[itemCodeName].PriceCategories[priceCategoryName]) {
            structuredData[itemCodeName].PriceCategories[priceCategoryName] = {
              PriceCategory: priceCategoryName,
              Prices: [],
            };
          }

          structuredData[itemCodeName].PriceCategories[priceCategoryName].Prices.push({
            Id: price.Id,
            Dealer: null,
            Price: price.Price,
          });
        }
      });

      const responseArray = Object.values(structuredData).map((item: any) => ({
        ItemCode: item.ItemCode,
        PriceCategories: Object.values(item.PriceCategories),
      }));

      res.status(200).json({ data: responseArray });
    } catch (error) {
      console.error('Error fetching prices by category and item code:', error);
      next(error);
    }
  };

  validateCreateOrUpdatePriceCategory = (input: any) => {
    if (!input.ItemCodeId || isNaN(Number(input.ItemCodeId))) return "ItemCodeId wajib diisi (angka)";
    if (!input.PriceCategoryId || isNaN(Number(input.PriceCategoryId))) return "PriceCategoryId wajib diisi (angka)";
    if (input.Price === undefined || input.Price === null || isNaN(Number(input.Price)))
      return "Price wajib diisi (angka)";
    if (Number(input.Price) < 0) return "Price tidak boleh negatif";
    if (input.Price > 100_000_000_000) return "Price maksimal 100 miliar";
    return null;
  };

  createOrUpdatePriceCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

      // ✅ Validasi input di sini
      const errorMsg = this.validateCreateOrUpdatePriceCategory(req.body);
      if (errorMsg) {
        res.status(400).json({ message: errorMsg });
        return;
      }
      const { ItemCodeId, PriceCategoryId, Price } = req.body;

      if (!ItemCodeId || !PriceCategoryId || Price === undefined) {
        res.status(400).json({ message: "ItemCodeId, PriceCategoryId, and Price are required." });
        return;
      }

      const existingPrice = await prisma.price.findFirst({
        where: {
          ItemCodeId: Number(ItemCodeId),
          PriceCategoryId: Number(PriceCategoryId),
          DealerId: null,
          DeletedAt: null,
        },
      });

      if (existingPrice) {
        const updatedPrice = await prisma.price.update({
          where: { Id: existingPrice.Id },
          data: { Price: Number(Price) },
        });

        res.status(200).json({ message: "Price updated successfully", data: updatedPrice });
      } else {
        const newPrice = await prisma.price.create({
          data: {
            Price: Number(Price),
            ItemCodeId: Number(ItemCodeId),
            PriceCategoryId: Number(PriceCategoryId),
            DealerId: null,
          },
        });

        res.status(201).json({ message: "Price created successfully", data: newPrice });
      }
    } catch (error) {
      console.error("Error creating/updating price:", error);
      next(error);
    }
  };

  getDealersFetchPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  validateDealerSpecificPriceInput = (input: any) => {
    if (!input.ItemCodeId || isNaN(Number(input.ItemCodeId))) return "ItemCodeId wajib diisi (angka)";
    if (!input.DealerId || isNaN(Number(input.DealerId))) return "DealerId wajib diisi (angka)";
    if (input.Price === undefined || input.Price === null || isNaN(Number(input.Price))) return "Price wajib diisi (angka)";
    if (Number(input.Price) < 0) return "Price tidak boleh negatif";
    if (input.Price > 100_000_000_000) return "Price maksimal 100 miliar";
    if (input.MinQuantity !== undefined || input.MaxQuantity !== undefined) return "Gunakan endpoint /prices/wholesale untuk harga grosir";
    return null;
  };

  createDealerSpecificPrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errorMsg = this.validateDealerSpecificPriceInput(req.body);
      if (errorMsg) {
        res.status(400).json({ message: errorMsg });
        return;
      }
      const { ItemCodeId, DealerId, Price, MinQuantity, MaxQuantity } = req.body;

      if (MinQuantity !== undefined || MaxQuantity !== undefined) {
        res.status(400).json({
          message: "Use /prices/wholesale for wholesale prices.",
        });
        return;
      }

      if (!ItemCodeId || !DealerId || Price === undefined) {
        res.status(400).json({ message: "ItemCodeId, DealerId, and Price are required." });
        return;
      }

      // *** HAPUS pengecekan existingPrice ini ***
      // const existingPrice = await prisma.price.findFirst({
      //   where: {
      //     ItemCodeId: Number(ItemCodeId),
      //     DealerId: Number(DealerId),
      //     DeletedAt: null,
      //   },
      // });
      // if (existingPrice) {
      //   res.status(403).json({ message: "A price for this dealer already exists." });
      //   return;
      // }

      // Cek hanya price specific (tanpa wholesale)
      const existingSpecific = await prisma.price.findFirst({
        where: {
          ItemCodeId: Number(ItemCodeId),
          DealerId: Number(DealerId),
          DeletedAt: null,
          WholesalePrices: { none: {} }, // TIDAK ADA data wholesale
        },
      });
      if (existingSpecific) {
        res.status(403).json({ message: "Specific price untuk dealer dan item code ini sudah ada." });
        return;
      }

      // Jika tidak ada, boleh create
      const newPrice = await prisma.price.create({
        data: {
          ItemCodeId: Number(ItemCodeId),
          DealerId: Number(DealerId),
          Price: Number(Price),
        },
      });
      res.status(201).json({ message: "Dealer-specific price created successfully", data: newPrice });
    } catch (error) {
      console.error("❌ Error creating dealer-specific price:", error);
      next(error);
    }
  };

  validateWholesalePriceInput = (input: any) => {
    if (!input.ItemCodeId || isNaN(Number(input.ItemCodeId))) return "ItemCodeId wajib diisi (angka)";
    if (!input.DealerId || isNaN(Number(input.DealerId))) return "DealerId wajib diisi (angka)";
    if (input.Price === undefined || input.Price === null || isNaN(Number(input.Price))) return "Price wajib diisi (angka)";
    if (Number(input.Price) < 0) return "Price tidak boleh negatif";
    if (input.Price > 100_000_000_000) return "Price maksimal 100 miliar";
    if (!input.MinQuantity || isNaN(Number(input.MinQuantity))) return "MinQuantity wajib diisi (angka)";
    if (!input.MaxQuantity || isNaN(Number(input.MaxQuantity))) return "MaxQuantity wajib diisi (angka)";
    if (Number(input.MinQuantity) < 0) return "MinQuantity tidak boleh negatif";
    if (Number(input.MaxQuantity) < Number(input.MinQuantity)) return "MaxQuantity harus lebih besar atau sama dengan MinQuantity";
    return null;
  };


  createWholesalePrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errorMsg = this.validateWholesalePriceInput(req.body);
      if (errorMsg) {
        res.status(400).json({ message: errorMsg });
        return;
      }
      const { ItemCodeId, DealerId, Price, MinQuantity, MaxQuantity } = req.body;

      if (!ItemCodeId || !DealerId || Price === undefined || !MinQuantity || !MaxQuantity) {
        res.status(400).json({
          message: "ItemCodeId, DealerId, Price, MinQuantity, and MaxQuantity are required.",
        });
        return;
      }

      // CUKUP CEK SEKALI SAJA DISINI
      const existingWholesale = await prisma.price.findFirst({
        where: {
          ItemCodeId: Number(ItemCodeId),
          DealerId: Number(DealerId),
          PriceCategoryId: null,
          DeletedAt: null,
          WholesalePrices: {
            some: {
              DeletedAt: null,
            },
          },
        },
      });

      if (existingWholesale) {
        res.status(403).json({
          message: "A wholesale price for this dealer and item already exists.",
        });
        return;
      }

      // lanjut create price
      const newPrice = await prisma.price.create({
        data: {
          ItemCodeId: Number(ItemCodeId),
          DealerId: Number(DealerId),
          Price: Number(Price),
          PriceCategoryId: null,
        },
      });

      const newWholesalePrice = await prisma.wholesalePrice.create({
        data: {
          PriceId: newPrice.Id,
          MinQuantity: Number(MinQuantity),
          MaxQuantity: Number(MaxQuantity),
        },
      });

      res.status(201).json({
        message: "Wholesale price created successfully.",
        data: {
          price: newPrice,
          wholesalePrice: newWholesalePrice,
        },
      });
    } catch (error) {
      console.error("❌ Error creating wholesale price:", error);
      next(error);
    }
  };

  validateUpdatePriceInput = (input: any) => {
    if (!input.Id || isNaN(Number(input.Id))) return "Id wajib diisi (angka)";
    if (input.Price === undefined || input.Price === null || isNaN(Number(input.Price))) return "Price wajib diisi (angka)";
    const price = Number(input.Price);
    if (price < 0) return "Price tidak boleh negatif";
    if (price > 100_000_000_000) return "Price maksimal 100 miliar";
    if (input.MinQuantity !== undefined && input.MaxQuantity !== undefined) {
      if (isNaN(Number(input.MinQuantity)) || isNaN(Number(input.MaxQuantity))) return "Min/MaxQuantity wajib angka";
      if (Number(input.MinQuantity) < 0) return "MinQuantity tidak boleh negatif";
      if (Number(input.MaxQuantity) < Number(input.MinQuantity)) return "MaxQuantity harus lebih besar atau sama dengan MinQuantity";
    }
    return null;
  };


  updatePrice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // ✅ Tambahkan validasi di awal
      const errorMsg = this.validateUpdatePriceInput(req.body);
      if (errorMsg) {
        res.status(400).json({ message: errorMsg });
        return;
      }

      const { Id, Price, MinQuantity, MaxQuantity } = req.body;

      if (!Id || Price === undefined) {
        res.status(400).json({ message: "Id dan Price harus disertakan" });
        return;
      }

      const existingPrice = await prisma.price.findUnique({
        where: { Id: Number(Id) },
      });

      if (!existingPrice) {
        res.status(404).json({ message: "Data harga tidak ditemukan" });
        return;
      }

      if (MinQuantity !== undefined && MaxQuantity !== undefined) {
        const existingWholesale = await prisma.wholesalePrice.findFirst({
          where: { PriceId: Number(Id), DeletedAt: null },
        });

        if (!existingWholesale) {
          res.status(404).json({ message: "Wholesale price tidak ditemukan." });
          return;
        }

        const updatedWholesale = await prisma.wholesalePrice.update({
          where: { Id: existingWholesale.Id },
          data: {
            MinQuantity: Number(MinQuantity),
            MaxQuantity: Number(MaxQuantity),
          },
        });

        const updatedPrice = await prisma.price.update({
          where: { Id: Number(Id) },
          data: { Price: Number(Price) },
        });

        res.status(200).json({
          message: "Harga wholesale berhasil diperbarui",
          data: {
            price: updatedPrice,
            wholesale: updatedWholesale,
          },
        });
      } else {
        const updatedPrice = await prisma.price.update({
          where: { Id: Number(Id) },
          data: { Price: Number(Price) },
        });

        res.status(200).json({
          message: "Harga berhasil diperbarui",
          data: updatedPrice,
        });
      }
    } catch (error) {
      console.error("Error updating price:", error);
      next(error);
    }
  };

  deletePrice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { Id } = req.params;

      // 1. Soft delete price
      await prisma.price.update({
        where: { Id: Number(Id) },
        data: { DeletedAt: new Date() },
      });

      // 2. Soft delete semua wholesalePrice yang terkait dengan price ini
      await prisma.wholesalePrice.updateMany({
        where: { PriceId: Number(Id), DeletedAt: null },
        data: { DeletedAt: new Date() },
      });

      res.status(200).json({ message: "Price & related wholesale prices deleted successfully" });
    } catch (error) {
      console.error("Error deleting price:", error);
      next(error);
    }
  };
}

const priceController = new Price();

export const getItemCodeWithPriceCategory = priceController.getItemCodeWithPriceCategory;
export const getPricesByCategory = priceController.getPricesByCategory;
export const getDealersFetchPrice = priceController.getDealersFetchPrice;
export const createOrUpdatePriceCategory = priceController.createOrUpdatePriceCategory;
export const createDealerSpecificPrice = priceController.createDealerSpecificPrice;
export const createWholesalePrice = priceController.createWholesalePrice;
export const updatePrice = priceController.updatePrice;
export const deletePrice = priceController.deletePrice;

export default {
  getItemCodeWithPriceCategory,
  getPricesByCategory,
  getDealersFetchPrice,
  createOrUpdatePriceCategory,
  createDealerSpecificPrice,
  createWholesalePrice,
  updatePrice,
  deletePrice,
};
