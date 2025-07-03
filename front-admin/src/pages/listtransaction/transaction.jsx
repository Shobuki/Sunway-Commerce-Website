import React, { useEffect, useState } from "react";
import axios from "@/utils/axios";


function hasFeatureAccess(menuAccess, feature) {
  return (
    menuAccess?.Features?.some(
      (f) => f.Feature === feature && f.Access === "WRITE"
    ) ?? false
  );
}


const Transaction = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateDetails, setUpdateDetails] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    sortDate: "asc",
  });
  const [dealerFilter, setDealerFilter] = useState("");
  const [itemCodeFilter, setItemCodeFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [partNumberFilter, setPartNumberFilter] = useState("");

  const [showFilterModal, setShowFilterModal] = useState(false);

  const [itemCodeOptions, setItemCodeOptions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState([]);
  const [forceApplyTax, setForceApplyTax] = useState(false);
  const [activeTax, setActiveTax] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState("");


  const [searchTerm, setSearchTerm] = useState("");

  const [loadingAccess, setLoadingAccess] = useState(true);
  const [menuAccess, setMenuAccess] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/admin/access/my-menu")
      .then(res => {
        const access = (res.data || []).find(
          m => m.Name?.toLowerCase() === "salesorder"
        );
        setMenuAccess(access || null);
        setLoadingAccess(false);
        if (!access) setTimeout(() => window.location.href = "/access-denied", 0);
      })
      .catch(() => {
        setMenuAccess(null);
        setLoadingAccess(false);
        setTimeout(() => window.location.href = "/access-denied", 0);
      });
  }, []);

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  useEffect(() => {
    if (forceApplyTax && activeTax) {
      const updated = updateDetails.map(detail => ({
        ...detail,
        FinalPrice: detail.Quantity * detail.Price * (1 + activeTax.Percentage / 100),
      }));
      setUpdateDetails(updated);
    }
  }, [forceApplyTax, activeTax]);

  useEffect(() => {
    if (showModal && updateDetails.length > 0) {
      const hasAnyTax = updateDetails.some(
        d => d.TaxId != null || (typeof d.TaxPercentage === "number" && d.TaxPercentage > 0)
      );
      setForceApplyTax(hasAnyTax);
    }
  }, [showModal, updateDetails]);

  const fetchSalesOrders = async () => {
    try {
      const { data: result } = await axios.get("/api/admin/admin/salesorder/getall");
      if (result.data) {
        const normalized = result.data.map(order => ({
          ...order,
          SalesOrderDetails: order.Details
        }));
        setSalesOrders(normalized);
      }
    } catch (error) {
      // Axios error sudah lebih jelas
      console.error("Error fetching sales orders:", error);
      alert(error.response?.data?.message || error.message || "Fetch error");
    }
  };


  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...updateDetails];
    newDetails[index][field] = value;
    if (forceApplyTax && activeTax) {
      newDetails[index].FinalPrice = value * newDetails[index].Price * (1 + activeTax.Percentage / 100);
    } else {
      newDetails[index].FinalPrice = value * newDetails[index].Price;
    }

    setUpdateDetails(newDetails);



  };

  const fetchItemCodes = async (itemCodeId, query, index) => {
    try {
      const { data: result } = await axios.post("/api/admin/admin/salesorder/detail/fetchrelateditemcodes", {
        ItemCodeId: itemCodeId > 0 ? itemCodeId : undefined,
        query
      });
      if (result?.data) {
        setItemCodeOptions((prev) => {
          const updated = [...prev];
          updated[index] = result.data;
          return updated;
        });
      }
    } catch (error) {
      console.error("Fetch ItemCodes failed:", error);
    }
  };


  const fetchActiveTax = async () => {
    try {
      const { data: result } = await axios.get("/api/admin/admin/salesorder/tax/getactive");
      if (result?.data?.Id) {
        setActiveTax({ Id: result.data.Id, Percentage: result.data.Percentage });
      }
    } catch (error) {
      console.error("Fetch Active Tax failed:", error);
    }
  };




  const handleUpdate = async () => {
    try {
      const updatedData = {
        SalesOrderId: selectedOrder?.Id,
        SalesOrderNumber: selectedOrder?.SalesOrderNumber,
        JdeSalesOrderNumber: selectedOrder?.JdeSalesOrderNumber,
        Status: "NEEDS_REVISION",
        Note: selectedOrder?.Note,
        PaymentTerm: selectedOrder?.PaymentTerm,
        FOB: selectedOrder?.FOB,
        CustomerPoNumber: selectedOrder?.CustomerPoNumber,
        DeliveryOrderNumber: selectedOrder?.DeliveryOrderNumber,
        ForceApplyTax: forceApplyTax,
        SalesOrderDetails: updateDetails.map((detail) => ({
          Id: detail.Id,
          Quantity: detail.Quantity,
          Price: detail.Price,
          FinalPrice: detail.FinalPrice,
          ItemCodeId: detail.ItemCodeId,
          PriceCategoryId: detail.PriceCategoryId ?? null,
        })),
      };

      await axios.put("/api/admin/admin/salesorder/approval/update", updatedData);

      alert("Sales Order updated successfully!");
      fetchSalesOrders();
      setShowModal(false);
    } catch (err) {
      console.error("Update failed:", err);
      alert(`Update failed: ${err.response?.data?.message || err.message}`);
    }
  };



  const handleDelete = async (id) => {
    if (deletingId !== null) return;
    if (window.confirm("Are you sure you want to delete this order?")) {
      setDeletingId(id);
      setDeleteMsg("");
      try {
        await axios.delete("/api/admin/admin/salesorder", {
          data: { SalesOrderId: id }
        });

        setDeleteMsg("✔️ Sales order deleted successfully!");
        setSalesOrders(prev => prev.filter(order => order.Id !== id));
      } catch (error) {
        setDeleteMsg(`❌ Delete failed: ${error.response?.data?.message || error.message}`);
        console.error("Delete failed:", error);
      } finally {
        setDeletingId(null);
        setTimeout(() => setDeleteMsg(""), 3000);
      }
    }
  };



  const calculateTotal = (details) => {
    if (!Array.isArray(details)) return 0;
    return details.reduce((sum, detail) => sum + (detail.FinalPrice || 0), 0);
  };




  const filteredOrders = salesOrders
    .filter(order => {
      const searchMatch =
        order.SalesOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.Dealer?.CompanyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.JdeSalesOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = filters.status ? order.Status === filters.status : true;

      const dateMatch =
        (!filters.startDate || new Date(order.CreatedAt) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(order.CreatedAt) <= new Date(filters.endDate));

      const details = Array.isArray(order.SalesOrderDetails) ? order.SalesOrderDetails : [];

      return (
        searchMatch &&
        statusMatch &&
        dateMatch &&
        (dealerFilter ? order.Dealer?.CompanyName?.toLowerCase().includes(dealerFilter.toLowerCase()) : true) &&
        (itemCodeFilter ? details.some(detail => detail.ItemCode?.Name?.toLowerCase().includes(itemCodeFilter.toLowerCase())) : true) &&
        (productFilter ? details.some(detail => detail.Product?.Name?.toLowerCase().includes(productFilter.toLowerCase())) : true) &&
        (productCategoryFilter ? details.some(detail => detail.Product?.ProductCategory?.Name?.toLowerCase().includes(productCategoryFilter.toLowerCase())) : true)
      );
    })
    .sort((a, b) => {
      if (filters.sortDate === "asc") {
        return new Date(a.CreatedAt) - new Date(b.CreatedAt);
      }
      return new Date(b.CreatedAt) - new Date(a.CreatedAt);
    });

  // --- Render proteksi loading & akses ---
  if (loadingAccess) return <div>Loading Access...</div>;
  if (!menuAccess) return null;

  // Cek fitur
  const canEdit = hasFeatureAccess(menuAccess, "editsalesorder");
  const canDelete = hasFeatureAccess(menuAccess, "deletesalesorder");
  const showActions = canEdit || canDelete;
  return (
    <div className="p-5 ml-60 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-5">Sales Orders</h2>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <select
          name="status"
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Status</option>
          <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
          <option value="NEEDS_REVISION">Needs Revision</option>
          <option value="APPROVED_EMAIL_SENT">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>





        <input
          type="date"
          name="startDate"
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="endDate"
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        />

        <select
          name="sortDate"
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        >
          <option value="asc">Oldest First</option>
          <option value="desc">Newest First</option>
        </select>
      </div>
      <button
        onClick={() => setShowFilterModal(true)}
        className="bg-gray-700 text-white px-4 py-2 rounded mb-4"
      >
        Filter
      </button>

      {deleteMsg && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-[9999] text-center">
          {deleteMsg}
        </div>
      )}

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Order Number</th>
            <th className="border p-2">Dealer</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Total Harga</th>
            {showActions && <th className="border p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.Id}>
              <td className="border p-2">{order.SalesOrderNumber || "-"}</td>
              <td className="border p-2">{order.Dealer?.CompanyName}</td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded ${order.Status === "APPROVED_EMAIL_SENT" ? "bg-green-100 text-green-800" :
                  order.Status === "NEEDS_REVISION" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                  {order.Status}
                </span>
              </td>
              <td className="border p-2">
                {new Date(order.CreatedAt).toLocaleDateString()}
              </td>
              <td className="border p-2">
                Rp {calculateTotal(order.Details).toLocaleString()}
              </td>
              {showActions && (
                <td className="border p-2">
                  {canEdit && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setUpdateDetails(
                          Array.isArray(order.Details)
                            ? order.Details.map((d) => ({
                              ...d,
                              ItemCode: { Id: d.ItemCodeId, Name: d.ItemName },
                              TaxId: d.TaxId ?? null,
                              TaxPercentage: d.TaxPercentage ?? null,
                              TaxName: d.TaxName ?? null,
                            }))
                            : []
                        );
                        setShowModal(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(order.Id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      disabled={deletingId === order.Id}
                    >
                      {deletingId === order.Id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>


      {/* Edit Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[75vw] xl:max-w-[70vw] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Review/Edit Order: {selectedOrder.SalesOrderNumber}
            </h3>

            {/* Bagian Info Order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Editable Fields */}
              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sales Order Number</label>
                <input
                  type="text"
                  value={selectedOrder.SalesOrderNumber}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, SalesOrderNumber: e.target.value })
                  }
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 shadow-sm"
                  placeholder="Sales Order Number"
                />
              </div>

              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Customer PO Number</label>
                <input
                  type="text"
                  value={selectedOrder.CustomerPoNumber || ''}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, CustomerPoNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Customer PO Number"
                />
              </div>
              {/* Read-only */}
              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Dealer Name</label>
                <input
                  type="text"
                  value={selectedOrder.Dealer?.CompanyName || "-"}
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 shadow-sm"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction Date</label>
                <input
                  type="text"
                  value={
                    selectedOrder.CreatedAt
                      ? new Date(selectedOrder.CreatedAt).toLocaleDateString()
                      : ""
                  }
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 shadow-sm"
                />
              </div>

              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Region</label>
                <input
                  type="text"
                  value={selectedOrder.Dealer?.Region || ""}
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 shadow-sm"
                />
              </div>
              <div className="md:col-span-1 flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">JDE Sales Order Number</label>
                <input
                  type="text"
                  value={selectedOrder.JdeSalesOrderNumber || ""}
                  onChange={e =>
                    setSelectedOrder({ ...selectedOrder, JdeSalesOrderNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="JDE Sales Order Number"
                />
              </div>
              <div className="md:col-span-1 flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Order Number</label>
                <input
                  type="text"
                  value={selectedOrder.DeliveryOrderNumber || ""}
                  onChange={e =>
                    setSelectedOrder({ ...selectedOrder, DeliveryOrderNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Delivery Order Number"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">FOB</label>
                <input
                  type="text"
                  value={selectedOrder.FOB || ""}
                  onChange={e =>
                    setSelectedOrder({ ...selectedOrder, FOB: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="FOB"
                />
              </div>
              <div className="col-span-1 md:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Note</label>
                <input
                  type="text"
                  value={selectedOrder.Note || ""}
                  onChange={e =>
                    setSelectedOrder({ ...selectedOrder, Note: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Note"
                />
              </div>
              <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row md:items-center gap-6">
                <label className="inline-flex items-center flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={forceApplyTax}
                    onChange={async (e) => {
                      const newValue = e.target.checked;
                      setForceApplyTax(newValue);
                      if (newValue) {
                        await fetchActiveTax();
                        if (activeTax) {
                          const updated = updateDetails.map(detail => ({
                            ...detail,
                            FinalPrice: detail.Quantity * detail.Price * (1 + activeTax.Percentage / 100),
                          }));
                          setUpdateDetails(updated);
                        }
                      } else {
                        setActiveTax(null);
                        const updated = updateDetails.map(detail => ({
                          ...detail,
                          FinalPrice: detail.Quantity * detail.Price,
                        }));
                        setUpdateDetails(updated);
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active Tax {activeTax && `(${activeTax.Percentage}%)`}
                  </span>
                </label>
                <span className="mx-2 text-gray-400 font-bold text-xl hidden md:inline">||</span>
                <div className="flex items-center mt-3 md:mt-0">
                  <label className="text-sm font-medium text-gray-700 mr-2 min-w-[100px]">Payment Term</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={selectedOrder.PaymentTerm || ""}
                    onChange={e =>
                      setSelectedOrder({ ...selectedOrder, PaymentTerm: parseInt(e.target.value) || 0 })
                    }
                    className="border rounded px-3 py-2 w-32"
                    placeholder="Hari"
                  />
                  <span className="ml-2 text-sm text-gray-600">hari</span>
                </div>
              </div>
            </div>

            {/* Item Table */}
            <div className="space-y-6">
              <div className="mt-6">
                <h4 className="font-bold text-lg mb-2">Item Details</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 table-fixed">
                    <colgroup>
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '10%' }} />
                    </colgroup>
                    <thead className="bg-gray-100 text-sm text-gray-700">
                      <tr>
                        <th className="border px-3 py-2 text-left">Item Code</th>
                        <th className="border px-3 py-2 text-left">Quantity</th>
                        <th className="border px-3 py-2 text-left">Price</th>
                        <th className="border px-3 py-2 text-left">Final Price</th>
                        <th className="border px-3 py-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {updateDetails.map((detail, index) => (
                        <tr key={detail.Id || `new-${index}`}>
                          <td className="border px-2 py-1 align-top">
                            <div className="relative">
                              <button
                                className="w-full text-left border px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 truncate"
                                onClick={() => {
                                  const toggles = [...dropdownOpen];
                                  toggles[index] = !toggles[index];
                                  setDropdownOpen(toggles);
                                  if (
                                    toggles[index] &&
                                    (!itemCodeOptions[index] || itemCodeOptions[index].length === 0)
                                  ) {
                                    fetchItemCodes(detail.ItemCodeId, "", index);
                                  }
                                }}
                              >
                                {detail.ItemCode?.Name || "Pilih Item Code"}
                              </button>
                              {dropdownOpen[index] && (
                                <div className="absolute bg-white border mt-1 rounded shadow-lg z-[60] w-full max-h-60 overflow-y-auto">
                                  <input
                                    type="text"
                                    className="w-full p-2 border-b sticky top-0 bg-white z-10"
                                    placeholder="Cari Item Code..."
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => {
                                      e.stopPropagation();
                                      fetchItemCodes(0, e.target.value, index);
                                    }}
                                  />
                                  {itemCodeOptions[index]?.length > 0 ? (
                                    itemCodeOptions[index]?.map((item) => (
                                      <div
                                        key={item.Id}
                                        className="p-2 hover:bg-blue-100 cursor-pointer truncate"
                                        onClick={() => {
                                          const updated = [...updateDetails];
                                          updated[index].ItemCodeId = item.Id;
                                          updated[index].ItemCode = item;
                                          const qty = updated[index].Quantity;
                                          const price = updated[index].Price;
                                          updated[index].FinalPrice =
                                            forceApplyTax && activeTax
                                              ? qty * price * (1 + activeTax.Percentage / 100)
                                              : qty * price;
                                          setUpdateDetails(updated);
                                          const toggles = [...dropdownOpen];
                                          toggles[index] = false;
                                          setDropdownOpen(toggles);
                                        }}
                                      >
                                        {item.Name}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-2 text-gray-500">Tidak ada item.</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="border px-2 py-1 align-top">
                            <input
                              type="number"
                              min="1"
                              className="w-full border px-2 py-1 rounded focus:ring-indigo-500 focus:border-indigo-500"
                              value={detail.Quantity}
                              onChange={e =>
                                handleDetailChange(index, "Quantity", parseInt(e.target.value) || 1)
                              }
                            />
                          </td>
                          <td className="border px-2 py-1 align-top">
                            <input
                              type="number"
                              min="0"
                              className="w-full border px-2 py-1 rounded focus:ring-indigo-500 focus:border-indigo-500"
                              value={detail.Price}
                              onChange={e =>
                                handleDetailChange(index, "Price", parseFloat(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className="border px-2 py-1 bg-gray-50 text-gray-800 align-top">
                            Rp {detail.FinalPrice.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="border text-center align-middle">
                            <button
                              type="button"
                              onClick={() => {
                                setUpdateDetails(prev =>
                                  prev.filter((_, i) => i !== index)
                                );
                                setDropdownOpen(prev =>
                                  prev.filter((_, i) => i !== index)
                                );
                                setItemCodeOptions(prev =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                              className="text-red-600 hover:text-red-800 font-bold text-2xl leading-none w-10 h-10 flex items-center justify-center mx-auto"
                              title="Remove Item"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="text-right font-bold px-3 py-2 border">Total Keseluruhan:</td>
                        <td className="border px-3 py-2 bg-gray-100 font-bold text-gray-800">
                          Rp {updateDetails.reduce((sum, detail) => sum + (detail.FinalPrice || 0), 0).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="border"></td>
                      </tr>
                    </tfoot>
                  </table>
                  <button
                    onClick={() => {
                      setUpdateDetails([
                        ...updateDetails,
                        {
                          Id: Date.now(),
                          ItemCodeId: 0,
                          ItemCode: { Id: 0, Name: "Pilih Item Code", PartNumberId: 0 },
                          Quantity: 1,
                          Price: 0,
                          FinalPrice: 0,
                        },
                      ]);
                      setDropdownOpen([...dropdownOpen, false]);
                      setItemCodeOptions([...itemCodeOptions, []]);
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150"
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Tombol Action */}
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white transition duration-150"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Filter Sales Orders</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search Keyword"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Dealer Name"
                value={dealerFilter}
                onChange={(e) => setDealerFilter(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Item Code"
                value={itemCodeFilter}
                onChange={(e) => setItemCodeFilter(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Part Number"
                value={partNumberFilter}
                onChange={(e) => setPartNumberFilter(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Product Name"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Product Category"
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="border px-3 py-2 rounded"
              />
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="border px-3 py-2 rounded"
              />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="border px-3 py-2 rounded"
              />
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="border px-3 py-2 rounded"
              >
                <option value="">All Status</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="NEEDS_REVISION">Needs Revision</option>
                <option value="APPROVED_EMAIL_SENT">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                name="sortDate"
                value={filters.sortDate}
                onChange={handleFilterChange}
                className="border px-3 py-2 rounded"
              >
                <option value="asc">Oldest First</option>
                <option value="desc">Newest First</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Close
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transaction;