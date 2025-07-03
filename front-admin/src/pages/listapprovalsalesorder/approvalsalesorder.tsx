import React, { useEffect, useState } from "react";
import { Fragment } from "react";
import axios from "@/utils/axios";

type FeatureAccess = {
  Feature: string;
  Access: string;
};

type MenuAccess = {
  Features?: FeatureAccess[];
  // tambahkan field lain jika perlu
};

function hasFeatureAccess(menuAccess: MenuAccess | null, feature: string): boolean {
  return (
    menuAccess?.Features?.some(
      (f: FeatureAccess) => f.Feature === feature && f.Access === "WRITE"
    ) ?? false
  );
}


interface SalesOrder {
  Id: number;
  SalesOrderNumber: string;
  JdeSalesOrderNumber?: string; // ✅ Add this field
  Dealer: { // Ubah dari DealerName ke object Dealer
    CompanyName: string;
    Region: string;
  };
  CreatedAt: string; // Tambahkan CreatedAt
  Region: string;
  Status: string;
  Note?: string;
  PaymentTerm?: number;
  FOB?: string;
  CustomerPoNumber?: string;
  DeliveryOrderNumber?: string;
  details?: SalesOrderDetail[];
}

interface ItemCode {
  Id: number;
  Name: string;
  PartNumberId: number;
  OEM?: string;
  QtyOnHand?: number;
  Weight?: number;
  Price?: any[];
  ItemCodeImage?: any[];
}


interface SalesOrderDetail {
  Id: number;
  ItemCodeId: number;
  ItemCode: ItemCode; // Tambahkan ini
  Quantity: number;
  Price: number;
  FinalPrice: number;
  PriceCategoryId?: number;
  TaxId?: number | null;
  TaxPercentage?: number | null;
  TaxName?: string | null;
}

interface EmailRecipient {
  Id: number;
  SalesId: number;
  RecipientEmail: string;
}

