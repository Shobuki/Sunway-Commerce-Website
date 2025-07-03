import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../../../middlewares/dealer/authenticateToken";

const prisma = new PrismaClient();
const router = express.Router();

// Ensure JWT_SECRET is defined
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}


// Define the custom JWT payload
interface CustomJwtPayload extends JwtPayload {
  UserId: number;
}

// ==============================
// 🔒 LOGIN User (Generate Token)
// ==============================
router.post("/login", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      res.status(400).json({ message: "Username/Email and password are required." });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ Username: identifier }, { Email: identifier }],
        DeletedAt: null,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = jwt.sign({ UserId: user.Id }, JWT_SECRET, { expiresIn: "1h" });

    await prisma.user.update({
      where: { Id: user.Id },
      data: { Token: token },
    });

    await prisma.userSession.create({
      data: {
        UserId: user.Id,
        LoginTime: new Date(),
        Token: token,
      },
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        UserId: user.Id,
        Username: user.Username,
        Email: user.Email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
});

// ==============================
// 🚪 LOGOUT User (End Session)
// ==============================
router.post("/logout", authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(400).json({ message: "Token is required for logout." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as CustomJwtPayload;

    if (!decoded.UserId) {
      res.status(401).json({ message: "Invalid token payload." });
      return;
    }

    await prisma.userSession.updateMany({
      where: {
        UserId: decoded.UserId,
        LogoutTime: null,
      },
      data: {
        LogoutTime: new Date(),
      },
    });

    await prisma.user.update({
      where: { Id: decoded.UserId },
      data: { Token: null },
    });

    res.json({ message: "Logout successful." });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
    next(error);
  }
});

// ===================================
// ✅ PROTECTED ROUTE EXAMPLE (User)
// ===================================
router.get("/auth", authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(400).json({ message: "Token is required." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as CustomJwtPayload;

    if (!decoded.UserId) {
      res.status(401).json({ message: "Invalid token payload." });
      return;
    }

    // ✅ Fetch the user data based on UserId from token
    const user = await prisma.user.findUnique({
      where: { Id: decoded.UserId, DeletedAt: null },
      select: {
        Id: true,
        Username: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // ✅ Return user profile data
    res.status(200).json({
      message: "User profile fetched successfully.",
      user,
    });

  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Invalid or expired token." });
  }
});


export default router;
