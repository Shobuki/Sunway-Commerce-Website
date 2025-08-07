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
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}
// ==============================
// ✅ REGISTER USER
// ==============================
router.post("/register", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password, name, phoneNumber, address, birthdate, country, gender, province } = req.body;
    try {
        // 🚫 Validasi input
        // Required
        if (!email || !username || !password) {
            res.status(400).json({ message: "Email, username, and password are required." });
            return;
        }
        // Length Validation
        if (String(email).trim().length > 75) {
            res.status(400).json({ message: "Email cannot exceed 75 characters." });
            return;
        }
        if (String(username).trim().length > 30) {
            res.status(400).json({ message: "Username cannot exceed 30 characters." });
            return;
        }
        if (name && String(name).trim().length > 50) {
            res.status(400).json({ message: "Name cannot exceed 50 characters." });
            return;
        }
        if (password && String(password).length > 100) {
            res.status(400).json({ message: "Password cannot exceed 100 characters." });
            return;
        }
        if (address && String(address).trim().length > 150) {
            res.status(400).json({ message: "Address cannot exceed 150 characters." });
            return;
        }
        if (country && String(country).trim().length > 30) {
            res.status(400).json({ message: "Country cannot exceed 30 characters." });
            return;
        }
        if (gender && String(gender).trim().length > 10) {
            res.status(400).json({ message: "Gender cannot exceed 10 characters." });
            return;
        }
        if (phoneNumber && String(phoneNumber).trim().length > 20) {
            res.status(400).json({ message: "Phone number cannot exceed 20 characters." });
            return;
        }
        if (province && String(province).trim().length > 30) {
            res.status(400).json({ message: "Province cannot exceed 30 characters." });
            return;
        }
        // Optional: validasi birthdate (jika diisi)
        if (birthdate && isNaN(Date.parse(birthdate))) {
            res.status(400).json({ message: "Invalid birthdate format." });
            return;
        }
        // 🔄 Cek apakah user dengan email atau username sudah ada
        const existingUser = yield prisma.user.findFirst({
            where: {
                OR: [
                    { Email: email },
                    { Username: username },
                ],
            },
        });
        if (existingUser) {
            res.status(409).json({ message: "User with this email or username already exists." });
            return;
        }
        // 🔒 Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // 🟢 Create new user
        const newUser = yield prisma.user.create({
            data: {
                Email: email,
                Username: username,
                Password: hashedPassword,
                Name: name,
                PhoneNumber: phoneNumber,
                Address: address,
                Birthdate: birthdate ? new Date(birthdate) : undefined,
                Country: country,
                Gender: gender,
                Province: province,
            },
        });
        // 🔐 Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ UserId: newUser.Id }, JWT_SECRET, { expiresIn: "1h" });
        // 💾 Simpan token di database
        yield prisma.user.update({
            where: { Id: newUser.Id },
            data: { Token: token },
        });
        // 📅 Simpan session di UserSession
        yield prisma.userSession.create({
            data: {
                UserId: newUser.Id,
                LoginTime: new Date(),
                Token: token,
            },
        });
        res.status(201).json({
            message: "User registered successfully.",
            token,
            user: {
                UserId: newUser.Id,
                Username: newUser.Username,
                Email: newUser.Email,
                Name: newUser.Name,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        next(error);
    }
}));
exports.default = router;
