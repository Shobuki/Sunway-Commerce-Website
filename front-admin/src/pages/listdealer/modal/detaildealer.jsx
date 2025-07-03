import React, { useState, useEffect } from "react";
import axios from "@/utils/axios"; // <- pastikan pakai utils yang inject token
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";
import WarehouseManagerModal from "./Warehousemanagermodal";
import AsyncSelect from "react-select/async";

// Styles for select
const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#f7ccd4"
      : state.data.isAssigned
        ? "#c61632"
        : "#fff",
    color: state.data.isAssigned ? "#fff" : "#222",
    fontWeight: state.data.isAssigned ? "bold" : "normal",
  }),
  multiValue: (provided, state) => ({
    ...provided,
    backgroundColor: state.data.isAssigned ? "#c61632" : "#f7ccd4",
    color: "#fff",
    fontWeight: "bold",
  }),
  multiValueLabel: (provided, state) => ({
    ...provided,
    color: "#fff",
    fontWeight: "bold",
  }),
  control: (provided) => ({
    ...provided,
    borderColor: "#c61632",
    boxShadow: "0 0 0 1px #c61632",
    "&:hover": { borderColor: "#b0152e" }
  }),
};

const DetailDealer = ({ isOpen, onClose, dealerId, refreshDealers }) => {
  const [dealerData, setDealerData] = useState(null);
  const [formData, setFormData] = useState({
  CompanyName: "",
  Region: "",
  PriceCategoryId: "",
  StoreCode: "",
  SalesId: [],
  Userid: [],
});

  // For users
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // For sales
  const [assignedSales, setAssignedSales] = useState([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);

  const [priceCategories, setPriceCategories] = useState([]);
  const [showAssignWarehouse, setShowAssignWarehouse] = useState(false);

  const [menuAccess, setMenuAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [allSalesList, setAllSalesList] = useState([]);


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
    if (isOpen && dealerId) {
      fetchDealerDetails(dealerId);
      fetchPriceCategories();
    }
  }, [isOpen, dealerId]);

  const fetchAllSales = async () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const res = await axios.get("/api/admin/admin/admins/list/sales", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setAllSalesList(res.data.data || []);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllSales();
    }
  }, [isOpen]);

  const fetchDealerDetails = async (dealerId) => {
    try {
      const res = await axios.get(`/api/admin/admin/dealers/${dealerId}`);
      const data = res.data.data;

      setDealerData(data);
      setFormData({
  CompanyName: data.CompanyName || "",
  Region: data.Region || "",
  PriceCategoryId: data.PriceCategory?.Id?.toString() || "",
  StoreCode: data.StoreCode || "",
   SalesId: data.Sales?.map(s => s.Id.toString()) || [],
  Userid: data.User?.map(u => u.Id.toString()) || [],
  Address: data.Address || "",
  PhoneNumber: data.PhoneNumber || "",
  fax: data.fax || "",
});

      setAssignedUsers(data.User || []);
      setAssignedSales(
        (data.Sales || []).map(salesDealer => ({
          SalesId: salesDealer.Id,
          Name: salesDealer.Name || "",
          AdminId: salesDealer.AdminId,
          Email: salesDealer.Email || "",

        }))
      );
    } catch (error) {
      console.error("Error fetching dealer details:", error);
    }
  };

  // ---------------------- USER ASSIGN SELECT ----------------------
  const filterUserOption = (option, rawInput) => {
    // Only filter by email
    if (!rawInput) return option.data.isAssigned;
    return (
      option.data.isAssigned ||
      (option.data.email && option.data.email.toLowerCase().includes(rawInput.toLowerCase()))
    );
  };
  const loadUserOptions = async (inputValue) => {
    if (!inputValue) return [];
    setIsLoadingUsers(true);
    const res = await axios.get(`/api/admin/admin/users?email=${inputValue}`);
    const users = res.data.data || [];
    const assignedid = new Set(formData.Userid);
    setIsLoadingUsers(false);
    return [
      ...assignedUsers.map(u => ({
        value: u.Id.toString(),
        label: u.Name ? `${u.Name} (${u.Email})` : u.Email,
        email: u.Email,
        isAssigned: true,
      })),
      ...users
        .filter(u => !assignedid.has(u.Id.toString()))
        .map(u => ({
          value: u.Id.toString(),
          label: u.Name ? `${u.Name} (${u.Email})` : u.Email,
          email: u.Email,
          isAssigned: false,
        })),
    ];
  };
  const handleAssignUserChange = (selected) => {
    const id = selected ? selected.map(opt => opt.value) : [];
    setFormData(prev => ({ ...prev, Userid: id }));
    setAssignedUsers(
      selected
        ? selected.map(opt => ({
          Id: opt.value,
          Name: opt.label.split(" (")[0],
          Email: /\(([^)]+)\)/.exec(opt.label)?.[1] || opt.label,
        }))
        : []
    );
  };
  const handleRemoveAssignedUser = (userId) => {
  setFormData(prev => ({
    ...prev,
    Userid: prev.Userid.filter(id => id !== userId.toString()),
  }));
  setAssignedUsers(prev => prev.filter(u => u.Id.toString() !== userId.toString()));
};
  const userDefaultValues = assignedUsers.map(u => ({
    value: u.Id.toString(),
    label: u.Name ? `${u.Name} (${u.Email})` : u.Email,
    isAssigned: true,
  }));

  // ---------------------- SALES ASSIGN SELECT ----------------------
  const filterSalesOption = (option, rawInput) => {
    // Filter by username or email (support both)
    if (!rawInput) return option.data.isAssigned;
    return (
      option.data.isAssigned ||
      (option.data.username && option.data.username.toLowerCase().includes(rawInput.toLowerCase())) ||
      (option.data.email && option.data.email.toLowerCase().includes(rawInput.toLowerCase()))
    );
  };
  const loadSalesOptions = async (inputValue) => {
    if (!inputValue) return [];
    setIsLoadingSales(true);
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const res = await axios.get("/api/admin/admin/admins/list/sales", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    let sales = res.data.data || [];
    if (inputValue)
      sales = sales.filter(s =>
        (s.Username && s.Username.toLowerCase().includes(inputValue.toLowerCase())) ||
        (s.Email && s.Email.toLowerCase().includes(inputValue.toLowerCase()))
      );
    const assignedid = new Set(formData.SalesId);

    setIsLoadingSales(false);
    return [
      // Sales sudah assigned
      ...assignedSales.map(s => ({
        value: s.SalesId?.toString(),  // Pastikan SalesId, bukan Id
        label: s.Name || s.Username || s.Email,
        username: s.Username,
        email: s.Email,
        isAssigned: true,
      })),
      // Sales belum assigned (harus juga pakai SalesId, bukan Id)
      ...sales
        .filter(s => !assignedid.has(s.SalesId?.toString()))
        .map(s => ({
          value: s.SalesId?.toString(), // HARUS SalesId
          label: s.Name || s.Username || s.Email,
          username: s.Username,
          email: s.Email,
          isAssigned: false,
        })),
    ];
  };
  const handleAssignSalesChange = (selected) => {
    const id = selected ? selected.map(opt => opt.value) : [];
    setFormData(prev => ({ ...prev, SalesId: id }));
    setAssignedSales(
      selected
        ? selected.map(opt => ({
          SalesId: opt.value,
          Name: opt.label,
          Username: opt.username,
          Email: opt.email,
        }))
        : []
    );
  };
  const handleRemoveAssignedSales = (salesId) => {
  // selalu bandingkan sebagai string!
  setFormData(prev => ({
    ...prev,
    SalesId: prev.SalesId.filter(id => id !== salesId.toString()),
  }));
  setAssignedSales(prev => prev.filter(s => s.SalesId?.toString() !== salesId.toString()));
};

  const salesDefaultValues = assignedSales.map(s => ({
    value: s.SalesId?.toString(),
    label: s.Name || s.Username || s.Email,
    username: s.Username,
    email: s.Email,
    isAssigned: true,
  }));

  // ---------------------- OTHERS ----------------------
  const fetchPriceCategories = async () => {
    try {
      const res = await axios.get("/api/admin/admin/dealers/fetch-price-categories");
      setPriceCategories(res.data.data);
    } catch (error) {
      console.error("Error fetching price categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/admin/dealers/${dealerId}`, {
  CompanyName: formData.CompanyName,
  Region: formData.Region,
  StoreCode: formData.StoreCode,
  PriceCategoryId: formData.PriceCategoryId ? Number(formData.PriceCategoryId) : null,
  SalesIds: Array.isArray(formData.SalesId) ? formData.SalesId.map(Number) : [],
  UserIds: Array.isArray(formData.Userid) ? formData.Userid.map(Number) : [],
  Address: formData.Address,
  PhoneNumber: formData.PhoneNumber,
  fax: formData.fax,
});
      alert("Dealer updated successfully.");
      refreshDealers();
      onClose();
    } catch (error) {
      console.error("Error updating dealer:", error);
      alert("Failed to update dealer.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this dealer?")) return;
    try {
      await axios.delete(`/api/admin/admin/dealers/${dealerId}`);
      alert("Dealer deleted.");
      refreshDealers();
    } catch (error) {
      console.error("Error deleting dealer:", error);
      alert("Failed to delete dealer.");
    }
  };

  if (!isOpen || !dealerData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Dealer Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Company Name</label>
            <input
              name="CompanyName"
              value={formData.CompanyName}
              maxLength={100}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label>Region</label>
            <input
              name="Region"
              value={formData.Region}
              maxLength={50}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label>Store Code *</label>
            <input
              name="StoreCode"
              value={formData.StoreCode}
              maxLength={30}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label>Price Category</label>
            <select
              name="PriceCategoryId"
              value={formData.PriceCategoryId}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="">No Price Category</option>
              {priceCategories.map(cat => (
                <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
              ))}
            </select>
          </div>

          {/* SALES */}
          <div className="mb-2">
            <label className="font-medium">Assign Sales</label>
            <AsyncSelect
              isMulti
              cacheOptions
              defaultOptions
              value={salesDefaultValues}
              loadOptions={loadSalesOptions}
              onChange={handleAssignSalesChange}
              placeholder="Type sales username or email..."
              styles={customStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              filterOption={filterSalesOption}
              isLoading={isLoadingSales}
              noOptionsMessage={() => "Type username or email to search sales"}
              formatOptionLabel={option => (
                <div>
                  {option.label}
                  {option.isAssigned && <span className="ml-1 text-xs">(assigned)</span>}
                </div>
              )}
            />
          </div>
          {/* BOX: Daftar Sales Sudah Assign */}
          {assignedSales.length > 0 && (
            <div
              style={{
                border: "1.5px solid #c61632",
                borderRadius: "8px",
                background: "#fff7fa",
                padding: "14px",
                marginTop: "14px",
                boxShadow: "0 2px 8px 0 rgba(198, 22, 50, 0.05)",
              }}
            >
              <div className="font-semibold text-[#c61632] mb-2">
                Assigned Sales:
              </div>
              <ul className="space-y-2">
                {assignedSales.map(sales => (
                  <li key={sales.SalesId} className="flex items-center justify-between">
                    <span className="font-bold text-[#c61632]">
                      {sales.Name || sales.Username}
                      <span className="text-[#c61632] font-semibold">
                        ({sales.Email || sales.Username})
                      </span>
                    </span>
                    <button
                      onClick={() => handleRemoveAssignedSales(sales.SalesId?.toString())}
                      className="ml-2 px-2 py-1 bg-[#ffe7eb] text-[#c61632] rounded hover:bg-[#c61632] hover:text-white transition"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}


          {/* USERS */}
          <div className="mb-2">
            <label className="font-medium">Assign Users</label>
            <AsyncSelect
              isMulti
              cacheOptions
              defaultOptions
              value={userDefaultValues}
              loadOptions={loadUserOptions}
              onChange={handleAssignUserChange}
              placeholder="Type user email..."
              styles={customStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              filterOption={filterUserOption}
              isLoading={isLoadingUsers}
              noOptionsMessage={() => "Type user email to search"}
              formatOptionLabel={option => (
                <div>
                  {option.label}
                  {option.isAssigned && <span className="ml-1 text-xs">(assigned)</span>}
                </div>
              )}
            />
          </div>
          {/* BOX: Daftar User Sudah Assign */}
          {assignedUsers.length > 0 && (
            <div
              style={{
                border: "1.5px solid #c61632",
                borderRadius: "8px",
                background: "#fff7fa",
                padding: "14px",
                marginTop: "14px",
                boxShadow: "0 2px 8px 0 rgba(198, 22, 50, 0.05)",
              }}
            >
              <div className="font-semibold text-[#c61632] mb-2">
                Assigned Users:
              </div>
              <ul className="space-y-2">
                {assignedUsers.map(user => (
                  <li key={user.Id} className="flex items-center justify-between">
                    <span className="font-bold text-[#c61632]">
                      {user.Name} <span className="text-[#c61632]">({user.Email})</span>
                    </span>
                    <button
                      onClick={() => handleRemoveAssignedUser(user.Id)}
                      className="ml-2 px-2 py-1 bg-[#ffe7eb] text-[#c61632] rounded hover:bg-[#c61632] hover:text-white transition"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="w-[120px] px-4 py-1.5 rounded bg-gray-500 text-white font-medium flex justify-center items-center"
              onClick={onClose}
            >
              Cancel
            </button>
            {hasFeatureAccess(menuAccess, "editwarehousepriority") && (
              <button
                type="button"
                className="w-[100px] px-4 py-1.5 rounded bg-amber-700 text-white font-medium flex justify-center items-center"
                onClick={() => setShowAssignWarehouse(true)}
              >
                Warehouse<br />Priority
              </button>
            )}
            {hasFeatureAccess(menuAccess, "edit") && (
              <button
                type="submit"
                className="w-[120px] px-4 py-1.5 rounded bg-blue-600 text-white font-medium flex justify-center items-center"
              >
                Save
              </button>
            )}
            {hasFeatureAccess(menuAccess, "delete") && (
              <button
                type="button"
                className="w-[120px] px-4 py-1.5 rounded bg-red-600 text-white font-medium flex justify-center items-center"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
      <WarehouseManagerModal
        isOpen={showAssignWarehouse}
        onClose={() => setShowAssignWarehouse(false)}
        dealerId={dealerId}
      />
    </div>
  );
};

export default DetailDealer;
