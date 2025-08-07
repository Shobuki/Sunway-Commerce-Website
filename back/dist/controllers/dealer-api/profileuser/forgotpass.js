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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResetEmailFromToken = exports.resetPassword = exports.requestForgotPassword = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const requestForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    const user = yield prisma.user.findFirst({ where: { Email: email, DeletedAt: null } });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const token = (0, uuid_1.v4)();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    const emailConfig = yield prisma.emailConfig.findFirst({ where: { IsActive: true } });
    const template = yield prisma.emailTemplate.findFirst({
        where: { TemplateType: "FORGOT_PASSWORD_USER", DeletedAt: null },
    });
    if (!emailConfig || !template) {
        res.status(500).json({ message: "Email configuration or template not found" });
        return;
    }
    yield prisma.userForgotPasswordRequest.create({
        data: {
            UserId: user.Id,
            Token: token,
            ExpiresAt: expiresAt,
            EmailTemplateId: template.Id,
            SenderEmail: emailConfig.Email,
        },
    });
    const resetUrl = `http://sunflexstoreindonesia.com:3002/reset-password/${token}`;
    const subject = template.Subject || "Reset your password";
    const body = (template.Body || "")
        .replace("{{link}}", resetUrl)
        .replace("{{user}}", user.Name || user.Email);
    const transporter = nodemailer_1.default.createTransport({
        host: emailConfig.Host,
        port: emailConfig.Port,
        secure: emailConfig.Secure,
        auth: {
            user: emailConfig.Email,
            pass: emailConfig.Password,
        },
    });
    try {
        yield transporter.sendMail({
            from: `"Support" <${emailConfig.Email}>`,
            to: user.Email,
            subject,
            html: body,
        });
        res.status(200).json({ message: "Reset password email sent." });
    }
    catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ message: "Failed to send email." });
    }
});
exports.requestForgotPassword = requestForgotPassword;
function isValidPassword(pw) {
    if (!pw || pw.length < 5)
        return false;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    return hasLetter && hasNumber;
}
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    if (!newPassword) {
        res.status(400).json({ message: "Password is required." });
        return;
    }
    if (newPassword.length < 5) {
        res.status(400).json({ message: "Password must be at least 5 characters." });
        return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(newPassword)) {
        res.status(400).json({ message: "Password must contain both letters and numbers." });
        return;
    }
    try {
        const request = yield prisma.userForgotPasswordRequest.findFirst({
            where: {
                Token: token,
                IsUsed: false,
                ExpiresAt: { gt: new Date() },
            },
            include: { User: true },
        });
        if (!request) {
            res.status(400).json({ message: "Token invalid or expired." });
            return;
        }
        // 🔐 HASH PASSWORD SEBELUM UPDATE
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield prisma.user.update({
            where: { Id: request.UserId },
            data: { Password: hashedPassword },
        });
        yield prisma.userForgotPasswordRequest.update({
            where: { Id: request.Id },
            data: { IsUsed: true, Status: "SENT" },
        });
        res.status(200).json({ message: "Password updated successfully." });
    }
    catch (error) {
        console.error("Reset error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.resetPassword = resetPassword;
// GET email dari token
const getResetEmailFromToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const request = yield prisma.userForgotPasswordRequest.findFirst({
        where: {
            Token: token,
            IsUsed: false,
            ExpiresAt: { gt: new Date() },
        },
        include: { User: true },
    });
    if (!request || !request.User) {
        res.status(404).json({ message: "Token invalid or expired" });
        return;
    }
    res.status(200).json({ email: request.User.Email });
});
exports.getResetEmailFromToken = getResetEmailFromToken;
