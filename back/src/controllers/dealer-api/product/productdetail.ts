import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const resolvePrice2 = (
  prices: any[],
  dealerId: any,
  priceCategoryId: any
) => {
  // Cari dealer specific (priority)
  const dealerSpecific = prices.find(
    p =>
      p.DealerId === dealerId &&
      p.PriceCategoryId == null &&
      (!p.WholesalePrices || p.WholesalePrices.length === 0)
  );
  // Cari price category (priority kedua)
  const byCategory = prices.find(
    p =>
      p.DealerId == null &&
      p.PriceCategoryId === priceCategoryId &&
      (!p.WholesalePrices || p.WholesalePrices.length === 0)
  );
  // Cari wholesale price jika ada
  for (const p of prices) {
    if (p.WholesalePrices?.length) {
      // Ambil semua wholesaleprice valid
      const grosir = p.WholesalePrices[0];
      return {
        NormalPrice: dealerSpecific?.Price || byCategory?.Price || 0,
        WholesalePrice: grosir.Price.Price,
        MinQtyWholesale: grosir.MinQuantity,
        MaxQtyWholesale: grosir.MaxQuantity,
      };
    }
  }
  // Kalau tidak ada grosir, tetap return normal
  return {
    NormalPrice: dealerSpecific?.Price || byCategory?.Price || 0,
    WholesalePrice: null,
    MinQtyWholesale: null,
    MaxQtyWholesale: null,
  };
};

