import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Navbar from '../../components/header/navbar';
import { getImageUrl } from '../../utils/getBaseURL';


const PdfPreview = dynamic(() => import('../../components/PdfPreview'), { ssr: false });
const PopupChoose = dynamic(() => import('./popupchoose'), { ssr: false });

// --- Interfaces
interface ProductImage {
  Image: string;
}
export interface PopupChooseProps {
  productId: number;
  onClose?: () => void;
}
interface PartNumberDetail {
  Id: number;
  Name: string;
  Description: string;
  Dash: number | null;
  InnerDiameter: number | null;
  OuterDiameter: number | null;
  WorkingPressure: number | null;
  BurstingPressure: number | null;
  BendingRadius: number | null;
  HoseWeight: number | null;
}
interface ProductDetail {
  Id: number;
  Name: string;
  CodeName?: string;
  Description: string;
  ProductImage: ProductImage[];
  PartNumber: PartNumberDetail[];
}
interface SpecFile {
  Id: number;
  FileName: string;
  FilePath: string;
  MimeType: string;
  UploadedAt: string;
}

const ProductDetail = () => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [specFiles, setSpecFiles] = useState<SpecFile[]>([]);
  const [specFile, setSpecFile] = useState<SpecFile | null>(null); // Tambahkan state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const mmToInch = (mm: number | null) =>
    mm != null ? (mm / 25.4).toFixed(2) : '-';
  const psiToBar = (psi: number | null) =>
    psi != null ? (psi * 0.0689476).toFixed(0) : '-';

  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem('userToken'));
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchProductDetail = async () => {
      try {
        const response = await fetch(`/api/dealer/dealer/product/detail/product/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error('Failed to fetch product details.');
        const data = await response.json();
        setProduct(data.data);

        // Selalu fetch PDF specFile apapun kondisi tabel
        await fetchSpecFiles(data.data.Id);

      } catch (error) {
        setError('Failed to load product detail.');
      }
    };

    const fetchProductImage = async () => {
      try {
        const response = await fetch(`/api/dealer/dealer/product/detail/image/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) return;
        const data = await response.json();
        const firstImageUrl = data.data[0]?.ImageUrl
          ? getImageUrl(data.data[0].ImageUrl)
          : null;
        setProductImage(firstImageUrl);
      } catch { }
    };
    const fetchSpecFiles = async (productId: number) => {
      try {
        const apiUrl = getImageUrl('api/dealer/dealer/product/detail/specification/files');
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ProductId: productId }),
        });
        if (!response.ok) return;
        const data = await response.json();
        setSpecFile(data.file || null);
        // DEBUG LOG, pastikan response benar
        console.log("fetchSpecFiles response:", data);
      } catch (e) {
        console.error("fetchSpecFiles error:", e);
      }
    };

    fetchProductDetail();
    fetchProductImage();
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Loading...</p>;

  // DEBUG: cek isi specFile


  let previewFile: SpecFile | null = null;
  if (showPdfPreview && specFile) {
    previewFile = specFile;
  }
  const hasValidPartNumber = (pnList: PartNumberDetail[]) =>
    pnList.some(
      p =>
        p.Dash !== null ||
        p.InnerDiameter !== null ||
        p.OuterDiameter !== null ||
        p.WorkingPressure !== null ||
        p.BurstingPressure !== null ||
        p.BendingRadius !== null ||
        p.HoseWeight !== null
    );
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

        {/* Specifications Table / PDF Preview */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">
          <h2 className="text-2xl font-semibold bg-gray-800 text-white px-6 py-4">
            Technical Specifications
          </h2>
          <div className="py-8 px-6 space-y-8">
            {/* --- TABEL: Hanya tampil jika ada partnumber valid --- */}
            {product.PartNumber && hasValidPartNumber(product.PartNumber) && (
              <div className="w-full overflow-x-auto">
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
                        <td className="px-2 py-2 border text-center text-black">{part.Dash ?? '-'}</td>
                        <td className="px-2 py-2 border text-center text-black">{mmToInch(part.InnerDiameter)}</td>
                        <td className="px-2 py-2 border text-center text-black">{part.InnerDiameter ?? '-'}</td>
                        <td className="px-2 py-2 border text-center text-black">{part.OuterDiameter ?? '-'}</td>
                        <td className="px-2 py-2 border text-center text-black">{part.WorkingPressure ?? '-'}</td>
                        <td className="px-2 py-2 border text-center text-black">{psiToBar(part.WorkingPressure)}</td>
                        <td className="px-2 py-2 border text-center text-black">{part.BurstingPressure ?? '-'}</td>
                        <td className="px-2 py-2 border text-center text-black">{psiToBar(part.BurstingPressure)}</td>
                        <td className="px-2 py-2 border text-center text-black">{mmToInch(part.BendingRadius)}</td>
                        <td className="px-2 py-2 border text-center text-black">{part.BendingRadius ?? '-'}</td>
                        <td className="px-2 py-2 border text-center text-black">{part.HoseWeight ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* --- PDF Preview: selalu render jika ada file PDF --- */}
            {specFile && (
              <div className="w-full flex justify-center">
                {specFile.MimeType === 'application/pdf' ? (
                  <PdfPreview fileUrl={getImageUrl(specFile.FilePath)} />
                ) : (
                  // Tampilkan image jika tipe file gambar
                  specFile.MimeType.startsWith('image/') && (
                    <img
                      src={getImageUrl(specFile.FilePath)}
                      alt={specFile.FileName}
                      style={{
                        width: '100%',
                        maxWidth: 900,
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: 12,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        background: "#fff",
                        display: 'block',
                      }}
                    />
                  )
                )}
              </div>
            )}
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
