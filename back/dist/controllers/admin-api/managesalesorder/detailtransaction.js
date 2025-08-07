"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRelatedItemCodes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const fetchRelatedItemCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ItemCodeId, query } = req.body;
        // 🔁 Ubah urutan pengecekan: query lebih prioritas
        if (query && query.trim() !== "") {
            const searchResults = yield prisma.itemCode.findMany({
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
        const item = yield prisma.itemCode.findUnique({
            where: { Id: ItemCodeId },
            select: { PartNumberId: true }
        });
        if (!item || item.PartNumberId === null) {
            res.status(404).json({ message: "ItemCode or related PartNumber not found" });
            return;
        }
        const relatedItems = yield prisma.itemCode.findMany({
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
    }
    catch (error) {
        console.error("Error in fetchRelatedItemCodes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.fetchRelatedItemCodes = fetchRelatedItemCodes;
