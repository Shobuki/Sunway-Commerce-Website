import { Request, Response, NextFunction } from "express";

export const extractAdminId = (req: Request, res: Response, next: NextFunction): void => {
  const AdminId = req.body.AdminId || req.query.AdminId || req.headers["admin-id"];
  
  if (!AdminId) {
    res.status(400).json({ message: "Admin ID is required in the request." });
    return; // Ensure no further execution if adminId is missing
  }
  
  req.body.AdminId = AdminId; // Attach adminId to req.body
  next(); // Call the next middleware
};
