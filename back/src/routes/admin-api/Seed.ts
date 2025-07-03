import express from "express";
import { seedAdminMenuAccess } from "../../controllers/admin-api/manageadmin/access/menu";

// Inisialisasi router
const router = express.Router();

/**
 * Endpoint untuk men-seed data menu admin (POST /api/admin/admin/access/menu/seed)
 */
router.post("/access/menu/seed", seedAdminMenuAccess);

export default router;
