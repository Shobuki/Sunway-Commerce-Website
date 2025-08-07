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
exports.resetAdminPassword = exports.getResetEmailFromAdminToken = exports.requestForgotPasswordAdmin = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
// === REQUEST FORGOT PASSWORD ADMIN ===
const requestForgotPasswordAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    const admin = yield prisma.admin.findFirst({
        where: { Email: email, DeletedAt: null }
    });
    if (!admin) {
        res.status(404).json({ message: "Admin not found" });
        return;
    }
    const token = (0, uuid_1.v4)();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    // Email config and template (template type: "FORGOT_PASSWORD_ADMIN")
    const emailConfig = yield prisma.emailConfig.findFirst({ where: { IsActive: true } });
    const template = yield prisma.emailTemplate.findFirst({
        where: { TemplateType: "FORGOT_PASSWORD_ADMIN", DeletedAt: null }
    });
    if (!emailConfig || !template) {
        res.status(500).json({ message: "Email configuration or template not found" });
        return;
    }
    // Save request
    yield prisma.adminForgotPasswordRequest.create({
        data: {
            AdminId: admin.Id,
            Token: token,
            ExpiresAt: expiresAt,
            EmailTemplateId: template.Id,
            SenderEmail: emailConfig.Email,
        }
    });
    // Replace template variables
    const resetUrl = `http://sunflexstoreindonesia.com:3001/reset-password/${token}`;
    const subject = template.Subject || "Reset your password";
    const body = (template.Body || "")
        .replace("{{link}}", resetUrl)
        .replace("{{user}}", admin.Name || admin.Email);
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
            to: admin.Email,
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
exports.requestForgotPasswordAdmin = requestForgotPasswordAdmin;
// === GET EMAIL FROM TOKEN ===
const getResetEmailFromAdminToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const request = yield prisma.adminForgotPasswordRequest.findFirst({
        where: {
            Token: token,
            IsUsed: false,
            ExpiresAt: { gt: new Date() },
        },
        include: { Admin: true },
    });
    if (!request || !request.Admin) {
        res.status(404).json({ message: "Token invalid or expired" });
        return;
    }
    res.status(200).json({ email: request.Admin.Email });
});
exports.getResetEmailFromAdminToken = getResetEmailFromAdminToken;
// === PASSWORD VALIDATION ===
function isValidPassword(pw) {
    if (!pw || pw.length < 5)
        return false;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    return hasLetter && hasNumber;
}
// === RESET ADMIN PASSWORD ===
const resetAdminPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    if (!newPassword) {
        res.status(400).json({ message: "Password is required." });
        return;
    }
    if (!isValidPassword(newPassword)) {
        res.status(400).json({ message: "Password minimal 5 karakter dan kombinasi huruf + angka." });
        return;
    }
    try {
        const request = yield prisma.adminForgotPasswordRequest.findFirst({
            where: {
                Token: token,
                IsUsed: false,
                ExpiresAt: { gt: new Date() },
            },
            include: { Admin: true },
        });
        if (!request || !request.Admin) {
            res.status(400).json({ message: "Token invalid or expired." });
            return;
        }
        // Hash password before save
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield prisma.admin.update({
            where: { Id: request.AdminId },
            data: { Password: hashedPassword },
        });
        yield prisma.adminForgotPasswordRequest.update({
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
exports.resetAdminPassword = resetAdminPassword;
