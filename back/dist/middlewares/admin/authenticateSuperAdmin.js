"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSuperAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
// Middleware untuk memvalidasi SuperAdmin
const authenticateSuperAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: Token is required" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Validasi jika role bukan superadmin
        if (decoded.Role !== "superadmin") {
            res.status(403).json({ message: "Forbidden: Only superadmins can perform this action" });
            return;
        }
        // Set `AdminId` dan `Role` di `req.body`
        req.body.AdminId = decoded.AdminId;
        req.body.Role = decoded.Role;
        console.log("SuperAdmin validated:", {
            AdminId: req.body.AdminId,
            Role: req.body.Role,
        });
        next(); // Melanjutkan ke middleware berikutnya
    }
    catch (error) {
        const err = error;
        console.error("Invalid token:", err.message); // Gunakan `err.message` dengan aman
        res.status(403).json({ message: "Invalid token" });
    }
};
exports.authenticateSuperAdmin = authenticateSuperAdmin;
exports.default = exports.authenticateSuperAdmin;
