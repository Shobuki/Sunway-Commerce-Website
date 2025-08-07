"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.deleteProfilePicture = exports.getProfilePicture = exports.uploadProfilePicture = exports.updateUserProfile = exports.getUserProfile = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const prisma = new client_1.PrismaClient();
// Directory for storing profile images
const IMAGE_DIRECTORY = path_1.default.join(process.cwd(), "public", "dealer", "images", "profile");
// Ensure the directory exists
if (!fs_1.default.existsSync(IMAGE_DIRECTORY)) {
    fs_1.default.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
    console.log("Image directory created:", IMAGE_DIRECTORY);
}
// Multer Configuration for File Upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGE_DIRECTORY);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `user_${Date.now()}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
exports.upload = upload;
// ✅ **Get User Profile**
const getUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { UserId } = req.body;
        if (!UserId || isNaN(Number(UserId))) {
            res.status(400).json({ message: "Invalid User ID." });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { Id: parseInt(UserId, 10) },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        next(error);
    }
});
exports.getUserProfile = getUserProfile;
// ✅ **Update User Profile**
const updateUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { UserId, email, name, address, phoneNumber, birthdate, country, gender, province } = req.body;
        if (!UserId || isNaN(Number(UserId))) {
            res.status(400).json({ message: "Invalid User ID." });
            return;
        }
        // === Max length validation ===
        if (email && String(email).trim().length > 75) {
            res.status(400).json({ message: "Email cannot exceed 75 characters." });
            return;
        }
        if (name && String(name).trim().length > 50) {
            res.status(400).json({ message: "Name cannot exceed 50 characters." });
            return;
        }
        if (address && String(address).trim().length > 150) {
            res.status(400).json({ message: "Address cannot exceed 150 characters." });
            return;
        }
        if (phoneNumber && String(phoneNumber).trim().length > 20) {
            res.status(400).json({ message: "Phone number cannot exceed 20 characters." });
            return;
        }
        if (country && String(country).trim().length > 30) {
            res.status(400).json({ message: "Country cannot exceed 30 characters." });
            return;
        }
        if (gender && String(gender).trim().length > 10) {
            res.status(400).json({ message: "Gender cannot exceed 10 characters." });
            return;
        }
        if (province && String(province).trim().length > 30) {
            res.status(400).json({ message: "Province cannot exceed 30 characters." });
            return;
        }
        // Optional: birthdate validation
        if (birthdate && isNaN(Date.parse(birthdate))) {
            res.status(400).json({ message: "Invalid birthdate format." });
            return;
        }
        const updatedUser = yield prisma.user.update({
            where: { Id: parseInt(UserId, 10) },
            data: {
                Email: email,
                Name: name,
                Address: address,
                PhoneNumber: phoneNumber,
                Birthdate: birthdate ? new Date(birthdate) : undefined,
                Country: country,
                Gender: gender,
                Province: province,
            },
        });
        res.json({ message: "User profile updated successfully", data: updatedUser });
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        next(error);
    }
});
exports.updateUserProfile = updateUserProfile;
// ✅ **Upload/Update Profile Picture**
const uploadProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { UserId } = req.body;
        const file = req.file;
        if (!UserId || isNaN(Number(UserId))) {
            res.status(400).json({ message: "Invalid User ID." });
            return;
        }
        if (!file) {
            res.status(400).json({ message: "No file uploaded." });
            return;
        }
        const updatedUser = yield prisma.user.update({
            where: { Id: parseInt(UserId, 10) },
            data: { Image: file.filename },
        });
        res.json({ message: "Profile picture updated successfully", data: updatedUser });
    }
    catch (error) {
        console.error("Error uploading profile picture:", error);
        next(error);
    }
});
exports.uploadProfilePicture = uploadProfilePicture;
// Di controller
const getProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { UserId } = req.body;
        if (!UserId || isNaN(Number(UserId))) {
            res.status(400).json({ message: "Invalid User ID." }); // Hapus 'return'
            return; // Tetap pertahankan untuk menghentikan eksekusi
        }
        const user = yield prisma.user.findUnique({
            where: { Id: parseInt(UserId, 10) },
        });
        if (!user || !user.Image) {
            res.status(404).json({ message: "Profile picture not found." }); // Hapus 'return'
            return;
        }
        const imageUrl = `/images/user/profile/${user.Image}`;
        res.json({ imageUrl }); // Hapus 'return'
    }
    catch (error) {
        console.error("Error fetching profile picture URL:", error);
        next(error);
    }
});
exports.getProfilePicture = getProfilePicture;
// ✅ **Delete Profile Picture**
const deleteProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { UserId } = req.body;
        const user = yield prisma.user.findUnique({
            where: { Id: parseInt(UserId, 10) },
        });
        if (!user || !user.Image) {
            res.status(404).json({ message: "Profile picture not found." });
            return;
        }
        const filePath = path_1.default.join(IMAGE_DIRECTORY, user.Image);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        yield prisma.user.update({
            where: { Id: parseInt(UserId, 10) },
            data: { Image: null },
        });
        res.json({ message: "Profile picture deleted successfully." });
    }
    catch (error) {
        console.error("Error deleting profile picture:", error);
        next(error);
    }
});
exports.deleteProfilePicture = deleteProfilePicture;
