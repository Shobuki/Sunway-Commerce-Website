import { Router } from "express";
import { userAuth } from "../../../middlewares/dealer/userAuth";
import {
    convertCartToSalesOrder,
    getSalesOrdersByUserDealer,
    getSalesOrdersBySales,
   updateSalesOrder,
} from "../../../controllers/dealer-api/transaction/salesorder"; // ✅ Import dengan benar



const router = Router();



router.post("/salesorder/convert-cart",userAuth, convertCartToSalesOrder);
//router.post("/salesorder/getbysales", getSalesOrdersBySales);
router.post("/salesorder/getbyuser",userAuth, getSalesOrdersByUserDealer);




export default router;
