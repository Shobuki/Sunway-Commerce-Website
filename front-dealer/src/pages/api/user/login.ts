import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { identifier, password } = req.body;

  try {
    // Log identifier and password for debugging (avoid logging password in production)
    console.log('Login attempt with identifier:', identifier);

    // Check if the user exists using either email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      console.log('User not found with identifier:', identifier);
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    // Log user data to verify retrieval
    console.log('User found:', user);

    // Verify the password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password verification:', isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // Create a session record in the database
    await prisma.userSession.create({
      data: {
        userId: user.id,
        loginTime: new Date(),
        token,
      },
    });

    console.log('Login successful, token generated:', token);

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
