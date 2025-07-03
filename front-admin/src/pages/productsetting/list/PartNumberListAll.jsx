import React, { useState, useEffect } from "react";
import axios from "axios";
import CreatePartNumberModal from "../Modal/modalturunan/PartNumberCreateModal";
import PartNumberEditModal from "../Modal/modalparent/PartNumberEditModal";

const PartNumberListAll = () => {
  const [partNumbers, setPartNumbers] = useState([]);
  const [filteredPartNumbers, setFilteredPartNumbers] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPartNumberId, setEditPartNumberId] = useState(null);
  const [productId, setProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    fetchPartNumbers();
  }, []);

  const fetchPartNumbers = async () => {
    try {
      const response = await axios.get("/api/admin/admin/products/part-numbers");
      const productsData = response.data.data || [];
      const allPartNumbers = productsData.flatMap(product =>
        (product.PartNumber || []).map(part => ({
          ...part,
          ProductName: product.Name,
        }))
      );
      setPartNumbers(allPartNumbers);
      setFilteredPartNumbers(allPartNumbers);
      setProducts(productsData.map(product => ({ id: product.Id, name: product.Name })));
      if (allPartNumbers.length > 0) {
        setProductId(allPartNumbers[0].ProductId);
      }
    } catch (error) {
      console.error("Error fetching part numbers:", error);
    }
  };

  const handleEditClick = (Id, ProductId) => {
    setEditPartNumberId(Id);
    setProductId(ProductId);
    setIsEditModalOpen(true);
  };

  const handleDeletePartNumber = async (Id) => {
    if (!window.confirm("Are you sure you want to delete this Part Number?")) return;
    try {
      await axios.delete(`/api/admin/admin/products/part-numbers/${Id}`);
      fetchPartNumbers();
    } catch (error) {
      console.error("Error deleting part number:", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredPartNumbers(
      partNumbers.filter((pn) =>
        pn.Name.toLowerCase().includes(value)
      )
    );
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedProduct(value);
    if (value === "") {
      setFilteredPartNumbers(partNumbers);
    } else {
      setFilteredPartNumbers(partNumbers.filter(pn => pn.ProductId === parseInt(value)));
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="bg-white p-5 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">All Part Numbers</h2>
      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="text"
          placeholder="Search Part Number..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border p-2 rounded-lg w-full md:w-1/3"
        />
        <div className="relative w-full md:w-1/3">
          <div className="relative">
            <div
              className="border p-2 rounded-lg w-full cursor-pointer bg-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedProduct
                ? products.find(p => p.id === selectedProduct)?.name
                : "All Products"}
            </div>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search Product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <div
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      handleFilterChange({ target: { value: "" } });
                      setIsDropdownOpen(false);
                    }}
                  >
                    All Products
                  </div>
                  {products
                    .filter((product) =>
                      product.name.toLowerCase().includes(productSearch.toLowerCase())
                    )
                    .map((product) => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          handleFilterChange({ target: { value: product.id } });
                          setIsDropdownOpen(false);
                        }}
                      >
                        {product.name}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table for Part Numbers */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              {/* Other columns will automatically adjust to content */}
              <th className="border p-2 min-w-[120px]">Nama Product</th>
              <th className="border p-2 min-w-[120px]">Part Number</th>
              <th className="border p-2">Dash</th>
              <th className="border p-2">Inner Diameter (mm)</th>
              <th className="border p-2">Outer Diameter (mm)</th>
              <th className="border p-2">Working Pressure (psi)</th>
              <th className="border p-2">Bursting Pressure (psi)</th>
              <th className="border p-2">Bending Radius (mm)</th>
              <th className="border p-2">Hose Weight (m/kg)</th>
              <th
                className="border p-2 text-center"
                style={{
                  minWidth: '220px', // Minimum width for actions column
                  width: '220px',    // Fixed width if possible
                  whiteSpace: "nowrap",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPartNumbers.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center p-3">No Part Numbers Available</td>
              </tr>
            ) : (
              filteredPartNumbers.map((pn) => (
                <tr key={pn.Id} className="text-center">
                  <td className="border p-2">{pn.ProductName}</td>
                  <td className="border p-2">{pn.Name}</td>
                  <td className="border p-2">{pn.Dash}</td>
                  <td className="border p-2">{pn.InnerDiameter}</td>
                  <td className="border p-2">{pn.OuterDiameter}</td>
                  <td className="border p-2">{pn.WorkingPressure}</td>
                  <td className="border p-2">{pn.BurstingPressure}</td>
                  <td className="border p-2">{pn.BendingRadius}</td>
                  <td className="border p-2">{pn.HoseWeight}</td>
                  <td
                    className="border p-2"
                    style={{
                      minWidth: '220px', // Ensure consistent sizing with header
                      width: '220px',
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div className="flex justify-center items-center gap-2"> {/* Reduced gap for more compactness */}
                      <button
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-md hover:bg-yellow-600 transition-all flex items-center gap-1.5" // Adjusted padding, font size, and gap
                        onClick={() => handleEditClick(pn.Id, pn.ProductId)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z"></path></svg>
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-md hover:bg-red-600 transition-all flex items-center gap-1.5" // Adjusted padding, font size, and gap
                        onClick={() => handleDeletePartNumber(pn.Id)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Part Number Button */}
      <CreatePartNumberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={fetchPartNumbers}
        productId={productId}
      />

      <PartNumberEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={fetchPartNumbers}
        partNumberId={editPartNumberId}
        productId={productId}
      />
    </div>
  );
};

export default PartNumberListAll;