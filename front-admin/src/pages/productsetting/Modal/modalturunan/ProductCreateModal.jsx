import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dinamis untuk menghindari masalah SSR
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ProductCreateModal = ({ isOpen, onClose, onSave, categoryId }) => {
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    CodeName: "",
    ProductCategoryId: categoryId,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && categoryId) {
      setFormData((prevData) => ({
        ...prevData,
        ProductCategoryId: parseInt(categoryId, 10),
      }));
    }
  }, [isOpen, categoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      Description: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    if (!formData.ProductCategoryId) {
      setError("Product Category ID is required.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "/api/admin/admin/products/main",
        {
          ...formData,
          ProductCategoryId: parseInt(formData.ProductCategoryId, 10),
        }
      );

      if (response.status !== 201) {
        throw new Error(response.data.message || "Failed to create product");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white w-[90%] max-w-3xl p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create New Product</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-medium">Product Name</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <ReactQuill
              value={formData.Description}
              onChange={handleDescriptionChange}
              className="bg-white"
              theme="snow"
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['clean'],
                ],
              }}
            />
          </div>

          <div>
            <label className="block font-medium">Code Name</label>
            <input
              type="text"
              name="CodeName"
              value={formData.CodeName}
              onChange={handleInputChange}
              className="border rounded p-2 w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default ProductCreateModal;
