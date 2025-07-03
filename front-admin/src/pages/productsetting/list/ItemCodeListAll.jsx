import React, { useState, useEffect } from "react";
import axios from 'axios';
import CreateItemCodeModal from "../Modal/modalturunan/ItemCodeCreateModal";
import ItemCodeEditModal from "../Modal/modalparent/ItemCodeEditModal";

const ItemCodeListAll = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [FilterPartSearch, setFilterPartSearch] = useState("");
  const [editProductId, setEditProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/admin/admin/products/item-codes");
      setProducts(response.data.data || []);
      setFilteredProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleFilterChange = (productId) => {
    setSelectedProduct(productId);
    setIsDropdownOpen(false);
    setFilterPartSearch("");

    if (productId === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.Id.toString() === productId));
    }
  };

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setProductSearch(searchTerm);

    const filtered = products
        .map((product) => {
            const filteredItemCodes = product.ItemCode.filter((item) =>
                item.Name.toLowerCase().includes(searchTerm) ||
                item.OEM.toLowerCase().includes(searchTerm)
            );

            // Jika tidak ada `ItemCode` yang cocok, hapus produk dari hasil pencarian
            if (filteredItemCodes.length === 0) return null;

            return { ...product, ItemCode: filteredItemCodes };
        })
        .filter(Boolean); // Hapus produk yang tidak memiliki ItemCode yang cocok

    setFilteredProducts(filtered);
};


  const handleEditClick = (id) => {
    setEditProductId(id);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/admin/admin/products/item-codes/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting Item Code:", error);
      alert("Failed to delete Item Code.");
    }
  };

  return (
    <div className="bg-white p-5 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">All Item Codes</h2>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search Item Code..."
          value={productSearch}
          onChange={handleSearchChange}
          className="border p-2 rounded-lg w-1/3"
        />

        <div className="relative w-full md:w-1/3">
          <div className="relative">
            <div
              className="border p-2 rounded-lg w-full cursor-pointer bg-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedProduct
                ? products.find(p => p.Id.toString() === selectedProduct)?.Name
                : "All Part Numbers"}
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search Product..."
                    value={FilterPartSearch}
                    onChange={(e) => setFilterPartSearch(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto">
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleFilterChange("")}
                  >
                    All Part Numbers
                  </div>
                  {products
                    .filter((product) =>
                      product.Name.toLowerCase().includes(FilterPartSearch.toLowerCase())
                    )
                    .map((product) => (
                      <div
                        key={product.Id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleFilterChange(product.Id.toString())}
                      >
                        {product.Name}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto"> {/* Ensure table is scrollable if content overflows */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 min-w-[100px]">Item Code</th> {/* Added min-width */}
              <th className="border p-2 min-w-[80px]">OEM</th> {/* Added min-width */}
              <th className="border p-2 min-w-[80px]">Sales Code</th> {/* Added min-width */}
              <th className="border p-2">Stocking Type Code</th>
              <th className="border p-2">Weight</th>
              <th className="border p-2 min-w-[120px]">Part Number</th> {/* Added min-width */}
              <th className="border p-2 text-center" style={{ minWidth: '180px', width: '180px', whiteSpace: 'nowrap' }}>Actions</th> {/* Fixed width for actions */}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.flatMap(product => product.ItemCode.map(pr => (
              <tr key={pr.Id}>
                <td className="border p-2">{pr.Name}</td>
                <td className="border p-2">{pr.OEM}</td>
                <td className="border p-2">{pr.SalesCode}</td> {/* Assuming SalesCode exists based on th */}
                <td className="border p-2">{pr.StockingTypeCode}</td> {/* Assuming StockingTypeCode exists based on th */}
                <td className="border p-2">{pr.Weight}</td>
                <td className="border p-2">
                  {products.find(p => p.Id === pr.PartNumberId)?.Name || "N/A"}
                </td>
                <td className="border p-2 flex justify-center gap-1.5" style={{ minWidth: '180px', width: '180px', whiteSpace: 'nowrap' }}> {/* Consistent fixed width */}
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-yellow-600 transition-all"
                    onClick={() => handleEditClick(pr.Id)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-red-600 transition-all"
                    onClick={() => handleDeleteClick(pr.Id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      <CreateItemCodeModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={fetchProducts} />
      <ItemCodeEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={fetchProducts}
        productId={editProductId}
      />
    </div>
  );
};

export default ItemCodeListAll;