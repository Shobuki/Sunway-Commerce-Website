"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../controllers/dealer-api/user/auth"));
const register_1 = __importDefault(require("../../controllers/dealer-api/user/register"));
const product_1 = __importDefault(require("./product/product"));
const profile_1 = __importDefault(require("./dealer/profile"));
const cart_1 = __importDefault(require("./cart/cart"));
const salesorder_1 = __importDefault(require("./transaction/salesorder"));
const dealerApiRouter = express_1.default.Router();
// Mount Dealer API routes
//router.use("/dealer-api", dealerApiRouter);
dealerApiRouter.use("/dealer", auth_1.default);
dealerApiRouter.use("/dealer", register_1.default);
dealerApiRouter.use("/dealer", profile_1.default);
dealerApiRouter.use("/dealer", product_1.default);
dealerApiRouter.use("/dealer", cart_1.default);
dealerApiRouter.use("/dealer", salesorder_1.default);
exports.default = dealerApiRouter;
