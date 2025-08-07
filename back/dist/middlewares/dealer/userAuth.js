"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
class AuthError extends Error {
    constructor(message, status = 401) {
        super(message);
        this.status = status;
    }
}
// Middleware untuk autentikasi user (bukan admin!)
const userAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
            ? authHeader.replace("Bearer ", "")
            : null;
        if (!token)
            return next(new AuthError("Token missing", 401));
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Payload JWT harus ada field UserId, Username, Email (set saat login)
        req.user = {
            Id: payload.UserId,
            Username: payload.Username,
            Email: payload.Email,
        };
        next();
    }
    catch (err) {
        console.error("[userAuth] JWT error:", err);
        return next(new AuthError("Invalid or expired token", 401));
    }
};
exports.userAuth = userAuth;
