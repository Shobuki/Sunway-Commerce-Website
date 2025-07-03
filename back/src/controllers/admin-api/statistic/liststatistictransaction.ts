import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();

const reportRequestSchema = z.object({
  timeRange: z.enum(['all', 'day', 'week', 'month', 'year', 'custom']).default('all'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  DealerId: z.number().optional(),
  UserId: z.number().optional(),
  ItemCodeId: z.number().optional(),
  ProductCategoryId: z.number().optional(),
  ProductId: z.number().optional(),
  PartNumberId: z.number().optional(),
  Status: z.enum(['APPROVED_EMAIL_SENT', 'REJECTED', 'PENDING_APPROVAL']).optional()
});

class SalesOrder {
  getTransactionReportHandler = async (req: Request, res: Response) => {
    try {
      const filters = reportRequestSchema.parse(req.body.filters ?? {});

      const daysMap = { day: 1, week: 7, month: 30, year: 365 } as const;

      const createdAtFilter = (() => {
        if (filters.timeRange === 'custom' && filters.startDate && filters.endDate) {
          return {
            CreatedAt: {
              gte: new Date(filters.startDate),
              lte: new Date(filters.endDate),
            },
          };
        } else if (filters.timeRange in daysMap) {
          const now = new Date();
          if (filters.timeRange in daysMap) {
            now.setDate(now.getDate() - daysMap[filters.timeRange as keyof typeof daysMap]);
          }
          return {
            CreatedAt: {
              gte: now,
            },
          };
        }
        return null;
      })();

      const detailFilters: any[] = [];

      if (filters.ItemCodeId) {
        detailFilters.push({ ItemCodeId: filters.ItemCodeId });
      }
      if (filters.PartNumberId) {
        detailFilters.push({ ItemCode: { PartNumberId: filters.PartNumberId } });
      }
      if (filters.ProductId) {
        detailFilters.push({
          ItemCode: {
            PartNumber: { ProductId: filters.ProductId }
          }
        });
      }
      if (filters.ProductCategoryId) {
        detailFilters.push({
          ItemCode: {
            PartNumber: {
              Product: {
                ProductCategory: { some: { Id: filters.ProductCategoryId } }
              }
            }
          }
        });
      }

      const whereClause: any = {
        AND: [
          filters.DealerId && { DealerId: filters.DealerId },
          filters.UserId && { UserId: filters.UserId },
          filters.Status && { Status: filters.Status },
          createdAtFilter,
          detailFilters.length > 0 && {
            SalesOrderDetails: {
              some: {
                AND: detailFilters
              }
            }
          }
        ].filter(Boolean),
      };

      const transactions = await prisma.salesOrder.findMany({
        where: whereClause,
        include: {
          Dealer: true,
          User: true,
          SalesOrderDetails: {
            include: {
              ItemCode: {
                include: {
                  ProductBrand: true,
                  PartNumber: {
                    include: {
                      Product: {
                        include: {
                          ProductCategory: true,
                        },
                      },
                    },
                  },
                },
              },
              PriceCategory: true,
            },
          },
        },
        orderBy: { CreatedAt: 'desc' },
      });

      const result = transactions.map(tx => ({
        Id: tx.Id,
        SalesOrderNumber: tx.SalesOrderNumber,
        CreatedAt: tx.CreatedAt,
        Status: tx.Status,
        Dealer: {
          Id: tx.Dealer?.Id,
          Name: tx.Dealer?.CompanyName,
          Region: tx.Dealer?.Region,
        },
        User: {
          Id: tx.User?.Id,
          Name: tx.User?.Name,
          Email: tx.User?.Email,
        },
        TotalAmount: tx.SalesOrderDetails.reduce(
          (acc, d) => acc + d.FinalPrice * d.Quantity,
          0
        ),
        Details: tx.SalesOrderDetails.map(d => ({
          ItemCode: d.ItemCode?.Name,
          Brand: d.ItemCode?.ProductBrand?.ProductBrandName,
          PartNumber: d.ItemCode?.PartNumber?.Name,
          Product: d.ItemCode?.PartNumber?.Product?.Name,
          Categories: d.ItemCode?.PartNumber?.Product?.ProductCategory?.map(c => c.Name),
          Quantity: d.Quantity,
          Price: {
            Final: d.FinalPrice,
            Original: d.Price,
            Category: d.PriceCategory?.Name,
          },
          Total: d.Quantity * d.FinalPrice,
        })),
      }));

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      console.error('[Transaction Report Error]', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  };

  getStatisticFilterOptions = async (_req: Request, res: Response) => {
    try {
      const [dealers, users, itemCodes, partNumbers, products, categories] = await Promise.all([
        prisma.dealer.findMany({ select: { Id: true, CompanyName: true } }),
        prisma.user.findMany({ select: { Id: true, Name: true } }),
        prisma.itemCode.findMany({ select: { Id: true, Name: true } }),
        prisma.partNumber.findMany({ select: { Id: true, Name: true } }),
        prisma.product.findMany({ select: { Id: true, Name: true } }),
        prisma.productCategory.findMany({ select: { Id: true, Name: true } }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          dealers: dealers.map(d => ({ Id: d.Id, Name: d.CompanyName })),
          users: users.map(u => ({ Id: u.Id, Name: u.Name })),
          itemCodes: itemCodes.map(i => ({ Id: i.Id, Name: i.Name })),
          partNumbers: partNumbers.map(p => ({ Id: p.Id, Name: p.Name })),
          products: products.map(p => ({ Id: p.Id, Name: p.Name })),
          categories: categories.map(c => ({ Id: c.Id, Name: c.Name })),
        },
      });
    } catch (error: any) {
      console.error('[GetStatisticFilterOptions Error]', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  };
}

const salesOrderController = new SalesOrder();

export const getTransactionReportHandler = salesOrderController.getTransactionReportHandler;
export const getStatisticFilterOptions = salesOrderController.getStatisticFilterOptions;

export default salesOrderController;
