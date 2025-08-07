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
exports.IMAGE_DIRECTORY = exports.deleteProfilePicture = exports.updateProfilePicture = exports.updateProfile = exports.getProfilePicture = exports.getProfile = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Direktori penyimpanan gambar
const IMAGE_DIRECTORY = path_1.default.join(process.cwd(), "public/admin/images/profile");
exports.IMAGE_DIRECTORY = IMAGE_DIRECTORY;
// Buat direktori jika belum ada
if (!fs_1.default.existsSync(IMAGE_DIRECTORY)) {
    fs_1.default.mkdirSync(IMAGE_DIRECTORY, { recursive: true });
    console.log("Image directory created:", IMAGE_DIRECTORY);
}
// **Get Own Profile**
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { AdminId } = req.body;
        if (!AdminId || isNaN(Number(AdminId))) {
            res.status(400).json({ Message: "Invalid Admin ID." });
            return;
        }
        const Admin = yield prisma.admin.findUnique({
            where: { Id: parseInt(AdminId, 10) }, // Menggunakan "Id"
            include: { AdminRole: true },
        });
        if (!Admin) {
            res.status(404).json({ Message: "Admin not found." });
            return;
        }
        res.json(Admin);
    }
    catch (Error) {
        console.error("Error fetching profile:", Error);
        next(Error);
    }
});
exports.getProfile = getProfile;
// **Get Profile Picture**
const getProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { AdminId } = req.params;
        if (!AdminId || isNaN(Number(AdminId))) {
            res.status(400).json({ Message: "Invalid Admin ID." });
            return;
        }
        const admin = yield prisma.admin.findUnique({
            where: { Id: parseInt(AdminId, 10) },
        });
        if (!admin || !admin.Image) {
            res.status(404).json({ Message: "Profile picture not found." });
            return;
        }
        const FilePath = path_1.default.join(IMAGE_DIRECTORY, admin.Image);
        if (!fs_1.default.existsSync(FilePath)) {
            res.status(404).json({ Message: "Profile picture file not found." });
            return;
        }
        res.sendFile(FilePath); // Kirim file sebagai respons
    }
    catch (error) {
        console.error("Error fetching profile picture:", error);
        next(error);
    }
});
exports.getProfilePicture = getProfilePicture;
// **Update Own Profile**
// **Update Own Profile**
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, email, name, birthdate, phonenumber, address, gender } = req.body;
    try {
        console.log("Received Data:", req.body); // Debugging
        if (!id || isNaN(Number(id))) {
            res.status(400).json({ Message: "Invalid Admin ID." });
            return;
        }
        // ID wajib valid dan positif
        if (!id || isNaN(Number(id)) || Number(id) <= 0) {
            res.status(400).json({ Message: "Invalid Admin ID." });
            return;
        }
        // Email: maksimal 75 karakter (tidak cek format)
        if (email && String(email).trim().length > 75) {
            res.status(400).json({ Message: "Email cannot exceed 75 characters." });
            return;
        }
        // Name: maksimal 50 karakter
        if (name && String(name).trim().length > 50) {
            res.status(400).json({ Message: "Name cannot exceed 50 characters." });
            return;
        }
        // Birthdate: validasi hanya jika ada (optional, boleh kosong)
        if (birthdate && isNaN(Date.parse(birthdate))) {
            res.status(400).json({ Message: "Invalid birthdate format." });
            return;
        }
        // PhoneNumber: maksimal 20 karakter
        if (phonenumber && String(phonenumber).trim().length > 20) {
            res.status(400).json({ Message: "Phone number cannot exceed 20 characters." });
            return;
        }
        // Address: maksimal 150 karakter
        if (address && String(address).trim().length > 150) {
            res.status(400).json({ Message: "Address cannot exceed 150 characters." });
            return;
        }
        // Gender: maksimal 10 karakter
        if (gender && String(gender).trim().length > 10) {
            res.status(400).json({ Message: "Gender cannot exceed 10 characters." });
            return;
        }
        const UpdatedAdmin = yield prisma.admin.update({
            where: { Id: parseInt(id, 10) }, // Use `id` from the request body
            data: {
                Email: email || null,
                Name: name || null,
                Birthdate: birthdate ? new Date(birthdate) : null,
                PhoneNumber: phonenumber || null,
                Address: address || null,
                Gender: gender || null,
            },
        });
        console.log("Updated Admin:", UpdatedAdmin); // Debugging
        res.status(200).json({ Message: "Profile updated successfully", Admin: UpdatedAdmin });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
// **Update Profile Picture**
const updateProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { AdminId } = req.body;
        // Validasi AdminId
        if (!AdminId || isNaN(Number(AdminId))) {
            res.status(400).json({ Message: "Invalid Admin ID." });
            return;
        }
        const adminIdNumber = parseInt(AdminId, 10);
        // Validasi keberadaan Admin
        const adminExists = yield prisma.admin.findUnique({
            where: { Id: adminIdNumber },
        });
        if (!adminExists) {
            res.status(404).json({ Message: "Admin not found." });
            return;
        }
        // Validasi tipe konten
        const contentType = req.headers["content-type"];
        if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes("multipart/form-data"))) {
            res.status(400).json({ Message: "Invalid file upload request." });
            return;
        }
        const buffers = [];
        req.on("data", (chunk) => buffers.push(chunk));
        req.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const data = Buffer.concat(buffers);
            // Ganti nama file menjadi Id Admin dengan ekstensi sesuai tipe file
            const boundary = (_a = req.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.split("boundary=")[1];
            if (!boundary) {
                res.status(400).json({ Message: "Boundary not found in multipart data." });
                return;
            }
            const boundaryBuffer = Buffer.from(`--${boundary}`);
            const boundaryEndBuffer = Buffer.from(`--${boundary}--`);
            const parts = data
                .toString("binary")
                .split(boundaryBuffer.toString("binary"))
                .filter((part) => part && !part.includes(boundaryEndBuffer.toString("binary")));
            let fileData = null;
            let fileName = null;
            for (const part of parts) {
                const headersAndBody = part.split("\r\n\r\n");
                const headers = headersAndBody[0];
                const body = headersAndBody[1];
                if (headers.includes("Content-Disposition")) {
                    const fileNameMatch = headers.match(/filename="([^"]+)"/);
                    if (fileNameMatch) {
                        const originalExt = path_1.default.extname(fileNameMatch[1]); // Ekstensi asli file
                        fileName = `${adminIdNumber}${originalExt}`; // Nama file sesuai Id Admin
                        fileData = Buffer.from(body, "binary");
                    }
                }
            }
            if (!fileData || !fileName) {
                res.status(400).json({ Message: "No file uploaded." });
                return;
            }
            const FilePath = path_1.default.join(IMAGE_DIRECTORY, fileName);
            fs_1.default.writeFileSync(FilePath, fileData);
            // Update kolom Image di database
            const UpdatedAdmin = yield prisma.admin.update({
                where: { Id: adminIdNumber },
                data: { Image: fileName },
            });
            res.json({ Message: "Profile picture updated successfully", Admin: UpdatedAdmin });
        }));
    }
    catch (error) {
        console.error("Error updating profile picture:", error);
        next(error);
    }
});
exports.updateProfilePicture = updateProfilePicture;
// **Delete Profile Picture**
const deleteProfilePicture = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { AdminId } = req.body;
    try {
        const Admin = yield prisma.admin.findUnique({ where: { Id: parseInt(AdminId, 10) } });
        if (!Admin || !Admin.Image) {
            res.status(404).json({ Message: "Profile picture not found." });
            return;
        }
        const FilePath = path_1.default.join(IMAGE_DIRECTORY, Admin.Image);
        if (fs_1.default.existsSync(FilePath)) {
            fs_1.default.unlinkSync(FilePath);
        }
        yield prisma.admin.update({
            where: { Id: parseInt(AdminId, 10) },
            data: { Image: null },
        });
        res.json({ Message: "Profile picture deleted successfully." });
    }
    catch (Error) {
        console.error("Error deleting profile picture:", Error);
        next(Error);
    }
});
exports.deleteProfilePicture = deleteProfilePicture;
