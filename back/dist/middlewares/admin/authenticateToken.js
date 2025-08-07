"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Unauthorized: Token is required" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Unauthorized: Token is required" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Set `AdminId` dan `Role` di `req.body`
        req.body.AdminId = decoded.AdminId;
        req.body.Role = decoded.Role;
        console.log("Admin ID and Role set in request body:", {
            AdminId: req.body.AdminId,
            Role: req.body.Role,
        });
        next(); // Melanjutkan ke middleware berikutnya
    }
    catch (error) {
        console.error("Invalid token:", error);
        res.status(403).json({ message: "Invalid token" });
    }
}
// Export default untuk digunakan di tempat lain
exports.default = authenticateToken;
