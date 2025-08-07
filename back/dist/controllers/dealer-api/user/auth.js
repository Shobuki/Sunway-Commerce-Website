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
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authenticateToken_1 = require("../../../middlewares/dealer/authenticateToken");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Ensure JWT_SECRET is defined
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}
// ==============================
// 🔒 LOGIN User (Generate Token)
// ==============================
router.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { identifier, password } = req.body;
    try {
        if (!identifier || !password) {
            res.status(400).json({ message: "Username/Email and password are required." });
            return;
        }
        const user = yield prisma.user.findFirst({
            where: {
                OR: [{ Username: identifier }, { Email: identifier }],
                DeletedAt: null,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.Password);
        if (!passwordMatch) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ UserId: user.Id }, JWT_SECRET, { expiresIn: "1h" });
        yield prisma.user.update({
            where: { Id: user.Id },
            data: { Token: token },
        });
        yield prisma.userSession.create({
            data: {
                UserId: user.Id,
                LoginTime: new Date(),
                Token: token,
            },
        });
        res.json({
            message: "Login successful",
            token,
            user: {
                UserId: user.Id,
                Username: user.Username,
                Email: user.Email,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        next(error);
    }
}));
// ==============================
// 🚪 LOGOUT User (End Session)
// ==============================
router.post("/logout", authenticateToken_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(400).json({ message: "Token is required for logout." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.UserId) {
            res.status(401).json({ message: "Invalid token payload." });
            return;
        }
        yield prisma.userSession.updateMany({
            where: {
                UserId: decoded.UserId,
                LogoutTime: null,
            },
            data: {
                LogoutTime: new Date(),
            },
        });
        yield prisma.user.update({
            where: { Id: decoded.UserId },
            data: { Token: null },
        });
        res.json({ message: "Logout successful." });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
}));
// ===================================
// ✅ PROTECTED ROUTE EXAMPLE (User)
// ===================================
router.get("/auth", authenticateToken_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(400).json({ message: "Token is required." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded.UserId) {
            res.status(401).json({ message: "Invalid token payload." });
            return;
        }
        // ✅ Fetch the user data based on UserId from token
        const user = yield prisma.user.findUnique({
            where: { Id: decoded.UserId, DeletedAt: null },
            select: {
                Id: true,
                Username: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // ✅ Return user profile data
        res.status(200).json({
            message: "User profile fetched successfully.",
            user,
        });
    }
    catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ message: "Invalid or expired token." });
    }
}));
exports.default = router;
