"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.protectedRoute = exports.checkAdminRole = exports.adminLogout = exports.getAdminSession = exports.adminLogin = exports.validateAdminId = void 0;
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const UAParser = __importStar(require("ua-parser-js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authenticateToken_1 = require("../../middlewares/admin/authenticateToken");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
// ✅ Middleware to validate AdminId
const validateAdminId = (req, res, next) => {
    const { AdminId } = req.body;
    if (!AdminId || isNaN(Number(AdminId))) {
        res.status(400).json({ message: "Invalid or missing AdminId." });
        return;
    }
    req.body.AdminId = parseInt(AdminId, 10);
    next();
};
exports.validateAdminId = validateAdminId;
// ✅ LOGIN Admin (Generate Token and Save Session)
const adminLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const { identifier, password } = req.body;
    const userAgent = req.headers['user-agent'] || "";
    try {
        if (!identifier || !password) {
            res.status(400).json({ message: "Username/email and password are required." });
            return;
        }
        const admin = yield prisma.admin.findFirst({
            where: {
                OR: [
                    { Username: identifier },
                    { Email: identifier },
                ],
            },
            include: { AdminRole: true, Sales: true },
        });
        if (!admin) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, admin.Password);
        if (!passwordMatch) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            AdminId: admin.Id,
            Role: ((_a = admin.AdminRole) === null || _a === void 0 ? void 0 : _a.Name) || "Unknown",
            RoleId: (_b = admin.AdminRole) === null || _b === void 0 ? void 0 : _b.Id, // <-- tambah ini!
            SalesId: (_c = admin.Sales) === null || _c === void 0 ? void 0 : _c.Id
        }, JWT_SECRET);
        yield prisma.admin.update({
            where: { Id: admin.Id },
            data: { Token: token },
        });
        // --- PARSE USER AGENT ---
        const parser = new UAParser.UAParser();
        parser.setUA(userAgent);
        const uaResult = parser.getResult();
        const deviceInfo = [
            (_d = uaResult.os) === null || _d === void 0 ? void 0 : _d.name,
            (_e = uaResult.os) === null || _e === void 0 ? void 0 : _e.version,
            (_f = uaResult.browser) === null || _f === void 0 ? void 0 : _f.name,
            (_g = uaResult.browser) === null || _g === void 0 ? void 0 : _g.version,
            (_h = uaResult.device) === null || _h === void 0 ? void 0 : _h.type,
            (_j = uaResult.device) === null || _j === void 0 ? void 0 : _j.vendor,
        ]
            .filter(Boolean)
            .join(" | ");
        yield prisma.adminSession.create({
            data: {
                AdminId: admin.Id,
                LoginTime: new Date(),
                Device: deviceInfo, // Device info hasil parsing
                UserAgent: userAgent, // User-Agent utuh
            },
        });
        res.json({
            message: "Login successful",
            token,
            session: {
                AdminId: admin.Id,
                Username: admin.Username,
                Email: admin.Email,
                Role: ((_k = admin.AdminRole) === null || _k === void 0 ? void 0 : _k.Name) || "Unknown",
                RoleId: (_l = admin.AdminRole) === null || _l === void 0 ? void 0 : _l.Id, // <-- ini juga
                SalesId: ((_m = admin.Sales) === null || _m === void 0 ? void 0 : _m.Id) || null,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        next(error);
    }
});
exports.adminLogin = adminLogin;
// ✅ GET Admin Session
const getAdminSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(400).json({ message: "Token is required." });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Fetch session
        const session = yield prisma.adminSession.findFirst({
            where: {
                AdminId: decoded.AdminId,
                LogoutTime: null,
            },
        });
        if (!session) {
            res.status(404).json({ message: "Session not found or expired." });
            return;
        }
        // Fetch SalesId if available
        const adminWithSales = yield prisma.admin.findUnique({
            where: { Id: decoded.AdminId },
            include: { Sales: true },
        });
        res.json({
            session: {
                AdminName: (adminWithSales === null || adminWithSales === void 0 ? void 0 : adminWithSales.Username) || "Unknown",
                AdminId: decoded.AdminId,
                SalesId: ((_b = adminWithSales === null || adminWithSales === void 0 ? void 0 : adminWithSales.Sales) === null || _b === void 0 ? void 0 : _b.Id) || null,
            },
        });
    }
    catch (error) {
        console.error("Session fetch error:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
});
exports.getAdminSession = getAdminSession;
// ✅ LOGOUT Admin (End Session)
const adminLogout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(400).json({ message: "Token is required for logout." });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        yield prisma.adminSession.updateMany({
            where: {
                AdminId: decoded.AdminId,
                LogoutTime: null,
            },
            data: {
                LogoutTime: new Date(),
            },
        });
        yield prisma.admin.update({
            where: { Id: decoded.AdminId },
            data: { Token: null },
        });
        res.json({ message: "Logout successful." });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
});
exports.adminLogout = adminLogout;
// ✅ CHECK Admin Role
const checkAdminRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: Token is required" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        res.json({ role: decoded.Role });
    }
    catch (error) {
        console.error("Invalid tokens:", error);
        res.status(403).json({ message: "Invalid tokens" });
    }
});
exports.checkAdminRole = checkAdminRole;
// ✅ Protected Route Example
const protectedRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { AdminId } = req.body;
    res.json({ message: `Access granted for AdminId: ${AdminId}` });
});
exports.protectedRoute = protectedRoute;
// ✅ Routes
router.post("/login", exports.adminLogin);
router.get("/session", authenticateToken_1.authenticateToken, exports.getAdminSession);
router.post("/logout", exports.adminLogout);
router.get("/role", authenticateToken_1.authenticateToken, exports.checkAdminRole);
router.get("/protected-route", authenticateToken_1.authenticateToken, exports.validateAdminId, exports.protectedRoute);
exports.default = router;
