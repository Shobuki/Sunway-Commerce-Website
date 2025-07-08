import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// === REQUEST FORGOT PASSWORD ADMIN ===
export const requestForgotPasswordAdmin = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const admin = await prisma.admin.findFirst({
    where: { Email: email, DeletedAt: null }
  });
  if (!admin) {
    res.status(404).json({ message: "Admin not found" });
    return;
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  // Email config and template (template type: "FORGOT_PASSWORD_ADMIN")
  const emailConfig = await prisma.emailConfig.findFirst({ where: { IsActive: true } });
  const template = await prisma.emailTemplate.findFirst({
    where: { TemplateType: "FORGOT_PASSWORD_ADMIN", DeletedAt: null }
  });

  if (!emailConfig || !template) {
    res.status(500).json({ message: "Email configuration or template not found" });
    return;
  }

  // Save request
  await prisma.adminForgotPasswordRequest.create({
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

  const transporter = nodemailer.createTransport({
    host: emailConfig.Host,
    port: emailConfig.Port,
    secure: emailConfig.Secure,
    auth: {
      user: emailConfig.Email,
      pass: emailConfig.Password,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Support" <${emailConfig.Email}>`,
      to: admin.Email,
      subject,
      html: body,
    });
    res.status(200).json({ message: "Reset password email sent." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};


// === GET EMAIL FROM TOKEN ===
export const getResetEmailFromAdminToken = async (req: Request, res: Response) => {
  const { token } = req.params;

  const request = await prisma.adminForgotPasswordRequest.findFirst({
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
};


// === PASSWORD VALIDATION ===
function isValidPassword(pw: string): boolean {
  if (!pw || pw.length < 5) return false;
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  return hasLetter && hasNumber;
}

// === RESET ADMIN PASSWORD ===
export const resetAdminPassword = async (req: Request, res: Response) => {
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
    const request = await prisma.adminForgotPasswordRequest.findFirst({
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
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { Id: request.AdminId },
      data: { Password: hashedPassword },
    });

    await prisma.adminForgotPasswordRequest.update({
      where: { Id: request.Id },
      data: { IsUsed: true, Status: "SENT" },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
