import { Request, Response } from 'express';
import { PrismaClient, AccessLevel } from '@prisma/client';

const prisma = new PrismaClient();

class AdminRole {
  validateAdminRoleInput = (input: any) => {
  if (!input.Name || input.Name.length > 30) return 'Role Name maksimal 30 karakter';
  if (input.Description && input.Description.length > 100) return 'Role Description maksimal 100 karakter';
  return null;
};

  createAdminRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { Name, Description, MenuAccess } = req.body;
      // MenuAccess: optional array of { MenuId: number, Access: AccessLevel }
 const errorMsg = this.validateAdminRoleInput(req.body);
    if (errorMsg) {
      res.status(400).json({ error: errorMsg });
      return;
    }
      const newAdminRole = await prisma.adminRole.create({
        data: {
          Name,
          Description,
          RoleAccess: MenuAccess && Array.isArray(MenuAccess)
            ? {
                create: MenuAccess.map((item: { MenuId: number; Access: AccessLevel }) => ({
                  MenuId: item.MenuId,
                  Access: item.Access || 'READ',
                })),
              }
            : undefined,
        },
        include: { RoleAccess: true },
      });

      res.status(201).json({ message: 'Admin role created successfully', data: newAdminRole });
    } catch (error) {
      console.error('Error creating admin role:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getAllAdminRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await prisma.adminRole.findMany({
        include: {
          RoleAccess: {
            include: { Menu: true },
          },
          Admin: true,
        },
      });
      res.status(200).json({ data: roles });
    } catch (error) {
      console.error('Error fetching admin roles:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getAdminRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const roleId = parseInt(id, 10);
      if (isNaN(roleId)) {
        res.status(400).json({ message: 'Invalid role ID' });
        return;
      }

      const adminRole = await prisma.adminRole.findUnique({
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
    } catch (error) {
      console.error('Error fetching admin role by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  updateAdminRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { Name, Description, MenuAccess } = req.body;

          const errorMsg = this.validateAdminRoleInput(req.body);
    if (errorMsg) {
      res.status(400).json({ error: errorMsg });
      return;
    }
      // Update basic fields
      const updatedRole = await prisma.adminRole.update({
        where: { Id: parseInt(id, 10) },
        data: {
          Name,
          Description,
        },
      });

      // Optional: Replace RoleAccess if provided
      if (Array.isArray(MenuAccess)) {
        // delete old access
        await prisma.roleMenuAccess.deleteMany({ where: { RoleId: updatedRole.Id } });

        // insert new ones
        await prisma.roleMenuAccess.createMany({
          data: MenuAccess.map((item: { MenuId: number; Access: AccessLevel }) => ({
            RoleId: updatedRole.Id,
            MenuId: item.MenuId,
            Access: item.Access || 'READ',
          })),
        });
      }

      res.status(200).json({ message: 'Admin role updated successfully', data: updatedRole });
    } catch (error) {
      console.error('Error updating admin role:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  deleteAdminRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id, 10);

    // 1. Cek apakah role masih dipakai oleh admin manapun
    const adminCount = await prisma.admin.count({
      where: { RoleId: roleId },
    });

    if (adminCount > 0) {
      res.status(400).json({ error: "Role tidak dapat dihapus karena masih ada admin yang memakai role ini." });
      return;
    }

    // 2. Hapus semua relasi RoleMenuAccess dan RoleMenuFeatureAccess
    await prisma.roleMenuAccess.deleteMany({ where: { RoleId: roleId } });
    await prisma.roleMenuFeatureAccess.deleteMany({ where: { RoleId: roleId } });

    // 3. Hapus adminRole-nya
    await prisma.adminRole.delete({
      where: { Id: roleId },
    });

    res.status(200).json({ message: 'Admin role deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
}

const adminRoleController = new AdminRole();

export const createAdminRole = adminRoleController.createAdminRole;
export const getAllAdminRoles = adminRoleController.getAllAdminRoles;
export const getAdminRoleById = adminRoleController.getAdminRoleById;
export const updateAdminRole = adminRoleController.updateAdminRole;
export const deleteAdminRole = adminRoleController.deleteAdminRole;

export default {
  createAdminRole,
  getAllAdminRoles,
  getAdminRoleById,
  updateAdminRole,
  deleteAdminRole,
};
