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
exports.deleteEmailConfig = exports.upsertEmailConfig = exports.getAllEmailConfigs = exports.deleteEmailTemplate = exports.updateEmailTemplate = exports.createEmailTemplate = exports.getAllEmailTemplates = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailConfig {
    constructor() {
        // ========== EMAIL TEMPLATE ==========
        this.validateEmailConfigInput = (input) => {
            if (!input.Email || input.Email.length > 255)
                return 'Email maksimal 255 karakter';
            if (!input.Password || input.Password.length > 255)
                return 'Password maksimal 255 karakter';
            if (!input.Host || input.Host.length > 255)
                return 'Host maksimal 255 karakter';
            if (input.Port && String(input.Port).length > 5)
                return 'Port maksimal 5 digit';
            return null;
        };
        this.validateEmailTemplateInput = (input) => {
            if (!input.Name || input.Name.length > 100)
                return 'Nama template maksimal 100 karakter';
            if (!input.Subject || input.Subject.length > 255)
                return 'Subject maksimal 255 karakter';
            if (!input.Body)
                return 'Body wajib diisi';
            // Body: TEXT, boleh panjang
            if (!input.TemplateType)
                return 'TemplateType wajib dipilih';
            return null;
        };
        this.getAllEmailTemplates = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const templates = yield prisma.emailTemplate.findMany({ where: { DeletedAt: null } });
                res.json(templates);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to fetch templates" });
            }
        });
        this.createEmailTemplate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errorMsg = this.validateEmailTemplateInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ error: errorMsg });
                    return;
                }
                const { Name, Subject, Body, TemplateType } = req.body;
                // Soft delete existing template with same type
                yield prisma.emailTemplate.updateMany({
                    where: {
                        TemplateType,
                        DeletedAt: null,
                    },
                    data: {
                        DeletedAt: new Date(),
                    },
                });
                const template = yield prisma.emailTemplate.create({
                    data: { Name, Subject, Body, TemplateType },
                });
                res.status(201).json(template);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to create template" });
            }
        });
        this.updateEmailTemplate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id, Name, Subject, Body, TemplateType } = req.body;
                const errorMsg = this.validateEmailTemplateInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ error: errorMsg });
                    return;
                }
                // Soft delete other templates with same type (excluding current one)
                yield prisma.emailTemplate.updateMany({
                    where: {
                        TemplateType,
                        Id: { not: Number(Id) },
                        DeletedAt: null,
                    },
                    data: {
                        DeletedAt: new Date(),
                    },
                });
                const template = yield prisma.emailTemplate.update({
                    where: { Id: Number(Id) },
                    data: { Name, Subject, Body, TemplateType },
                });
                res.json(template);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to update template" });
            }
        });
        this.deleteEmailTemplate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.body;
                yield prisma.emailTemplate.update({
                    where: { Id: Number(Id) },
                    data: { DeletedAt: new Date() },
                });
                res.json({ message: "Template deleted" });
            }
            catch (error) {
                res.status(500).json({ error: "Failed to delete template" });
            }
        });
        // ========== EMAIL CONFIG ==========
        this.getAllEmailConfigs = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const configs = yield prisma.emailConfig.findMany({ where: { DeletedAt: null } });
                res.json(configs);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to fetch configs" });
            }
        });
        this.upsertEmailConfig = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id, Email, Password, Host, Port, Secure } = req.body;
                const errorMsg = this.validateEmailConfigInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ error: errorMsg });
                    return;
                }
                // 1. Cek kredensial SMTP dengan TLS bypass
                const transporter = nodemailer_1.default.createTransport({
                    host: Host,
                    port: Number(Port),
                    secure: Secure,
                    auth: {
                        user: Email,
                        pass: Password,
                    },
                    tls: {
                        rejectUnauthorized: false,
                    },
                });
                yield transporter.verify(); // ✅ login test
                // 2. Soft delete semua config aktif lainnya
                yield prisma.emailConfig.updateMany({
                    where: Id
                        ? { Id: { not: Number(Id) }, DeletedAt: null }
                        : { DeletedAt: null },
                    data: { DeletedAt: new Date() },
                });
                let config;
                // 3. Update jika ada Id, else Create
                if (Id) {
                    config = yield prisma.emailConfig.update({
                        where: { Id: Number(Id) },
                        data: { Email, Password, Host, Port, Secure },
                    });
                }
                else {
                    config = yield prisma.emailConfig.create({
                        data: { Email, Password, Host, Port, Secure },
                    });
                }
                res.status(200).json(config);
            }
            catch (error) {
                console.error("SMTP Login Failed:", error);
                res.status(400).json({
                    error: "SMTP Login Failed. Pastikan email, password, host, dan port valid. Jika Gmail, gunakan App Password.",
                });
            }
        });
        this.deleteEmailConfig = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Id } = req.body;
                yield prisma.emailConfig.update({
                    where: { Id: Number(Id) },
                    data: { DeletedAt: new Date() },
                });
                res.json({ message: "Config deleted" });
            }
            catch (error) {
                res.status(500).json({ error: "Failed to delete config" });
            }
        });
    }
}
const emailConfigController = new EmailConfig();
exports.getAllEmailTemplates = emailConfigController.getAllEmailTemplates;
exports.createEmailTemplate = emailConfigController.createEmailTemplate;
exports.updateEmailTemplate = emailConfigController.updateEmailTemplate;
exports.deleteEmailTemplate = emailConfigController.deleteEmailTemplate;
exports.getAllEmailConfigs = emailConfigController.getAllEmailConfigs;
exports.upsertEmailConfig = emailConfigController.upsertEmailConfig;
exports.deleteEmailConfig = emailConfigController.deleteEmailConfig;
exports.default = {
    getAllEmailTemplates: exports.getAllEmailTemplates,
    createEmailTemplate: exports.createEmailTemplate,
    updateEmailTemplate: exports.updateEmailTemplate,
    deleteEmailTemplate: exports.deleteEmailTemplate,
    getAllEmailConfigs: exports.getAllEmailConfigs,
    upsertEmailConfig: exports.upsertEmailConfig,
    deleteEmailConfig: exports.deleteEmailConfig,
};
