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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdminRole = exports.updateAdminRole = exports.getAdminRoleById = exports.getAllAdminRoles = exports.createAdminRole = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AdminRole {
    constructor() {
        this.validateAdminRoleInput = (input) => {
            if (!input.Name || input.Name.length > 30)
                return 'Role Name maksimal 30 karakter';
            if (input.Description && input.Description.length > 100)
                return 'Role Description maksimal 100 karakter';
            return null;
        };
        this.createAdminRole = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Name, Description, MenuAccess } = req.body;
                // MenuAccess: optional array of { MenuId: number, Access: AccessLevel }
                const errorMsg = this.validateAdminRoleInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ error: errorMsg });
                    return;
                }
                const newAdminRole = yield prisma.adminRole.create({
                    data: {
                        Name,
                        Description,
                        RoleAccess: MenuAccess && Array.isArray(MenuAccess)
                            ? {
                                create: MenuAccess.map((item) => ({
                                    MenuId: item.MenuId,
                                    Access: item.Access || 'READ',
                                })),
                            }
                            : undefined,
                    },
                    include: { RoleAccess: true },
                });
                res.status(201).json({ message: 'Admin role created successfully', data: newAdminRole });
            }
            catch (error) {
                console.error('Error creating admin role:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.getAllAdminRoles = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const roles = yield prisma.adminRole.findMany({
                    include: {
                        RoleAccess: {
                            include: { Menu: true },
                        },
                        Admin: true,
                    },
                });
                res.status(200).json({ data: roles });
            }
            catch (error) {
                console.error('Error fetching admin roles:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.getAdminRoleById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const roleId = parseInt(id, 10);
                if (isNaN(roleId)) {
                    res.status(400).json({ message: 'Invalid role ID' });
                    return;
                }
                const adminRole = yield prisma.adminRole.findUnique({
                    where: { Id: roleId },
                    include: {
                        Admin: true,
                        RoleAccess: {
                            include: {
                                Menu: true,
                            },
                        },
                    },
                });
                if (!adminRole) {
                    res.status(404).json({ message: 'Admin role not found' });
                    return;
                }
                res.status(200).json({ data: adminRole });
            }
            catch (error) {
                console.error('Error fetching admin role by ID:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.updateAdminRole = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { Name, Description, MenuAccess } = req.body;
                const errorMsg = this.validateAdminRoleInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ error: errorMsg });
                    return;
                }
                // Update basic fields
                const updatedRole = yield prisma.adminRole.update({
                    where: { Id: parseInt(id, 10) },
                    data: {
                        Name,
                        Description,
                    },
                });
                // Optional: Replace RoleAccess if provided
                if (Array.isArray(MenuAccess)) {
                    // delete old access
                    yield prisma.roleMenuAccess.deleteMany({ where: { RoleId: updatedRole.Id } });
                    // insert new ones
                    yield prisma.roleMenuAccess.createMany({
                        data: MenuAccess.map((item) => ({
                            RoleId: updatedRole.Id,
                            MenuId: item.MenuId,
                            Access: item.Access || 'READ',
                        })),
                    });
                }
                res.status(200).json({ message: 'Admin role updated successfully', data: updatedRole });
            }
            catch (error) {
                console.error('Error updating admin role:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.deleteAdminRole = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const roleId = parseInt(id, 10);
                // 1. Cek apakah role masih dipakai oleh admin manapun
                const adminCount = yield prisma.admin.count({
                    where: { RoleId: roleId },
                });
                if (adminCount > 0) {
                    res.status(400).json({ error: "Role tidak dapat dihapus karena masih ada admin yang memakai role ini." });
                    return;
                }
                // 2. Hapus semua relasi RoleMenuAccess dan RoleMenuFeatureAccess
                yield prisma.roleMenuAccess.deleteMany({ where: { RoleId: roleId } });
                yield prisma.roleMenuFeatureAccess.deleteMany({ where: { RoleId: roleId } });
                // 3. Hapus adminRole-nya
                yield prisma.adminRole.delete({
                    where: { Id: roleId },
                });
                res.status(200).json({ message: 'Admin role deleted successfully' });
            }
            catch (error) {
                console.error('Error deleting admin role:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
}
const adminRoleController = new AdminRole();
exports.createAdminRole = adminRoleController.createAdminRole;
exports.getAllAdminRoles = adminRoleController.getAllAdminRoles;
exports.getAdminRoleById = adminRoleController.getAdminRoleById;
exports.updateAdminRole = adminRoleController.updateAdminRole;
exports.deleteAdminRole = adminRoleController.deleteAdminRole;
exports.default = {
    createAdminRole: exports.createAdminRole,
    getAllAdminRoles: exports.getAllAdminRoles,
    getAdminRoleById: exports.getAdminRoleById,
    updateAdminRole: exports.updateAdminRole,
    deleteAdminRole: exports.deleteAdminRole,
};