const ApprovalSalesOrder: React.FC = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [salesId, setSalesId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updateDetails, setUpdateDetails] = useState<SalesOrderDetail[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [editingRecipient, setEditingRecipient] = useState<EmailRecipient | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);

  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const [dropdownOpen, setDropdownOpen] = useState<boolean[]>([]);
  const [itemCodeOptions, setItemCodeOptions] = useState<
    { Id: number; Name: string; PartNumberId: number }[][]
  >([]);


  const [forceApplyTax, setForceApplyTax] = useState(false);
  const [activeTax, setActiveTax] = useState<{ Id: number, Percentage: number } | null>(null);

  const [sortDealerAsc, setSortDealerAsc] = useState(true);

  const [approveLoading, setApproveLoading] = useState(false);
  const [approveMessage, setApproveMessage] = useState("");


  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxPercentage, setTaxPercentage] = useState('');
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState('');
  const [currentTax, setCurrentTax] = useState<{ Id: number; Name: string; Percentage: number } | null>(null);

  const [loadingAccess, setLoadingAccess] = useState(true);
  const [menuAccess, setMenuAccess] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/admin/access/my-menu")
      .then(res => {
        const data = res.data;
        const access = (data || []).find(
          (m: { Name: string; }) => m.Name?.toLowerCase() === "approvesalesorder"
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
    fetchSessionAndSalesOrders();
  }, []);

  useEffect(() => {
    if (showEmailModal && salesId) {
      fetchEmailRecipients();
    }
  }, [showEmailModal, salesId]);

  useEffect(() => {
    setDropdownOpen(Array(updateDetails.length).fill(false));
    updateDetails.forEach((d, idx) => {
      fetchItemCodes(d.ItemCodeId, "", idx); // fetch awal by default itemcode
    });
  }, [updateDetails]);

  useEffect(() => {
    if (forceApplyTax) {
      fetchActiveTax(); // hanya fetch, tidak update harga
    }
  }, [forceApplyTax]);

  useEffect(() => {
    if (!activeTax) return;

    setUpdateDetails((prevDetails) =>
      prevDetails.map((detail) => {
        const base = detail.Price * detail.Quantity;
        return {
          ...detail,
          FinalPrice: forceApplyTax
            ? base * (1 + activeTax.Percentage / 100)
            : base,
        };
      })
    );
  }, [forceApplyTax, activeTax]);


  useEffect(() => {
    // Jika modal review terbuka & ada detail order
    if (showModal && updateDetails.length > 0) {
      const hasAnyTax = updateDetails.some(
        d => d.TaxId != null || (typeof d.TaxPercentage === 'number' && d.TaxPercentage > 0)
      );
      setForceApplyTax(hasAnyTax);
    }
  }, [showModal, updateDetails]);

  const fetchSessionAndSalesOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view this page.");
      return;
    }

    try {
      const sessionResponse = await axios.get("/api/admin/admin/session", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const sessionResult = sessionResponse.data;
      if (!sessionResult?.session?.SalesId) {
        setError("Sales ID not found in session. Please re-login.");
        return;
      }
      setSalesId(sessionResult.session.SalesId);
      await fetchSalesOrders(sessionResult.session.SalesId);
    } catch (error) {
      console.error("Error fetching session or sales orders:", error);
      setError("Failed to fetch session or sales orders.");
    }
  };

  const fetchSalesOrders = async (salesId: number) => {
    try {
      const response = await axios.post("/api/admin/admin/salesorder/getbysales", {
        SalesId: salesId
      });
      const result = response.data;

      if (result?.data && Array.isArray(result.data)) {
        setSalesOrders(
          result.data.map((order: any) => ({
            Id: order.Id,
            SalesOrderNumber: order.SalesOrderNumber || '',
            JdeSalesOrderNumber: order.JDESalesOrderNumber || '',
            Dealer: {
              CompanyName: order.Dealer?.CompanyName || 'N/A',
              Region: order.Dealer?.Region || '-'
            },
            CreatedAt: new Date(order.CreatedAt).toLocaleDateString(),
            Status: order.Status,
            Note: order.Note,
            PaymentTerm: order.PaymentTerm,
            FOB: order.FOB,
            CustomerPoNumber: order.CustomerPoNumber,
            DeliveryOrderNumber: order.DeliveryOrderNumber,
            details: order.Details?.map((d: any) => ({
              Id: d.Id || 0,
              ItemCodeId: d.ItemCodeId,
              ItemCode: {
                Id: d.ItemCodeId,
                Name: d.ItemName || "Unknown",
                PartNumberId: d.PartNumberId ?? 0,
              },
              Quantity: d.Quantity,
              Price: d.Price,
              FinalPrice: d.FinalPrice,
              PriceCategoryId: d.PriceCategory,
              TaxId: d.TaxId ?? null,
              TaxPercentage: d.TaxPercentage ?? null,
              TaxName: d.TaxName ?? null,
            })) || [],
          }))
        );
      } else {
        setError("No sales orders found.");
      }
    } catch (err) {
      console.error("Failed to fetch sales orders:", err);
      setError("Failed to fetch sales orders.");
    }
  };


  const fetchItemCodes = async (itemCodeId: number, query: string, index: number) => {
    try {
      const response = await axios.post("/api/admin/admin/salesorder/detail/fetchrelateditemcodes", {
        ItemCodeId: itemCodeId > 0 ? itemCodeId : undefined,
        query
      });
      const result = response.data;
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
      // Pastikan axios sudah inject token dari utils/axios
      const res = await axios.get("/api/admin/admin/salesorder/tax/getactive");
      const result = res.data;
      if (result?.data?.Id) setActiveTax({ Id: result.data.Id, Percentage: result.data.Percentage });
    } catch (err) {
      console.error("Failed to fetch active tax:", err);
    }
  };





  const handleReview = (order: SalesOrder) => {
    setSelectedOrder(order);
    setUpdateDetails(order.details || []);
    setShowModal(true);
  };

  const handleDetailChange = (index: number, field: keyof SalesOrderDetail, value: number) => {
    setUpdateDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      const qty = field === "Quantity" ? value : updated[index].Quantity;
      const price = field === "Price" ? value : updated[index].Price;

      updated[index].FinalPrice = forceApplyTax && activeTax
        ? qty * price * (1 + activeTax.Percentage / 100)
        : qty * price;

      return updated;
    });
  };

  const handleAddItem = () => {
    setUpdateDetails((prevDetails) => [
      ...prevDetails,
      {
        Id: Date.now(), // Menggunakan timestamp sebagai ID sementara untuk client-side key
        ItemCodeId: 0,
        ItemCode: { Id: 0, Name: "Pilih Item Code", PartNumberId: 0 }, // Default ItemCode
        Quantity: 1,
        Price: 0,
        FinalPrice: 0,
      },
    ]);
    // Perluas juga state untuk dropdown dan options item baru
    setDropdownOpen((prev) => [...prev, false]); // Tutup dropdown by default untuk item baru
    setItemCodeOptions((prev) => [...prev, []]); // Array kosong untuk options item baru
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setUpdateDetails((prevDetails) =>
      prevDetails.filter((_, index) => index !== indexToRemove)
    );
    setDropdownOpen((prevOpen) =>
      prevOpen.filter((_, index) => index !== indexToRemove)
    );
    setItemCodeOptions((prevOptions) =>
      prevOptions.filter((_, index) => index !== indexToRemove)
    );
  };

  // Hitung total keseluruhan harga
  const totalOverallPrice = updateDetails.reduce(
    (sum, detail) => sum + detail.FinalPrice,
    0
  );


  const handleApprove = async () => {
    if (approveLoading) return;
    setApproveLoading(true);
    setApproveMessage("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/admin/admin/salesorder/approval/approve", {
        SalesOrderId: selectedOrder?.Id,
        SalesId: salesId,
        SalesOrderNumber: selectedOrder?.SalesOrderNumber,
        JdeSalesOrderNumber: selectedOrder?.JdeSalesOrderNumber,
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
          ItemCodeId: detail.ItemCodeId,
          PriceCategoryId: detail.PriceCategoryId ?? null,
        })),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSalesOrders(prev =>
        prev.map(order =>
          order.Id === selectedOrder?.Id ? { ...order, Status: "APPROVED_EMAIL_SENT" } : order
        )
      );
      setApproveMessage("✔️ Approval berhasil!");
    } catch (error) {
      setApproveMessage("❌ Approval gagal, coba lagi.");
      console.error("Approval failed:", error);
    } finally {
      setApproveLoading(false);
      setShowModal(false);
      setTimeout(() => setApproveMessage(""), 3000);
    }
  };



  const handleReject = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/admin/admin/salesorder/approval/reject", {
        SalesOrderId: selectedOrder?.Id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setSalesOrders(prev => prev.filter(order => order.Id !== selectedOrder?.Id));
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setShowModal(false);
    }
  };




  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedOrder || !salesId) return;
    try {
      await axios.post(`/api/admin/admin/salesorder/approval/${action}`, {
        SalesOrderId: selectedOrder.Id,
        SalesId: action === "approve" ? salesId : undefined,
      });
      setShowModal(false);
      fetchSalesOrders(salesId);
    } catch {
      setError(`Failed to ${action} the sales order.`);
    }
  };





  const handleUpdate = async () => {
    try {
      setLoading(true);

      const updatedData: any = {
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
          ItemCodeId: detail.ItemCodeId,
          PriceCategoryId: detail.PriceCategoryId ?? null,
        })),
      };
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/admin/admin/salesorder/approval/update",
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      setSalesOrders((prev) =>
        prev.map((order) =>
          order.Id === selectedOrder?.Id
            ? {
              ...order,
              ...updatedData,
              Status: "NEEDS_REVISION",
              details: updateDetails,
            }
            : order
        )
      );

      alert("Sales Order updated successfully!");

    } catch (error: any) {
      console.error("Update failed:", error);
      setError(error.message || "An unknown error occurred during update.");
      alert(`Update failed: ${error.message}`);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };



  const handleOrderChange = (field: keyof SalesOrder, value: string | number) => {
    setSelectedOrder((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  // Lengkapi fungsi fetchEmailRecipients
  const fetchEmailRecipients = async () => {
    try {
      const response = await axios.post("/api/admin/admin/salesorder/emailrecipient/getbysalesid", {
        SalesId: salesId
      });
      const result = response.data;
      if (result.data) {
        setEmailRecipients(result.data);
      }
    } catch (error) {
      console.error("Error fetching email recipients:", error);
      alert('Failed to fetch email recipients');
    }
  };


  // Fungsi untuk handle CRUD operations
  const handleCreateRecipient = async () => {
    if (!newEmail || !salesId) return;

    try {
      await axios.post("/api/admin/admin/salesorder/emailrecipient/create", {
        SalesId: salesId,
        RecipientEmail: newEmail
      });

      setNewEmail('');
      fetchEmailRecipients();
    } catch (error) {
      console.error("Create error:", error);
      alert('Failed to create recipient');
    }
  };


  const handleUpdateRecipient = async () => {
    if (!editingRecipient || !editEmail) return;

    try {
      await axios.put("/api/admin/admin/salesorder/emailrecipient/update", {
        RecipientId: editingRecipient.Id,
        RecipientEmail: editEmail
      });

      setEditingRecipient(null);
      setEditEmail('');
      fetchEmailRecipients();
    } catch (error) {
      console.error("Update error:", error);
      alert('Failed to update recipient');
    }
  };


  const handleDeleteRecipient = async (recipientId: number) => {
    if (!window.confirm('Are you sure you want to delete this recipient?')) return;

    try {
      await axios.delete("/api/admin/admin/salesorder/emailrecipient/delete", {
        data: { RecipientId: recipientId }
      });

      fetchEmailRecipients();
    } catch (error) {
      console.error("Delete error:", error);
      alert('Failed to delete recipient');
    }
  };


  // Fetch pajak aktif saat open modal
  const handleShowTaxModal = async () => {
    setTaxError('');
    setShowTaxModal(true);
    setTaxLoading(true);
    try {
      const res = await axios.get('/api/admin/admin/salesorder/tax/getactive');
      const result = res.data;
      if (result?.data) {
        setCurrentTax(result.data);
        setTaxName(result.data.Name || '');
        setTaxPercentage(result.data.Percentage?.toString() || '');
      } else {
        setCurrentTax(null);
        setTaxName('');
        setTaxPercentage('');
      }
    } catch (err) {
      setTaxError('Gagal fetch pajak aktif');
      setCurrentTax(null);
    } finally {
      setTaxLoading(false);
    }
  };

  // Handle upsert pajak
  const handleUpsertTax = async () => {
    setTaxError('');
    // Validasi Frontend
    if (!taxName.trim() || taxName.length > 40) {
      setTaxError('Nama pajak wajib diisi & maksimal 40 karakter');
      return;
    }
    const percent = parseFloat(taxPercentage);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      setTaxError('Persentase harus 0-100');
      return;
    }
    setTaxLoading(true);
    try {
      const res = await axios.post('/api/admin/admin/salesorder/tax/upsert', {
        Name: taxName, Percentage: percent
      });
      const result = res.data;
      if (!res.status || res.status !== 200) throw new Error(result.message || 'Gagal menyimpan pajak');
      setShowTaxModal(false);
      setCurrentTax(result.data);
      alert('Pajak aktif berhasil diubah!');
      fetchActiveTax?.();
    } catch (err: any) {
      setTaxError(err.message || 'Gagal simpan pajak');
    } finally {
      setTaxLoading(false);
    }
  };

  const filteredOrders = salesOrders
    .filter(order => order.Status !== "APPROVED_EMAIL_SENT") // ⛔ Saring langsung yang sudah approve
    .filter((order) => {

      const matchesDealer = order.Dealer.CompanyName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? order.Status === statusFilter : true;

      const createdAt = new Date(order.CreatedAt).getTime();
      const fromDate = dateRange.from ? new Date(dateRange.from).getTime() : null;
      const toDate = dateRange.to ? new Date(dateRange.to).getTime() : null;

      const matchesDate =
        (!fromDate || createdAt >= fromDate) &&
        (!toDate || createdAt <= toDate + 86400000); // +1 hari agar inclusive

      return matchesDealer && matchesStatus && matchesDate;
    });
  console.log('All salesOrders:', salesOrders);
  console.log('Filtered orders:', filteredOrders);

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const nameA = a.Dealer.CompanyName.toLowerCase();
    const nameB = b.Dealer.CompanyName.toLowerCase();
    return sortDealerAsc
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  {
    approveMessage && (
      <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-[9999] text-center">
        {approveMessage}
      </div>
    )
  }

  const canListRecipient = menuAccess && hasFeatureAccess(menuAccess, "listemailrecipient");
  const canCrudRecipient = menuAccess && hasFeatureAccess(menuAccess, "createupdatedeleteemailrecipient");
  const canTaxConfig = menuAccess && hasFeatureAccess(menuAccess, "taxconfig");
  const canReview = menuAccess && hasFeatureAccess(menuAccess, "reviewsalesorder");

  if (loadingAccess) return <div>Loading Access...</div>;
  if (!menuAccess) return null; // Sudah redirect

  return (
    <div className="p-5 ml-60 max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-2xl font-bold mb-5">Approval Sales Orders</h2>
      {canListRecipient && (
        <button
          className="bg-indigo-500 px-4 py-2 rounded text-white mr-2"
          onClick={() => setShowEmailModal(true)}
        >
          Manage Email Recipients
        </button>
      )}
      {canTaxConfig && (
        <button
          className="bg-pink-600 px-4 py-2 rounded text-white mb-3"
          onClick={handleShowTaxModal}
        >
          Tax Config
        </button>
      )}


      <div className="flex gap-4 mb-4">
        {/* Search Dealer */}
        <input
          type="text"
          placeholder="Search by Dealer Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded w-1/3"
        />

        {/* Filter Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="">All Status</option>
          <option value="PENDING_APPROVAL">Pending</option>
          <option value="NEEDS_REVISION">Needs Revision</option>
          <option value="APPROVED_EMAIL_SENT">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Filter Tanggal */}
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
          className="border px-4 py-2 rounded"
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
          className="border px-4 py-2 rounded"
        />
      </div>
      <button
        className="bg-purple-500 px-4 py-2 rounded text-white mb-4"
        onClick={() => setSortDealerAsc(prev => !prev)}
      >
        Sort Dealer Name {sortDealerAsc ? "↑" : "↓"}
      </button>


      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead>
          <tr className="bg-gray-100">

            <th className="border border-gray-300 px-4 py-2">Dealer Name</th>
            <th className="border border-gray-300 px-4 py-2">Region</th>
            <th className="border border-gray-300 px-4 py-2">Transaction Date</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => (

            <tr key={order.Id}>
              <td className="border border-gray-300 px-4 py-2">{order.Dealer.CompanyName}</td>
              <td className="border border-gray-300 px-4 py-2">{order.Dealer.Region}</td>
              <td className="border border-gray-300 px-4 py-2">{order.CreatedAt}</td>
              <td className="border border-gray-300 px-4 py-2">{order.Status}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="bg-blue-500 px-3 py-1 rounded text-white"
                  onClick={() => handleReview(order)}
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]"> {/* Tambah z-index lebih tinggi jika perlu */}
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[75vw] xl:max-w-[70vw] max-h-[90vh] overflow-y-auto"> {/* Sedikit perlebar max-w agar lebih nyaman */}
            <h3 className="text-xl font-bold mb-4">Review Order: {selectedOrder.SalesOrderNumber}</h3>

            {/* Bagian Info Order (SalesOrderNumber, CustomerPoNumber, dll.) tetap sama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Editable Fields */}
              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sales Order Number</label>
                <input
                  type="text"
                  value={selectedOrder.SalesOrderNumber}
                  onChange={(e) => handleOrderChange('SalesOrderNumber', e.target.value)}
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
                  onChange={(e) => handleOrderChange('CustomerPoNumber', e.target.value)}
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Customer PO Number"
                />
              </div>
              {/* Read-only Fields */}
              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Dealer Name</label>
                <input
                  type="text"
                  value={selectedOrder.Dealer.CompanyName}
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 shadow-sm"
                />
              </div>

              <div className="col-span-1 md:col-span-2"> {/* Dibuat span 2 agar lebih rapi */}
                <label className="text-sm font-medium text-gray-700 mb-1 block">Transaction Date</label>
                <input
                  type="text"
                  value={selectedOrder.CreatedAt}
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 shadow-sm"
                />
              </div>

              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Region</label>
                <input
                  type="text"
                  value={selectedOrder.Dealer.Region} // Menggunakan selectedOrder.Dealer.Region jika ada
                  readOnly
                  className="w-full px-4 py-2 border rounded bg-gray-100 shadow-sm"
                />
              </div>
              <div className="md:col-span-1 flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">JDE Sales Order Number</label>
                <input
                  type="text"
                  value={selectedOrder.JdeSalesOrderNumber || ""}
                  onChange={e => handleOrderChange('JdeSalesOrderNumber', e.target.value)}
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="JDE Sales Order Number"
                />
              </div>

              <div className="md:col-span-1 flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery OrderNumber</label>
                <input
                  type="text"
                  value={selectedOrder.DeliveryOrderNumber || ""}
                  onChange={e => handleOrderChange('DeliveryOrderNumber', e.target.value)}
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Delivery Order Number"
                />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">FOB</label>
                <input
                  type="text"
                  value={selectedOrder.FOB || ""}
                  onChange={e => handleOrderChange('FOB', e.target.value)}
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="FOB"
                />
              </div>

              <div className="col-span-1 md:col-span-3"> {/* Note dibuat full width */}
                <label className="text-sm font-medium text-gray-700 mb-1 block">Note</label>
                <input
                  type="text"
                  value={selectedOrder.Note || ''}
                  onChange={(e) => handleOrderChange('Note', e.target.value)}
                  className="w-full px-4 py-2 border rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Note"
                />
              </div>
              <div className="col-span-1 md:col-span-3 flex flex-col md:flex-row md:items-center gap-6">
                {/* Checkbox Pajak */}
                <label className="inline-flex items-center flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={forceApplyTax}
                    onChange={(e) => setForceApplyTax(e.target.checked)}
                    className="form-checkbox h-5 w-5 text-indigo-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active Tax {activeTax && `(${activeTax.Percentage}%)`}
                  </span>
                </label>
                {/* Garis pembatas || */}
                <span className="mx-2 text-gray-400 font-bold text-xl hidden md:inline">||</span>
                {/* Payment Term */}
                <div className="flex items-center mt-3 md:mt-0">
                  <label className="text-sm font-medium text-gray-700 mr-2 min-w-[100px]">Payment Term</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={selectedOrder.PaymentTerm || ""}
                    onChange={(e) => handleOrderChange("PaymentTerm", parseInt(e.target.value) || 0)}
                    className="border rounded px-3 py-2 w-32"
                    placeholder="Hari"
                  />
                  <span className="ml-2 text-sm text-gray-600">hari</span>
                </div>
              </div>
            </div>


            {/* Form Update Items */}
            <div className="space-y-6">
              <div className="mt-6">
                <h4 className="font-bold text-lg mb-2">Item Details</h4>
                <div className="overflow-x-auto">
                  {/* Tambahkan table-fixed dan tentukan lebar kolom pada th jika perlu */}
                  <table className="min-w-full border border-gray-300 table-fixed">
                    <colgroup>
                      <col style={{ width: '35%' }} /> {/* Item Code */}
                      <col style={{ width: '15%' }} /> {/* Quantity */}
                      <col style={{ width: '20%' }} /> {/* Price */}
                      <col style={{ width: '20%' }} /> {/* Final Price */}
                      <col style={{ width: '10%' }} /> {/* Action */}
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
                        // Gunakan index sebagai key jika Id tidak unik atau belum ada saat item baru ditambahkan
                        <tr key={detail.Id || `new-${index}`}>
                          <td className="border px-2 py-1 align-top"> {/* align-top agar dropdown tidak mendorong konten lain ke bawah */}
                            <div className="relative">
                              <button
                                className="w-full text-left border px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 truncate" // truncate agar teks panjang tidak merusak layout
                                onClick={() => {
                                  const toggles = [...dropdownOpen];
                                  toggles[index] = !toggles[index];
                                  setDropdownOpen(toggles);
                                  if (toggles[index] && (!itemCodeOptions[index] || itemCodeOptions[index].length === 0)) { // Hanya fetch jika dropdown dibuka & options kosong
                                    fetchItemCodes(detail.ItemCodeId, "", index);
                                  }
                                }}
                              >
                                {detail.ItemCode?.Name || "Pilih Item Code"}
                              </button>
                              {dropdownOpen[index] && (
                                <div className="absolute bg-white border mt-1 rounded shadow-lg z-[60] w-full max-h-60 overflow-y-auto"> {/* max-h dan overflow-y */}
                                  <input
                                    type="text"
                                    className="w-full p-2 border-b sticky top-0 bg-white z-10" // sticky search bar
                                    placeholder="Cari Item Code..."
                                    onClick={(e) => e.stopPropagation()} // Mencegah dropdown tertutup saat klik input
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      fetchItemCodes(0, e.target.value, index); // itemcodeId 0 untuk search by query
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
                                          updated[index].ItemCode = {
                                            Id: item.Id,
                                            Name: item.Name,
                                            PartNumberId: item.PartNumberId ?? 0,
                                          };
                                          // Opsional: reset harga atau ambil harga default item baru
                                          // updated[index].Price = item.DefaultPrice || 0; 
                                          // hitung ulang FinalPrice
                                          const qty = updated[index].Quantity;
                                          const price = updated[index].Price; // atau item.DefaultPrice
                                          updated[index].FinalPrice = forceApplyTax && activeTax
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
                              onChange={(e) =>
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
                              onChange={(e) =>
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
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 font-bold text-2xl leading-none w-10 h-10 flex items-center justify-center mx-auto"
                              title="Remove Item"
                            >
                              &times;
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                    {/* Total Keseluruhan */}
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="text-right font-bold px-3 py-2 border">Total Keseluruhan:</td>
                        <td className="border px-3 py-2 bg-gray-100 font-bold text-gray-800">
                          Rp {totalOverallPrice.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="border"></td> {/* Kolom kosong untuk Action */}
                      </tr>
                    </tfoot>
                  </table>
                  <button
                    onClick={handleAddItem}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150"
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Tombol Action (Approve, Update, Reject, Close) */}
            <div className="mt-8 flex flex-wrap justify-end gap-3"> {/* flex-wrap dan gap untuk spacing tombol */}
              {canReview && (
                <><button
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white disabled:opacity-60 transition duration-150"
                  onClick={handleApprove}
                  disabled={approveLoading || loading}
                >
                  {approveLoading ? "Processing..." : "Approve"}
                </button><button
                  className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded text-white disabled:opacity-60 transition duration-150"
                  onClick={handleUpdate}
                  disabled={loading || approveLoading}
                >
                    {loading ? "Updating..." : "Update & Revise"}
                  </button><button
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white disabled:opacity-60 transition duration-150"
                    onClick={handleReject} // Anda mungkin ingin membuat fungsi handleReject yang lebih spesifik atau menggunakan handleAction("reject")
                    disabled={loading || approveLoading}
                  >
                    Reject
                  </button></>
              )}
              <button
                className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white transition duration-150"
                onClick={() => setShowModal(false)}
                disabled={loading || approveLoading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/5 max-h-screen overflow-auto">
            <h3 className="text-lg font-bold mb-4">Manage Email Recipients</h3>

            {/* Add New Email Form */}
            <div className="mb-4 flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                maxLength={255}
                className="border px-4 py-2 rounded flex-grow"
              />
              {canCrudRecipient && (
                <button
                  onClick={handleCreateRecipient}
                  className="bg-blue-500 px-4 py-2 rounded text-white"
                >
                  Add
                </button>
              )}
            </div>

            {/* Email List */}
            <div className="space-y-2">
              {emailRecipients.map((recipient) => (
                <div key={recipient.Id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  {editingRecipient?.Id === recipient.Id ? (
                    <>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="border px-2 py-1 rounded flex-grow mr-2"
                      />
                      {canCrudRecipient && (
                        <button
                          onClick={handleUpdateRecipient}
                          className="bg-green-500 px-2 py-1 rounded text-white"
                        >
                          Save
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="flex-grow">{recipient.RecipientEmail}</span>
                      <div className="space-x-2">
                        {canCrudRecipient && (
                          <button
                            onClick={() => {
                              setEditingRecipient(recipient);
                              setEditEmail(recipient.RecipientEmail);
                            }}
                            className="bg-yellow-500 px-2 py-1 rounded text-white"
                          >
                            Edit
                          </button>
                        )}
                        {canCrudRecipient && (
                          <button
                            onClick={() => handleDeleteRecipient(recipient.Id)}
                            className="bg-red-500 px-2 py-1 rounded text-white"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-500 px-4 py-2 rounded text-white"
                onClick={() => {
                  setShowEmailModal(false);
                  setEditingRecipient(null);
                  setEditEmail('');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showTaxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full relative">
            <h2 className="text-lg font-bold mb-2">Atur Pajak Aktif</h2>
            {taxLoading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : (
              <>
                {currentTax && (
                  <div className="mb-3 text-sm text-gray-700">
                    <div className="font-semibold mb-1">Pajak Aktif Saat Ini:</div>
                    <div>Nama: <span className="font-bold">{currentTax.Name}</span></div>
                    <div>Persentase: <span className="font-bold">{currentTax.Percentage}%</span></div>
                  </div>
                )}
                <label className="block text-sm font-medium mb-1 mt-3">Nama Pajak</label>
                <input
                  type="text"
                  value={taxName}
                  maxLength={40}
                  onChange={e => setTaxName(e.target.value)}
                  className="border px-3 py-2 rounded w-full mb-2"
                  placeholder="Contoh: PPN"
                  autoFocus
                />
                <label className="block text-sm font-medium mb-1">Persentase (%)</label>
                <input
                  type="number"
                  value={taxPercentage}
                  min={0}
                  max={100}
                  step={0.01}
                  onChange={e => setTaxPercentage(e.target.value)}
                  className="border px-3 py-2 rounded w-full mb-2"
                  placeholder="0-100"
                />
                {taxError && (
                  <div className="text-red-600 mb-2">{taxError}</div>
                )}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                    onClick={() => setShowTaxModal(false)}
                    disabled={taxLoading}
                  >
                    Batal
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    onClick={handleUpsertTax}
                    disabled={taxLoading}
                  >
                    Simpan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING_APPROVAL":
      return "text-orange-500";
    case "NEEDS_REVISION":
      return "text-red-500";
    case "APPROVED_EMAIL_SENT":
      return "text-green-500";
    default:
      return "text-black";
  }
};

export default ApprovalSalesOrder;
