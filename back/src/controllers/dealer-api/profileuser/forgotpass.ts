// src/controllers/auth/forgotPassword.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const requestForgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const user = await prisma.user.findFirst({ where: { Email: email, DeletedAt: null } });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  const emailConfig = await prisma.emailConfig.findFirst({ where: { IsActive: true } });
  const template = await prisma.emailTemplate.findFirst({
    where: { TemplateType: "FORGOT_PASSWORD_USER", DeletedAt: null },
  });

  if (!emailConfig || !template) {
    res.status(500).json({ message: "Email configuration or template not found" });
    return;
  }

  await prisma.userForgotPasswordRequest.create({
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
      to: user.Email,
      subject,
      html: body,
    });

    res.status(200).json({ message: "Reset password email sent." });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
};


function isValidPassword(pw: string): boolean {
    if (!pw || pw.length < 5) return false;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    return hasLetter && hasNumber;
  }
  export const resetPassword = async (req: Request, res: Response) => {
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
      const request = await prisma.userForgotPasswordRequest.findFirst({
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
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      await prisma.user.update({
        where: { Id: request.UserId },
        data: { Password: hashedPassword },
      });
  
      await prisma.userForgotPasswordRequest.update({
        where: { Id: request.Id },
        data: { IsUsed: true, Status: "SENT" },
      });
  
      res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
      console.error("Reset error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };


  // GET email dari token
export const getResetEmailFromToken = async (req: Request, res: Response) => {
    const { token } = req.params;
  
    const request = await prisma.userForgotPasswordRequest.findFirst({
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
  };
  