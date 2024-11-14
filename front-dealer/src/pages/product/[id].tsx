import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../../types/types';
import Navbar from '../../components/header/navbar';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import React, { useState } from 'react';

const prisma = new PrismaClient();

interface ProductProps {
  product: Product;
}

const DetailProduct: React.FC<ProductProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);

  // Handlers for quantity adjustment
  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Function to handle adding product to cart
  const handleAddToCart = async () => {
    const token = sessionStorage.getItem('userToken'); // Ambil token dari sessionStorage

    if (!token) {
      alert('Please log in to add items to the cart.');
      return;
    }

    try {
      const response = await fetch('/api/cart/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Tambahkan token di sini
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Product added to cart successfully!');
      } else {
        alert('Failed to add product to cart: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('An error occurred while adding the product to the cart.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-8">
        <div className="container mx-auto flex flex-wrap md:flex-nowrap gap-8">
          {/* Product Images */}
          <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-md border border-red-500">
            <div className="flex flex-wrap gap-4 mb-6">
              {product.images.map((img, index) => (
                <div key={img.id} className="w-full md:w-1/2 lg:w-1/3 p-2">
                  <Image
                    src={img.image.startsWith('/') ? img.image : '/default-placeholder.png'}
                    alt={`Product image ${index + 1}`}
                    width={400}
                    height={400}
                    className="rounded-md border border-gray-300"
                    unoptimized={true}
                  />
                </div>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-2 text-red-600">{product.name}</h1>
            <h2 className="text-3xl font-semibold mb-4 text-black">
              Rp {product.prices.length > 0 ? product.prices[0].price.toLocaleString() : 'N/A'}
            </h2>
            <p className="text-gray-700 mb-4">{product.description}</p>
          </div>

          {/* Product Info and Actions */}
          <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md border border-red-500">
            <h3 className="text-2xl font-semibold text-red-600 mb-4">Product Details</h3>
            <ul className="text-gray-700 mb-6">
              <li className="mb-2">
                <strong>Min. Order:</strong> 1 unit
              </li>
              {product.categories.length > 0 && (
                <li className="mb-2">
                  <strong>Category:</strong> {product.categories.map((cat) => cat.name).join(', ')}
                </li>
              )}

              {/* Stock Information */}
              <div className="bg-red-50 p-4 rounded-md border border-red-500 mb-4">
                <h3 className="text-xl font-semibold text-red-600">Stock Available</h3>
                <p className="text-gray-700">{product.stock} units left</p>
              </div>
            </ul>

            {/* Quantity Selector */}
            <div className="flex items-center mb-4">
              <button
                onClick={handleDecrease}
                className="px-3 py-1 border rounded-l-md bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                className="w-12 text-center border-t border-b"
              />
              <button
                onClick={handleIncrease}
                className="px-3 py-1 border rounded-r-md bg-gray-200 hover:bg-gray-300"
              >
                +
              </button>
              <span className="ml-4 text-gray-700 font-bold">
                Stock Total: {product.stock}
              </span>
            </div>

            {/* Corrected "Add to Cart" Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition mb-4"
            >
              + Add to Cart
            </button>
            <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};

  if (!id || isNaN(parseInt(id as string))) {
    return { notFound: true };
  }

  // Fetch product data from the database
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id as string) },
    include: {
      prices: true,
      images: true,
      categories: true,
      promos: true,
    },
  });

  if (!product) {
    return { notFound: true };
  }

  return {
    props: {
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        deletedAt: product.deletedAt ? product.deletedAt.toISOString() : null,
        prices: product.prices.map((price) => ({
          ...price,
          createdAt: price.createdAt.toISOString(),
          deletedAt: price.deletedAt ? price.deletedAt.toISOString() : null,
        })),
        images: product.images.map((image) => ({
          ...image,
          createdAt: image.createdAt.toISOString(),
          deletedAt: image.deletedAt ? image.deletedAt.toISOString() : null,
        })),
        categories: product.categories.map((category) => ({
          ...category,
          createdAt: category.createdAt.toISOString(),
          deletedAt: category.deletedAt ? category.deletedAt.toISOString() : null,
        })),
        promos: product.promos.map((promo) => ({
          ...promo,
          startDate: promo.startDate.toISOString(),
          endDate: promo.endDate.toISOString(),
        })),
      },
    },
  };
};

export default DetailProduct;
