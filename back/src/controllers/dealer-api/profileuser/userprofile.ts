import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import multer from "multer";

const prisma = new PrismaClient();

// Directory for storing profile images
const IMAGE_DIRECTORY = path.join(process.cwd(), "public", "dealer", "images", "profile");

// Ensure the directory exists
if (!fs.existsSync(IMAGE_DIRECTORY)) {
    fs.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
    console.log("Image directory created:", IMAGE_DIRECTORY);
}

// Multer Configuration for File Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGE_DIRECTORY);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `user_${Date.now()}${ext}`);
    },
});

const upload = multer({ storage });

// ✅ **Get User Profile**
export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId } = req.body;

        if (!UserId || isNaN(Number(UserId))) {
            res.status(400).json({ message: "Invalid User ID." });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { Id: parseInt(UserId, 10) },
        });

        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        next(error);
    }
};

// ✅ **Update User Profile**
export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
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

        const updatedUser = await prisma.user.update({
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
    } catch (error) {
        console.error("Error updating user profile:", error);
        next(error);
    }
};

// ✅ **Upload/Update Profile Picture**
export const uploadProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
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

        const updatedUser = await prisma.user.update({
            where: { Id: parseInt(UserId, 10) },
            data: { Image: file.filename },
        });

        res.json({ message: "Profile picture updated successfully", data: updatedUser });
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        next(error);
    }
};

// Di controller
export const getProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId } = req.body;

        if (!UserId || isNaN(Number(UserId))) {
            res.status(400).json({ message: "Invalid User ID." }); // Hapus 'return'
            return; // Tetap pertahankan untuk menghentikan eksekusi
        }

        const user = await prisma.user.findUnique({
            where: { Id: parseInt(UserId, 10) },
        });

        if (!user || !user.Image) {
            res.status(404).json({ message: "Profile picture not found." }); // Hapus 'return'
            return;
        }

        const imageUrl = `/images/user/profile/${user.Image}`;
        res.json({ imageUrl }); // Hapus 'return'

    } catch (error) {
        console.error("Error fetching profile picture URL:", error);
        next(error);
    }
};



// ✅ **Delete Profile Picture**
export const deleteProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { UserId } = req.body;

        const user = await prisma.user.findUnique({
            where: { Id: parseInt(UserId, 10) },
        });

        if (!user || !user.Image) {
            res.status(404).json({ message: "Profile picture not found." });
            return;
        }

        const filePath = path.join(IMAGE_DIRECTORY, user.Image);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.user.update({
            where: { Id: parseInt(UserId, 10) },
            data: { Image: null },
        });

        res.json({ message: "Profile picture deleted successfully." });
    } catch (error) {
        console.error("Error deleting profile picture:", error);
        next(error);
    }
};

// Export Multer upload for route usage
export { upload };
