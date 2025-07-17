import express from "express";
import { apiPricingCalculate } from "../../controllers/global/Pricing";
import { calculateOrderSummary } from "../../controllers/global/Pricing"



const pricingRouter = express.Router();

// POST /api/global/pricing/calculate
pricingRouter.post("/calculate", apiPricingCalculate);

export default pricingRouter;
