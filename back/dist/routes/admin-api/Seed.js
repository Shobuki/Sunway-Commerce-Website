"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menu_1 = require("../../controllers/admin-api/manageadmin/access/menu");
// Inisialisasi router
const router = express_1.default.Router();
/**
 * Endpoint untuk men-seed data menu admin (POST /api/admin/admin/access/menu/seed)
 */
router.post("/access/menu/seed", menu_1.seedAdminMenuAccess);
exports.default = router;
