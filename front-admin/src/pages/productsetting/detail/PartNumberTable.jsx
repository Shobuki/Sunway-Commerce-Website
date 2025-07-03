import React, { useState, useEffect, Fragment } from "react";
import axios from "@/utils/axios";
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";
import CreatePartNumberModal from "../Modal/modalturunan/PartNumberCreateModal";
import PartNumberEditModal from "../Modal/modalturunan/PartNumberEditModal";
import ItemCodeDropdown from "./ItemCodeDropdown"; // Assuming this handles the nested table

// Asumsi ikon sudah diimpor atau didefinisikan di tempat lain
const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z"></path>
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clipRule="evenodd" />
  </svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);
const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);


const PartNumberTable = ({ productId }) => {
  const [partNumbers, setPartNumbers] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPartNumberId, setEditPartNumberId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [loadingPartNumbers, setLoadingPartNumbers] = useState(true);
  const [userMessagePN, setUserMessagePN] = useState("");

  const [menuAccess, setMenuAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  // Akses fitur dari `menuAccess`
  const canEdit = hasFeatureAccess(menuAccess, "editproduct");
  const canDelete = hasFeatureAccess(menuAccess, "deleteproduct");
  const canCreate = hasFeatureAccess(menuAccess, "createproduct"); // Tambahkan ini jika ada fitur create
  const showActions = canEdit || canDelete;

  useEffect(() => {
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

  const clearMessagePN = () => {
    setTimeout(() => setUserMessagePN(""), 3000);
  };

  useEffect(() => {
    if (productId) {
      setLoadingPartNumbers(true);
      fetchPartNumbers();
    }
  }, [productId]);

  const fetchPartNumbers = async () => {
    try {
      const response = await axios.get(
        `/api/admin/admin/products/part-numbers/products/${productId}`
      );
      setPartNumbers(response.data.data.PartNumber || []);
    } catch (error) {
      console.error("Error fetching part numbers:", error);
      setPartNumbers([]);
      setUserMessagePN("Error: Could not fetch part numbers.");
      clearMessagePN();
    } finally {
      setLoadingPartNumbers(false);
    }
  };

  const handleEditClick = (id) => {
    setEditPartNumberId(id);
    setIsEditModalOpen(true);
  };

  const handleToggleDropdown = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeletePartNumber = async (id) => {
    if (!window.confirm("Are you sure you want to delete this part number and all its item codes? This action cannot be undone.")) return;
    setUserMessagePN("");
    try {
      await axios.delete(
        `/api/admin/admin/products/part-numbers/${id}`
      );
      fetchPartNumbers();
      setUserMessagePN("Success: Part number deleted.");
    } catch (error) {
      console.error("Error deleting part number:", error);
      setUserMessagePN("Error: Failed to delete part number.");
    } finally {
      clearMessagePN();
    }
  };

  const naturalSort = (a, b) => {
    return a.Name.localeCompare(b.Name, undefined, { numeric: true, sensitivity: 'base' });
  };

  if (loadingAccess) return null; // Or a loading spinner

  return (
    <div className="bg-white p-4 sm:p-5 shadow-lg rounded-xl border border-gray-100">
      {userMessagePN && (
        <div className={`mb-3 p-2 rounded-md text-white text-xs z-40 ${userMessagePN.startsWith("Error:") ? "bg-red-500" : "bg-green-500"}`}>
          {userMessagePN}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Part Number List</h3>
        {canCreate && ( // Menggunakan canCreate
          <button
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm font-semibold shadow-md transition duration-150 ease-in-out" // Lebihkan padding untuk button besar
            onClick={() => setIsCreateModalOpen(true)}
          >
            <IconPlus className="w-5 h-5 mr-1" /> Create Part Number
          </button>
        )}
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200"> {/* Added overflow-x-auto here */}
        <table className="min-w-full divide-y divide-gray-200 table-fixed"> {/* min-w-full agar bisa discroll */}
          <colgroup>
            {/* Sesuaikan lebar kolom agar Actions bisa lebih besar, dan kolom lain lebih rapat */}
            <col style={{ width: "20%" }} /> {/* PART NUMBER */}
            <col style={{ width: "8%" }} />  {/* DASH */}
            <col style={{ width: "10%" }} /> {/* INNER.Ø (mm) */}
            <col style={{ width: "10%" }} /> {/* OUTER.Ø (mm) */}
            <col style={{ width: "10%" }} /> {/* WORK.P */}
            <col style={{ width: "10%" }} /> {/* BURST.P */}
            <col style={{ width: "10%" }} /> {/* BEND.R */}
            <col style={{ width: "8%" }} />  {/* WEIGHT */}
            {showActions && <col style={{ width: "14%" }} />} {/* ACTIONS: Lebih besar */}
          </colgroup>
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium text-left">Part Number</th>
              <th scope="col" className="px-2 py-3 text-center font-medium">Dash</th>
              <th scope="col" className="px-2 py-3 text-center font-medium">Inner Ø <span className="lowercase">(mm)</span></th>
              <th scope="col" className="px-2 py-3 text-center font-medium">Outer Ø <span className="lowercase">(mm)</span></th>
              <th scope="col" className="px-2 py-3 text-center font-medium break-words">Working Pressure<br /><span className="lowercase">(psi)</span></th>
              <th scope="col" className="px-2 py-3 text-center font-medium break-words">Bursting Pressure<br /><span className="lowercase">(psi)</span></th>
              <th scope="col" className="px-2 py-3 text-center font-medium break-words">Bending Radius<br /><span className="lowercase">(mm)</span></th>
              <th scope="col" className="px-2 py-3 text-center font-medium">Weight</th>
              {showActions && (<th scope="col" className="px-2 py-3 text-center font-medium">Actions</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loadingPartNumbers && (
              <tr>
                <td colSpan="9" className="py-10 text-center text-gray-500 text-sm animate-pulse">Loading part numbers...</td>
              </tr>
            )}
            {!loadingPartNumbers && partNumbers.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-10 text-center text-gray-500 italic text-sm">No Part Numbers Available.</td>
              </tr>
            ) : (
              [...partNumbers].sort(naturalSort).map((pn) => (
                <Fragment key={pn.Id}>
                  <tr className="hover:bg-gray-50 sm:hover:bg-slate-50/70 transition duration-150 ease-in-out">
                    <td
                      className="px-4 py-3 font-medium text-left cursor-pointer"
                      onClick={() => handleToggleDropdown(pn.Id)}
                      title={`Click to view/hide item codes for ${pn.Name}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{pn.Name}</span>
                        <IconChevronDown className={`ml-1 w-5 h-5 text-gray-400 group-hover:text-indigo-600 transform transition-transform duration-200 ${expandedRows[pn.Id] ? 'rotate-180' : ''}`} />
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">{pn.Dash || "-"}</td>
                    <td className="px-2 py-3 text-center">{pn.InnerDiameter || "-"}</td>
                    <td className="px-2 py-3 text-center">{pn.OuterDiameter || "-"}</td>
                    <td className="px-2 py-3 text-center break-words">{pn.WorkingPressure || "-"}</td>
                    <td className="px-2 py-3 text-center break-words">{pn.BurstingPressure || "-"}</td>
                    <td className="px-2 py-3 text-center break-words">{pn.BendingRadius || "-"}</td>
                    <td className="px-2 py-3 text-center">{pn.HoseWeight || "-"}</td>
                    {showActions && (
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-center space-x-2"> {/* Increased space-x for larger buttons */}
                          {canEdit && (
                            <button
                              onClick={() => handleEditClick(pn.Id)}
                              className="inline-flex items-center justify-center p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow-sm transition duration-150 ease-in-out text-sm font-semibold" // Adjust padding and font size for larger icons
                              title="Edit Part Number"
                            >
                              <IconPencil /> {/* Icon is now w-5 h-5 */}
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeletePartNumber(pn.Id)}
                              className="inline-flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition duration-150 ease-in-out text-sm font-semibold" // Adjust padding and font size for larger icons
                              title="Delete Part Number"
                            >
                              <IconTrash /> {/* Icon is now w-5 h-5 */}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  {expandedRows[pn.Id] && (
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td colSpan="9" className="p-0">
                        <div className="p-3 sm:p-4">
                          <ItemCodeDropdown partNumberId={pn.Id} menuAccess={menuAccess} /> {/* Pass menuAccess */}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <CreatePartNumberModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={() => {
            fetchPartNumbers();
            setIsCreateModalOpen(false);
            setUserMessagePN("Success: New part number created.");
            clearMessagePN();
          }}
          productId={productId}
        />
      )}
      {isEditModalOpen && editPartNumberId && (
        <PartNumberEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditPartNumberId(null);
          }}
          onSave={() => {
            fetchPartNumbers();
            setIsEditModalOpen(false);
            setEditPartNumberId(null);
            clearMessagePN();

            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 2500);
          }}
          partNumberId={editPartNumberId}
        />
      )}

      {showSuccessToast && (
  <div className="fixed top-6 right-6 z-[9999] flex items-center px-4 py-3 rounded-lg shadow-lg bg-green-600 text-white text-base font-medium transition-all duration-300 pointer-events-none animate-toast-in" style={{ minWidth: 240 }}>
    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    Part Number updated successfully!
  </div>
)}
    </div>
  );
};

export default PartNumberTable;