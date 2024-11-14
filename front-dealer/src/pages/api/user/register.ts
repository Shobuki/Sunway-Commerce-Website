import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Set the directory for uploads
const uploadDir = path.join(process.cwd(), 'public', 'images', 'user');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const config = {
  api: {
    bodyParser: true, // Enable Next.js body parsing
  },
};

// Validation schema using Yup
const userSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  name: Yup.string().required('Name is required'),
  username: Yup.string().required('Username is required'),
  address: Yup.string().nullable(),
  birthdate: Yup.date().nullable(),
  country: Yup.string().nullable(),
  gender: Yup.string().oneOf(['Male', 'Female', "Can't say"]).nullable(),
  phonenumber: Yup.string().nullable(),
  province: Yup.string().nullable(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Read the data from the request
    const { email, password, name, username, address, birthdate, country, gender, phonenumber, province, image } = req.body;

    // Validate the fields
    await userSchema.validate(
      { email, password, name, username, address, birthdate, country, gender, phonenumber, province },
      { abortEarly: false }
    );

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username,
        address,
        birthdate: birthdate ? new Date(birthdate) : null,
        country,
        gender,
        phonenumber,
        province,
      },
    });

    console.log('New user created:', newUser);

    // Handle the image file
    let imagePath = null;
    if (image) {
      try {
        const base64Data = image.split(';base64,').pop();
        const extension = '.png'; // Adjust the file extension as needed
        const newFileName = `${newUser.id}${extension}`;
        const newFilePath = path.join(uploadDir, newFileName);

        // Save the image to the file system
        fs.writeFileSync(newFilePath, base64Data, { encoding: 'base64' });
        imagePath = `/images/user/${newFileName}`;

        // Update the user with the image path
        await prisma.user.update({
          where: { id: newUser.id },
          data: { image: imagePath },
        });
        console.log('User image path updated in the database:', imagePath);
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }

    // Generate a token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1h' });

    // Save the token in the database
    await prisma.user.update({
      where: { id: newUser.id },
      data: { token },
    });

    console.log('Token generated and saved:', token);

    // Respond with success
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        image: imagePath,
        address: newUser.address,
        birthdate: newUser.birthdate,
        country: newUser.country,
        gender: newUser.gender,
        phonenumber: newUser.phonenumber,
        province: newUser.province,
      },
      token,
    });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
