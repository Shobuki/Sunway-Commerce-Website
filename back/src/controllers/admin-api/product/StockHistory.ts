import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NOTE_FILTER_OPTIONS = [
  { value: "Stock nulled: ItemCode+Warehouse not found in Excel", label: "Stock nulled: ItemCode+Warehouse not found in Excel" },
  { value: "Stock nulled: ItemCode not found in Excel", label: "Stock nulled: ItemCode not found in Excel" },
  { value: "QtyPO updated from Excel", label: "QtyPO updated from Excel" },
  { value: "QtyPO changed from", label: "QtyPO changed from ..." },
  { value: "Created from Excel upload", label: "Created from Excel upload" }
];
class StockHistory {

  getStockHistory = async (req: Request, res: Response) => {
    try {
      const {
        page = "1",
        perPage = "40",
        adminId,
        itemCodeId,
        productId,
        productCategoryId,
        q,
        type,
        startDate,
        endDate,
        sortBy = "UpdatedAt",
        sortDir = "desc",
        note,
      } = req.query;

      const rawStartDate = startDate as string;
      const rawEndDate = endDate as string;

      let startDateObj: Date | undefined = undefined;
      let endDateObj: Date | undefined = undefined;

      if (rawStartDate) {
        startDateObj = new Date(rawStartDate + "T00:00:00");
      }
      if (rawEndDate) {
        endDateObj = new Date(rawEndDate + "T23:59:59.999");
      }

      // Pagination
      const currentPage = parseInt(page as string) || 1;
      const limit = Math.min(parseInt(perPage as string) || 40, 100);
      const offset = (currentPage - 1) * limit;

      const filters: any = {
        ItemCode: { DeletedAt: null },
        ...(adminId ? { AdminId: Number(adminId) } : {}),
        ...(itemCodeId ? { ItemCodeId: Number(itemCodeId) } : {}),
        ...(startDateObj || endDateObj
          ? {
            UpdatedAt: {
              ...(startDateObj ? { gte: startDateObj } : {}),
              ...(endDateObj ? { lte: endDateObj } : {}),
            },
          }
          : {}),
      };

      // Filter by change type (manual/excel)
      let where = {
        ...filters,
      };

      if (note) {
  where = { ...where, Note: { equals: note } };
} else if (type === "manual") {
  where = { ...where, Note: { contains: "manual" } };
} else if (type === "excel") {
  where = {
    ...where,
    OR: [
      { Note: { startsWith: "Stock nulled: ItemCode+Warehouse not found in Excel" } },
      { Note: { startsWith: "Stock nulled: ItemCode not found in Excel" } },
      { Note: { startsWith: "QtyPO updated from Excel" } },
      { Note: { startsWith: "QtyPO changed from" } },
      { Note: { startsWith: "Created from Excel upload" } }
    ]
  };
}

      // Filter by ProductId (via PartNumber)
      if (productId) {
        filters.ItemCode.PartNumber = {
          ProductId: Number(productId),
          DeletedAt: null,
        };
      }

      // Filter by ProductCategoryId
      if (productCategoryId) {
        const prodInCat = await prisma.productCategory.findUnique({
          where: { Id: Number(productCategoryId) },
          include: { Products: { select: { Id: true } } },
        });
        const productIds = prodInCat?.Products?.map((p) => p.Id) ?? [];
        filters.ItemCode.PartNumber = {
          ProductId: { in: productIds },
          DeletedAt: null,
        };
      }

      // Search q (itemcode, product, admin, note)
      let ORsearch: any[] = [];
      if (q) {
        const qstr = q as string;
        ORsearch = [
          { ItemCode: { Name: { contains: qstr, mode: "insensitive" } } },
          { Note: { contains: qstr, mode: "insensitive" } },
          { Admin: { Username: { contains: qstr, mode: "insensitive" } } },
          { Admin: { Name: { contains: qstr, mode: "insensitive" } } },
          { ItemCode: { PartNumber: { Product: { Name: { contains: qstr, mode: "insensitive" } } } } },
        ];
      }

      // Query
      const [totalData, histories] = await Promise.all([
        prisma.stockHistory.count({ where }),
        prisma.stockHistory.findMany({
          where,
          include: {
            Admin: { select: { Id: true, Username: true, Name: true } },
            ItemCode: {
              select: {
                Id: true,
                Name: true,
                PartNumber: {
                  select: {
                    Id: true,
                    Name: true,
                    Product: {
                      select: {
                        Id: true,
                        Name: true,
                        ProductCategory: {
                          select: { Id: true, Name: true },
                        },
                      },
                    },
                  },
                },
              },
            },
            WarehouseStock: {
              select: {
                Id: true,
                QtyOnHand: true,
                Warehouse: { select: { Id: true, Name: true, BusinessUnit: true } },
              },
            },
            UploadLog: {
              select: { Id: true, FilePath: true, CreatedAt: true },
            },
          },
          orderBy: { [sortBy as string]: sortDir === "asc" ? "asc" : "desc" },
          take: limit,
          skip: offset,
        }),
      ]);

      // Format output as required (hirarki)
      const result = histories.map((row) => ({
        Id: row.Id,
        UpdatedAt: row.UpdatedAt,
        QtyBefore: row.QtyBefore,
        QtyAfter: row.QtyAfter,
        Note: row.Note,
        ChangeType: row.UploadLogId
          ? "excel"
          : row.Note?.toLowerCase().includes("manual")
            ? "manual"
            : "unknown",
        Admin: row.Admin
          ? {
            Id: row.Admin.Id,
            Username: row.Admin.Username,
            Name: row.Admin.Name,
          }
          : null,
        ProductCategory:
          row.ItemCode?.PartNumber?.Product?.ProductCategory?.map((cat) => ({
            Id: cat.Id,
            Name: cat.Name,
          })) ?? [],
        Product: row.ItemCode?.PartNumber?.Product
          ? {
            Id: row.ItemCode.PartNumber.Product.Id,
            Name: row.ItemCode.PartNumber.Product.Name,
          }
          : null,
        PartNumber: row.ItemCode?.PartNumber
          ? {
            Id: row.ItemCode.PartNumber.Id,
            Name: row.ItemCode.PartNumber.Name,
          }
          : null,
        ItemCode: row.ItemCode
          ? {
            Id: row.ItemCode.Id,
            Name: row.ItemCode.Name,
          }
          : null,
        Warehouse: row.WarehouseStock?.Warehouse
          ? {
            Id: row.WarehouseStock.Warehouse.Id,
            Name: row.WarehouseStock.Warehouse.Name,
            BusinessUnit: row.WarehouseStock.Warehouse.BusinessUnit,
          }
          : null,
        QtyOnHand: row.WarehouseStock?.QtyOnHand ?? null,
        UploadLog: row.UploadLog
          ? {
            Id: row.UploadLog.Id,
            FilePath: row.UploadLog.FilePath,
            CreatedAt: row.UploadLog.CreatedAt,
          }
          : null,
      }));

      res.json({
        message: "Stock history fetched successfully",
        currentPage,
        perPage: limit,
        totalData,
        totalPages: Math.ceil(totalData / limit),
        data: result,
      });
    } catch (error) {
      console.error("Error fetching stock history:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };


  getStockHistoryOptions = async (req: Request, res: Response) => {
    try {
      // Semua admin (yang aktif)
      const adminOptions = await prisma.admin.findMany({
        where: { DeletedAt: null },
        select: { Id: true, Username: true, Name: true }
      });

      // Semua item code (yang aktif)
      const itemCodeOptions = await prisma.itemCode.findMany({
        where: { DeletedAt: null },
        select: { Id: true, Name: true }
      });

      // Semua produk (yang aktif)
      const productOptions = await prisma.product.findMany({
        where: { DeletedAt: null },
        select: { Id: true, Name: true }
      });

      // Semua kategori produk (yang aktif)
      const categoryOptions = await prisma.productCategory.findMany({
        where: { DeletedAt: null },
        select: { Id: true, Name: true }
      });

      res.json({
        adminOptions,
        itemCodeOptions,
        productOptions,
        categoryOptions,
        noteOptions: NOTE_FILTER_OPTIONS,
      });
    } catch (error) {
      console.error("Error fetching stock history options:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };

}

const stockHistoryController = new StockHistory();
const getStockHistoryController = stockHistoryController.getStockHistoryOptions;

export const getStockHistoryOptions = getStockHistoryController;
export const getStockHistory = stockHistoryController.getStockHistory;
export default stockHistoryController;
