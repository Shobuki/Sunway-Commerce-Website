import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

interface CustomJwtPayload extends JwtPayload {
  UserId: number;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Token is missing." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error("Token authentication error:", error);
    res.status(403).json({ message: "Invalid or expired token." });
  }
};
