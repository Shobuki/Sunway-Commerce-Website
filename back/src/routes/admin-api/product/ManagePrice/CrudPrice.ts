import {
      getItemCodeWithPriceCategory,
      getPricesByCategory,
      getDealersFetchPrice,
      createOrUpdatePriceCategory,
      createDealerSpecificPrice,
      createWholesalePrice,
      updatePrice,
      deletePrice
} from '../../../../controllers/admin-api/manageprice/CrudPrice';
import { Router } from 'express';
import { adminAuth, authorizeMenuAccess, authorizeMenuFeatureAccess } from "../../../../middlewares/admin/auth";

const router = Router();


// Routes for Price

router.get(
      '/prices/itemcodes/pricecategorys',
      adminAuth,
      authorizeMenuAccess("price"),
      getItemCodeWithPriceCategory
);
router.get("/prices/category/item/:itemCodeId?",
      adminAuth,
      authorizeMenuAccess("price"),
      getPricesByCategory);
router.get("/prices/dealers",
      adminAuth,
      authorizeMenuAccess("price"),
      getDealersFetchPrice
);
router.post(
      "/prices/update-category",
    //  adminAuth,
     // authorizeMenuFeatureAccess("price", "addprice"),
      createOrUpdatePriceCategory
);
router.post(
      "/prices/dealers",
   //   adminAuth,
    //  authorizeMenuFeatureAccess("price", "addprice"),
      createDealerSpecificPrice
);
router.post(
      "/prices/wholesale",
      adminAuth,
      authorizeMenuFeatureAccess("price", "addprice"),
      createWholesalePrice
);
router.post(
      "/prices/edit",
      adminAuth,
      authorizeMenuFeatureAccess("price", "editprice"),
      updatePrice
);
router.delete(
      "/prices/:Id",
      adminAuth,
      authorizeMenuFeatureAccess("price", "deleteprice"),
      deletePrice
);

export default router;