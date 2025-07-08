import dotenv from "dotenv";
dotenv.config(); // ✅ lebih konsisten
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import adminApiRouter from './routes/admin-api';
import dealerApiRouter from './routes/dealer-api';

const app = express();

const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://sunflexstoreindonesia.com:3001',
  'http://sunflexstoreindonesia.com:3002',
  'https://sunflexstoreindonesia.com',
  'http://sunflexstoreindonesia.com',
  'https://sunflexstoreindonesia.com:3001',
  'https://sunflexstoreindonesia.com:3002',
];

app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS Origin:', origin);
    console.log('AllowedOrigins:', allowedOrigins);
    console.log('IndexOf:', allowedOrigins.indexOf(origin ?? ''));
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS BLOCKED ORIGIN:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

// Middleware JSON and URL-encoded parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for static files
//middleware product category image
app.use('/images/product/productcategoryimage', express.static(path.join(__dirname, '../public/admin/images/product/productcategoryimage')));

//middleware product image
app.use('/images/product/productimage', express.static(path.join(__dirname, '../public/admin/images/product/productimage')));

//middleware item code image
app.use('/images/product/itemcode/itemcodeimage', express.static(path.join(__dirname, '../public/admin/images/product/itemcodeimage')));

//middleware profile image admin
app.use('/images/profile', express.static(path.join(__dirname, '../public/admin/images/profile')));

//middleware profile image user
app.use('/images/user/profile', express.static(path.join(__dirname, '../public/dealer/images/profile')));

//middleware dll (blm guna)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  if (!req.url.startsWith('/images') && req.url !== '/') {
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
  }
  next();
});

// Routes

app.use('/api/admin', adminApiRouter);
app.use('/api/dealer', dealerApiRouter);


// Handle CORS preflight
app.options('*', cors());

// Base route
app.get('/', (req: Request, res: Response) => {
  res.send('API is working!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
