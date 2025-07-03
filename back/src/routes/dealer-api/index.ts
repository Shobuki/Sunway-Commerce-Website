import express from "express";
import login from "../../controllers/dealer-api/user/auth"
import register from "../../controllers/dealer-api/user/register"   

import product from "./product/product";

import profile from "./dealer/profile";

import cart from "./cart/cart";

import sales from "./transaction/salesorder"




const dealerApiRouter = express.Router();

// Mount Dealer API routes
//router.use("/dealer-api", dealerApiRouter);

dealerApiRouter.use("/dealer",login)
dealerApiRouter.use("/dealer",register)

dealerApiRouter.use("/dealer",profile);

dealerApiRouter.use("/dealer",product);

dealerApiRouter.use("/dealer",cart);

dealerApiRouter.use("/dealer",sales);


export default dealerApiRouter;
