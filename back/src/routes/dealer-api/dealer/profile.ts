import { Router } from "express";
import {getUserProfile,
    updateUserProfile,
    uploadProfilePicture,
    getProfilePicture,
    deleteProfilePicture,
    upload
} from "../../../controllers/dealer-api/profileuser/userprofile";
import {
    requestForgotPassword,
    resetPassword,
    getResetEmailFromToken
} from "../../../controllers/dealer-api/profileuser/forgotpass"

const router = Router();


router.post("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.post("/profile/picture/upload", upload.single("file"), uploadProfilePicture);
router.post("/profile/picture/get", getProfilePicture);
router.delete("/profile/picture/delete", deleteProfilePicture);

router.post("/profile/reset/forgotpassword", requestForgotPassword);
router.post("/profile/reset/resetpassword", resetPassword);
router.get("/profile/reset/getresetemailtoken/:id", getResetEmailFromToken);


export default router;
