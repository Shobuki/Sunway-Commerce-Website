"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Pricing_1 = require("../../controllers/global/Pricing");
const pricingRouter = express_1.default.Router();
// POST /api/global/pricing/calculate
pricingRouter.post("/calculate", Pricing_1.apiPricingCalculate);
exports.default = pricingRouter;
