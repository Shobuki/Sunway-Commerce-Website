"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userAuth_1 = require("../../../middlewares/dealer/userAuth");
const salesorder_1 = require("../../../controllers/dealer-api/transaction/salesorder"); // ✅ Import dengan benar
const router = (0, express_1.Router)();
router.post("/salesorder/convert-cart", userAuth_1.userAuth, salesorder_1.convertCartToSalesOrder);
//router.post("/salesorder/getbysales", getSalesOrdersBySales);
router.post("/salesorder/getbyuser", userAuth_1.userAuth, salesorder_1.getSalesOrdersByUserDealer);
exports.default = router;
