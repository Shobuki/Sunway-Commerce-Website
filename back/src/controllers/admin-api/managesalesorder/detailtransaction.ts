import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const fetchRelatedItemCodes = async (req: Request, res: Response) => {
  try {
    const { ItemCodeId, query } = req.body;

    // 🔁 Ubah urutan pengecekan: query lebih prioritas
    if (query && query.trim() !== "") {
      const searchResults = await prisma.itemCode.findMany({
        where: {
          Name: {
            contains: query,
            mode: "insensitive"
          }
        },
        select: {
          Id: true,
          Name: true,
          OEM: true,
          Weight: true,
          Price: {
            where: {
              DeletedAt: null
            },
            orderBy: {
              CreatedAt: "desc"
            },
            take: 1, // Ambil 1 harga terbaru
            select: {
              Price: true
            }
          },
          WarehouseStocks: {
            where: {
              DeletedAt: null
            },
            select: {
              QtyOnHand: true
            }
          },
          ItemCodeImage: {
            select: {
              Image: true
            }
          }
        }
      });

      res.status(200).json({
        message: "ItemCodes fetched by search query.",
        data: searchResults
      });
      return;
    }

    // Hanya jika tidak ada query, validasi ItemCodeId
    if (!ItemCodeId) {
      res.status(400).json({ message: "ItemCodeId is required if no query is provided" });
      return;
    }

    const item = await prisma.itemCode.findUnique({
      where: { Id: ItemCodeId },
      select: { PartNumberId: true }
    });

    if (!item || item.PartNumberId === null) {
      res.status(404).json({ message: "ItemCode or related PartNumber not found" });
      return;
    }

    const relatedItems = await prisma.itemCode.findMany({
      where: {
        PartNumberId: item.PartNumberId
      },
      select: {
        Id: true,
        Name: true,
        OEM: true,
        Weight: true,
        Price: {
          where: {
            DeletedAt: null
          },
          orderBy: {
            CreatedAt: "desc"
          },
          take: 1,
          select: {
            Price: true
          }
        },
        WarehouseStocks: {
          where: {
            DeletedAt: null
          },
          select: {
            QtyOnHand: true
          }
        },
        ItemCodeImage: {
          select: {
            Image: true
          }
        }
      }
    });

    res.status(200).json({
      message: "Related ItemCodes fetched by PartNumberId.",
      data: relatedItems
    });
  } catch (error) {
    console.error("Error in fetchRelatedItemCodes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
