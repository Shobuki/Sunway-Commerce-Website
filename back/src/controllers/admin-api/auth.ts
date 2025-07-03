import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import * as UAParser from 'ua-parser-js';
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../../middlewares/admin/authenticateToken";

const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Middleware to validate AdminId
export const validateAdminId = (req: Request, res: Response, next: NextFunction): void => {
    const { AdminId } = req.body;
    if (!AdminId || isNaN(Number(AdminId))) {
        res.status(400).json({ message: "Invalid or missing AdminId." });
        return;
    }
    req.body.AdminId = parseInt(AdminId, 10);
    next();
};

// ✅ LOGIN Admin (Generate Token and Save Session)
export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { identifier, password } = req.body;
    const userAgent = req.headers['user-agent'] || "";

    try {
        if (!identifier || !password) {
            res.status(400).json({ message: "Username/email and password are required." });
            return;
        }

        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                    { Username: identifier },
                    { Email: identifier },
                ],
            },
            include: { AdminRole: true, Sales: true },
        });

        if (!admin) {
            res.status(404).json({ message: "Admin not found." });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, admin.Password);
        if (!passwordMatch) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }

        const token = jwt.sign(
            {
                AdminId: admin.Id,
                Role: admin.AdminRole?.Name || "Unknown",
                RoleId: admin.AdminRole?.Id, // <-- tambah ini!
                SalesId: admin.Sales?.Id
            },
            JWT_SECRET,
            // { expiresIn: "10h" }
        );

        await prisma.admin.update({
            where: { Id: admin.Id },
            data: { Token: token },
        });

        // --- PARSE USER AGENT ---
        const parser = new UAParser.UAParser();
        parser.setUA(userAgent);
        const uaResult = parser.getResult();
        const deviceInfo = [
            uaResult.os?.name,
            uaResult.os?.version,
            uaResult.browser?.name,
            uaResult.browser?.version,
            uaResult.device?.type,
            uaResult.device?.vendor,
        ]
            .filter(Boolean)
            .join(" | ");

        await prisma.adminSession.create({
            data: {
                AdminId: admin.Id,
                LoginTime: new Date(),
                Device: deviceInfo, // Device info hasil parsing
                UserAgent: userAgent, // User-Agent utuh
            },
        });

        res.json({
            message: "Login successful",
            token,
            session: {
                AdminId: admin.Id,
                Username: admin.Username,
                Email: admin.Email,
                Role: admin.AdminRole?.Name || "Unknown",
                RoleId: admin.AdminRole?.Id, // <-- ini juga
                SalesId: admin.Sales?.Id || null,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        next(error);
    }
};

// ✅ GET Admin Session
export const getAdminSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(400).json({ message: "Token is required." });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { AdminId: number };

        // Fetch session
        const session = await prisma.adminSession.findFirst({
            where: {
                AdminId: decoded.AdminId,
                LogoutTime: null,
            },
        });

        if (!session) {
            res.status(404).json({ message: "Session not found or expired." });
            return;
        }

        // Fetch SalesId if available
        const adminWithSales = await prisma.admin.findUnique({
            where: { Id: decoded.AdminId },
            include: { Sales: true },
        });

        res.json({
            session: {
                AdminName: adminWithSales?.Username || "Unknown",
                AdminId: decoded.AdminId,
                SalesId: adminWithSales?.Sales?.Id || null,
            },
        });
    } catch (error) {
        console.error("Session fetch error:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
};


// ✅ LOGOUT Admin (End Session)
export const adminLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(400).json({ message: "Token is required for logout." });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { AdminId: number };

        await prisma.adminSession.updateMany({
            where: {
                AdminId: decoded.AdminId,
                LogoutTime: null,
            },
            data: {
                LogoutTime: new Date(),
            },
        });

        await prisma.admin.update({
            where: { Id: decoded.AdminId },
            data: { Token: null },
        });

        res.json({ message: "Logout successful." });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
};

// ✅ CHECK Admin Role
export const checkAdminRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Unauthorized: Token is required" });
            return;
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { AdminId: number; Role: string };
        res.json({ role: decoded.Role });
    } catch (error) {
        console.error("Invalid tokens:", error);
        res.status(403).json({ message: "Invalid tokens" });
    }
};

// ✅ Protected Route Example
export const protectedRoute = async (req: Request, res: Response): Promise<void> => {
    const { AdminId } = req.body;
    res.json({ message: `Access granted for AdminId: ${AdminId}` });
};

// ✅ Routes
router.post("/login", adminLogin);
router.get("/session", authenticateToken, getAdminSession);
router.post("/logout", adminLogout);
router.get("/role", authenticateToken, checkAdminRole);
router.get("/protected-route", authenticateToken, validateAdminId, protectedRoute);

export default router;
