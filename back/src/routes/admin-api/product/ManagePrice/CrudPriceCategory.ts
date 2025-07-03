import { Router } from "express";
import { adminAuth, authorizeMenuAccess, authorizeMenuFeatureAccess } from "../../../../middlewares/admin/auth";
import {
  createPriceCategory,
  getAllPriceCategories,
  updatePriceCategory,
  deletePriceCategory,
} from "../../../../controllers/admin-api/manageprice/CrudPriceCategory";

const router = Router();

// Routes for PriceCategory
router.post(
  "/pricecategory",
  adminAuth,
  authorizeMenuFeatureAccess("price", "managepricecategory"),
  createPriceCategory
);
router.get("/pricecategory",
  adminAuth,
  authorizeMenuFeatureAccess("price", "managepricecategory"),
  getAllPriceCategories); // Get all PriceCategories
router.put(
  "/pricecategory/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("price", "managepricecategory"),
  updatePriceCategory
);
router.delete(
  "/pricecategory/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("price", "managepricecategory"),
  deletePriceCategory
);

export default router;
