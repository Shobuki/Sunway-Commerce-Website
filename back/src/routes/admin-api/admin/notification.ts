// src/routes/admin/notification.ts
import express from "express";
import {
  getAdminNotifications,
  markNotificationAsRead
} from "../../../controllers/admin-api/notification/SalesOrder";
import { adminAuth } from "../../../middlewares/admin/auth";

const router = express.Router();

// Semua endpoint di bawah ini HANYA BISA DIAKSES ADMIN YANG VALID TOKEN
router.get("/notification", adminAuth, getAdminNotifications);
router.patch("/notification/read", adminAuth, markNotificationAsRead);
router.patch("/notification/read/markallread", adminAuth, markNotificationAsRead);

export default router;
