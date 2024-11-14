import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader); // Debug: Cek apakah token ada di header

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token iss required' });
    }

    const token = authHeader.split(' ')[1];
    let userId: number;

    // Verifikasi token dan ambil userId dari token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
      console.log('Decoded User ID:', userId); // Debug: Cek apakah userId berhasil di-decode dari token
    } catch (error) {
      console.error('Token verification failed:', error); // Debug: Log jika token invalid atau expired
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (req.method === 'POST') {
      const { productId, quantity } = req.body;
      console.log('POST Request Received - Product ID:', productId, 'Quantity:', quantity); // Debug: Log detail produk

      if (!productId || !quantity || quantity <= 0) {
        console.error('Invalid product ID or quantity'); // Debug: Log jika ID produk atau jumlah tidak valid
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
      }

      // Cari atau buat keranjang untuk user
      let cart = await prisma.cart.findFirst({
        where: { userId },
      });
      console.log('Cart found:', cart); // Debug: Cek jika cart sudah ada atau perlu dibuat

      if (!cart) {
        console.log('No existing cart found for user, creating new cart...');
        cart = await prisma.cart.create({
          data: {
            userId,
          },
        });
      }

      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });
      console.log('Existing Cart Item:', existingCartItem); // Debug: Log jika item cart sudah ada atau tidak

      if (existingCartItem) {
        console.log('Product already in cart, updating quantity...');
        await prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + quantity,
          },
        });
      } else {
        console.log('Product not in cart, adding new cart item...');
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }

      return res.status(200).json({ message: 'Product added to cart successfully' });
    } else if (req.method === 'GET') {
      console.log('GET Request - Fetching cart for user ID:', userId);
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          cartItems: {
            include: {
              product: {
                include: {
                  prices: true,
                  images: true,
                },
              },
            },
          },
        },
      });
      console.log('Fetched Cart:', cart); // Debug: Log isi keranjang yang ditemukan

      if (!cart) {
        console.error('Cart not found for user'); // Debug: Log jika tidak ada keranjang yang ditemukan untuk user
        return res.status(404).json({ message: 'Cart not found' });
      }

      const formattedCartItems = cart.cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.prices.length > 0 ? item.product.prices[0].price : 0,
          imageUrl: item.product.images.length > 0 ? item.product.images[0].image : '/path/to/default-image.jpg',
        },
      }));

      console.log('Formatted Cart Items:', formattedCartItems); // Debug: Log item cart yang diformat untuk respon

      return res.status(200).json(formattedCartItems);
    } else {
      console.error('Method not allowed:', req.method); // Debug: Log metode request yang tidak diizinkan
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling cart:', error); // Debug: Log error general pada server
    res.status(500).json({ message: 'Internal server error' });
  }
}
