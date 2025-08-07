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
exports.getMyMenuAccess = exports.updateRoleMenuAccess = exports.getAdminAccessMatrix = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
// ✅ GET: Matrix semua akses admin berdasarkan role + fitur menu
const getAdminAccessMatrix = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield prisma.adminRole.findMany({
            include: {
                RoleAccess: { include: { Menu: true } },
                RoleFeatureAccess: { include: { MenuFeature: { include: { Menu: true } } } },
                Admin: {
                    select: { Id: true, Name: true, Username: true, DeletedAt: true }
                }
            },
            orderBy: { Name: "asc" }
        });
        const menus = yield prisma.menu.findMany({
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
            Menus: menus.map(menu => {
                var _a;
                return ({
                    MenuId: menu.Id,
                    MenuName: menu.Name,
                    Path: menu.Path,
                    MenuAccess: ((_a = role.RoleAccess.find(ra => ra.MenuId === menu.Id)) === null || _a === void 0 ? void 0 : _a.Access) || "NONE",
                    Features: menu.MenuFeatures.map(feature => {
                        var _a;
                        return ({
                            FeatureId: feature.Id,
                            Feature: feature.Feature,
                            FeatureAccess: ((_a = role.RoleFeatureAccess.find(rfa => rfa.MenuFeatureId === feature.Id)) === null || _a === void 0 ? void 0 : _a.Access) || "NONE"
                        });
                    })
                });
            })
        }));
        res.status(200).json({ data: matrix });
    }
    catch (err) {
        console.error("Error loading access matrix", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getAdminAccessMatrix = getAdminAccessMatrix;
// ✅ PUT: Update role access untuk menu tertentu (dan bisa extend untuk fitur)
const updateRoleMenuAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const existing = yield prisma.roleMenuAccess.findFirst({ where: { RoleId, MenuId } });
            if (existing) {
                yield prisma.roleMenuAccess.update({ where: { Id: existing.Id }, data: { Access } });
            }
            else {
                yield prisma.roleMenuAccess.create({ data: { RoleId, MenuId, Access } });
            }
            res.status(200).json({ message: "Menu access updated." });
            return;
        }
        // === Update akses fitur menu
        if (MenuFeatureId) {
            const existingFeature = yield prisma.roleMenuFeatureAccess.findFirst({
                where: { RoleId, MenuFeatureId }
            });
            if (existingFeature) {
                yield prisma.roleMenuFeatureAccess.update({
                    where: { Id: existingFeature.Id },
                    data: { Access }
                });
            }
            else {
                yield prisma.roleMenuFeatureAccess.create({
                    data: { RoleId, MenuFeatureId, Access }
                });
            }
            res.status(200).json({ message: "Menu feature access updated." });
            return;
        }
        res.status(400).json({ message: "No valid access target." });
    }
    catch (err) {
        console.error("Error updating access:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateRoleMenuAccess = updateRoleMenuAccess;
const getMyMenuAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "No token." });
        }
        else {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const admin = yield prisma.admin.findUnique({
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
            if (!(admin === null || admin === void 0 ? void 0 : admin.AdminRole)) {
                res.status(403).json({ message: "No role." });
            }
            else {
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
                const menuWithFeatures = menus.map(menu => (Object.assign(Object.assign({}, menu), { Features: menuFeatures
                        .filter(f => f.MenuId === menu.MenuId)
                        .map(f => ({
                        FeatureId: f.FeatureId,
                        Feature: f.Feature,
                        Access: f.Access
                    })) })));
                res.status(200).json(menuWithFeatures);
            }
        }
    }
    catch (error) {
        console.error("getMyMenuAccess error:", error);
        res.status(401).json({ message: "Invalid or expired token." });
    }
});
exports.getMyMenuAccess = getMyMenuAccess;
