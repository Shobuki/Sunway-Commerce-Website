import React, { useState, useEffect, useMemo } from "react";
import DetailDealer from "./modal/detaildealer"; // Pastikan path ini benar
import CreateDealer from "./modal/CreateDealer"; // Pastikan path ini benar
import axios from "@/utils/axios"; // <- pastikan pakai utils yang inject token
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";

// Icon sederhana (Anda bisa menggunakan library ikon seperti react-icons)
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-gray-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDealer, setSelectedDealer] = useState(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriceCategory, setSelectedPriceCategory] = useState(""); // '' berarti semua kategori

  const [menuAccess, setMenuAccess] = useState(null);
const [loadingAccess, setLoadingAccess] = useState(true);

useEffect(() => {
  axios.get("/api/admin/admin/access/my-menu").then(res => {
    const access = (res.data || []).find(m => m.Name?.toLowerCase() === "managedealer");
    setMenuAccess(access || null);
    setLoadingAccess(false);
    if (!access) setTimeout(() => window.location.href = "/access-denied", 0);
  }).catch(() => {
    setMenuAccess(null);
    setLoadingAccess(false);
    setTimeout(() => window.location.href = "/access-denied", 0);
  });
}, []);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/admin/dealers"); // Sesuaikan dengan endpoint API Anda
      setDealers(response.data.data || []); // Pastikan response.data.data adalah array
    } catch (err) {
      console.error("Error fetching dealers:", err);
      setError("Gagal memuat data dealer. Silakan coba lagi nanti.");
      setDealers([]); // Set ke array kosong jika ada error
    } finally {
      setIsLoading(false);
    }
  };

  // Mendapatkan daftar kategori harga unik untuk filter
  const priceCategories = useMemo(() => {
    if (!dealers || dealers.length === 0) return [];
    const categories = new Set(
      dealers
        .map((dealer) => dealer.PriceCategory?.Name)
        .filter(Boolean) // Hilangkan nilai undefined atau null
    );
    return Array.from(categories).sort();
  }, [dealers]);

  // Logika filter dan pencarian
  const filteredDealers = useMemo(() => {
    return dealers.filter((dealer) => {
      const matchesSearchTerm =
        dealer.CompanyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.StoreCode?.toLowerCase().includes(searchTerm.toLowerCase()); // Asumsi ada field 'StoreCode'

      const matchesPriceCategory =
        selectedPriceCategory === "" || // "Semua Kategori"
        dealer.PriceCategory?.Name === selectedPriceCategory;

      return matchesSearchTerm && matchesPriceCategory;
    });
  }, [dealers, searchTerm, selectedPriceCategory]);

  const handleOpenDetail = (dealer) => {
    setSelectedDealer(dealer);
    setShowDetailPopup(true);
  };

  const handleCloseDetail = () => {
    setShowDetailPopup(false);
    setSelectedDealer(null);
    fetchDealers(); // Refresh data setelah modal ditutup
  };

  const handleOpenCreate = () => {
    setShowCreatePopup(true);
  };

  const handleCloseCreate = () => {
    setShowCreatePopup(false);
    fetchDealers(); // Refresh data setelah modal ditutup
  };

  if (loadingAccess) return <div>Loading Access...</div>;
if (!menuAccess) return null;

  return (
    <div className="p-6 sm:p-8 bg-gray-100 min-h-screen ml-0 md:ml-64 transition-all duration-300"> {/* Sesuaikan ml jika sidebar fixed */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dealer Management</h1>
      </header>

      {/* Panel Kontrol: Pencarian, Filter, dan Tombol Create */}
      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Search Bar */}
          <div className="md:col-span-1">
            <label htmlFor="search-dealer" className="block text-sm font-medium text-gray-700 mb-1">
              Cari Dealer (Nama atau Kode Toko)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                id="search-dealer"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Contoh: PT Maju Jaya atau ST001"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Price Category */}
          <div className="md:col-span-1">
            <label htmlFor="price-category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter Kategori Harga
            </label>
            <select
              id="price-category-filter"
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={selectedPriceCategory}
              onChange={(e) => setSelectedPriceCategory(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {priceCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Create Dealer */}
          <div className="md:col-span-1 md:text-right">
            {hasFeatureAccess(menuAccess, "create") && (
            <button
              onClick={handleOpenCreate}
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Tambah Dealer Baru
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Tampilan Loading dan Error */}
      {isLoading && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">Memuat data dealer...</p>
          {/* Anda bisa menambahkan spinner di sini */}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Grid Dealer */}
      {!isLoading && !error && (
        <>
          {filteredDealers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDealers.map((dealer) => (
                <div
                  key={dealer.Id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  <div className="p-5 flex-grow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={dealer.CompanyName}>
                      {dealer.CompanyName}
                    </h2>
                    {dealer.StoreCode && ( // Tampilkan StoreCode jika ada
                       <p className="text-sm text-gray-500 mb-1">
                         Kode Toko: <span className="font-medium text-gray-700">{dealer.StoreCode}</span>
                       </p>
                    )}
                    <p className="text-sm text-gray-500 mb-1">
                      Region: <span className="font-medium text-gray-700">{dealer.Region || "-"}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Kategori Harga:{" "}
                      <span className="font-medium text-gray-700">
                        {dealer.PriceCategory?.Name || "Tidak Ada"}
                      </span>
                    </p>
                  </div>
                  <div className="p-5 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenDetail(dealer)}
                      className="w-full text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-gray-500">
                {dealers.length > 0 ? "Tidak ada dealer yang cocok dengan kriteria pencarian/filter Anda." : "Belum ada data dealer."}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal DetailDealer */}
      {showDetailPopup && selectedDealer && (
        <DetailDealer
          isOpen={showDetailPopup}
          onClose={handleCloseDetail}
          dealerId={selectedDealer.Id}
          refreshDealers={fetchDealers}
          menuAccess={menuAccess} // Tetap kirim fetchDealers jika dibutuhkan di dalam modal
        />
      )}

      {/* Modal CreateDealer */}
      {showCreatePopup && (
        <CreateDealer
          isOpen={showCreatePopup}
          onClose={handleCloseCreate}
          refreshDealers={fetchDealers}
        />
      )}
    </div>
  );
};

export default DealerManagement;