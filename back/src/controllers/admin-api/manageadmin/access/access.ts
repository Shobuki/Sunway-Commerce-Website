import { Request, Response } from "express";
import { PrismaClient, AccessLevel } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ GET: Matrix semua akses admin berdasarkan role + fitur menu
export const getAdminAccessMatrix = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.adminRole.findMany({
      include: {
        RoleAccess: { include: { Menu: true } },
        RoleFeatureAccess: { include: { MenuFeature: { include: { Menu: true } } } },
        Admin: {
          select: { Id: true, Name: true, Username: true, DeletedAt: true }
        }
      },
      orderBy: { Name: "asc" }
    });

    const menus = await prisma.menu.findMany({
      include: { MenuFeatures: true },
      orderBy: { Name: "asc" }
    });

    // Struktur matrix: per role → per menu → per feature
    const matrix = roles.map(role => ({
      RoleId: role.Id,
      RoleName: role.Name,
      Admins: role.Admin.filter(a => a.DeletedAt == null).map(a => ({
        AdminId: a.Id,
        AdminName: a.Name || a.Username
      })),
      Menus: menus.map(menu => ({
        MenuId: menu.Id,
        MenuName: menu.Name,
        Path: menu.Path,
        MenuAccess: role.RoleAccess.find(ra => ra.MenuId === menu.Id)?.Access || "NONE",
        Features: menu.MenuFeatures.map(feature => ({
          FeatureId: feature.Id,
          Feature: feature.Feature,
          FeatureAccess: role.RoleFeatureAccess.find(rfa => rfa.MenuFeatureId === feature.Id)?.Access || "NONE"
        }))
      }))
    }));

    res.status(200).json({ data: matrix });
  } catch (err) {
    console.error("Error loading access matrix", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ PUT: Update role access untuk menu tertentu (dan bisa extend untuk fitur)
export const updateRoleMenuAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { RoleId, MenuId, Access, MenuFeatureId } = req.body;
    if (!RoleId || (!MenuId && !MenuFeatureId) || !Access) {
      res.status(400).json({ message: "Missing RoleId, MenuId/MenuFeatureId, or Access." });
      return;
    }
    // Validasi access level enum
    if (!["NONE", "WRITE"].includes(Access)) {
      res.status(400).json({ message: "Invalid access level." });
      return;
    }

    // === Update akses menu utama
    if (MenuId) {
      const existing = await prisma.roleMenuAccess.findFirst({ where: { RoleId, MenuId } });
      if (existing) {
        await prisma.roleMenuAccess.update({ where: { Id: existing.Id }, data: { Access } });
      } else {
        await prisma.roleMenuAccess.create({ data: { RoleId, MenuId, Access } });
      }
      res.status(200).json({ message: "Menu access updated." });
      return;
    }

    // === Update akses fitur menu
    if (MenuFeatureId) {
      const existingFeature = await prisma.roleMenuFeatureAccess.findFirst({
        where: { RoleId, MenuFeatureId }
      });
      if (existingFeature) {
        await prisma.roleMenuFeatureAccess.update({
          where: { Id: existingFeature.Id },
          data: { Access }
        });
      } else {
        await prisma.roleMenuFeatureAccess.create({
          data: { RoleId, MenuFeatureId, Access }
        });
      }
      res.status(200).json({ message: "Menu feature access updated." });
      return;
    }

    res.status(400).json({ message: "No valid access target." });
  } catch (err) {
    console.error("Error updating access:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getMyMenuAccess = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "No token." });
    } else {
      const decoded = jwt.verify(token, JWT_SECRET) as { AdminId: number };

      const admin = await prisma.admin.findUnique({
        where: { Id: decoded.AdminId },
        include: {
          AdminRole: {
            include: {
              RoleAccess: { include: { Menu: true } },
              RoleFeatureAccess: {
                include: { MenuFeature: { include: { Menu: true } } }
              }
            }
          }
        }
      });

      if (!admin?.AdminRole) {
        res.status(403).json({ message: "No role." });
      } else {
        // Step 1: Dapatkan menu utama
        const menus = admin.AdminRole.RoleAccess
          .filter((ra) => ra.Access !== "NONE")
          .map((ra) => ({
            MenuId: ra.MenuId,
            Name: ra.Menu.Name,
            Path: ra.Menu.Path,
            Access: ra.Access
          }));

        // Step 2: Group feature ke dalam menu
        const menuFeatures = admin.AdminRole.RoleFeatureAccess
          .filter((fa) => fa.Access !== "NONE")
          .map((fa) => ({
            MenuId: fa.MenuFeature.MenuId,
            FeatureId: fa.MenuFeature.Id,
            Feature: fa.MenuFeature.Feature,
            Access: fa.Access
          }));

        // Step 3: Nest features ke menu
        const menuWithFeatures = menus.map(menu => ({
          ...menu,
          Features: menuFeatures
            .filter(f => f.MenuId === menu.MenuId)
            .map(f => ({
              FeatureId: f.FeatureId,
              Feature: f.Feature,
              Access: f.Access
            }))
        }));

        res.status(200).json(menuWithFeatures);
      }
    }
  } catch (error) {
    console.error("getMyMenuAccess error:", error);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};