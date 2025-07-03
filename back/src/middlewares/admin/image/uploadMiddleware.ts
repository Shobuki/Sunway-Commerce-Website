import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

// Set the directory for storing profile images
const IMAGE_DIRECTORY = path.join(__dirname, "../../../public/admin/images/profile");

// Ensure the directory exists
if (!fs.existsSync(IMAGE_DIRECTORY)) {
  fs.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
}

// Define Multer storage configuration
const storage = multer.diskStorage({
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
    
    const ext = path.extname(file.originalname);
    const filename = `${adminId}${ext}`;
    console.log("Generated filename:", filename); // Log generated filename
    cb(null, filename);
  },
});

// File filter for validating uploads
const fileFilter = (req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only JPG and PNG are allowed."));
  }
  cb(null, true);
};

// Configure Multer
const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter,
});

export { uploadMiddleware, IMAGE_DIRECTORY };
