import React, { useState, useEffect, Fragment } from "react";
import axios from "@/utils/axios";
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";
import ItemCodeCreateModal from "../Modal/modalturunan/ItemCodeCreateModal"; // Pastikan path
import ItemCodeEditModal from "../Modal/modalturunan/ItemCodeEditModal";   // Pastikan path

// Helper untuk ikon sederhana (opsional, tapi direkomendasikan)
const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
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

const ItemCodeDropdown = ({ partNumberId }) => {
  const [itemCodes, setItemCodes] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItemCodeId, setSelectedItemCodeId] = useState(null);
  const [loadingItemCodes, setLoadingItemCodes] = useState(true);
  const [userMessageIC, setUserMessageIC] = useState("");

  const [menuAccess, setMenuAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);

  const canEdit = hasFeatureAccess(menuAccess, "editproduct");
const canDelete = hasFeatureAccess(menuAccess, "deleteproduct");
const showActions = canEdit || canDelete;
const [showSuccessToast, setShowSuccessToast] = useState(false);
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

  const clearMessageIC = () => {
    setTimeout(() => setUserMessageIC(""), 3000);
  };

  useEffect(() => {
    if (partNumberId) {
      setLoadingItemCodes(true);
      fetchItemCodes();
    }
  }, [partNumberId]);

  const fetchItemCodes = async () => {
    try {
      const response = await axios.get(
        `/api/admin/admin/products/item-codes/item/${partNumberId}`
      );
      const data = response.data.data;
      setItemCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching ItemCode data:", error);
      setItemCodes([]);
      setUserMessageIC("Error: Could not fetch item codes.");
      clearMessageIC();
    } finally {
      setLoadingItemCodes(false);
    }
  };

  const handleEditItemCode = (id) => {
    setSelectedItemCodeId(id);
    setIsEditModalOpen(true);
  };

  const handleDeleteItemCode = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item code?")) return;
    setUserMessageIC("");
    try {
      await axios.delete(`/api/admin/admin/products/item-codes/${id}`);
      fetchItemCodes();
      setUserMessageIC("Success: Item code deleted.");
    } catch (error) {
      console.error("Error deleting item code:", error);
      setUserMessageIC("Error: Failed to delete item code.");
    } finally {
      clearMessageIC();
    }
  };

  return (
  <div className="bg-white p-4 sm:p-5 rounded-xl shadow-lg border border-gray-100">
    {userMessageIC && (
      <div className={`mb-3 p-2 rounded-md text-white text-xs z-40 ${userMessageIC.startsWith("Error:") ? "bg-red-500" : "bg-green-500"}`}>
        {userMessageIC}
      </div>
    )}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Item Code Details</h4>
      {hasFeatureAccess(menuAccess, "createproduct") && (
        <button
          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold shadow-md transition duration-150 ease-in-out"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <IconPlus /> Add Item Code
        </button>
      )}
    </div>
    <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <colgroup>
          <col style={{ width: "30%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "17%" }} />
          {showActions && <col style={{ width: "16%" }} />}
        </colgroup>
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 font-medium text-left">Item Code</th>
            <th className="px-2 py-3 text-center font-medium">Allow Select.</th>
            <th className="px-2 py-3 text-center font-medium">Min Order</th>
            <th className="px-2 py-3 text-center font-medium">Order Step</th>
            {showActions && <th className="px-2 py-3 text-center font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loadingItemCodes && (
            <tr>
              <td colSpan="5" className="py-10 text-center text-gray-500 text-sm animate-pulse">Loading item codes...</td>
            </tr>
          )}
          {!loadingItemCodes && itemCodes.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-10 text-center text-gray-500 italic text-sm">No item code details available for this part number.</td>
            </tr>
          ) : (
            !loadingItemCodes && itemCodes.length > 0 && itemCodes.map((ic) => (
              <tr key={ic.Id} className="hover:bg-gray-50 sm:hover:bg-slate-50/70 transition duration-150 ease-in-out">
                <td className="px-4 py-3 font-medium text-left">
                  <span className="truncate block" title={ic.Name}>{ic.Name}</span>
                </td>
                <td className="px-2 py-3 text-center">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ic.AllowItemCodeSelection ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                    {ic.AllowItemCodeSelection ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">{ic.MinOrderQuantity ?? "-"}</td>
                <td className="px-2 py-3 text-center">{ic.OrderStep ?? "-"}</td>
                {showActions && (
                <td className="px-2 py-3">
                  <div className="flex items-center justify-center space-x-2">
                    {canEdit && (
                      <button
                        onClick={() => handleEditItemCode(ic.Id)}
                        className="inline-flex items-center justify-center p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-sm transition duration-150 ease-in-out text-sm font-semibold"
                        title="Edit Item Code"
                      >
                        <IconPencil />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteItemCode(ic.Id)}
                        className="inline-flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition duration-150 ease-in-out text-sm font-semibold"
                        title="Delete Item Code"
                      >
                        <IconTrash />
                      </button>
                    )}
                  </div>
                </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    {/* Modal bagian bawah tetap sama */}
    {isCreateModalOpen && (
      <ItemCodeCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={() => {
          fetchItemCodes();
          setIsCreateModalOpen(false);
          setUserMessageIC("Success: New item code created.");
          clearMessageIC();
        }}
        partNumberId={partNumberId}
      />
    )}
    {isEditModalOpen && selectedItemCodeId && (
  <ItemCodeEditModal
    isOpen={isEditModalOpen}
    onClose={() => {
      setIsEditModalOpen(false);
      setSelectedItemCodeId(null);
    }}
    onSave={() => {
      fetchItemCodes();
      setIsEditModalOpen(false);
      setSelectedItemCodeId(null);
      setShowSuccessToast(true);                // <--- Tampilkan toast sukses di parent
      setTimeout(() => setShowSuccessToast(false), 2500); // Otomatis hilang 2,5 detik
    }}
    Id={selectedItemCodeId}
  />
)}
{showSuccessToast && (
  <div className="fixed top-6 right-6 z-[9999] flex items-center px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white text-base font-medium transition-all duration-300 pointer-events-none animate-toast-in" style={{ minWidth: 240 }}>
    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    Item Code updated successfully!
  </div>
)}
  </div>
);
};

export default ItemCodeDropdown;