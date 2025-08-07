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
exports.authorizeMenuFeatureAccess = exports.authorizeMenuAccess = exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
// Tambahkan di tipe express (src/types/express/index.d.ts):
// declare module "express-serve-static-core" {
//   interface Request {
//     admin?: {
//       Id: number;
//       Username: string;
//       Role: string;
//       RoleId: number;
//       SalesId?: number;
//     };
//   }
// }
class AuthError extends Error {
    constructor(message, status = 401) {
        super(message);
        this.status = status;
    }
}
// Middleware autentikasi admin, isi req.admin dari JWT
const adminAuth = (req, res, next) => {
    try {
        //  console.log("==[ADMIN AUTH]==", req.headers.authorization);
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
            ? authHeader.replace("Bearer ", "")
            : null;
        if (!token)
            return next(new AuthError("Token missing", 401));
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // console.log("[ADMIN AUTH] decoded JWT:", payload); // <-- ini wajib!
        req.admin = {
            Id: payload.AdminId,
            Username: payload.Username,
            Role: payload.Role,
            RoleId: payload.RoleId,
            SalesId: payload.SalesId
        };
        console.log("[adminAuth]", req.admin);
        next();
    }
    catch (err) {
        console.error("[adminAuth] JWT error:", err);
        return next(new AuthError("Invalid or expired token", 401));
    }
};
exports.adminAuth = adminAuth;
// Cek akses menu berdasarkan string menuName
const authorizeMenuAccess = (menuNames) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = req.admin;
        const menus = Array.isArray(menuNames) ? menuNames : [menuNames];
        if (!admin ||
            typeof admin.RoleId === "undefined" ||
            admin.RoleId === null ||
            isNaN(admin.RoleId)) {
            return next(new AuthError("Admin RoleId not found in token", 401));
        }
        if (!menus.length)
            return next(new AuthError("Menu name(s) is required in middleware", 400));
        let authorized = false;
        let lastMenuId = null;
        for (const menuName of menus) {
            const menu = yield prisma.menu.findFirst({ where: { Name: menuName } });
            if (!menu)
                continue;
            const roleAccess = yield prisma.roleMenuAccess.findFirst({
                where: { MenuId: menu.Id, RoleId: admin.RoleId },
            });
            if (roleAccess && roleAccess.Access !== "NONE") {
                authorized = true;
                lastMenuId = menu.Id;
                break;
            }
        }
        if (!authorized) {
            return next(new AuthError("Unauthorized: No menu access", 403));
        }
        // Optional: Simpan menuId terakhir yang lolos akses, jika mau dipakai handler berikutnya
        req.menuId = lastMenuId;
        next();
    }
    catch (err) {
        return next(new AuthError("Failed to verify menu access", 403));
    }
});
exports.authorizeMenuAccess = authorizeMenuAccess;
/**
 * Cek akses fitur pada menu tertentu, mendukung single atau array fitur.
 * @param menuName Nama menu (string)
 * @param featureNames Nama fitur (string atau array string)
 */
const authorizeMenuFeatureAccess = (menuName, featureNames) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = req.admin;
        console.log("[authorizeMenuAccess] admin object:", admin);
        console.log("[authorizeMenuAccess] typeof RoleId:", typeof (admin === null || admin === void 0 ? void 0 : admin.RoleId), admin === null || admin === void 0 ? void 0 : admin.RoleId);
        if (!admin ||
            typeof admin.RoleId === "undefined" ||
            admin.RoleId === null ||
            isNaN(admin.RoleId)) {
            return next(new AuthError("Admin RoleId not found in token", 401));
        }
        if (!menuName || !featureNames)
            return next(new AuthError("Menu and feature name(s) required in middleware", 400));
        // Cari menu
        const menu = yield prisma.menu.findFirst({ where: { Name: menuName } });
        if (!menu)
            return next(new AuthError("Menu not found", 404));
        // Ubah featureNames ke array jika bukan array
        const features = Array.isArray(featureNames) ? featureNames : [featureNames];
        for (const featureName of features) {
            // Cari menuFeature by MenuId + Feature
            const menuFeature = yield prisma.menuFeature.findFirst({
                where: { MenuId: menu.Id, Feature: featureName },
            });
            if (!menuFeature)
                return next(new AuthError(`Menu feature '${featureName}' not found`, 404));
            // Cek akses role pada fitur
            const featureAccess = yield prisma.roleMenuFeatureAccess.findFirst({
                where: {
                    MenuFeatureId: menuFeature.Id,
                    RoleId: admin.RoleId,
                },
            });
            if (!featureAccess || featureAccess.Access === "NONE") {
                return next(new AuthError(`Unauthorized: No access to feature '${featureName}'`, 403));
            }
        }
        next();
    }
    catch (err) {
        return next(new AuthError("Failed to verify feature access", 403));
    }
});
exports.authorizeMenuFeatureAccess = authorizeMenuFeatureAccess;
