import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class EmailSalesOrderRecipient {

  createEmailRecipient = async (req: Request, res: Response): Promise<void> => {
    try {

      let { SalesId, RecipientEmail } = req.body;

      SalesId = Number(SalesId);

      if (!SalesId || isNaN(SalesId) || !RecipientEmail) {
        res.status(400).json({ message: "Valid SalesId and RecipientEmail are required." });
        return;
      }

      if (RecipientEmail.length > 255) {
        res.status(400).json({ message: "RecipientEmail maksimal 255 karakter." });
        return;
      }

   

      const existingRecipient = await prisma.emailSalesOrderRecipient.findFirst({
        where: {
          SalesId,
          RecipientEmail,
        },
      });

      if (existingRecipient) {
        res.status(400).json({ message: "Recipient already exists for this SalesId." });
        return;
      }

      const newRecipient = await prisma.emailSalesOrderRecipient.create({
        data: {
          SalesId,
          RecipientEmail,
        },
      });

      res.status(201).json({ message: "Recipient created successfully.", data: newRecipient });

    } catch (error) {
      console.error("Error creating recipient:", error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  };

  getRecipientsBySalesId = async (req: Request, res: Response): Promise<void> => {
    try {
      let { SalesId } = req.body;

      SalesId = Number(SalesId);

      if (!SalesId || isNaN(SalesId)) {
        res.status(400).json({ message: "Valid SalesId is required." });
        return;
      }

      const recipients = await prisma.emailSalesOrderRecipient.findMany({
        where: {
          SalesId,
          DeletedAt: null,
        },
      });

      res.status(200).json({
        message: "Recipients fetched successfully.",
        data: recipients,
      });

    } catch (error) {
      console.error("Error fetching recipients:", error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  };

  updateRecipient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { RecipientId, RecipientEmail } = req.body;

      if (!RecipientId || !RecipientEmail) {
        res.status(400).json({ message: "RecipientId and new RecipientEmail are required." });
        return;
      }

      // Dalam updateRecipient
if (RecipientEmail.length > 255) {
  res.status(400).json({ message: "RecipientEmail maksimal 255 karakter." });
  return;
}

      const updatedRecipient = await prisma.emailSalesOrderRecipient.updateMany({
        where: {
          Id: parseInt(RecipientId),
          DeletedAt: null,
        },
        data: {
          RecipientEmail,
        },
      });

      res.status(200).json({
        message: "Recipient updated successfully.",
        data: updatedRecipient,
      });

    } catch (error) {
      console.error("Error updating recipient:", error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  };

  deleteRecipient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { RecipientId } = req.body;

      if (!RecipientId) {
        res.status(400).json({ message: "RecipientId is required." });
        return;
      }

      await prisma.emailSalesOrderRecipient.delete({
        where: { Id: RecipientId },
      });

      res.status(200).json({
        message: "Recipient deleted successfully.",
      });

    } catch (error) {
      console.error("Error deleting recipient:", error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  };
}

const emailSalesOrderRecipientController = new EmailSalesOrderRecipient();

export const createEmailRecipient = emailSalesOrderRecipientController.createEmailRecipient;
export const getRecipientsBySalesId = emailSalesOrderRecipientController.getRecipientsBySalesId;
export const updateRecipient = emailSalesOrderRecipientController.updateRecipient;
export const deleteRecipient = emailSalesOrderRecipientController.deleteRecipient;
