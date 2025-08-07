"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAdminId = void 0;
const extractAdminId = (req, res, next) => {
    const AdminId = req.body.AdminId || req.query.AdminId || req.headers["admin-id"];
    if (!AdminId) {
        res.status(400).json({ message: "Admin ID is required in the request." });
        return; // Ensure no further execution if adminId is missing
    }
    req.body.AdminId = AdminId; // Attach adminId to req.body
    next(); // Call the next middleware
};
exports.extractAdminId = extractAdminId;
