import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Navbar from '../../components/header/navbar';
import { getImageUrl } from '../../utils/getBaseURL';

interface ProductImage {
  Image: string;
}
// Tambahkan tipe prop onClose
export interface PopupChooseProps {
  productId: number;
  onClose?: () => void; // << tambah baris ini
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
  CodeName?: string; // ← tambahkan ini
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const mmToInch = (mm: number) => (mm / 25.4).toFixed(2);
  const psiToBar = (psi: number) => (psi * 0.0689476).toFixed(0);

  useEffect(() => {
    // Cek login setiap kali halaman di-mount
    setIsLoggedIn(!!sessionStorage.getItem('userToken'));
  }, []);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        if (!id) return;
        const response = await fetch(`/api/dealer/dealer/product/detail/product/${id}`, {
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


    // Di dalam useEffect fetchProductImage
    const fetchProductImage = async () => {
      try {
        if (!id) return;

        const response = await fetch(`/api/dealer/dealer/product/detail/image/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        // ✅ Jangan tampilkan error kalau gagal
        if (!response.ok) {
          console.warn('Tidak ada gambar tersedia untuk produk ini.');
          return; // Keluar diam-diam
        }

        const data = await response.json();
        const firstImageUrl = data.data[0]?.ImageUrl
          ? getImageUrl(data.data[0].ImageUrl)
          : null;

        setProductImage(firstImageUrl);
      } catch (error) {
        console.warn('Error mengambil gambar produk:', error);
        // Jangan set error apapun
      }
    };


    fetchProductDetail();
    fetchProductImage();
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        <div className="grid md:grid-cols-2 gap-8 mb-12 mt-12">
          {/* Product Image Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            {productImage ? (
              <img
                src={productImage}
                alt={product.Name}
                className="w-full h-96 object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div className="space-y-1">
              {product.CodeName && (
                <span className="text-sm text-gray-500 uppercase tracking-wide block">
                  {product.CodeName}
                </span>
              )}
              <h1 className="text-4xl font-bold text-gray-900">{product.Name}</h1>
            </div>

            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.Description }}
            />


            <div className="mt-8">
              {isLoggedIn && (
                <button
                  onClick={() => setIsPopupOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all w-full sm:w-auto"
                >
                  SELECT PRODUCT VARIANT
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Specifications Table */}
        {/* Specifications Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <h2 className="text-2xl font-semibold bg-gray-800 text-white px-6 py-4">
            Technical Specifications
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-yellow-300">
                <tr>
                  <th className="px-4 py-2 border text-black" rowSpan={2}>Part Number</th>
                  <th className="px-2 py-2 border text-black" rowSpan={2}>dash</th>
                  <th className="px-2 py-2 border text-black" colSpan={2}>I.D.</th>
                  <th className="px-2 py-2 border text-black" rowSpan={2}>O.D.<br />(mm)</th>
                  <th className="px-2 py-2 border text-black" colSpan={2}>Max Working Pressure</th>
                  <th className="px-2 py-2 border text-black" colSpan={2}>Min Burst Pressure</th>
                  <th className="px-2 py-2 border text-black" colSpan={2}>Min Bend Radius</th>
                  <th className="px-2 py-2 border text-black" rowSpan={2}>Hose Weight<br />(m/kg)</th>
                </tr>
                <tr>
                  <th className="px-2 py-2 border text-black">inch</th>
                  <th className="px-2 py-2 border text-black">mm</th>
                  <th className="px-2 py-2 border text-black">psi</th>
                  <th className="px-2 py-2 border text-black">bar</th>
                  <th className="px-2 py-2 border text-black">psi</th>
                  <th className="px-2 py-2 border text-black">bar</th>
                  <th className="px-2 py-2 border text-black">inch</th>
                  <th className="px-2 py-2 border text-black">mm</th>
                </tr>
              </thead>
              <tbody>
                {([...product.PartNumber].sort((a, b) =>
                  a.Name.localeCompare(b.Name, 'en', { numeric: true })
                )).map((part) => (
                  <tr key={part.Id} className="hover:bg-yellow-50">
                    <td className="px-4 py-2 border font-medium text-black">{part.Name}</td>
                    <td className="px-2 py-2 border text-center text-black">{part.Dash}</td>
                    <td className="px-2 py-2 border text-center text-black">{mmToInch(part.InnerDiameter)}</td>
                    <td className="px-2 py-2 border text-center text-black">{part.InnerDiameter}</td>
                    <td className="px-2 py-2 border text-center text-black">{part.OuterDiameter}</td>
                    <td className="px-2 py-2 border text-center text-black">{part.WorkingPressure}</td>
                    <td className="px-2 py-2 border text-center text-black">{psiToBar(part.WorkingPressure)}</td>
                    <td className="px-2 py-2 border text-center text-black">{part.BurstingPressure}</td>
                    <td className="px-2 py-2 border text-center text-black">{psiToBar(part.BurstingPressure)}</td>
                    <td className="px-2 py-2 border text-center text-black">{mmToInch(part.BendingRadius)}</td>
                    <td className="px-2 py-2 border text-center text-black">{part.BendingRadius}</td>
                    <td className="px-2 py-2 border text-center text-black">{part.HoseWeight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>



        {/* Popup Modal */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full h-[96vh] sm:max-w-6xl max-h-screen overflow-hidden flex flex-col shadow-lg mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center bg-gray-800 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">Select Configuration</h3>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <PopupChoose
                  productId={product.Id}
                  onClose={() => setIsPopupOpen(false)}
                />
              </div>
            </div>
          </div>

        )}
      </main>
    </div>
  );
};

export default ProductDetail;
