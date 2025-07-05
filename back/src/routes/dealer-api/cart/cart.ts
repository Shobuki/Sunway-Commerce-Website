import { Router } from "express";
import { addUpdateCart,getCartByUserId,getOrderRules } from "../../../controllers/dealer-api/cart/cart"; // ✅ Import dengan benar
import { userAuth } from "../../../middlewares/dealer/userAuth";

const router = Router();

router.post("/cart/get",userAuth,  getCartByUserId);
router.post("/cart/add-update",userAuth, addUpdateCart);
router.post("/cart/rules",userAuth, getOrderRules);

export default router;
