import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import nodemailer from "nodemailer";

class EmailConfig {
  // ========== EMAIL TEMPLATE ==========

  validateEmailConfigInput = (input: any) => {
    if (!input.Email || input.Email.length > 255) return 'Email maksimal 255 karakter';
    if (!input.Password || input.Password.length > 255) return 'Password maksimal 255 karakter';
    if (!input.Host || input.Host.length > 255) return 'Host maksimal 255 karakter';
    if (input.Port && String(input.Port).length > 5) return 'Port maksimal 5 digit';
    return null;
  };

  validateEmailTemplateInput = (input: any) => {
    if (!input.Name || input.Name.length > 100) return 'Nama template maksimal 100 karakter';
    if (!input.Subject || input.Subject.length > 255) return 'Subject maksimal 255 karakter';
    if (!input.Body) return 'Body wajib diisi';
    // Body: TEXT, boleh panjang
    if (!input.TemplateType) return 'TemplateType wajib dipilih';
    return null;
  };


  getAllEmailTemplates = async (req: Request, res: Response) => {
    try {
      const templates = await prisma.emailTemplate.findMany({ where: { DeletedAt: null } });
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  };

  createEmailTemplate = async (req: Request, res: Response) => {
    try {
          const errorMsg = this.validateEmailTemplateInput(req.body);
    if (errorMsg) {
      res.status(400).json({ error: errorMsg });
      return;
    }
    
      const { Name, Subject, Body, TemplateType } = req.body;

      // Soft delete existing template with same type
      await prisma.emailTemplate.updateMany({
        where: {
          TemplateType,
          DeletedAt: null,
        },
        data: {
          DeletedAt: new Date(),
        },
      });

      const template = await prisma.emailTemplate.create({
        data: { Name, Subject, Body, TemplateType },
      });

      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to create template" });
    }
  };

  updateEmailTemplate = async (req: Request, res: Response) => {
    try {
      const { Id, Name, Subject, Body, TemplateType } = req.body;
      const errorMsg = this.validateEmailTemplateInput(req.body);
      if (errorMsg) {
        res.status(400).json({ error: errorMsg });
        return;
      }

      // Soft delete other templates with same type (excluding current one)
      await prisma.emailTemplate.updateMany({
        where: {
          TemplateType,
          Id: { not: Number(Id) },
          DeletedAt: null,
        },
        data: {
          DeletedAt: new Date(),
        },
      });

      const template = await prisma.emailTemplate.update({
        where: { Id: Number(Id) },
        data: { Name, Subject, Body, TemplateType },
      });

      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to update template" });
    }
  };

  deleteEmailTemplate = async (req: Request, res: Response) => {
    try {
      const { Id } = req.body;
      await prisma.emailTemplate.update({
        where: { Id: Number(Id) },
        data: { DeletedAt: new Date() },
      });
      res.json({ message: "Template deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  };

  // ========== EMAIL CONFIG ==========

  getAllEmailConfigs = async (req: Request, res: Response) => {
    try {
      const configs = await prisma.emailConfig.findMany({ where: { DeletedAt: null } });
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch configs" });
    }
  };

  upsertEmailConfig = async (req: Request, res: Response) => {
    try {
      const { Id, Email, Password, Host, Port, Secure } = req.body;

      const errorMsg = this.validateEmailConfigInput(req.body);
      if (errorMsg) {
        res.status(400).json({ error: errorMsg });
        return;
      }
      // 1. Cek kredensial SMTP dengan TLS bypass
      const transporter = nodemailer.createTransport({
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

      await transporter.verify(); // ✅ login test

      // 2. Soft delete semua config aktif lainnya
      await prisma.emailConfig.updateMany({
        where: Id
          ? { Id: { not: Number(Id) }, DeletedAt: null }
          : { DeletedAt: null },
        data: { DeletedAt: new Date() },
      });

      let config;

      // 3. Update jika ada Id, else Create
      if (Id) {
        config = await prisma.emailConfig.update({
          where: { Id: Number(Id) },
          data: { Email, Password, Host, Port, Secure },
        });
      } else {
        config = await prisma.emailConfig.create({
          data: { Email, Password, Host, Port, Secure },
        });
      }

      res.status(200).json(config);
    } catch (error) {
      console.error("SMTP Login Failed:", error);
      res.status(400).json({
        error:
          "SMTP Login Failed. Pastikan email, password, host, dan port valid. Jika Gmail, gunakan App Password.",
      });
    }
  };

  deleteEmailConfig = async (req: Request, res: Response) => {
    try {
      const { Id } = req.body;
      await prisma.emailConfig.update({
        where: { Id: Number(Id) },
        data: { DeletedAt: new Date() },
      });
      res.json({ message: "Config deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete config" });
    }
  };
}

const emailConfigController = new EmailConfig();

export const getAllEmailTemplates = emailConfigController.getAllEmailTemplates;
export const createEmailTemplate = emailConfigController.createEmailTemplate;
export const updateEmailTemplate = emailConfigController.updateEmailTemplate;
export const deleteEmailTemplate = emailConfigController.deleteEmailTemplate;

export const getAllEmailConfigs = emailConfigController.getAllEmailConfigs;
export const upsertEmailConfig = emailConfigController.upsertEmailConfig;
export const deleteEmailConfig = emailConfigController.deleteEmailConfig;

export default {
  getAllEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAllEmailConfigs,
  upsertEmailConfig,
  deleteEmailConfig,
};
