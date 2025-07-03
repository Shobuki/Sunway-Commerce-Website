import express, { Request, Response, NextFunction } from "express";
import { authenticateToken } from "../../../middlewares/admin/authenticateToken";
import { extractAdminId } from "../../../middlewares/admin/extractAdminId";
import { PrismaClient } from "@prisma/client";
import {
  getProfile,
  getProfilePicture,
  updateProfile,
  updateProfilePicture,
} from "../../../controllers/admin-api/ProfileController";
import {requestForgotPasswordAdmin,getResetEmailFromAdminToken,resetAdminPassword} from "../../../controllers/admin-api/forgotpass"
import { uploadMiddleware } from "../../../middlewares/admin/image/uploadMiddleware";

const prisma = new PrismaClient();
const router = express.Router();

// Define routes
router.get("/profile", authenticateToken, getProfile);
router.get("/profile/image/:AdminId", authenticateToken, getProfilePicture);
router.put("/profile", authenticateToken, updateProfile);

router.post(
  "/profile/image",
  authenticateToken,
  updateProfilePicture
);


router.post("/profile/reset/forgotpassword", requestForgotPasswordAdmin);
router.get("/profile/reset/getresetemailtoken/:id", getResetEmailFromAdminToken);
router.post("/profile/reset/resetpassword", resetAdminPassword);

export default router;
