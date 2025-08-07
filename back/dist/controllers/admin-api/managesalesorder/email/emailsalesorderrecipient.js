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
exports.deleteRecipient = exports.updateRecipient = exports.getRecipientsBySalesId = exports.createEmailRecipient = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EmailSalesOrderRecipient {
    constructor() {
        this.createEmailRecipient = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
                const existingRecipient = yield prisma.emailSalesOrderRecipient.findFirst({
                    where: {
                        SalesId,
                        RecipientEmail,
                    },
                });
                if (existingRecipient) {
                    res.status(400).json({ message: "Recipient already exists for this SalesId." });
                    return;
                }
                const newRecipient = yield prisma.emailSalesOrderRecipient.create({
                    data: {
                        SalesId,
                        RecipientEmail,
                    },
                });
                res.status(201).json({ message: "Recipient created successfully.", data: newRecipient });
            }
            catch (error) {
                console.error("Error creating recipient:", error);
                res.status(500).json({ message: "Internal Server Error." });
            }
        });
        this.getRecipientsBySalesId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let { SalesId } = req.body;
                SalesId = Number(SalesId);
                if (!SalesId || isNaN(SalesId)) {
                    res.status(400).json({ message: "Valid SalesId is required." });
                    return;
                }
                const recipients = yield prisma.emailSalesOrderRecipient.findMany({
                    where: {
                        SalesId,
                        DeletedAt: null,
                    },
                });
                res.status(200).json({
                    message: "Recipients fetched successfully.",
                    data: recipients,
                });
            }
            catch (error) {
                console.error("Error fetching recipients:", error);
                res.status(500).json({ message: "Internal Server Error." });
            }
        });
        this.updateRecipient = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
                const updatedRecipient = yield prisma.emailSalesOrderRecipient.updateMany({
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
            }
            catch (error) {
                console.error("Error updating recipient:", error);
                res.status(500).json({ message: "Internal Server Error." });
            }
        });
        this.deleteRecipient = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { RecipientId } = req.body;
                if (!RecipientId) {
                    res.status(400).json({ message: "RecipientId is required." });
                    return;
                }
                yield prisma.emailSalesOrderRecipient.delete({
                    where: { Id: RecipientId },
                });
                res.status(200).json({
                    message: "Recipient deleted successfully.",
                });
            }
            catch (error) {
                console.error("Error deleting recipient:", error);
                res.status(500).json({ message: "Internal Server Error." });
            }
        });
    }
}
const emailSalesOrderRecipientController = new EmailSalesOrderRecipient();
exports.createEmailRecipient = emailSalesOrderRecipientController.createEmailRecipient;
exports.getRecipientsBySalesId = emailSalesOrderRecipientController.getRecipientsBySalesId;
exports.updateRecipient = emailSalesOrderRecipientController.updateRecipient;
exports.deleteRecipient = emailSalesOrderRecipientController.deleteRecipient;
