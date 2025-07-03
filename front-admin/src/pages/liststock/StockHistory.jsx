import React, { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { format } from "date-fns";

// --- KOMPONEN BARU: FilterPopup ---
// Komponen ini berisi semua input filter di dalam sebuah modal.
const FilterPopup = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  options,
  onApplyFilter,
  onResetFilter,
}) => {
  if (!isOpen) return null;


  // Handler untuk setiap perubahan input di form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      if (name === "type" && value !== "excel") {
        // Reset note jika bukan Excel
        return { ...prev, [name]: value, note: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilter();
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800">Filter Riwayat Stok</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Grid untuk layout filter yang lebih rapi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* --- Semua input filter dipindahkan ke sini --- */}
            <div>
              <label className="block font-semibold mb-1 text-sm">Admin</label>
              <select name="adminId" className="border px-3 py-2 rounded w-full" value={filters.adminId} onChange={handleInputChange}>
                <option value="">Semua</option>
                {options.adminOptions.map(a => <option key={a.Id} value={a.Id}>{a.Name || a.Username}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Item Code</label>
              <select name="itemCodeId" className="border px-3 py-2 rounded w-full" value={filters.itemCodeId} onChange={handleInputChange}>
                <option value="">Semua</option>
                {options.itemCodeOptions.map(ic => <option key={ic.Id} value={ic.Id}>{ic.Name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Produk</label>
              <select name="productId" className="border px-3 py-2 rounded w-full" value={filters.productId} onChange={handleInputChange}>
                <option value="">Semua</option>
                {options.productOptions.map(p => <option key={p.Id} value={p.Id}>{p.Name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Kategori Produk</label>
              <select name="productCategoryId" className="border px-3 py-2 rounded w-full" value={filters.productCategoryId} onChange={handleInputChange}>
                <option value="">Semua</option>
                {options.categoryOptions.map(c => <option key={c.Id} value={c.Id}>{c.Name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Tipe Perubahan</label>
              <select
                name="type"
                className="border px-3 py-2 rounded w-full"
                value={filters.type}
                onChange={handleInputChange}
              >
                <option value="">Semua</option>
                <option value="manual">Manual</option>
                <option value="excel">Excel Upload</option>
              </select>
            </div>

            {filters.type === "excel" && (
  <div>
    <label className="block font-semibold mb-1 text-sm">Jenis Catatan (Note)</label>
    <select
      name="note"
      className="border px-3 py-2 rounded w-full"
      value={filters.note}
      onChange={handleInputChange}
    >
      <option value="">Semua</option>
      {options.noteOptions?.map(n => (
        <option key={n.value} value={n.value}>{n.label}</option>
      ))}
    </select>
  </div>
)}
            <div>
              <label className="block font-semibold mb-1 text-sm">Jenis Perubahan</label>
              <select name="changeTarget" className="border px-3 py-2 rounded w-full" value={filters.changeTarget} onChange={handleInputChange}>
                <option value="">Semua</option>
                <option value="qtyonhand">Qty On Hand</option>
                <option value="qtypo">Qty PO</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Tanggal Mulai</label>
              <input name="startDate" type="date" className="border px-3 py-2 rounded w-full" value={filters.startDate} onChange={handleInputChange} />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Tanggal Akhir</label>
              <input name="endDate" type="date" className="border px-3 py-2 rounded w-full" value={filters.endDate} onChange={handleInputChange} />
            </div>

            <div className="lg:col-span-3">
              <label className="block font-semibold mb-1 text-sm">Pencarian</label>
              <input
                name="q"
                type="text"
                placeholder="Cari kode/item/admin..."
                className="border px-3 py-2 rounded w-full"
                value={filters.q}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Tombol Aksi di dalam Popup */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onResetFilter}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold"
            >Reset</button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-semibold"
            >Terapkan Filter</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Helper: format tanggal
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return format(date, "yyyy-MM-dd HH:mm");
};

const TYPE_LABEL = {
  manual: "Manual",
  excel: "Excel Upload",
  unknown: "Unknown"
};

const StockHistory = () => {
  // State data
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  // --- PERUBAHAN 1: State Filter digabung jadi satu ---
  const initialFilterState = {
    adminId: "",
    itemCodeId: "",
    productId: "",
    productCategoryId: "",
    q: "",
    type: "",
    startDate: "",
    endDate: "",
    changeTarget: "",
  };
  const [filters, setFilters] = useState(initialFilterState);

  // State untuk kontrol popup
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);

  // Dropdown options
  const [adminOptions, setAdminOptions] = useState([]);
  const [itemCodeOptions, setItemCodeOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [noteOptions, setNoteOptions] = useState([]);
  // Fetch dropdown options **ONCE** saat mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get("/api/admin/admin/products/stock/history/options");
        setAdminOptions(res.data.adminOptions || []);
        setItemCodeOptions(res.data.itemCodeOptions || []);
        setProductOptions(res.data.productOptions || []);
        setCategoryOptions(res.data.categoryOptions || []);
        setNoteOptions(res.data.noteOptions || []);
      } catch (error) {
        // Handle error
      }
    };
    fetchOptions();
  }, []);

  // Fetch data histori
  const fetchData = async (newFilters = filters, newPage = page) => {
    setLoading(true);
    // Membersihkan filter dari properti yang nilainya kosong
    const activeFilters = Object.entries(newFilters).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});

    try {
      const response = await axios.get("/api/admin/admin/products/stock/history", {
        params: {
          page: newPage,
          perPage,
          ...activeFilters // Kirim filter yang aktif saja
        }
      });
      setData(response.data.data || []);
      setTotalData(response.data.totalData || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setData([]);
      setTotalData(0);
      setTotalPages(1);
      alert("Gagal memuat data stok history!");
    } finally {
      setLoading(false);
    }
  };

  const getChangeTarget = (note = "") => {
    note = note?.toLowerCase() || "";
    if (note.includes("qtypo")) return "qtypo";
    if (note.includes("created from excel upload") || note.includes("updated from excel upload") || note.includes("stock nulled")) return "qtyonhand";
    return "qtyonhand";
  };

  // Fetch data saat komponen pertama kali mount
  useEffect(() => {
    fetchData(filters, 1);
    // eslint-disable-next-line
  }, []);


  // Handler saat filter diterapkan dari popup
  const handleApplyFilter = () => {
    setPage(1); // Selalu reset ke halaman 1 saat filter baru diterapkan
    fetchData(filters, 1);
    setFilterPopupOpen(false); // Tutup popup setelah filter diterapkan
  };

  // Handler untuk mereset filter
  const handleResetFilter = () => {
    setFilters(initialFilterState);
    setPage(1);
    fetchData(initialFilterState, 1); // Langsung fetch data dengan filter kosong
    setFilterPopupOpen(false); // Tutup popup
  };

  // Handler untuk paginasi
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchData(filters, newPage);
  }

  // Handler untuk per page
  const handlePerPageChange = (e) => {
    const newPerPage = Number(e.target.value);
    setPerPage(newPerPage);
    setPage(1);
    fetchData(filters, 1);
  }


  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Riwayat Perubahan Stok</h1>
        {/* --- PERUBAHAN 2: Tombol filter utama --- */}
        <button
          onClick={() => setFilterPopupOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
        >
          {/* Optional: Tambahkan icon filter */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filter & Cari
        </button>
      </div>

      {/* --- PERUBAHAN 3: Render komponen popup --- */}
      <FilterPopup
        isOpen={isFilterPopupOpen}
        onClose={() => setFilterPopupOpen(false)}
        filters={filters}
        setFilters={setFilters}
        options={{ adminOptions, itemCodeOptions, productOptions, categoryOptions,noteOptions, }}
        onApplyFilter={handleApplyFilter}
        onResetFilter={handleResetFilter}
      />

      {/* Table (Tidak ada perubahan di sini) */}
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow border">
        <table className="w-full text-sm table-auto">
          <thead className="bg-blue-100">
            <tr>
              {/* Atur lebar setiap kolom */}
              <th className="px-3 py-2 text-left w-[12%]">Tanggal</th>
              <th className="px-3 py-2 text-left w-[10%]">Admin</th>
              <th className="px-3 py-2 text-left w-[10%]">Item Code</th>
              <th className="px-3 py-2 text-left w-[10%]">Part Number</th>
              <th className="px-3 py-2 text-left w-[13%]">Produk</th>
              <th className="px-3 py-2 text-left w-[10%]">Kategori</th>
              <th className="px-3 py-2 text-left w-[10%]">Warehouse</th>
              <th className="px-3 py-2 text-right w-[7%]">Qty Sebelum</th>
              <th className="px-3 py-2 text-right w-[7%]">Qty Sesudah</th>
              <th className="px-3 py-2 text-center w-[7%]">Tipe</th>
              <th className="px-3 py-2 text-left">Catatan</th> {/* Kolom ini akan mengambil sisa ruang */}
            </tr>
          </thead>
          <tbody>
            {!loading && data.length === 0 && (
              <tr><td className="py-6 text-center text-gray-400" colSpan={11}>Tidak ada data histori stok</td></tr>
            )}
            {data
              .filter(row => {
                if (!filters.changeTarget) return true;
                return getChangeTarget(row.Note) === filters.changeTarget;
              })
              .map(row => (
                <tr key={row.Id} className="hover:bg-blue-50">
                  <td className="px-3 py-2">{formatDate(row.UpdatedAt)}</td>
                  <td className="px-3 py-2">{row.Admin?.Name || row.Admin?.Username || "-"}</td>
                  <td className="px-3 py-2">{row.ItemCode?.Name || "-"}</td>
                  <td className="px-3 py-2">{row.PartNumber?.Name || "-"}</td>
                  <td className="px-3 py-2">{row.Product?.Name || "-"}</td>
                  <td className="px-3 py-2">
                    {Array.isArray(row.ProductCategory) && row.ProductCategory.length > 0
                      ? row.ProductCategory.map(cat => cat.Name).join(", ")
                      : "-"}
                  </td>
                  <td className="px-3 py-2">{row.Warehouse?.BusinessUnit || row.Warehouse?.Name || "-"}</td>
                  <td className="px-3 py-2 text-right">{row.QtyBefore ?? "-"}</td>
                  <td className="px-3 py-2 text-right font-bold">{row.QtyAfter ?? "-"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold
                        ${row.ChangeType === "manual" ? "bg-yellow-100 text-yellow-800"
                        : row.ChangeType === "excel" ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"}`
                    }>
                      {TYPE_LABEL[row.ChangeType] || row.ChangeType}
                    </span>
                  </td>
                  <td className="px-3 py-2">{row.Note}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <div className="p-6 text-center text-blue-500 font-semibold animate-pulse">Loading...</div>}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-5">
        <span className="text-sm text-gray-600">
          Total: {totalData} data &mdash; Halaman {page} / {totalPages}
        </span>
        <div className="flex gap-2 items-center">
          <button className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Prev</button>
          <span className="font-semibold">{page}</span>
          <button className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200" disabled={page === totalPages || totalPages === 0} onClick={() => handlePageChange(page + 1)}>Next</button>
          <select value={perPage} className="border rounded p-1 ml-3" onChange={handlePerPageChange}>
            {[10, 20, 40, 80].map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default StockHistory;