"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CrudAdminRole_1 = __importDefault(require("../../../../controllers/admin-api/manageadmin/CrudAdminRole"));
const access_1 = require("../../../../controllers/admin-api/manageadmin/access/access");
const auth_1 = require("../../../../middlewares/admin/auth");
const router = (0, express_1.Router)();
router.post('/roles', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("rolemenuaccess"), // fitur create
CrudAdminRole_1.default.createAdminRole);
router.get('/roles', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)('rolemenuaccess'), CrudAdminRole_1.default.getAllAdminRoles);
router.get('/roles/:id', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)('rolemenuaccess'), CrudAdminRole_1.default.getAdminRoleById);
router.put('/roles/:id', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)('rolemenuaccess'), CrudAdminRole_1.default.updateAdminRole);
router.delete('/roles/:id', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)('rolemenuaccess'), CrudAdminRole_1.default.deleteAdminRole);
// ===== Access Matrix & Role Menu Access (juga pakai menu access saja) =====
router.get('/access/matrix', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)('rolemenuaccess'), access_1.getAdminAccessMatrix);
router.put('/access/role/menu', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)('rolemenuaccess'), access_1.updateRoleMenuAccess);
router.get('/access/my-menu', auth_1.adminAuth, // GET my-menu untuk sidebar, sebaiknya selalu diperbolehkan
access_1.getMyMenuAccess);
exports.default = router;
