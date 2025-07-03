import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class Admin {
  validateCreateAdminInput = (input: any) => {
    if (!input.Username || input.Username.length > 30) return 'Username maksimal 30 karakter';
    if (!input.Password || input.Password.length > 150) return 'Password maksimal 150 karakter';
    if (!input.Email || input.Email.length > 75) return 'Email maksimal 75 karakter';
    if (input.Name && input.Name.length > 50) return 'Name maksimal 50 karakter';
    if (input.PhoneNumber && input.PhoneNumber.length > 20) return 'PhoneNumber maksimal 20 karakter';
    if (input.Address && input.Address.length > 150) return 'Address maksimal 150 karakter';
    if (input.Gender && input.Gender.length > 10) return 'Gender maksimal 10 karakter';
    return null;
  };

  // Validasi untuk UPDATE (semua field opsional, jika diisi cek validasinya)
  validateUpdateAdminInput = (input: any) => {
    if (input.Username && input.Username.length > 30) return 'Username maksimal 30 karakter';
    if (input.Password) return 'Password tidak boleh diupdate lewat endpoint ini'; // Atau bisa skip, jika memang tidak bisa update password
    if (input.Email && input.Email.length > 75) return 'Email maksimal 75 karakter';
    if (input.Name && input.Name.length > 50) return 'Name maksimal 50 karakter';
    if (input.PhoneNumber && input.PhoneNumber.length > 20) return 'PhoneNumber maksimal 20 karakter';
    if (input.Address && input.Address.length > 150) return 'Address maksimal 150 karakter';
    if (input.Gender && input.Gender.length > 10) return 'Gender maksimal 10 karakter';
    return null;
  };

  createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Username, Password, Email, Name, Birthdate, PhoneNumber, Address, Gender, RoleId } = req.body;
    const errorMsg = this.validateCreateAdminInput(req.body);
    if (errorMsg) {
      res.status(400).json({ error: errorMsg });
      return;
    }
    const hashedPassword = await bcrypt.hash(Password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        Username,
        Password: hashedPassword,
        Email,
        Name,
        Birthdate: Birthdate ? new Date(Birthdate) : null,
        PhoneNumber,
        Address,
        Gender,
        RoleId: parseInt(RoleId, 10),
      },
    });
    // Hilangkan Password dari hasil response
    // Cara 1: destructuring
    const { Password: _pw, ...adminDataWithoutPassword } = newAdmin;
    res.status(201).json({ message: 'Admin created successfully', data: adminDataWithoutPassword });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
      const admins = await prisma.admin.findMany({
        where: { DeletedAt: null },
        include: {
          AdminRole: true,
          Sales: { include: {} },
        },
      });
      const formattedAdmins = admins.map((admin) => ({
        Id: admin.Id,
        Username: admin.Username,
        Email: admin.Email,
        Name: admin.Name,
        Birthdate: admin.Birthdate,
        PhoneNumber: admin.PhoneNumber,
        Address: admin.Address,
        Gender: admin.Gender,
        Role: admin.AdminRole?.Name,
        IsSales: !!admin.Sales,
        CreatedAt: admin.CreatedAt,
      }));
      res.status(200).json({ data: formattedAdmins });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  getAdminById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const admin = await prisma.admin.findUnique({
        where: { Id: parseInt(id, 10) },
        include: {
          AdminRole: true,
          Sales: { include: {} },
        },
      });
      if (!admin) {
        res.status(404).json({ message: 'Admin not found' });
        return;
      }
      const formattedAdmin = {
        Id: admin.Id,
        Username: admin.Username,
        Email: admin.Email,
        Name: admin.Name,
        Birthdate: admin.Birthdate,
        PhoneNumber: admin.PhoneNumber,
        Address: admin.Address,
        Gender: admin.Gender,
        Role: admin.AdminRole?.Name,
        IsSales: !!admin.Sales,
        CreatedAt: admin.CreatedAt,
      };
      res.status(200).json({ data: formattedAdmin });
    } catch (error) {
      console.error('Error fetching admin:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  updateAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const errorMsg = this.validateUpdateAdminInput(req.body);
    if (errorMsg) {
      res.status(400).json({ error: errorMsg });
      return;
    }

    const updateData: any = {};
    if (req.body.Username) updateData.Username = req.body.Username;
    if (req.body.Email) updateData.Email = req.body.Email;
    if (req.body.Name) updateData.Name = req.body.Name;
    if (req.body.Birthdate) updateData.Birthdate = new Date(req.body.Birthdate);
    if (req.body.PhoneNumber) updateData.PhoneNumber = req.body.PhoneNumber;
    if (req.body.Address) updateData.Address = req.body.Address;
    if (req.body.Gender) updateData.Gender = req.body.Gender;
    if (req.body.RoleId) updateData.RoleId = parseInt(req.body.RoleId, 10);

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields provided for update' });
      return;
    }

    const updatedAdmin = await prisma.admin.update({
      where: { Id: parseInt(id, 10) },
      data: updateData,
    });

    // Hilangkan Password dari hasil response
    const { Password: _pw, ...adminDataWithoutPassword } = updatedAdmin;
    res.status(200).json({ message: 'Admin updated successfully', data: adminDataWithoutPassword });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminToDelete = await prisma.admin.findUnique({
        where: { Id: parseInt(id, 10) },
        include: {
          AdminRole: true,
          Sales: true,
        },
      });
      if (!adminToDelete) {
        res.status(404).json({ message: 'Admin not found' });
        return;
      }
      if (adminToDelete.AdminRole?.Name === 'superadmin') {
        const superAdminCount = await prisma.admin.count({
          where: {
            RoleId: adminToDelete.RoleId,
            DeletedAt: null,
          },
        });
        if (superAdminCount <= 1) {
          res.status(400).json({ message: 'Cannot delete the last superadmin' });
          return;
        }
      }
      if (adminToDelete.Sales) {
        res.status(400).json({ message: 'Cannot delete an admin assigned to sales' });
        return;
      }
      await prisma.admin.update({
        where: { Id: parseInt(id, 10) },
        data: { DeletedAt: new Date() },
      });
      res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

// Instansiasi controller agar tetap bisa diimport (tanpa perlu .bind() lagi)
const adminController = new Admin();

export const createAdmin = adminController.createAdmin;
export const getAllAdmins = adminController.getAllAdmins;
export const getAdminById = adminController.getAdminById;
export const updateAdmin = adminController.updateAdmin;
export const deleteAdmin = adminController.deleteAdmin;
