"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileMiddleware = void 0;
const validateFileMiddleware = (req, res, next) => {
    console.log("Headers:", req.headers); // Log header request untuk debugging
    console.log("Files Middleware:", req.files); // Log file yang diterima
    if (!req.files || Object.keys(req.files).length === 0) {
        console.error("No files detected in the request");
        res.status(400).json({ message: "No files uploaded" });
        return;
    }
    next(); // Jika file ada, lanjutkan ke middleware berikutnya atau handler
};
exports.validateFileMiddleware = validateFileMiddleware;
