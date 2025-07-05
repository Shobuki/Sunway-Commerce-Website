import React, { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import ModalAssignCategory from "../detail/ModalAssignCategory"; // pastikan path sudah benar


// Import ReactQuill secara dinamis agar tidak error di SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const ProductEditModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    Id: "",
    Name: "",
    CodeName: "",
    Description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Simpan ProductCategoryIds yang sedang di-assign (buat initial value agar konsisten)
  const [categoryIds, setCategoryIds] = useState([]);

 const [categoryId, setCategoryId] = useState(null);
const [categoryObj, setCategoryObj] = useState(null);   // Nama kategori


  useEffect(() => {
  if (isOpen && product) {
    setFormData({
      id: product.Id,
      Name: product.Name || "",
      CodeName: product.CodeName || "",
      Description: product.Description || "",
    });

    // Ambil ID & Nama category dari product (jika ada)
    const cat = (product.ProductCategory && product.ProductCategory[0]) || null;
    setCategoryId(cat ? cat.Id : null);
    setCategoryObj(cat ? { Id: cat.Id, Name: cat.Name } : null);
  }
}, [isOpen, product]);

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        id: product.Id,
        Name: product.Name || "",
        CodeName: product.CodeName || "",
        Description: product.Description || "",
      });
      setCategoryIds(product.ProductCategory?.map((cat) => cat.Id) || []);
    }
  }, [isOpen, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, Description: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      await axios.put("/api/admin/admin/products/main", {
        ...formData,
        ProductCategoryIds: categoryIds,  // ← penting!
      });
      onSave();
      onClose();
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white w-[90%] max-w-3xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-medium">Name</label>
            <input
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="Product Name"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Code Name</label>
            <input
              name="CodeName"
              value={formData.CodeName}
              onChange={handleChange}
              placeholder="Optional Code"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <div className="max-h-[250px] overflow-y-auto">
              <ReactQuill
                theme="snow"
                value={formData.Description}
                onChange={handleDescriptionChange}
                placeholder="Description with bold, italic, underline..."
                className="bg-white rounded"
              />
            </div>

          </div>
          <div>
  <label className="block font-medium mb-1">Category</label>
  <div className="flex items-center gap-2">
    {product.ProductCategory && product.ProductCategory.length > 0 ? (
      <span className="text-gray-700">
        {product.ProductCategory
          .map(
            (cat) =>
              cat.ParentCategory
                ? `${cat.Name} (${cat.ParentCategory.Name})`
                : cat.Name
          )
          .join(", ")}
      </span>
    ) : (
      <span className="italic text-gray-400">No category assigned</span>
    )}
    <button
      type="button"
      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
      onClick={() => setIsAssignModalOpen(true)}
    >
      Assign Category
    </button>
  </div>
</div>
        </div>
        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <ModalAssignCategory
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        productId={formData.id}
        initialCategoryId={categoryIds[0] || null}
        productName={formData.Name}
        productDescription={formData.Description}
        productCodeName={formData.CodeName}
        onSuccess={(newCategoryId) => {
          setCategoryIds([newCategoryId]);
          setIsAssignModalOpen(false);
        }}
      />
    </div>
  );
};

export default ProductEditModal;
