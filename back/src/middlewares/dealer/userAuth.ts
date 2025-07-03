import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

// Middleware untuk autentikasi user (bukan admin!)
export const userAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) return next(new AuthError("Token missing", 401));
    const payload = jwt.verify(token, JWT_SECRET) as any;

    // Payload JWT harus ada field UserId, Username, Email (set saat login)
    req.user = {
      Id: payload.UserId,
      Username: payload.Username,
      Email: payload.Email,
    };
    next();
  } catch (err) {
    console.error("[userAuth] JWT error:", err);
    return next(new AuthError("Invalid or expired token", 401));
  }
};
