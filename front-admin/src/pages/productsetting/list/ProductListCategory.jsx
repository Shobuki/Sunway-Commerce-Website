import React, { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/router";
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";
import ModalProductCategory from "../Modal/modalparent/ProductCategoryModal"; // Import modal kategori
import ProductCreateModal from "../Modal/modalturunan/ProductCreateModal";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronRight, FiFolder, FiPackage } from "react-icons/fi";
import "../Product.css";

const ProductListCategory = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [productCreateModalOpen, setProductCreateModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
const [menuAccess, setMenuAccess] = useState(null);
const [loadingAccess, setLoadingAccess] = useState(true);

  // Style constants
  const containerStyle = "bg-white rounded-lg shadow-sm p-6";
  const buttonStyle = "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors";
  const inputStyle = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";


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
    fetchCategories();
  }, []);

  // ✅ Fetch Semua Kategori
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/api/admin/admin/products/main/category`);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false); // ✅ PENTING: set isLoading menjadi false
    }
  };


  const toggleExpand = (id) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddProduct = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setProductCreateModalOpen(true);
  };

  const handleProductCreateSave = () => {
    fetchCategories();
    setProductCreateModalOpen(false);
  };

  // ✅ Navigate to Detail Page
  const handleEditProduct = (productId) => {
    router.push(`/productsetting/list/${productId}`);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`/api/admin/admin/products/main/${productId}`);
      fetchCategories(); // Refresh kategori setelah penghapusan produk
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };


  // Filter categories based on search query
  const filterCategories = (categories, query) => {
    return categories.filter(category => {
      const matches = category.Name.toLowerCase().includes(query.toLowerCase()) ||
        (category.SubCategories && category.SubCategories.some(sub =>
          filterCategories([sub], query).length > 0
        )) ||
        (category.Products && category.Products.some(product =>
          product.Name.toLowerCase().includes(query.toLowerCase())
        ));

      return matches;
    });
  };

  const filteredCategories = filterCategories(categories, searchQuery);

  // ✅ Render Semua Kategori Beserta Subkategori dan Produk
  // Enhanced category rendering
  const renderCategory = (category, level = 0) => {
    const isExpanded = expandedCategories[category.Id];
    const paddingLeft = `${level * 24}px`;

    return (
      <div
        key={category.Id}
        className="mb-2 border-l-2 border-gray-100"
        style={{ paddingLeft }}
      >
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleExpand(category.Id)}
              className="text-gray-500 hover:text-blue-600"
            >
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            <FiFolder className="text-blue-500" />
            <span className="font-medium">{category.Name}</span>
          </div>

          <div className="flex items-center gap-2">
            {hasFeatureAccess(menuAccess, "createproduct") && (
            <button
              onClick={() => handleAddProduct(category.Id)}
              className={`${buttonStyle} text-green-600 hover:bg-green-50`}
            >
              <FiPlus /> Add Product
            </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="ml-6">
            {/* Subcategories */}
            {category.SubCategories?.map(sub => renderCategory(sub, level + 1))}

            {/* Products */}
            {category.Products?.sort((a, b) => a.Name.localeCompare(b.Name)) // ✅ Urutkan produk
              .map(product => (
                <div key={product.Id} className="flex items-center justify-between p-3 ml-6 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FiPackage className="text-gray-400" />
                    <span>{product.Name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditProduct(product.Id)} className={`${buttonStyle} text-blue-600 hover:bg-blue-50`}>
                      <FiEdit /> More Detail
                    </button>
                    {hasFeatureAccess(menuAccess, "deleteproduct") && (
                    <button onClick={() => handleDeleteProduct(product.Id)} className={`${buttonStyle} text-red-600 hover:bg-red-50`}>
                      <FiTrash2 /> Delete
                    </button>
                    )}
                  </div>
                </div>
              ))}

          </div>
        )}
      </div>
    );
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSave = async () => {
    try {
      if (!selectedProduct?.Id) return;

      await axios.put(`/api/admin/admin/products/${selectedProduct.Id}`, {
        Name: selectedProduct.Name,
      });

      fetchCategories(); // Refresh kategori setelah edit
      setModalOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleManageCategories = () => {
    setCategoryModalOpen(true);
  };

  const handleCategoryModalClose = () => {
    setCategoryModalOpen(false);
  };




  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className={containerStyle}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
            <p className="text-gray-600 mt-1">Organize products by categories and subcategories</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {hasFeatureAccess(menuAccess, "managecategory") && (
            <button
              onClick={handleManageCategories}
              className={`${buttonStyle} bg-blue-600 text-white hover:bg-blue-700`}
            >
              <FiPlus /> Manage Categories
            </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputStyle} pl-10`}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading product structure...</p>
          </div>
        ) : (
          /* Content */
          <div className="border rounded-lg overflow-hidden">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => renderCategory(category))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No categories found matching your search
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals (tetap sama) */}
      {productCreateModalOpen && (
        <ProductCreateModal
          isOpen={productCreateModalOpen}
          onClose={() => setProductCreateModalOpen(false)}
          onSave={handleProductCreateSave}
          categoryId={selectedCategoryId}
        />
      )}

      {categoryModalOpen && (
        <ModalProductCategory
          onClose={handleCategoryModalClose}
          onUpdate={fetchCategories}
        />
      )}
    </div>
  );
};

export default ProductListCategory;
