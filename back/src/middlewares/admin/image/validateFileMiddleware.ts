import { Request, Response, NextFunction } from "express";

export const validateFileMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  console.log("Headers:", req.headers); // Log header request untuk debugging
  console.log("Files Middleware:", req.files); // Log file yang diterima
  if (!req.files || Object.keys(req.files).length === 0) {
    console.error("No files detected in the request");
    res.status(400).json({ message: "No files uploaded" });
    return;
  }
  next(); // Jika file ada, lanjutkan ke middleware berikutnya atau handler
};
