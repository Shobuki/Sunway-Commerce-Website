"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_1 = require("../../../controllers/dealer-api/cart/cart"); // ✅ Import dengan benar
const userAuth_1 = require("../../../middlewares/dealer/userAuth");
const router = (0, express_1.Router)();
router.post("/cart/get", userAuth_1.userAuth, cart_1.getCartByUserId);
router.post("/cart/add-update", userAuth_1.userAuth, cart_1.addUpdateCart);
router.post("/cart/rules", userAuth_1.userAuth, cart_1.getOrderRules);
exports.default = router;
