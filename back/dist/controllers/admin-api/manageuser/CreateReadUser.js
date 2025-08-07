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
exports.getUsers = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// **Create User (tanpa relasi ke Dealer)**
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Email, Name, Password, Username, Image, Address, Birthdate, Country, Gender, PhoneNumber, Province } = req.body;
        // Validasi input
        if (!Email || !Password || !Username) {
            res.status(400).json({ message: "Email, Password, and Username are required." });
            return;
        }
        // Cek apakah username atau email sudah digunakan
        const existingUser = yield prisma.user.findFirst({
            where: {
                OR: [{ Email }, { Username }],
            },
        });
        if (existingUser) {
            res.status(400).json({ message: "Email or Username already exists." });
            return;
        }
        // Buat user baru tanpa relasi ke Dealer
        const newUser = yield prisma.user.create({
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
    }
    catch (error) {
        console.error("Error creating user:", error);
        next(error);
    }
});
exports.createUser = createUser;
// **Read Users (termasuk Dealer jika ada)**
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            where: { DeletedAt: null },
            include: {
                Dealer: true, // Ambil data Dealer jika ada relasi
            },
            orderBy: { CreatedAt: "desc" },
        });
        res.status(200).json({ data: users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        next(error);
    }
});
exports.getUsers = getUsers;
exports.default = {
    createUser: exports.createUser,
    getUsers: exports.getUsers,
};
