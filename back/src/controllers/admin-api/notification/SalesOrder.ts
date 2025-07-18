import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/admin/notification
 */
export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    // WAJIB: admin-only, pakai req.admin dari adminAuth
    const admin = req.admin;
    if (!admin || !admin.Id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Optional filter isRead
    let isReadFilter: boolean | undefined = undefined;
    if (typeof req.query.isRead === "string") {
      if (req.query.isRead.toLowerCase() === "true") isReadFilter = true;
      if (req.query.isRead.toLowerCase() === "false") isReadFilter = false;
    }

    // Query condition
    const where: any = {
      AdminId: admin.Id,
      ...(isReadFilter !== undefined ? { IsRead: isReadFilter } : {}),
      DeletedAt: null,
    };

    const [notifications, total] = await Promise.all([
      prisma.adminNotification.findMany({
        where,
        orderBy: [{ CreatedAt: "desc" }],
        include: {
          SalesOrder: {
            select: {
              Id: true,
              SalesOrderNumber: true,
              Dealer: { select: { CompanyName: true } },
              Status: true,
              CreatedAt: true,
            }
          }
        },
        skip: offset,
        take: limit,
      }),
      prisma.adminNotification.count({ where }),
    ]);

    res.json({
      page,
      limit,
      total,
      data: notifications.map(n => ({
        Id: n.Id,
        Title: n.Title,
        Body: n.Body,
        Type: n.Type,
        Path: n.Path,
        IsRead: n.IsRead,
        SalesOrderId: n.SalesOrderId,
        SalesOrder: n.SalesOrder ? {
          Id: n.SalesOrder.Id,
          SalesOrderNumber: n.SalesOrder.SalesOrderNumber,
          Dealer: n.SalesOrder.Dealer?.CompanyName,
          Status: n.SalesOrder.Status,
          CreatedAt: n.SalesOrder.CreatedAt,
        } : null,
        CreatedAt: n.CreatedAt,
      })),
    });

  } catch (err) {
    console.error("[API] Get admin notification error", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * PATCH /api/admin/notification/:id/read
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const admin = req.admin;
    if (!admin || !admin.Id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const notifId = Number(req.body.notifId); // ambil dari body
    if (!notifId) {
      res.status(400).json({ message: "Invalid notifId" });
      return;
    }

    const notif = await prisma.adminNotification.findUnique({ where: { Id: notifId } });
    if (!notif || notif.AdminId !== admin.Id) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    await prisma.adminNotification.update({
      where: { Id: notifId },
      data: { IsRead: true },
    });

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("[API] Mark notification as read error", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const admin = req.admin || req.user;
    if (!admin || !admin.Id) {
      res.status(401).json({ message: "Unauthorized" }); // Tidak pakai return di depan
      return; // biar handler stop
    }
    await prisma.adminNotification.updateMany({
      where: { AdminId: admin.Id, IsRead: false, DeletedAt: null },
      data: { IsRead: true },
    });
    res.json({ message: "All notifications marked as read" }); // Tidak pakai return
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};