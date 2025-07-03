import { Router } from 'express';
import {
  adminAuth,
  authorizeMenuAccess,
  authorizeMenuFeatureAccess,
} from "../../../../middlewares/admin/auth";

import {
  createDealer,
  getDealers,
  getDealerById,
  getAllFetchPriceCategories,
  updateDealer,
  deleteDealer,
} from '../../../../controllers/admin-api/managedealer/CrudDealer';

import {
    assignUserToDealer,
    removeUserFromDealer,
} from '../../../../controllers/admin-api/managedealer/UserDealer';

import {assignWarehouseToDealer,unassignWarehouseFromDealer,getWarehousesByDealer,reorderDealerWarehouses,fetchAllWarehouses} from '../../../../controllers/admin-api/managedealer/WarehouseDealer';

const router = Router();

//route crud dealer
router.get(
  '/dealers/fetch-price-categories',
  adminAuth,
  authorizeMenuAccess("managedealer"),
  getAllFetchPriceCategories
);
router.post(
  '/dealers',
  adminAuth,
  authorizeMenuFeatureAccess("managedealer", "create"),
  createDealer
);
router.get(
  '/dealers',
  adminAuth,
  authorizeMenuAccess("managedealer"),
  getDealers
);
router.get(
  '/dealers/:Id',
  adminAuth,
  authorizeMenuAccess("managedealer"),
  getDealerById
);
router.put(
  '/dealers/:Id',
  adminAuth,
  authorizeMenuFeatureAccess("managedealer", "edit"),
  updateDealer
);
router.delete(
  '/dealers/:Id',
  adminAuth,
  authorizeMenuFeatureAccess("managedealer", "delete"),
  deleteDealer
);


//route userdealer
router.post(
  '/dealers/assign',
  adminAuth,
  authorizeMenuFeatureAccess("managedealer", "edit"),
  assignUserToDealer
);
router.delete(
  '/dealers/remove',
  adminAuth,
  authorizeMenuFeatureAccess("managedealer", "edit"),
  removeUserFromDealer
);

//route warehouse dealer
router.post(
  '/dealers/assign-warehouse',
  adminAuth,
  authorizeMenuFeatureAccess("managedealer", "editwarehousepriority"),
  assignWarehouseToDealer
);
router.post(
  '/dealers/unassign-warehouse',
  adminAuth,
  authorizeMenuFeatureAccess("managedealer", "editwarehousepriority"),
  unassignWarehouseFromDealer
);
router.post(
  '/dealers/warehouses/',
  adminAuth,
  authorizeMenuAccess("managedealer"),
  getWarehousesByDealer
);
router.post(
  '/dealers/reorder-warehouses',
  adminAuth,
  authorizeMenuFeatureAccess("managedealer", "editwarehousepriority"),
  reorderDealerWarehouses
);
router.get(
  '/dealers/warehouses/all',
  adminAuth,
  authorizeMenuAccess("managedealer"),
  fetchAllWarehouses
);

export default router;
