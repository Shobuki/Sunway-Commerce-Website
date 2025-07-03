import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { sessionId } = req.body;

  if (!sessionId || isNaN(Number(sessionId))) {
    res.status(400).json({ message: "Invalid sessionId." });
    return;
  }

  try {
    // Update LogoutTime, bukan delete
    await prisma.adminSession.update({
      where: { Id: Number(sessionId) },
      data: { LogoutTime: new Date() }
    });

    res.json({ message: "Session revoked (LogoutTime updated)." });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/admin/revoke
// body: { adminId: number }
export const revokeAllSessionByAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { adminId } = req.body;

  if (!adminId || isNaN(Number(adminId))) {
    res.status(400).json({ message: "Invalid adminId." });
    return;
  }

  try {
    // Set LogoutTime untuk semua session yang aktif (LogoutTime masih null)
    await prisma.adminSession.updateMany({
      where: { AdminId: Number(adminId), LogoutTime: null },
      data: { LogoutTime: new Date() }
    });

    // Optional: Hapus token (force logout)
    await prisma.admin.update({
      where: { Id: Number(adminId) },
      data: { Token: null }
    });

    res.json({ message: "All sessions for this admin revoked (LogoutTime updated)." });
  } catch (error) {
    next(error);
  }
};

export const getSessionsByAdminId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { adminId } = req.body;

  if (!adminId || isNaN(Number(adminId))) {
    res.status(400).json({ message: "Invalid adminId." });
    return;
  }

  try {
    const sessions = await prisma.adminSession.findMany({
      where: { AdminId: Number(adminId) },
      orderBy: { LoginTime: "desc" },
      take: 100
    });

    const result = sessions.map(sess => ({
      sessionId: sess.Id,
      adminId: sess.AdminId,
      logintime: sess.LoginTime,
      logouttime: sess.LogoutTime,
      status: !sess.LogoutTime ? "active" : "inactive",
      device: sess.Device ?? null,
      useragent: sess.UserAgent ?? null,
    }));

    res.json({ sessions: result });
  } catch (error) {
    next(error);
  }
};
