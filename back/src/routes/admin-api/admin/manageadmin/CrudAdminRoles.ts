import { Router } from 'express';
import CrudAdminRole from '../../../../controllers/admin-api/manageadmin/CrudAdminRole';
import {getAdminAccessMatrix,updateRoleMenuAccess,getMyMenuAccess} from '../../../../controllers/admin-api/manageadmin/access/access'

import {
  adminAuth,
  authorizeMenuAccess,
  authorizeMenuFeatureAccess
} from "../../../../middlewares/admin/auth";


const router = Router();

router.post(
  '/roles',
  adminAuth,
  authorizeMenuAccess("rolemenuaccess"),  // fitur create
  CrudAdminRole.createAdminRole
);
router.get(
  '/roles',
  adminAuth,
  authorizeMenuAccess('rolemenuaccess'),
  CrudAdminRole.getAllAdminRoles
);
router.get(
  '/roles/:id',
  adminAuth,
  authorizeMenuAccess('rolemenuaccess'),
  CrudAdminRole.getAdminRoleById
);
router.put(
  '/roles/:id',
  adminAuth,
  authorizeMenuAccess('rolemenuaccess'),
  CrudAdminRole.updateAdminRole
);
router.delete(
  '/roles/:id',
  adminAuth,
  authorizeMenuAccess('rolemenuaccess'),
  CrudAdminRole.deleteAdminRole
);

// ===== Access Matrix & Role Menu Access (juga pakai menu access saja) =====
router.get(
  '/access/matrix',
  adminAuth,
  authorizeMenuAccess('rolemenuaccess'),
  getAdminAccessMatrix
);
router.put(
  '/access/role/menu',
  adminAuth,
  authorizeMenuAccess('rolemenuaccess'),
  updateRoleMenuAccess
);
router.get(
  '/access/my-menu',
  adminAuth, // GET my-menu untuk sidebar, sebaiknya selalu diperbolehkan
  getMyMenuAccess
);

export default router;
