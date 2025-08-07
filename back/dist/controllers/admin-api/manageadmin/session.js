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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionsByAdminId = exports.revokeAllSessionByAdmin = exports.revokeSession = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const revokeSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId } = req.body;
    if (!sessionId || isNaN(Number(sessionId))) {
        res.status(400).json({ message: "Invalid sessionId." });
        return;
    }
    try {
        // Update LogoutTime, bukan delete
        yield prisma.adminSession.update({
            where: { Id: Number(sessionId) },
            data: { LogoutTime: new Date() }
        });
        res.json({ message: "Session revoked (LogoutTime updated)." });
    }
    catch (error) {
        next(error);
    }
});
exports.revokeSession = revokeSession;
// POST /api/admin/admin/revoke
// body: { adminId: number }
const revokeAllSessionByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminId } = req.body;
    if (!adminId || isNaN(Number(adminId))) {
        res.status(400).json({ message: "Invalid adminId." });
        return;
    }
    try {
        // Set LogoutTime untuk semua session yang aktif (LogoutTime masih null)
        yield prisma.adminSession.updateMany({
            where: { AdminId: Number(adminId), LogoutTime: null },
            data: { LogoutTime: new Date() }
        });
        // Optional: Hapus token (force logout)
        yield prisma.admin.update({
            where: { Id: Number(adminId) },
            data: { Token: null }
        });
        res.json({ message: "All sessions for this admin revoked (LogoutTime updated)." });
    }
    catch (error) {
        next(error);
    }
});
exports.revokeAllSessionByAdmin = revokeAllSessionByAdmin;
const getSessionsByAdminId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { adminId } = req.body;
    if (!adminId || isNaN(Number(adminId))) {
        res.status(400).json({ message: "Invalid adminId." });
        return;
    }
    try {
        const sessions = yield prisma.adminSession.findMany({
            where: { AdminId: Number(adminId) },
            orderBy: { LoginTime: "desc" },
            take: 100
        });
        const result = sessions.map(sess => {
            var _a, _b;
            return ({
                sessionId: sess.Id,
                adminId: sess.AdminId,
                logintime: sess.LoginTime,
                logouttime: sess.LogoutTime,
                status: !sess.LogoutTime ? "active" : "inactive",
                device: (_a = sess.Device) !== null && _a !== void 0 ? _a : null,
                useragent: (_b = sess.UserAgent) !== null && _b !== void 0 ? _b : null,
            });
        });
        res.json({ sessions: result });
    }
    catch (error) {
        next(error);
    }
});
exports.getSessionsByAdminId = getSessionsByAdminId;
