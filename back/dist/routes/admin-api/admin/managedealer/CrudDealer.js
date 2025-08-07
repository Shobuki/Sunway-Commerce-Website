"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../../../middlewares/admin/auth");
const CrudDealer_1 = require("../../../../controllers/admin-api/managedealer/CrudDealer");
const UserDealer_1 = require("../../../../controllers/admin-api/managedealer/UserDealer");
const WarehouseDealer_1 = require("../../../../controllers/admin-api/managedealer/WarehouseDealer");
const router = (0, express_1.Router)();
//route crud dealer
router.get('/dealers/fetch-price-categories', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("managedealer"), CrudDealer_1.getAllFetchPriceCategories);
router.post('/dealers', auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("managedealer", "create"), CrudDealer_1.createDealer);
router.get('/dealers', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("managedealer"), CrudDealer_1.getDealers);
router.get('/dealers/:Id', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("managedealer"), CrudDealer_1.getDealerById);
router.put('/dealers/:Id', auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("managedealer", "edit"), CrudDealer_1.updateDealer);
router.delete('/dealers/:Id', auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("managedealer", "delete"), CrudDealer_1.deleteDealer);
//route userdealer
router.post('/dealers/assign', auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("managedealer", "edit"), UserDealer_1.assignUserToDealer);
router.delete('/dealers/remove', auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("managedealer", "edit"), UserDealer_1.removeUserFromDealer);
//route warehouse dealer
router.post('/dealers/assign-warehouse', auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("managedealer", "editwarehousepriority"), WarehouseDealer_1.assignWarehouseToDealer);
router.post('/dealers/unassign-warehouse', auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("managedealer", "editwarehousepriority"), WarehouseDealer_1.unassignWarehouseFromDealer);
router.post('/dealers/warehouses/', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("managedealer"), WarehouseDealer_1.getWarehousesByDealer);
router.post('/dealers/reorder-warehouses', auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("managedealer", "editwarehousepriority"), WarehouseDealer_1.reorderDealerWarehouses);
router.get('/dealers/warehouses/all', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("managedealer"), WarehouseDealer_1.fetchAllWarehouses);
exports.default = router;
