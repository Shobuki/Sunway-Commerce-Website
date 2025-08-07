"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/admin/notification.ts
const express_1 = __importDefault(require("express"));
const SalesOrder_1 = require("../../../controllers/admin-api/notification/SalesOrder");
const auth_1 = require("../../../middlewares/admin/auth");
const router = express_1.default.Router();
// Semua endpoint di bawah ini HANYA BISA DIAKSES ADMIN YANG VALID TOKEN
router.get("/notification", auth_1.adminAuth, SalesOrder_1.getAdminNotifications);
router.patch("/notification/read", auth_1.adminAuth, SalesOrder_1.markNotificationAsRead);
router.patch("/notification/read/markallread", auth_1.adminAuth, SalesOrder_1.markAllNotificationsAsRead);
exports.default = router;
