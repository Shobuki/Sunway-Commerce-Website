import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiX, FiChevronDown, FiChevronRight, FiFolder,
  FiEdit, FiTrash2, FiPlus, FiSearch
} from "react-icons/fi";
import { FiUpload, FiImage } from "react-icons/fi";


const ModalProductCategory = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ Id: null, Name: "", ParentCategoryId: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [categoryImages, setCategoryImages] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/admin/admin/products/categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  useEffect(() => {
    if (selectedCategory?.Id) {
      fetchCategoryImages(selectedCategory.Id);
    } else {
      setCategoryImages([]);
    }
  }, [selectedCategory]);

  const fetchCategoryImages = async (categoryId) => {
    try {
      const res = await axios.get(
        `/api/admin/admin/products/productcategories/images/${categoryId}`
      );
      setCategoryImages(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setCategoryImages([]); // ✅ kalau tidak ada gambar, kosongkan array
      } else {
        console.error("Failed to load images:", err); // ❌ tampilkan hanya jika bukan 404
      }
    }
  };



  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      Id: category.Id,
      Name: category.Name,
      ParentCategoryId: category.ParentCategoryId || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`/api/admin/admin/products/categories/${id}`);
        alert("Category deleted successfully");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cek duplikasi nama (case-insensitive, tidak termasuk self-update)
    const isDuplicate = categories.some(cat =>
      cat.Name.toLowerCase() === formData.Name.toLowerCase() &&
      cat.Id !== formData.Id
    );



    try {
      await axios.post("/api/admin/admin/products/categories", {
        Id: formData.Id,
        Name: formData.Name,
        ParentCategoryId: formData.ParentCategoryId || null,
      });

      alert(`Category ${formData.Id ? "updated" : "created"} successfully`);
      setFormData({ Id: null, Name: "", ParentCategoryId: null });
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error.response?.data?.message || "Failed to save category");
    }
  };

  const filteredParentCategories = categories.filter(cat =>
    cat.Name.toLowerCase().includes(parentSearch.toLowerCase())
  );


  // Style constants
  const inputStyle = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const buttonStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors";


  const renderCategory = (category, level = 0) => {
    const isExpanded = expandedCategories[category.Id];
    const hasChildren = category.SubCategories?.length > 0;



    return (
      <div
        key={category.Id}
        className="group border-l-2 border-gray-100 ml-4 hover:border-blue-200"
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(category.Id)}
                className="text-gray-400 hover:text-blue-600"
              >
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            )}
            <FiFolder className="flex-shrink-0 text-blue-500" />
            <span className="font-medium">{category.Name}</span>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEdit(category)}
              className={`${buttonStyle} text-blue-600 hover:bg-blue-50`}
            >
              <FiEdit className="text-sm" />
            </button>
            <button
              onClick={() => handleDelete(category.Id)}
              className={`${buttonStyle} text-red-600 hover:bg-red-50`}
            >
              <FiTrash2 className="text-sm" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-4">
            {category.SubCategories.map(sub => renderCategory(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filterCategories = (categories) => {
    if (!searchTerm.trim()) return categories;

    const lowerSearch = searchTerm.toLowerCase();

    const recursiveFilter = (cats) => {
      return cats
        .map(cat => {
          const matchedChildren = cat.SubCategories ? recursiveFilter(cat.SubCategories) : [];
          const isMatched = cat.Name.toLowerCase().includes(lowerSearch);
          if (isMatched || matchedChildren.length > 0) {
            return {
              ...cat,
              SubCategories: matchedChildren,
            };
          }
          return null;
        })
        .filter(Boolean);
    };

    return recursiveFilter(categories);
  };

  const filteredCategories = filterCategories(categories).filter(
    (cat) => cat.ParentCategoryId === null
  );

  const handleUploadImage = async () => {
    if (!uploadFile || !formData.Id) return;
    const form = new FormData();
    form.append("ProductCategoryId", formData.Id);
    form.append("image", uploadFile);

    try {
      await axios.post("/api/admin/admin/products/productcategories/images", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchCategoryImages(formData.Id);
      setUploadFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`/api/admin/admin/products/productcategories/images/${imageId}`);
      fetchCategoryImages(formData.Id);
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory ? "Edit Category" : "New Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Form Section (Tetap di atas, tidak discroll) */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6 border-b" id="product-category-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              required
              className={`${inputStyle} pl-4`}
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category
            </label>
            <input
              type="text"
              placeholder="Search parent category..."
              value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              className={`${inputStyle} mb-2`}
            />
            <select
              name="ParentCategoryId"
              value={formData.ParentCategoryId || ""}
              onChange={(e) =>
                setFormData({ ...formData, ParentCategoryId: e.target.value || null })
              }
              className={`${inputStyle} pr-8`}
            >
              <option value="">Select parent category (optional)</option>
              {filteredParentCategories.map((cat) => (
                <option key={cat.Id} value={cat.Id}>
                  {cat.Name}
                </option>
              ))}
            </select>


          </div>
        </form>



        {/* Scrollable Category List */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN: Upload & preview image */}
            <div>
              {formData.Id && (
                <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image for Selected Category
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="block w-full"
                    />
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      className={`${buttonStyle} bg-green-600 text-white hover:bg-green-700`}
                    >
                      <FiUpload />
                      Upload
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-3">
                    {categoryImages.length === 0 && (
                      <div className="text-gray-400 text-xs italic">
                        No images uploaded.
                      </div>
                    )}
                    {categoryImages.map((img) => (
                      <div key={img.Id} className="relative group w-24 h-24 rounded overflow-hidden border bg-white">
                        <img
                          src={`http://${window.location.hostname}:3000${img.ImageUrl}`}
                          alt="category"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleDeleteImage(img.Id)}
                          className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 shadow hover:bg-red-100"
                          title="Delete Image"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* RIGHT COLUMN: Category List */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold mb-3">Existing Categories</h3>
              <div className="flex items-center gap-2 mb-4">
                <FiSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className={inputStyle}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div
                className="border rounded-lg p-4 bg-gray-50"
                style={{
                  maxHeight: '440px',
                  minHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => renderCategory(category))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No categories found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className={`${buttonStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-category-form"
            className={`${buttonStyle} bg-blue-600 text-white hover:bg-blue-700`}
          >
            <FiPlus className="text-lg" />
            {selectedCategory ? "Update Category" : "Create Category"}
          </button>
        </div>
      </div>

    </div>
  );
};

export default ModalProductCategory;
