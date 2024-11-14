import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const activeSession = await prisma.userSession.findFirst({
      where: {
        userId: decoded.userId,
        logoutTime: null,
      },
    });

    if (!activeSession) {
      return res.status(401).json({ message: 'Session has expired' });
    }

    res.status(200).json({ message: 'Session is active', userId: decoded.userId });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
