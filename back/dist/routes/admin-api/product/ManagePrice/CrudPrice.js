"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CrudPrice_1 = require("../../../../controllers/admin-api/manageprice/CrudPrice");
const express_1 = require("express");
const auth_1 = require("../../../../middlewares/admin/auth");
const router = (0, express_1.Router)();
// Routes for Price
router.get('/prices/itemcodes/pricecategorys', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("price"), CrudPrice_1.getItemCodeWithPriceCategory);
router.get("/prices/category/item/:itemCodeId?", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("price"), CrudPrice_1.getPricesByCategory);
router.get("/prices/dealers", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("price"), CrudPrice_1.getDealersFetchPrice);
router.post("/prices/update-category", 
//  adminAuth,
// authorizeMenuFeatureAccess("price", "addprice"),
CrudPrice_1.createOrUpdatePriceCategory);
router.post("/prices/dealers", 
//   adminAuth,
//  authorizeMenuFeatureAccess("price", "addprice"),
CrudPrice_1.createDealerSpecificPrice);
router.post("/prices/wholesale", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("price", "addprice"), CrudPrice_1.createWholesalePrice);
router.post("/prices/edit", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("price", "editprice"), CrudPrice_1.updatePrice);
router.delete("/prices/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("price", "deleteprice"), CrudPrice_1.deletePrice);
exports.default = router;
