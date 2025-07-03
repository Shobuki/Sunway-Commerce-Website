import React, { useState } from "react";
import axios from "axios";

// Helper untuk ikon sederhana (opsional, tapi direkomendasikan)
const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.704A2.75 2.75 0 007.56 18h4.88a2.75 2.75 0 002.72-1.991l.84-10.704.148.022a.75.75 0 10.231-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1"> {/* Sedikit lebih besar untuk tombol utama */}
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);
const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2"> {/* Disesuaikan ukurannya */}
         <path d="M9.25 13.25V3.057l-.97.97a.75.75 0 01-1.06-1.06l2.5-2.5a.75.75 0 011.06 0l2.5 2.5a.75.75 0 11-1.06 1.06l-.97-.97V13.25a.75.75 0 01-1.5 0z" />
         <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
);

const ProductDetailCard = ({ product, onSaveSuccess, onClose }) => {
  const [editedProduct, setEditedProduct] = useState({ ...product });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    try {
      // Pastikan product.Id ada sebelum mengirim
      if (!product || !product.Id) {
          throw new Error("Product ID is missing.");
      }
      await axios.put(`/api/admin/admin/products/main/${product.Id}`, editedProduct);
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error("Error updating product:", error);
      setErrorMessage(error.response?.data?.message || error.message || "Failed to update product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
     <div className="p-4 sm:p-6 bg-white shadow-lg rounded-lg w-full max-w-full mx-auto overflow-x-auto">
    <h3 className="text-xl font-semibold mb-4 sm:mb-6 text-gray-800 border-b pb-3">Edit Product Details</h3>
    {errorMessage && (
      <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
        {errorMessage}
      </div>
      )}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            id="productName" // ID harus unik
            name="Name"
            value={editedProduct.Name || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
            required
          />
        </div>

        <div>
          <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="productDescription" // ID harus unik
            name="Description"
            value={editedProduct.Description || ''}
            onChange={handleChange}
            rows="5" // Lebih banyak baris untuk deskripsi
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-3 sm:pt-4">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 shadow-sm transition duration-150 ease-in-out"
                disabled={isSaving}
            >
                Cancel
            </button>
            <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-70"
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                ) : 'Save Changes'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProductDetailCard;