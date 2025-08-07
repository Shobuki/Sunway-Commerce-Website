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
exports.removeUserFromDealer = exports.assignUserToDealer = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class User {
    constructor() {
        this.assignUserToDealer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { DealerId, UserId } = req.body;
                if (!DealerId || !UserId) {
                    res.status(400).json({ message: "DealerId and UserId are required." });
                    return;
                }
                const dealer = yield prisma.dealer.findUnique({ where: { Id: Number(DealerId) } });
                const user = yield prisma.user.findUnique({ where: { Id: Number(UserId) } });
                if (!dealer) {
                    res.status(404).json({ message: "Dealer not found." });
                    return;
                }
                if (!user) {
                    res.status(404).json({ message: "User not found." });
                    return;
                }
                yield prisma.user.update({
                    where: { Id: Number(UserId) },
                    data: {
                        Dealer: {
                            connect: { Id: Number(DealerId) },
                        },
                    },
                });
                res.status(200).json({ message: "User assigned to Dealer successfully." });
            }
            catch (error) {
                console.error("Error assigning User to Dealer:", error);
                next(error);
            }
        });
        this.removeUserFromDealer = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { DealerId, UserId } = req.body;
                if (!DealerId || !UserId) {
                    res.status(400).json({ message: "DealerId and UserId are required." });
                    return;
                }
                const dealer = yield prisma.dealer.findUnique({ where: { Id: Number(DealerId) } });
                const user = yield prisma.user.findUnique({ where: { Id: Number(UserId) } });
                if (!dealer) {
                    res.status(404).json({ message: "Dealer not found." });
                    return;
                }
                if (!user) {
                    res.status(404).json({ message: "User not found." });
                    return;
                }
                yield prisma.user.update({
                    where: { Id: Number(UserId) },
                    data: {
                        Dealer: {
                            disconnect: { Id: Number(DealerId) },
                        },
                    },
                });
                res.status(200).json({ message: "User removed from Dealer successfully." });
            }
            catch (error) {
                console.error("Error removing User from Dealer:", error);
                next(error);
            }
        });
    }
}
const userController = new User();
exports.assignUserToDealer = userController.assignUserToDealer;
exports.removeUserFromDealer = userController.removeUserFromDealer;
exports.default = {
    assignUserToDealer: exports.assignUserToDealer,
    removeUserFromDealer: exports.removeUserFromDealer,
};
