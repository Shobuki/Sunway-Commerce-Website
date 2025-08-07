"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGE_DIRECTORY = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Set the directory for storing profile images
const IMAGE_DIRECTORY = path_1.default.join(__dirname, "../../../public/admin/images/profile");
exports.IMAGE_DIRECTORY = IMAGE_DIRECTORY;
// Ensure the directory exists
if (!fs_1.default.existsSync(IMAGE_DIRECTORY)) {
    fs_1.default.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
}
// Define Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        console.log("Saving file to directory:", IMAGE_DIRECTORY); // Debug logging
        cb(null, IMAGE_DIRECTORY);
    },
    filename: (req, file, cb) => {
        console.log("Incoming file details:", {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        }); // Log file details
        const adminId = req.body.adminId; // `adminId` is guaranteed by the extractAdminId middleware
        console.log("Extracted adminId from request body:", adminId);
        const ext = path_1.default.extname(file.originalname);
        const filename = `${adminId}${ext}`;
        console.log("Generated filename:", filename); // Log generated filename
        cb(null, filename);
    },
});
// File filter for validating uploads
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type. Only JPG and PNG are allowed."));
    }
    cb(null, true);
};
// Configure Multer
const uploadMiddleware = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
    fileFilter,
});
exports.uploadMiddleware = uploadMiddleware;
