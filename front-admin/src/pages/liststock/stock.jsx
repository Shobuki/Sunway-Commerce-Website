import React, { useState, useEffect } from "react";
import axios from "@/utils/axios";
import EditStock from './EditStock';
import WarehouseItemCode from './WarehouseItemCode';
import { FiUploadCloud, FiX, FiFileText, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import WarehouseModal from './Warehouse';

function hasFeatureAccess(menuAccess, feature) {
    return (
        menuAccess?.Features?.some(
            (f) => f.Feature === feature && f.Access === "WRITE"
        ) ?? false
    );
}

const Stock = () => {
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedPartNumber, setSelectedPartNumber] = useState("");
    const [sortBy, setSortBy] = useState("product");
    const [selectedItem, setSelectedItem] = useState(null);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    const [showWarehouseModal, setShowWarehouseModal] = useState(false);

    const [loadingAccess, setLoadingAccess] = useState(true);
    const [menuAccess, setMenuAccess] = useState(null);

    const [warehouseItemCodeOpen, setWarehouseItemCodeOpen] = useState(false);
    const [selectedItemCode, setSelectedItemCode] = useState(null);
    const [shouldRefreshStock, setShouldRefreshStock] = useState(false);

    useEffect(() => {
        axios.get("/api/admin/admin/access/my-menu")
            .then((res) => {
                const access = (res.data || []).find(
                    (m) => m.Name?.toLowerCase() === "stock"
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

    const fetchStockData = async () => {
        try {
            const params = {};
            if (sortBy) params.sortBy = sortBy; // ✅ Kirim hanya jika ada nilai

            const response = await axios.post("/api/admin/admin/products/stock", { params });

            if (response.status === 200) {
                setStockData(response.data.data);
            } else {
                console.error("Unexpected API response:", response);
            }
        } catch (error) {
            console.error("Error fetching stock data:", error.response ? error.response.data : error);
        } finally {
            setLoading(false);
        }
    };




    // ✅ Fetch Data dari API
    useEffect(() => {
        fetchStockData();
    }, [sortBy]); // ✅ Fetch ulang saat sortBy berubah

    // ✅ Dapatkan semua item code yang unik dari data stock
    const allItemCodes = [
        ...new Set(
            stockData.flatMap((product) =>
                product.PartNumber.flatMap((part) =>
                    part.ItemCode.map((item) => item.Name)
                )
            )
        ),
    ];

    const filteredProductsByCategory = selectedCategory
        ? stockData.filter((p) =>
            p.ProductCategory.some((cat) => cat.Name === selectedCategory)
        )
        : stockData;


    const filteredProducts = filteredProductsByCategory
        .filter((product) => {
            if (selectedProduct && product.Name !== selectedProduct) return false;
            return true;
        })
        .map((product) => {
            let filteredPartNumbers = product.PartNumber;

            // Filter part number jika dipilih
            if (selectedPartNumber) {
                filteredPartNumbers = filteredPartNumbers.filter(part => part.Name === selectedPartNumber);
            }

            // Filter searchTerm
            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase();

                if (sortBy === "partnumber") {
                    filteredPartNumbers = filteredPartNumbers.filter(part =>
                        part.Name.toLowerCase().includes(lowerSearch)
                    );
                }

                if (sortBy === "itemcode") {
                    filteredPartNumbers = filteredPartNumbers
                        .map((part) => ({
                            ...part,
                            ItemCode: part.ItemCode.filter((item) =>
                                item.Name.toLowerCase().includes(lowerSearch)
                            ),
                        }))
                        .filter((part) => part.ItemCode.length > 0);
                }
            }

            if (filteredPartNumbers.length === 0) return null;

            return {
                ...product,
                PartNumber: filteredPartNumbers,
            };
        })
        .filter(Boolean);





    // ✅ Ambil daftar kategori unik dari produk
    const categories = [
        ...new Set(
            stockData.flatMap((product) =>
                product.ProductCategory.map((cat) => cat.Name)
            )
        ),
    ];


    // ✅ Ambil daftar Part Number berdasarkan produk yang dipilih
    const filteredPartNumbersByProduct = selectedProduct
        ? filteredProductsByCategory.find((p) => p.Name === selectedProduct)?.PartNumber || []
        : [];

    // Komponen Modal Upload
    const UploadStockModal = ({ onClose }) => {
        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    setSelectedFile(file);
                    setUploadError(null);
                } else {
                    setUploadError('Hanya file Excel (.xlsx) yang diperbolehkan');
                }
            }
        };

        const handleUpload = async () => {
            if (!selectedFile) return;

            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await axios.post(
                    '/api/admin/admin/products/stock/excel',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(percentCompleted);
                        }
                    }
                );

                if (response.data.success) {
                    setUploadResult(response.data);
                    fetchStockData(); // Refresh data setelah upload
                }
            } catch (error) {
                setUploadError(error.response?.data?.message || 'Gagal mengupload file');
            } finally {
                setUploadProgress(0);
            }
        };

        if (loadingAccess) return <div>Loading Access...</div>;
        if (!menuAccess) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto z-50 sm:my-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold flex items-center">
                            <FiUploadCloud className="mr-2" /> Update Stock via Excel
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* File Upload Section */}
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Template Excel</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            {selectedFile ? (
                                <div className="flex items-center justify-center text-green-600">
                                    <FiFileText className="mr-2" />
                                    {selectedFile.name}
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 text-gray-500">
                                        <FiUploadCloud className="text-3xl mx-auto" />
                                        <p>Drag & drop file Excel atau</p>
                                    </div>
                                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                        Pilih File
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept=".xlsx"
                                        />
                                    </label>
                                </>
                            )}
                        </div>
                        {uploadError && (
                            <div className="mt-2 text-red-600 text-sm flex items-center">
                                <FiAlertCircle className="mr-1" /> {uploadError}
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {uploadProgress > 0 && (
                        <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <div className="text-right text-sm text-gray-600 mt-1">
                                {uploadProgress}% Terupload
                            </div>
                        </div>
                    )}

                    {/* Upload Results */}

                    {uploadResult && (
                        <div className="mb-6">
                            <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                <div className="flex items-center mb-2">
                                    {uploadResult.success ? (
                                        <FiCheckCircle className="text-green-600 mr-2" />
                                    ) : (
                                        <FiAlertCircle className="text-yellow-600 mr-2" />
                                    )}
                                    <h4 className="font-semibold">
                                        {uploadResult.success ? 'Upload Berhasil!' : 'Ada Beberapa Masalah'}
                                    </h4>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                                    <div>
                                        <label>Total Diproses:</label>
                                        <p className="font-medium">{uploadResult.stats.totalProcessed}</p>
                                    </div>
                                    <div>
                                        <label>Berhasil:</label>
                                        <p className="text-green-600 font-medium">{uploadResult.stats.updated}</p>
                                    </div>
                                    <div>
                                        <label>Gagal:</label>
                                        <p className="text-red-600 font-medium">{uploadResult.stats.failed}</p>
                                    </div>
                                </div>

                                {/* Log Berhasil */}
                                {uploadResult.details.updatedItems.length > 0 && (
                                    <div className="mt-4">
                                        <div className="mb-2 font-medium text-green-600">Item yang Berhasil Diupdate:</div>
                                        <div className="max-h-40 overflow-y-auto border border-green-100 rounded-lg p-2">
                                            {uploadResult.details.updatedItems.map((item, index) => (
                                                <div key={index} className="mb-2 p-2 bg-green-50 rounded">
                                                    <div className="flex items-center text-sm">
                                                        <FiCheckCircle className="mr-2 text-green-600 flex-shrink-0" />
                                                        <div>
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="text-xs text-gray-600">
                                                                Sebelum: {item.beforeQty} → Sesudah: {item.afterQty}
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Log QtyPO Berhasil */}
                                {uploadResult.details.updatedPOs && uploadResult.details.updatedPOs.length > 0 && (
                                    <div className="mt-4">
                                        <div className="mb-2 font-medium text-blue-600">QtyPO yang Diperbarui:</div>
                                        <div className="max-h-40 overflow-y-auto border border-blue-100 rounded-lg p-2">
                                            {uploadResult.details.updatedPOs.map((po, index) => (
                                                <div key={index} className="mb-2 p-2 bg-blue-50 rounded">
                                                    <div className="text-sm text-gray-800">
                                                        <div className="font-medium">{po.itemCode} - {po.businessUnit}</div>
                                                        <div className="text-xs text-gray-600">
                                                            QtyPO Sebelum: {po.beforeQtyPO} → Sesudah: {po.afterQtyPO}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}


                                {/* Log Gagal */}
                                {uploadResult.details.failedMatches.length > 0 && (
                                    <div className="mt-4">
                                        <div className="mb-2 font-medium text-red-600">Item yang Gagal Diupdate:</div>
                                        <div className="max-h-40 overflow-y-auto border border-red-100 rounded-lg p-2">
                                            {uploadResult.details.failedMatches.map((error, index) => (
                                                <div key={index} className="mb-2 p-2 bg-red-50 rounded">
                                                    <div className="flex items-center text-sm">
                                                        <FiAlertCircle className="mr-2 text-red-600 flex-shrink-0" />
                                                        <div>
                                                            <div className="font-medium">{error.excelName}</div>
                                                            <div className="text-xs text-gray-600">{error.reason}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadProgress > 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploadProgress > 0 ? 'Mengupload...' : 'Mulai Upload'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Ambil semua warehouse dari seluruh itemcode di seluruh partnumber
    const allWarehousesFromStocks = React.useMemo(() => {
        const map = new Map();
        stockData.forEach(product =>
            product.PartNumber.forEach(part =>
                part.ItemCode.forEach(item =>
                    (item.WarehouseStocks || []).forEach(ws => {
                        const wh = ws.Warehouse;
                        if (wh && !map.has(wh.Id)) map.set(wh.Id, wh);
                    })
                )
            )
        );
        return Array.from(map.values());
    }, [stockData]);

    const handleAddWarehouse = async (warehouseId, itemCodeId) => {
        try {
            await axios.post("/api/admin/admin/products/warehouses/itemcode/add", {
                WarehouseId: warehouseId,
                ItemCodeId: itemCodeId
            });
            await fetchStockData(); // Refresh stock setelah tambah
        } catch (e) { }
    };

    const handleDeleteWarehouse = async (warehouseId, itemCodeId) => {
        try {
            await axios.delete("/api/admin/admin/products/warehouses/itemcode/remove", {
                data: { WarehouseId: warehouseId, ItemCodeId: itemCodeId }
            });
            await fetchStockData();
        } catch (e) { }
    };


    return (
        <div className="p-4 mx-auto max-w-7xl ml-60">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold mb-4">🏢 Stock Management</h1>

                {hasFeatureAccess(menuAccess, "managewarehouse") && (
                    <button
                        onClick={() => setShowWarehouseModal(true)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Manage Warehouses
                    </button>
                )}

                {hasFeatureAccess(menuAccess, "updateexcel") && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        <FiUploadCloud className="mr-2" /> Update via Excel
                    </button>
                )}
                {loading && <p className="text-center text-gray-600">Loading stock data...</p>}
            </div>
            {/* Filter Section */}
            <div className="flex flex-wrap gap-2 mb-4">
                <div className="relative flex-1 md:flex-none">
                    <input
                        type="text"
                        placeholder={
                            sortBy === "product"
                                ? "🔍 Search Product..."
                                : sortBy === "partnumber"
                                    ? "🔍 Search Part Number..."
                                    : "🔍 Search Item Code..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedProduct("");
                        setSelectedPartNumber("");
                    }}
                    className="w-full md:w-64 px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">📂 All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {selectedCategory && (
                    <select
                        value={selectedProduct}
                        onChange={(e) => {
                            setSelectedProduct(e.target.value);
                            setSelectedPartNumber("");
                        }}
                        className="w-full md:w-64 px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">📦 All Products</option>
                        {filteredProductsByCategory.map((product) => (
                            <option key={product.Name} value={product.Name}>
                                {product.Name}
                            </option>
                        ))}
                    </select>
                )}

                {selectedProduct && (
                    <select
                        value={selectedPartNumber}
                        onChange={(e) => setSelectedPartNumber(e.target.value)}
                        className="w-full md:w-64 px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">🔢 All Part Numbers</option>
                        {filteredPartNumbersByProduct.map((part) => (
                            <option key={part.Name} value={part.Name}>
                                {part.Name}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="product">Sort by Product</option>
                    <option value="partnumber">Sort by Part Number</option>
                    <option value="itemcode">Sort by Item Code</option>
                </select>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📂 Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Part Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Item Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">📊 Item In Stock</th>
                            <th className=" py-3 text-left text-xs font-small text-gray-500 uppercase ">📊 Item PO</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">⚙️ Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                            <React.Fragment key={product.Id}>
                                <tr className="bg-blue-50 font-semibold">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.ProductCategory.map((cat) => cat.Name).join(", ")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{product.Name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">

                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"></td>
                                    <td className="px-6 py-4 whitespace-nowrap">

                                    </td>
                                </tr>

                                {product.PartNumber.flatMap((part) =>
                                    part.ItemCode.map((item, index) => (
                                        <tr key={index} className="text-sm text-gray-600">
                                            <td className="px-6 py-2"></td>
                                            <td className="px-6 py-2"></td>
                                            <td className="px-6 py-2 pl-8">{part.Name}</td>
                                            <td className="px-6 py-2">{item.Name}</td>
                                            <td className="px-6 py-2">
                                                {item.WarehouseStocks && item.WarehouseStocks.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {item.WarehouseStocks.map((ws, idx) => (
                                                            <div key={idx} className="flex justify-between text-xs text-gray-800">
                                                                <span>{ws.Warehouse?.Name || "Unknown"}:</span>
                                                                <span className="font-medium">{ws.QtyOnHand}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">No Stock</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-2">{item.QtyPO || 0}</td>
                                            <td className="px-6 py-2">
                                                {hasFeatureAccess(menuAccess, "editstockmanual") && (
                                                    <>
                                                        <button
                                                            onClick={() => setSelectedItem(item)}
                                                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm mr-2"
                                                        >
                                                            Edit
                                                        </button>
                                                    </>
                                                )}
                                                {hasFeatureAccess(menuAccess, "managewarehouse") && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedItemCode(item);
                                                                setWarehouseItemCodeOpen(true);
                                                            }}
                                                            className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 text-sm"
                                                        >
                                                            Warehouse
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedItem && (
                <EditStock
                    item={selectedItem} // Pastikan selectedItem adalah item code yang benar
                    onClose={() => setSelectedItem(null)}
                    onSave={fetchStockData}
                />
            )}

            {showUploadModal && (
                <UploadStockModal
                    onClose={() => {
                        setShowUploadModal(false);
                        setSelectedFile(null);
                        setUploadResult(null);
                        setUploadError(null);
                    }}
                />
            )}

            {showWarehouseModal && (
                <WarehouseModal
                    isOpen={showWarehouseModal}
                    onClose={() => setShowWarehouseModal(false)}
                />
            )}
            {warehouseItemCodeOpen && selectedItemCode && (
                <WarehouseItemCode
                    itemCode={selectedItemCode}
                    isOpen={warehouseItemCodeOpen}
                    allWarehouses={allWarehousesFromStocks}
                    onAnyChange={() => setShouldRefreshStock(true)}
                    onClose={() => {
                        setWarehouseItemCodeOpen(false);
                        setSelectedItemCode(null);
                        if (shouldRefreshStock) {
                            fetchStockData();
                            setShouldRefreshStock(false);
                        }
                    }}
                />
            )}

        </div>
    );
};

export default Stock;
