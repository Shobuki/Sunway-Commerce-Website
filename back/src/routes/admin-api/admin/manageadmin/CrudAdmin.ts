import express from "express";
import {
  adminAuth,
  authorizeMenuAccess,
  authorizeMenuFeatureAccess,
} from "../../../../middlewares/admin/auth";

import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../../../../controllers/admin-api/manageadmin/CrudAdmin";

import {
  revokeAllSessionByAdmin, revokeSession, getSessionsByAdminId
} from "../../../../controllers/admin-api/manageadmin/session";
import { GetListSales } from "../../../../controllers/admin-api/manageadmin/ChangeAdminSales";
import { changeAdminSalesStatus } from "../../../../controllers/admin-api/manageadmin/ChangeAdminSales";

const router = express.Router();

// GET all admins: hanya butuh akses menu 'manageadmin'
router.get(
  "/admins",
  adminAuth,
  authorizeMenuAccess("manageadmin"),
  getAllAdmins
);

// GET admin by id: akses menu saja
router.get(
  "/admins/:id",
  adminAuth,
  authorizeMenuAccess("manageadmin"),
  getAdminById
);

// POST create admin: butuh akses fitur 'create' pada 'manageadmin'
router.post(
  "/admins",
  adminAuth,
  authorizeMenuFeatureAccess("manageadmin", "create"),
  createAdmin
);

// PUT update admin: akses fitur 'edit'
router.put(
  "/admins/:id",
  adminAuth,
  authorizeMenuFeatureAccess("manageadmin", "edit"),
  updateAdmin
);

// DELETE admin: akses fitur 'delete'
router.delete(
  "/admins/:id",
  adminAuth,
  authorizeMenuFeatureAccess("manageadmin", "delete"),
  deleteAdmin
);


// POST /api/admin/session/revoke
router.post("/admins/sessions/revoke",
  adminAuth,
  authorizeMenuFeatureAccess("manageadmin", "session"),
  revokeSession);
// POST /api/admin/admin/revoke
router.post("/admins/sessions/admin/revoke",
  adminAuth,
  authorizeMenuFeatureAccess("manageadmin", "session"),
  revokeAllSessionByAdmin);
router.post("/admins/sessions",
  adminAuth,
  authorizeMenuFeatureAccess("manageadmin", "session"),
  getSessionsByAdminId)



// GET list sales: hanya akses menu
router.get(
  "/admins/list/sales",
  adminAuth,
  GetListSales
);

// PATCH set sales status: fitur 'setsales'
router.patch(
  "/admins/salesstatus/:adminid",
  adminAuth,
  authorizeMenuFeatureAccess("manageadmin", "setsales"),
  changeAdminSalesStatus
);

export default router;
