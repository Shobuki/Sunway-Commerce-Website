import React, { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

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

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        id: product.Id,
        Name: product.Name || "",
        CodeName: product.CodeName || "",
        Description: product.Description || "",
      });
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
      await axios.put("/api/admin/admin/products/main", formData);
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
    </div>
  );
};

export default ProductEditModal;
