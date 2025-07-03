import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import "./../Product.css";

const ProductListAll = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchAllProducts();
  }, [currentPage, searchTerm, sortOrder]);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get("/api/admin/admin/products/main/all", {
        params: {
          page: currentPage,
          search: searchTerm,
          sort: sortOrder,
        },
      });
      setProducts(response.data.data || []);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching all products:", error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="product-container">
      <h2 className="title">All Products</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search product name..."
          className="border px-3 py-2 rounded w-1/2"
        />
        <button onClick={handleSortToggle} className="bg-gray-300 px-4 py-2 rounded ml-4">
          Sort: {sortOrder.toUpperCase()}
        </button>
      </div>

      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.Id}>
                <td>{product.Id}</td>
                <td>
                  <Link href={`/productsetting/list/${product.Id}`} className="product-link">
                    {product.Name}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-btn">
          Prev
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-btn">
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductListAll;
