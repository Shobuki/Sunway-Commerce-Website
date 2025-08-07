"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../../../middlewares/admin/auth");
const CrudPriceCategory_1 = require("../../../../controllers/admin-api/manageprice/CrudPriceCategory");
const router = (0, express_1.Router)();
// Routes for PriceCategory
router.post("/pricecategory", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("price", "managepricecategory"), CrudPriceCategory_1.createPriceCategory);
router.get("/pricecategory", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("price", "managepricecategory"), CrudPriceCategory_1.getAllPriceCategories); // Get all PriceCategories
router.put("/pricecategory/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("price", "managepricecategory"), CrudPriceCategory_1.updatePriceCategory);
router.delete("/pricecategory/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("price", "managepricecategory"), CrudPriceCategory_1.deletePriceCategory);
exports.default = router;
