import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Navbar from '../../components/header/navbar';

interface ProductImage {
  Image: string;
}

interface PartNumberDetail {
  Id: number;
  Name: string;
  Description: string;
  Dash: number;
  InnerDiameter: number;
  OuterDiameter: number;
  WorkingPressure: number;
  BurstingPressure: number;
  BendingRadius: number;
  HoseWeight: number;
}

interface ProductDetail {
  Id: number;
  Name: string;
  Description: string;
  ProductImage: ProductImage[];
  PartNumber: PartNumberDetail[];
}

const PopupChoose = dynamic(() => import('./popupchoose'), { ssr: false });

const ProductDetail = () => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        if (!id) return;
        const response = await fetch(`http://localhost:3000/api/dealer/dealer/product/detail/product/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) throw new Error('Failed to fetch product details.');

        const data = await response.json();
        setProduct(data.data);
      } catch (error) {
        console.error('Error fetching product detail:', error);
        setError('Failed to load product detail.');
      }
    };

    const fetchProductImage = async () => {
      try {
        if (!id) return;
        const response = await fetch(`http://localhost:3000/api/dealer/dealer/product/detail/image/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) throw new Error('Failed to fetch product image.');

        const data = await response.json();
        setProductImage(data.data?.Image || null);
      } catch (error) {
        console.error('Error fetching product image:', error);
      }
    };

    fetchProductDetail();
    fetchProductImage();
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
    
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">{product.Name}</h1>
      <p className="text-gray-700 mb-6">{product.Description}</p>

      {productImage ? (
        <img src={productImage} alt={product.Name} className="w-full max-w-md mb-6" />
      ) : (
        <p className="text-gray-500">No image available</p>
      )}

      <h2 className="text-xl font-semibold mb-2">Specification</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-yellow-300">
            <th className="border border-gray-300 p-2">Part Number</th>
            <th className="border border-gray-300 p-2">Dash</th>
            <th className="border border-gray-300 p-2">I.D (mm)</th>
            <th className="border border-gray-300 p-2">O.D (mm)</th>
            <th className="border border-gray-300 p-2">Max Working Pressure (bar)</th>
            <th className="border border-gray-300 p-2">Minimum Burst Pressure (bar)</th>
            <th className="border border-gray-300 p-2">Minimum Bend Radius (mm)</th>
            <th className="border border-gray-300 p-2">Hose Weight (kg/m)</th>
          </tr>
        </thead>
        <tbody>
          {product.PartNumber.map((part) => (
            <tr key={part.Id} className="hover:bg-gray-100">
              <td className="border border-gray-300 p-2">{part.Name}</td>
              <td className="border border-gray-300 p-2">{part.Dash}</td>
              <td className="border border-gray-300 p-2">{part.InnerDiameter}</td>
              <td className="border border-gray-300 p-2">{part.OuterDiameter}</td>
              <td className="border border-gray-300 p-2">{part.WorkingPressure}</td>
              <td className="border border-gray-300 p-2">{part.BurstingPressure}</td>
              <td className="border border-gray-300 p-2">{part.BendingRadius}</td>
              <td className="border border-gray-300 p-2">{part.HoseWeight}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <button
          onClick={() => setIsPopupOpen(true)}
          className="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700 transition"
        >
          Click To Choose
        </button>
      </div>

      {isPopupOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-xl">
      <PopupChoose productId={product.Id} />
      <button
        className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
        onClick={() => setIsPopupOpen(false)}
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
    </div>
  );
};

export default ProductDetail;
