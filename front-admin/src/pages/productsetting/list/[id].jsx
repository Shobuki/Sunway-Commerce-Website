import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";
import PartNumberTable from "../detail/PartNumberTable"; // This component will likely need its own adjustments
import ProductEditModal from "../Modal/ProductEditModal"; // Pastikan path sesuai
import { getImageUrl } from "../../../utils/getImageUrl"

const ProductDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [partNumbers, setPartNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [menuAccess, setMenuAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [specFiles, setSpecFiles] = useState([]);

  const [specUploading, setSpecUploading] = useState(false);

  useEffect(() => {
    // Ambil akses menu "product"
    axios
      .get("/api/admin/admin/access/my-menu")
      .then((res) => {
        const data = res.data || [];
        const found = data.find(m => m.Name?.toLowerCase() === "product");
        setMenuAccess(found || null);
        setLoadingAccess(false);
      })
      .catch(() => {
        setMenuAccess(null);
        setLoadingAccess(false);
      });
  }, []);

  useEffect(() => {
    if (id) {
      fetchProductDetail();
      fetchProductImages();
      fetchPartNumbers();
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchSpecificationFiles();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const res = await axios.get(`/api/admin/admin/products/main/${id}`);
      setProduct(res.data.data);
    } catch (err) {
      console.error("Error fetching product details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async () => {
    try {
      const res = await axios.get(`/api/admin/admin/products/images/${id}`);
      setImages(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        console.warn("No images found for this product.");
        setImages([]);
      } else {
        console.error("Error fetching product images:", err);
      }
    }
  };

  const fetchPartNumbers = async () => {
    try {
      const res = await axios.get(`/api/admin/admin/products/part-numbers/products/${id}`);
      setPartNumbers(res.data.data.PartNumber || []);
    } catch (err) {
      console.error("Error fetching part numbers:", err);
    }
  };

  const fetchSpecificationFiles = async () => {
    if (!id) return;
    try {
      const res = await axios.post("/api/admin/admin/products/specification-files/product", { ProductId: id });
      setSpecFiles(res.data.files || []);
    } catch (err) {
      setSpecFiles([]);
    }
  };

  const handleSpecUpload = async (event) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    const formData = new FormData();
    formData.append("ProductId", id);
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }
    try {
      setSpecUploading(true);
      await axios.post("/api/admin/admin/products/specification-files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchSpecificationFiles();
    } catch (err) {
      //
    } finally {
      setSpecUploading(false);
    }
  };

  const handleSpecDownload = async (fileId, fileName) => {
    try {
      const response = await axios.post(
        "/api/admin/admin/products/specification-files/download",
        { Id: fileId },
        { responseType: "blob" }
      );
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download file");
    }
  };

  const handleSpecDelete = async (fileId) => {
    try {
      await axios.post("/api/admin/admin/products/specification-files/delete", { Id: fileId });
      setSpecFiles(specFiles.filter((f) => f.Id !== fileId));
    } catch (err) {
      alert("Failed to delete file");
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("ProductId", id);
    formData.append("image", file);

    try {
      setUploading(true);
      await axios.post("/api/admin/admin/products/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProductImages();
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await axios.delete(`/api/admin/admin/products/images/${imageId}`);
      setImages(images.filter((img) => img.Id !== imageId));
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;
  if (!product) return <p className="text-center mt-5">Product not found.</p>;
  if (loadingAccess) return <div>Loading Access...</div>;
  if (!menuAccess) return null;
  return (
    <div className="w-full pl-[265px] pr-6 py-5 bg-white shadow-lg rounded-lg">
      {/* Product Header */}
      <div>
        <h1 className="text-3xl font-bold mb-3">{product.Name}</h1>
        <div
          className="text-gray-700 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: product.Description }}
        />
      </div>


      {/* Upload Image */}
      <div className="mt-5">
        {hasFeatureAccess(menuAccess, "editproduct") && (
          <label className="bg-blue-500 text-white px-5 py-2.5 rounded-md cursor-pointer hover:bg-blue-600 transition-all font-semibold inline-flex items-center gap-2"> {/* Increased padding, added inline-flex and gap for icon */}
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                Upload Image
              </>
            )}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        )}
      </div>

      {/* Image Gallery */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Product Images</h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.Id} className="relative group">
                <img
                  src={getImageUrl(image.ImageUrl)}
                  alt="Product"
                  className="w-full h-40 object-cover rounded-md shadow-md"
                />
                {hasFeatureAccess(menuAccess, "deleteproduct") && (
                  <button
                    onClick={() => handleDelete(image.Id)}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2.5 py-1.5 text-xs rounded-md opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-600" // Adjusted padding and font size for delete button
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No images available.</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Product Specification Files</h2>
        {/* UPLOAD BUTTON */}
        {hasFeatureAccess(menuAccess, "editproduct") && (
          <label className="bg-blue-500 text-white px-5 py-2.5 rounded-md cursor-pointer hover:bg-blue-600 transition-all font-semibold inline-flex items-center gap-2">
            {specUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                Upload Spec File
              </>
            )}
            <input type="file" className="hidden" multiple onChange={handleSpecUpload} disabled={specUploading} />
          </label>
        )}

        {/* SPEC FILES TABLE */}
        {specFiles.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 border-b text-left">File Name</th>
                  <th className="py-2 px-3 border-b text-left">Type</th>
                  <th className="py-2 px-3 border-b text-left">Uploaded At</th>
                  <th className="py-2 px-3 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {specFiles.map((f) => (
                  <tr key={f.Id}>
                    <td className="py-2 px-3 border-b">{f.FileName}</td>
                    <td className="py-2 px-3 border-b">{f.MimeType}</td>
                    <td className="py-2 px-3 border-b">{new Date(f.UploadedAt).toLocaleString()}</td>
                    <td className="py-2 px-3 border-b flex gap-2">
                      <button
                        onClick={() => handleSpecDownload(f.Id, f.FileName)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Download
                      </button>
                      {hasFeatureAccess(menuAccess, "editproduct") && (
                        <button
                          onClick={() => handleSpecDelete(f.Id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 mt-2">No specification files.</p>
        )}
      </div>


      <div className="mt-4">
        {hasFeatureAccess(menuAccess, "editproduct") && (
          <button
            className="bg-yellow-500 text-white px-5 py-2.5 rounded-md hover:bg-yellow-600 transition-all font-semibold inline-flex items-center gap-2" // Increased padding, added inline-flex and gap for icon
            onClick={() => setIsEditModalOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z"></path></svg>
            Edit Product
          </button>
        )}
      </div>


      {/* Full-Width Part Number Table */}
      <div className="mt-6 w-full">
        <div className="overflow-x-auto max-w-full"> {/* auto overflow, TAPI hanya ketika mepet */}
          <div className="w-full"> {/* Menjamin lebar minimum agar tidak patah */}
            <PartNumberTable partNumbers={partNumbers} productId={product.Id} />
          </div>
        </div>
      </div>
      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={fetchProductDetail}
        product={product}
      />
    </div>
  );
};

export default ProductDetail;