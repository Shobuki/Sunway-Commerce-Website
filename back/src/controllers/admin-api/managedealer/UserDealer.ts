import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class User {
  assignUserToDealer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { DealerId, UserId } = req.body;

      if (!DealerId || !UserId) {
        res.status(400).json({ message: "DealerId and UserId are required." });
        return;
      }

      const dealer = await prisma.dealer.findUnique({ where: { Id: Number(DealerId) } });
      const user = await prisma.user.findUnique({ where: { Id: Number(UserId) } });

      if (!dealer) {
        res.status(404).json({ message: "Dealer not found." });
        return;
      }

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      await prisma.user.update({
        where: { Id: Number(UserId) },
        data: {
          Dealer: {
            connect: { Id: Number(DealerId) },
          },
        },
      });

      res.status(200).json({ message: "User assigned to Dealer successfully." });
    } catch (error) {
      console.error("Error assigning User to Dealer:", error);
      next(error);
    }
  };

  removeUserFromDealer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { DealerId, UserId } = req.body;

      if (!DealerId || !UserId) {
        res.status(400).json({ message: "DealerId and UserId are required." });
        return;
      }

      const dealer = await prisma.dealer.findUnique({ where: { Id: Number(DealerId) } });
      const user = await prisma.user.findUnique({ where: { Id: Number(UserId) } });

      if (!dealer) {
        res.status(404).json({ message: "Dealer not found." });
        return;
      }

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      await prisma.user.update({
        where: { Id: Number(UserId) },
        data: {
          Dealer: {
            disconnect: { Id: Number(DealerId) },
          },
        },
      });

      res.status(200).json({ message: "User removed from Dealer successfully." });
    } catch (error) {
      console.error("Error removing User from Dealer:", error);
      next(error);
    }
  };
}

const userController = new User();

export const assignUserToDealer = userController.assignUserToDealer;
export const removeUserFromDealer = userController.removeUserFromDealer;

export default {
  assignUserToDealer,
  removeUserFromDealer,
};
