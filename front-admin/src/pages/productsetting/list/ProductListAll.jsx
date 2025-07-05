import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

const ProductListAll = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchAllProducts();
    // eslint-disable-next-line
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
  const sortedProducts = [...products].sort((a, b) => {
    // Prioritas: tanpa kategori dulu (StatusParent false)
    if (a.StatusParent === b.StatusParent) {
      // Jika sama-sama ada/tidak ada kategori, urut by Id
      return sortOrder === "asc" ? a.Id - b.Id : b.Id - a.Id;
    }
    // StatusParent false (tanpa kategori) di atas
    return a.StatusParent ? 1 : -1;
  });

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
    <div className="max-w-5xl mx-auto py-8 px-2">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">All Products</h2>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search product name..."
          className="border border-gray-300 px-3 py-2 rounded-lg w-full md:w-1/2"
        />
        <button
          onClick={handleSortToggle}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg shadow hover:bg-blue-200 transition"
        >
          Sort: {sortOrder.toUpperCase()}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-3 px-4 bg-gray-100 text-gray-600 font-semibold">ID</th>
              <th className="py-3 px-4 bg-gray-100 text-gray-600 font-semibold">Product Name</th>
              <th className="py-3 px-4 bg-gray-100 text-gray-600 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-400">
                  No products found.
                </td>
              </tr>
            )}
            {sortedProducts.map((product) => (
              <tr
                key={product.Id}
                className="hover:bg-blue-50 transition"
              >
                <td className="py-2 px-4 text-center">{product.Id}</td>
                <td className="py-2 px-4">
                  <Link
                    href={`/productsetting/list/${product.Id}`}
                    className=" hover:underline font-medium"
                  >
                    {product.Name}
                  </Link>
                </td>
                <td className="py-2 px-4 text-center">
                  {product.StatusParent ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Terkait Kategori
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Tidak Ada Kategori
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded shadow bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded shadow bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductListAll;
