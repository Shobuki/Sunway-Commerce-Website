import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// **Create User (tanpa relasi ke Dealer)**
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { Email, Name, Password, Username, Image, Address, Birthdate, Country, Gender, PhoneNumber, Province } = req.body;

    // Validasi input
    if (!Email || !Password || !Username) {
      res.status(400).json({ message: "Email, Password, and Username are required." });
      return;
    }

    // Cek apakah username atau email sudah digunakan
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ Email }, { Username }],
      },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email or Username already exists." });
      return;
    }

    // Buat user baru tanpa relasi ke Dealer
    const newUser = await prisma.user.create({
      data: {
        Email,
        Name,
        Password, // Pastikan dienkripsi dalam produksi
        Username,
        Image,
        Address,
        Birthdate: Birthdate ? new Date(Birthdate) : null,
        Country,
        Gender,
        PhoneNumber,
        Province,
      },
    });

    res.status(201).json({ message: "User created successfully", data: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    next(error);
  }
};

// **Read Users (termasuk Dealer jika ada)**
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { DeletedAt: null },
      include: {
        Dealer: true, // Ambil data Dealer jika ada relasi
      },
      orderBy: { CreatedAt: "desc" },
    });

    res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error);
  }
};

export default {
  createUser,
  getUsers,
};
