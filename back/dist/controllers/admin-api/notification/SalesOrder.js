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
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getAdminNotifications = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * GET /api/admin/notification
 */
const getAdminNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // WAJIB: admin-only, pakai req.admin dari adminAuth
        const admin = req.admin;
        if (!admin || !admin.Id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        // Optional filter isRead
        let isReadFilter = undefined;
        if (typeof req.query.isRead === "string") {
            if (req.query.isRead.toLowerCase() === "true")
                isReadFilter = true;
            if (req.query.isRead.toLowerCase() === "false")
                isReadFilter = false;
        }
        // Query condition
        const where = Object.assign(Object.assign({ AdminId: admin.Id }, (isReadFilter !== undefined ? { IsRead: isReadFilter } : {})), { DeletedAt: null });
        const [notifications, total] = yield Promise.all([
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
            data: notifications.map(n => {
                var _a;
                return ({
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
                        Dealer: (_a = n.SalesOrder.Dealer) === null || _a === void 0 ? void 0 : _a.CompanyName,
                        Status: n.SalesOrder.Status,
                        CreatedAt: n.SalesOrder.CreatedAt,
                    } : null,
                    CreatedAt: n.CreatedAt,
                });
            }),
        });
    }
    catch (err) {
        console.error("[API] Get admin notification error", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getAdminNotifications = getAdminNotifications;
/**
 * PATCH /api/admin/notification/:id/read
 */
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const notif = yield prisma.adminNotification.findUnique({ where: { Id: notifId } });
        if (!notif || notif.AdminId !== admin.Id) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }
        yield prisma.adminNotification.update({
            where: { Id: notifId },
            data: { IsRead: true },
        });
        res.json({ message: "Marked as read" });
    }
    catch (err) {
        console.error("[API] Mark notification as read error", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = req.admin || req.user;
        if (!admin || !admin.Id) {
            res.status(401).json({ message: "Unauthorized" }); // Tidak pakai return di depan
            return; // biar handler stop
        }
        yield prisma.adminNotification.updateMany({
            where: { AdminId: admin.Id, IsRead: false, DeletedAt: null },
            data: { IsRead: true },
        });
        res.json({ message: "All notifications marked as read" }); // Tidak pakai return
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