// ✅ Fetch Product Detail by ID (Include Product Images and Part Numbers)
export const getProductDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid Product ID." });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { Id: Number(id), DeletedAt: null },
      select: {
        Id: true,
        Name: true,
        CodeName: true,
        Description: true,
        CreatedAt: true,
        ProductImage: {
          where: { DeletedAt: null },
          select: { Image: true },
        },
        PartNumber: {
          where: { DeletedAt: null },
          select: {
            Id: true,
            Name: true,
            Dash: true,
            InnerDiameter: true,
            OuterDiameter: true,
            WorkingPressure: true,
            BurstingPressure: true,
            BendingRadius: true,
            HoseWeight: true,
            CreatedAt: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.status(200).json({
      message: "Product detail fetched successfully.",
      data: product,
    });

  } catch (error) {
    console.error("Error fetching product detail:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getProductImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid Product ID." });
      return;
    }

    const productImages = await prisma.productImage.findMany({
      where: {
        ProductId: Number(id),
        DeletedAt: null,
      },
      select: {
        Id: true,
        Image: true,
        CreatedAt: true,
      },
    });

    if (!productImages.length) {
      res.status(404).json({ message: "No images found for this product." });
      return;
    }

    // Tambahkan URL lengkap gambar
    const imagesWithUrls = productImages.map((image) => ({
      ...image,
      ImageUrl: `/images/product/productimage/${image.Image}`, // Sesuaikan path sesuai struktur folder
    }));

    res.status(200).json({
      message: "Product images fetched successfully.",
      data: imagesWithUrls,
    });
  } catch (error) {
    console.error("Error fetching product images:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};


export const fetchPartNumberFromProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, userId } = req.body;

    if (!productId || isNaN(Number(productId))) {
      res.status(400).json({ message: "Invalid or missing Product ID." });
      return;
    }

    if (!userId || isNaN(Number(userId))) {
      res.status(400).json({ message: "Invalid or missing User ID." });
      return;
    }

    const parsedProductId = Number(productId);
    const parsedUserId = Number(userId);

    const product = await prisma.product.findFirst({
      where: { Id: parsedProductId },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { Id: parsedUserId },
      include: { Dealer: true },
    });

    if (!user || !user.Dealer) {
      res.status(404).json({ message: "Dealer not found for this user." });
      return;
    }

    const dealerId = user.Dealer.Id;
    const priceCategoryId = user.Dealer.PriceCategoryId;
    const resolvePrice = (
      prices: {
        Price: number;
        DealerId: number | null;
        PriceCategoryId: number | null;
        WholesalePrices: { Price: { Price: number } }[];
      }[]
    ): { price: number | null; isWholesale: boolean } => {
      for (const p of prices) {
        if (p.WholesalePrices?.length) {
          return { price: p.WholesalePrices[0].Price.Price, isWholesale: true };
        }
      }

      for (const p of prices) {
        if (p.DealerId !== null) {
          return { price: p.Price, isWholesale: false };
        }
      }

      for (const p of prices) {
        if (p.PriceCategoryId !== null) {
          return { price: p.Price, isWholesale: false };
        }
      }

      return { price: null, isWholesale: false };
    };




    const partNumbers = await prisma.partNumber.findMany({
      where: {
        ProductId: parsedProductId,
        DeletedAt: null,
      },
      select: {
        Id: true,
        Name: true,
        ItemCode: {
          where: {
            DeletedAt: null,
          },
          select: {
            Id: true,
            AllowItemCodeSelection: true,
            Name: true,
            OEM: true,
            Weight: true,
            MinOrderQuantity: true,
            OrderStep: true,
            WarehouseStocks: {
              select: {
                QtyOnHand: true,
                Warehouse: {
                  select: { Name: true }
                }
              }
            },
            Price: {
              where: { DeletedAt: null },
              select: {
                Price: true,
                DealerId: true,
                PriceCategoryId: true,
                WholesalePrices: {
                  select: {
                    Price: { select: { Price: true } },
                    MinQuantity: true,
                    MaxQuantity: true
                  }
                }
              },
              orderBy: {
                CreatedAt: "desc"
              }
            },
            ItemCodeImage: {
              where: { DeletedAt: null },
              select: { Image: true },
              take: 1,
            },
          },
        },
      },
    });




    // ✅ Tambahkan default MinOrder dan OrderStep jika null
    const withDefaults = partNumbers.map(part => ({
      ...part,
      ItemCode: part.ItemCode.map(item => ({
        ...item,
        MinOrderQuantity: item.MinOrderQuantity ?? 1,
        OrderStep: item.OrderStep ?? 1,
      })),
    }));

    if (withDefaults.length === 0) {
      res.status(404).json({ message: "No part numbers or item codes found for this product." });
      return;
    }
    type ItemCodeWithStock = {
      WarehouseStocks: {
        QtyOnHand: number;
        Warehouse: {
          Name: string | null;
        } | null;
      }[];
    };

    const resolveStockPerWarehouse = (itemCodes: any[]) => {
      // Kumpulkan data stok per warehouse untuk setiap itemcode
      // Output: [{ Warehouse: 'Jakarta', QtyOnHand: 20 }, { Warehouse: 'Surabaya', QtyOnHand: 15 }, ...]
      const stockList: { warehouse: string, qty: number }[] = [];
      for (const ic of itemCodes) {
        for (const ws of ic.WarehouseStocks || []) {
          stockList.push({
            warehouse: ws.Warehouse?.Name ?? 'Unknown',
            qty: ws.QtyOnHand ?? 0
          });
        }
      }
      return stockList;
    };



    const result: any[] = [];

    withDefaults.forEach(part => {
      const allItemCodes = part.ItemCode;
      const itemCodeTrue = allItemCodes.filter(ic => ic.AllowItemCodeSelection);
      const itemCodeFalse = allItemCodes.filter(ic => !ic.AllowItemCodeSelection);

      // --- 1. Jika ADA itemCodeTrue, tampilkan itemcode true satu per satu ---
      for (const ic of itemCodeTrue) {
        // >>>> DI SINI <<<<
        // Ganti dari resolvePrice(ic.Price) menjadi resolvePrice2(ic.Price, dealerId, priceCategoryId)
        const resolved = resolvePrice2(ic.Price, dealerId, priceCategoryId);
        result.push({
          IdPartNumber: part.Id,
          Name: ic.Name,
          AllowItemCodeSelection: true,
          IdItemCode: ic.Id,
          PriceResolved: resolved.NormalPrice ?? 0,
          NormalPrice: resolved.NormalPrice ?? 0,
          WholesalePrice: resolved.WholesalePrice ?? null,
          MinQtyWholesale: resolved.MinQtyWholesale ?? null,
          MaxQtyWholesale: resolved.MaxQtyWholesale ?? null,
          MinOrderQuantity: ic.MinOrderQuantity,
          OrderStep: ic.OrderStep,
          IsWholesalePrice: resolvePrice(ic.Price).isWholesale,
          StockResolved: (ic.WarehouseStocks || []).map(ws => ({
            warehouse: ws.Warehouse?.Name ?? 'Unknown',
            qty: ws.QtyOnHand ?? 0
          }))
        });
      }

      // --- 2. Jika ADA itemCodeFalse, gabungkan/jadikan satu partnumber untuk semua itemcode false (akumulasi warehouse) ---
      if (itemCodeFalse.length > 0) {
        // Akumulasi stok per warehouse
        const stockMap: { [warehouse: string]: number } = {};
        itemCodeFalse.forEach(ic => {
          (ic.WarehouseStocks || []).forEach(ws => {
            const name = ws.Warehouse?.Name ?? 'Unknown';
            stockMap[name] = (stockMap[name] ?? 0) + (ws.QtyOnHand ?? 0);
          });
        });
        const stockResolved = Object.entries(stockMap).map(([warehouse, qty]) => ({
          warehouse, qty
        }));

        // Pilih itemcode paling optimal (algoritma mirip addUpdateCart, harga valid + stok valid + dsb)
        // 1. Filter harga valid
        const validItemCodes = itemCodeFalse.filter(item =>
          item.Price.some(p =>
            (p.DealerId === dealerId && p.PriceCategoryId == null) ||
            (p.DealerId == null && p.PriceCategoryId === priceCategoryId) ||
            (p.WholesalePrices && p.WholesalePrices.length > 0)
          )
        );
        // 2. Pilih stok terbanyak
        validItemCodes.sort((a, b) => {
          const stokA = (a.WarehouseStocks || []).reduce((s, ws) => s + (ws.QtyOnHand ?? 0), 0);
          const stokB = (b.WarehouseStocks || []).reduce((s, ws) => s + (ws.QtyOnHand ?? 0), 0);
          return stokB - stokA;
        });
        // 3. Pakai itemcode pertama hasil sort sebagai representative (untuk IdItemCode, harga, minOrder, dsb)
        const best = validItemCodes[0] || itemCodeFalse[0];
        const resolved = resolvePrice2(best.Price, dealerId, priceCategoryId);
        result.push({
          IdPartNumber: part.Id,
          Name: part.Name,
          AllowItemCodeSelection: false,
          IdItemCode: best.Id,
          PriceResolved: resolved.NormalPrice ?? 0,
          NormalPrice: resolved.NormalPrice ?? 0,
          WholesalePrice: resolved.WholesalePrice ?? null,
          MinQtyWholesale: resolved.MinQtyWholesale ?? null,
          MaxQtyWholesale: resolved.MaxQtyWholesale ?? null,
          MinOrderQuantity: best.MinOrderQuantity,
          OrderStep: best.OrderStep,
          IsWholesalePrice: resolvePrice(best.Price).isWholesale,
          StockResolved: stockResolved // sudah akumulasi semua itemcode di partnumber
        });
      }
    });




    res.status(200).json({
      message: "Part Numbers and Item Codes with Prices fetched successfully.",
      data: result,
    });


  } catch (error) {
    console.error("Error fetching part numbers and item codes:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

