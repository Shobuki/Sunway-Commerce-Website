"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../../../middlewares/admin/auth");
const CrudAdmin_1 = require("../../../../controllers/admin-api/manageadmin/CrudAdmin");
const session_1 = require("../../../../controllers/admin-api/manageadmin/session");
const ChangeAdminSales_1 = require("../../../../controllers/admin-api/manageadmin/ChangeAdminSales");
const ChangeAdminSales_2 = require("../../../../controllers/admin-api/manageadmin/ChangeAdminSales");
const router = express_1.default.Router();
// GET all admins: hanya butuh akses menu 'manageadmin'
router.get("/admins", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("manageadmin"), CrudAdmin_1.getAllAdmins);
// GET admin by id: akses menu saja
router.get("/admins/:id", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("manageadmin"), CrudAdmin_1.getAdminById);
// POST create admin: butuh akses fitur 'create' pada 'manageadmin'
router.post("/admins", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("manageadmin", "create"), CrudAdmin_1.createAdmin);
// PUT update admin: akses fitur 'edit'
router.put("/admins/:id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("manageadmin", "edit"), CrudAdmin_1.updateAdmin);
// DELETE admin: akses fitur 'delete'
router.delete("/admins/:id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("manageadmin", "delete"), CrudAdmin_1.deleteAdmin);
// POST /api/admin/session/revoke
router.post("/admins/sessions/revoke", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("manageadmin", "session"), session_1.revokeSession);
// POST /api/admin/admin/revoke
router.post("/admins/sessions/admin/revoke", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("manageadmin", "session"), session_1.revokeAllSessionByAdmin);
router.post("/admins/sessions", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("manageadmin", "session"), session_1.getSessionsByAdminId);
// GET list sales: hanya akses menu
router.get("/admins/list/sales", auth_1.adminAuth, ChangeAdminSales_1.GetListSales);
// PATCH set sales status: fitur 'setsales'
router.patch("/admins/salesstatus/:adminid", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("manageadmin", "setsales"), ChangeAdminSales_2.changeAdminSalesStatus);
exports.default = router;
