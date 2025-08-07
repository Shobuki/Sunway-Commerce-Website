"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = require("../../../middlewares/admin/authenticateToken");
const client_1 = require("@prisma/client");
const ProfileController_1 = require("../../../controllers/admin-api/ProfileController");
const forgotpass_1 = require("../../../controllers/admin-api/forgotpass");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Define routes
router.get("/profile", authenticateToken_1.authenticateToken, ProfileController_1.getProfile);
router.get("/profile/image/:AdminId", authenticateToken_1.authenticateToken, ProfileController_1.getProfilePicture);
router.put("/profile", authenticateToken_1.authenticateToken, ProfileController_1.updateProfile);
router.post("/profile/image", authenticateToken_1.authenticateToken, ProfileController_1.updateProfilePicture);
router.post("/profile/reset/forgotpassword", forgotpass_1.requestForgotPasswordAdmin);
router.get("/profile/reset/getresetemailtoken/:id", forgotpass_1.getResetEmailFromAdminToken);
router.post("/profile/reset/resetpassword", forgotpass_1.resetAdminPassword);
exports.default = router;
