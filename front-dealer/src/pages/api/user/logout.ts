import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.body;

  try {
    // Verify the JWT token
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Update the session to add a logout time
    await prisma.userSession.updateMany({
      where: {
        userId: decoded.userId,
        logoutTime: null, // Ensure only active sessions are updated
      },
      data: {
        logoutTime: new Date(),
      },
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
