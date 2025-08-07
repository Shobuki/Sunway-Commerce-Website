"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pricing_1 = __importDefault(require("./pricing")); // import router pricing
const globalRouter = express_1.default.Router();
// Mount semua global route di sini
globalRouter.use("/pricing", pricing_1.default);
// Tambah routing lain jika perlu...
exports.default = globalRouter;
