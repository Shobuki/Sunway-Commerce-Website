import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Middleware untuk memvalidasi SuperAdmin
export const authenticateSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: Token is required" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { AdminId: number; Role: string };

    // Validasi jika role bukan superadmin
    if (decoded.Role !== "superadmin") {
      res.status(403).json({ message: "Forbidden: Only superadmins can perform this action" });
      return;
    }

    // Set `AdminId` dan `Role` di `req.body`
    req.body.AdminId = decoded.AdminId;
    req.body.Role = decoded.Role;

    console.log("SuperAdmin validated:", {
      AdminId: req.body.AdminId,
      Role: req.body.Role,
    });

    next(); // Melanjutkan ke middleware berikutnya
  } catch (error) {
    const err = error as Error;
    console.error("Invalid token:", err.message); // Gunakan `err.message` dengan aman
    res.status(403).json({ message: "Invalid token" });
  }
};

export default authenticateSuperAdmin;
