import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

// Middleware autentikasi admin, isi req.admin dari JWT
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("==[ADMIN AUTH]==", req.headers.authorization);
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) return next(new AuthError("Token missing", 401));

    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log("[ADMIN AUTH] decoded JWT:", payload); // <-- ini wajib!
    req.admin = {
      Id: payload.AdminId,
      Username: payload.Username,
      Role: payload.Role,
      RoleId: payload.RoleId,
      SalesId: payload.SalesId
    };
    console.log("[adminAuth]", req.admin);
    next();
  } catch (err) {
    console.error("[adminAuth] JWT error:", err);
    return next(new AuthError("Invalid or expired token", 401));
  }
};



// Cek akses menu berdasarkan string menuName
export const authorizeMenuAccess = (menuNames: string | string[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.admin;
    const menus = Array.isArray(menuNames) ? menuNames : [menuNames];

    if (
      !admin ||
      typeof admin.RoleId === "undefined" ||
      admin.RoleId === null ||
      isNaN(admin.RoleId)
    ) {
      return next(new AuthError("Admin RoleId not found in token", 401));
    }
    if (!menus.length) return next(new AuthError("Menu name(s) is required in middleware", 400));

    let authorized = false;
    let lastMenuId: number | null = null;
    for (const menuName of menus) {
      const menu = await prisma.menu.findFirst({ where: { Name: menuName } });
      if (!menu) continue;
      const roleAccess = await prisma.roleMenuAccess.findFirst({
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
    (req as any).menuId = lastMenuId;

    next();
  } catch (err) {
    return next(new AuthError("Failed to verify menu access", 403));
  }
};

/**
 * Cek akses fitur pada menu tertentu, mendukung single atau array fitur.
 * @param menuName Nama menu (string)
 * @param featureNames Nama fitur (string atau array string)
 */
export const authorizeMenuFeatureAccess = (
  menuName: string,
  featureNames: string | string[]
) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = req.admin;
    console.log("[authorizeMenuAccess] admin object:", admin);
    console.log("[authorizeMenuAccess] typeof RoleId:", typeof admin?.RoleId, admin?.RoleId);
    if (
      !admin ||
      typeof admin.RoleId === "undefined" ||
      admin.RoleId === null ||
      isNaN(admin.RoleId)
    ) {
      return next(new AuthError("Admin RoleId not found in token", 401));
    }
    if (!menuName || !featureNames)
      return next(new AuthError("Menu and feature name(s) required in middleware", 400));

    // Cari menu
    const menu = await prisma.menu.findFirst({ where: { Name: menuName } });
    if (!menu) return next(new AuthError("Menu not found", 404));

    // Ubah featureNames ke array jika bukan array
    const features: string[] = Array.isArray(featureNames) ? featureNames : [featureNames];

    for (const featureName of features) {
      // Cari menuFeature by MenuId + Feature
      const menuFeature = await prisma.menuFeature.findFirst({
        where: { MenuId: menu.Id, Feature: featureName },
      });
      if (!menuFeature) return next(new AuthError(`Menu feature '${featureName}' not found`, 404));

      // Cek akses role pada fitur
      const featureAccess = await prisma.roleMenuFeatureAccess.findFirst({
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
  } catch (err) {
    return next(new AuthError("Failed to verify feature access", 403));
  }
};