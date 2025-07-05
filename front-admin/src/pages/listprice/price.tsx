import React, { useState, useEffect } from 'react';
// import ModalPriceCategory from './modal/Modalpricecategory'; // Asumsi tidak digunakan
import ModalCrudPriceCategory from './modal/Modalcrudpricecategory';
import axios from "@/utils/axios";
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";
import { useRouter } from "next/router";
import Select from "react-select";

interface Price {
  Id: number;
  Dealer: string | null;
  Price: number;
  MinQuantity?: number;
  MaxQuantity?: number;
  isWholesale?: boolean;
}

interface PriceCategory { // Struktur ini datang dari API per ItemCode
  PriceCategory: string; // Nama kategori dari backend, mis: "Retail", "Distributor", "Wholesale Prices"
  Prices: Price[];
}

interface Product {
  Id: number;
  Name: string;
  PartNumber: PartNumber[];
}

interface PartNumber {
  Id: number;
  Name: string;
  ItemCode: ItemCode[];
}

interface ItemCode {
  Id: number;
  Name: string;
}

const PriceList: React.FC = () => {
  const router = useRouter();
  // ... (state lainnya tetap sama) ...
  const [itemCodes, setItemCodes] = useState<ItemCode[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [pricesByItem, setPricesByItem] = useState<{ [key: number]: PriceCategory[] }>({});
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editPrice, setEditPrice] = useState<Price | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [priceCategories, setPriceCategories] = useState<{ Id: number; Name: string }[]>([]);
  const [selectedPriceCategory, setSelectedPriceCategory] = useState<number | null>(null);
  const [createPriceModal, setCreatePriceModal] = useState(false);
  const [createDealerModal, setCreateDealerModal] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<number | null>(null);

  const [dealers, setDealers] = useState<{ Id: number; CompanyName: string }[]>([]);
  const [filteredDealers, setFilteredDealers] = useState<{ Id: number; CompanyName: string }[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<number | null>(null);
  const [searchDealer, setSearchDealer] = useState("");

  const [isModalPriceCategoryOpen, setIsModalPriceCategoryOpen] = useState(false);

  const [priceType, setPriceType] = useState<string>("dealer");
  const [minQuantity, setMinQuantity] = useState<number>(0);
  const [maxQuantity, setMaxQuantity] = useState<number>(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchItemCode, setSearchItemCode] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPartNumber, setSelectedPartNumber] = useState<PartNumber | null>(null);

  const [menuAccess, setMenuAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);

  useEffect(() => {
    setLoadingAccess(true);
    axios
      .get(`/api/admin/admin/access/my-menu?_=${Date.now()}`) // Paksa fresh fetch
      .then(res => {
        const data = res.data || [];
        const found = data.find((m: { Name: string; }) => m.Name?.toLowerCase() === "price");
        setMenuAccess(found || null);
        setLoadingAccess(false);
        // Jika tidak punya akses, redirect
        if (!found) {
          router.replace("/access-denied");
        }
      })
      .catch(() => {
        setMenuAccess(null);
        setLoadingAccess(false);
        router.replace("/access-denied");
      });
  }, [router.asPath]); // Penting: Ganti dependency jadi asPath

  useEffect(() => {
    fetchProductsData();
  }, []);

  const fetchProductsData = async () => {
    try {
      const response = await axios.get('/api/admin/admin/prices/itemcodes/pricecategorys');
      setProducts(response.data.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch data');
    }
  };

  const fetchPrices = async (itemId: number) => {
    setLoading(itemId);
    setError(null);
    try {
      const response = await axios.get(`/api/admin/admin/prices/category/item/${itemId}`);
      const data = response.data?.data;
      if (!data || data.length === 0 || !data[0].PriceCategories) {
        setPricesByItem(prev => ({ ...prev, [itemId]: [] }));
        return;
      }
      setPricesByItem(prev => ({ ...prev, [itemId]: data[0].PriceCategories }));
    } catch (err) {
      setError("Error fetching price categories. Please try again later.");
      setPricesByItem(prev => ({ ...prev, [itemId]: [] }));
    } finally {
      setLoading(null);
    }
  };

  const fetchPriceCategories = async () => {
    try {
      const response = await axios.get(`/api/admin/admin/pricecategory`);
      setPriceCategories(response.data.data);
    } catch (error) {
      alert("Failed to load price categories");
    }
  };

  const toggleExpand = (itemId: number) => {
    if (expandedItem === itemId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(itemId);
      setCurrentItemId(itemId);
      if (!pricesByItem[itemId] || pricesByItem[itemId].length === 0) { // Fetch jika belum ada atau kosong
        fetchPrices(itemId);
      }
    }
  };

  const openCreatePriceModal = (itemId: number) => {
    fetchPriceCategories();
    setCurrentItemId(itemId);
    setNewPrice(0);
    setSelectedPriceCategory(null);
    setCreatePriceModal(true);
  };

  const openCreateDealerModal = (itemId: number) => {
    setCurrentItemId(itemId);
    setNewPrice(0);
    setSelectedDealerId(null);
    setSearchDealer("");
    setPriceType("dealer");
    setMinQuantity(0);
    setMaxQuantity(0);
    setCreateDealerModal(true);
  };

  const handleCreatePrice = async () => {
    const priceError = validatePrice(newPrice);
    if (priceError) {
      alert(priceError);
      return;
    }
    if (!selectedPriceCategory || !currentItemId || newPrice <= 0) {
      alert("Please select a category, item, and enter a valid price.");
      return;
    }
    try {
      await axios.post("/api/admin/admin/prices/update-category", {
        ItemCodeId: currentItemId,
        PriceCategoryId: selectedPriceCategory,
        Price: newPrice,
      });
      setCreatePriceModal(false);
      if (currentItemId) {
        fetchPrices(currentItemId);
      }
      alert("Price category created or updated successfully!");
    } catch (error) {
      alert("Error creating/updating price category");
    }
  };


  const handleEditClick = async (price: Price, itemCodeId: number) => {
    setEditPrice(null);
    setNewPrice(price.Price);
    setCurrentItemId(itemCodeId);

    setEditPrice({
      ...price,
      isWholesale: !!price.isWholesale, // Pastikan boolean
    });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editPrice || !currentItemId) {
      alert("No price selected for editing or item context is missing.");
      return;
    }
    const priceError = validatePrice(newPrice);
    if (priceError) {
      alert(priceError);
      return;
    }
    try {
      const body: any = { Id: editPrice.Id, Price: newPrice };
      if (editPrice.isWholesale) {
        body.MinQuantity = editPrice.MinQuantity;
        body.MaxQuantity = editPrice.MaxQuantity;
      }
      await axios.post("/api/admin/admin/prices/edit", body);
      setIsModalOpen(false);
      setEditPrice(null);
      fetchPrices(currentItemId);
    } catch (error: any) {
      alert(`Error updating price: ${error?.message || error}`);
    }
  };

  const handleDelete = async (priceId: number, itemCodeId: number) => {
    if (!confirm("Are you sure you want to delete this price?")) return;
    try {
      await axios.delete(`/api/admin/admin/prices/${priceId}`);
      fetchPrices(itemCodeId);
      alert("Price deleted successfully!");
    } catch (error) {
      alert("Error deleting price");
    }
  };


  const validatePrice = (price: number) => {
    if (isNaN(price)) return "Harga harus berupa angka.";
    if (price < 0) return "Harga tidak boleh negatif.";
    if (price > 100_000_000_000) return "Harga maksimal Rp100.000.000.000.";
    return null;
  };


  useEffect(() => {
    if (createDealerModal) fetchDealers();
  }, [createDealerModal]);

  const fetchDealers = async () => {
    try {
      const response = await axios.get("/api/admin/admin/prices/dealers");
      setDealers(response.data.data);
      setFilteredDealers(response.data.data);
    } catch (error) {
      alert("Error fetching dealers");
    }
  };

  const handleCreateDealerPrice = async () => {
    const priceError = validatePrice(newPrice);
    if (priceError) {
      alert(priceError);
      return;
    }
    if (!currentItemId || newPrice <= 0) {
      alert("Item not selected or price is invalid.");
      return;
    }
    if (!selectedDealerId) { // DealerId wajib untuk dealer/wholesale
      alert("Please select a dealer.");
      return;
    }
    if (priceType === "wholesale" && (minQuantity <= 0 || maxQuantity <= 0 || minQuantity >= maxQuantity)) {
      alert("Please enter valid Min/Max quantities for wholesale. Min must be less than Max.");
      return;
    }

    try {
      const endpoint =
        priceType === "wholesale"
          ? "/api/admin/admin/prices/wholesale"
          : "/api/admin/admin/prices/dealers";
      const body: any = {
        ItemCodeId: currentItemId,
        Price: newPrice,
        DealerId: selectedDealerId, // Wajib diisi untuk semua tipe!
      };

      if (priceType === "wholesale") {
        body.MinQuantity = minQuantity;
        body.MaxQuantity = maxQuantity;
      }

      await axios.post(endpoint, body);

      setCreateDealerModal(false);
      if (currentItemId) fetchPrices(currentItemId);
      alert("Price created successfully!");
    } catch (error: any) {
      if (error.response && (error.response.status === 403 || error.response.status === 409)) {
        alert(error.response.data?.message || "This price configuration might already exist or conflict.");
        return;
      }
      alert(
        `Error creating price: ${error?.message || "An unknown error occurred"}`
      );
    }
  };

  const filteredProducts = products.map(product => {
    if (selectedProduct && product.Id !== selectedProduct.Id) return null;
    const matchedPartNumbers = product.PartNumber.map(part => {
      if (selectedProduct && selectedPartNumber && part.Id !== selectedPartNumber.Id) return null;
      const matchedItemCodes = part.ItemCode.filter(item =>
        item.Name.toLowerCase().includes(searchItemCode.toLowerCase())
      );
      return matchedItemCodes.length > 0 ? { ...part, ItemCode: matchedItemCodes } : null;
    }).filter((part): part is PartNumber => part !== null);
    return matchedPartNumbers.length > 0 ? { ...product, PartNumber: matchedPartNumbers } : null;
  }).filter((product): product is Product => product !== null);

  const handleSearchDealer = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchDealer(e.target.value);
    setFilteredDealers(dealers.filter(d => d.CompanyName.toLowerCase().includes(e.target.value.toLowerCase())));
  };

  // --- Helper untuk merender list harga dalam satu section ---
  const renderPricesListInSection = (prices: Price[], itemId: number, sectionTitleForEmpty: string) => {
    if (!prices || prices.length === 0) {
      return <div className="px-4 py-3 text-sm text-gray-500 italic">No prices available in this {sectionTitleForEmpty}.</div>;
    }
    return prices.map(price => (
      <div key={price.Id} className="flex justify-between items-center px-4 py-2 border-b text-sm last:border-b-0 hover:bg-gray-50">
        <div className="flex-1">
          <span className="font-medium">{price.Dealer || (price.isWholesale ? "Wholesale" : "Standard Price")}</span>
          {price.isWholesale && (
            <span className="text-xs text-gray-500 ml-2 block sm:inline">
              (Min: {price.MinQuantity}, Max: {price.MaxQuantity})
            </span>
          )}
        </div>
        <span className="font-semibold mx-4">Rp{price.Price.toLocaleString()}</span>
        <div className="flex gap-2 flex-shrink-0">
          {hasFeatureAccess(menuAccess, "editprice") && (
            <button onClick={() => handleEditClick(price, itemId)} className="text-yellow-600 hover:text-yellow-700 hover:underline text-xs">Edit</button>
          )}
          {hasFeatureAccess(menuAccess, "deleteprice") && (
            <button onClick={() => handleDelete(price.Id, itemId)} className="text-red-600 hover:text-red-700 hover:underline text-xs">Delete</button>
          )}
        </div>
      </div>
    ));
  };

  // --- MODIFIKASI UTAMA DI SINI ---
  const renderPriceDetails = (itemId: number) => {
    const allAPICategories = pricesByItem[itemId];

    if (loading === itemId) {
      return <div className="p-4 text-sm text-gray-600 animate-pulse">Loading prices...</div>;
    }
    if (!allAPICategories) { // Jika belum fetch atau gagal total
      return <div className="p-4 text-sm text-red-600">Could not load price details.</div>;
    }
    if (allAPICategories.length === 0 && !loading) { // Sudah fetch tapi tidak ada data sama sekali
      return <div className="p-4 text-sm text-gray-500">No price configurations found for this item. Add new prices using the buttons above.</div>;
    }

    let collectedWholesalePrices: Price[] = [];
    let collectedDealerPrices: Price[] = [];
    const generalPriceCategoriesGrouped: { categoryName: string; prices: Price[] }[] = [];

    allAPICategories.forEach(apiCategory => {
      apiCategory.Prices.forEach(price => {
        if (price.isWholesale) {
          collectedWholesalePrices.push(price);
        } else if (price.Dealer) {
          collectedDealerPrices.push(price);
        } else {
          // Harga umum, kelompokkan berdasarkan PriceCategory aslinya
          let group = generalPriceCategoriesGrouped.find(g => g.categoryName === apiCategory.PriceCategory);
          if (!group) {
            group = { categoryName: apiCategory.PriceCategory, prices: [] };
            generalPriceCategoriesGrouped.push(group);
          }
          group.prices.push(price);
        }
      });
    });

    // Hapus duplikasi jika harga yang sama muncul di beberapa kategori API (berdasarkan ID harga)
    collectedWholesalePrices = [...new Map(collectedWholesalePrices.map(item => [item.Id, item])).values()];
    collectedDealerPrices = [...new Map(collectedDealerPrices.map(item => [item.Id, item])).values()];
    // Untuk generalPriceCategoriesGrouped, harga sudah unik per kategori API-nya

    const hasAnyPrice = collectedWholesalePrices.length > 0 || collectedDealerPrices.length > 0 || generalPriceCategoriesGrouped.some(g => g.prices.length > 0);

    if (!hasAnyPrice && !loading) {
      return <div className="p-4 text-sm text-gray-500">No price configurations found for this item after grouping. Add new prices using the buttons above.</div>;
    }

    return (
      <div className="space-y-4">
        {/* Section for Wholesale Prices */}
        {collectedWholesalePrices.length > 0 && (
          <div>
            <div className="flex justify-between items-center bg-green-100 px-4 py-2 rounded-t-md border-b border-green-200">
              <h4 className="font-semibold text-green-700">Wholesale Prices</h4>
            </div>
            <div className="bg-white border border-gray-200 border-t-0 rounded-b-md shadow-sm overflow-hidden max-h-60 overflow-y-auto">
              {renderPricesListInSection(collectedWholesalePrices, itemId, "section")}
            </div>
          </div>
        )}

        {/* Section for Dealer Specific Prices */}
        {collectedDealerPrices.length > 0 && (
          <div>
            <div className="flex justify-between items-center bg-yellow-100 px-4 py-2 rounded-t-md border-b border-yellow-200">
              <h4 className="font-semibold text-yellow-700">Dealer Specific Prices</h4>
            </div>
            <div className="bg-white border border-gray-200 border-t-0 rounded-b-md shadow-sm overflow-hidden max-h-60 overflow-y-auto">
              {renderPricesListInSection(collectedDealerPrices, itemId, "section")}
            </div>
          </div>
        )}

        {/* Section for General Price Categories */}
        {generalPriceCategoriesGrouped.filter(g => g.prices.length > 0).length > 0 && (
          <div>
            <div className="flex justify-between items-center bg-blue-100 px-4 py-2 rounded-t-md border-b border-blue-200">
              <h4 className="font-semibold text-blue-700">General Price Categories</h4>
            </div>
            <div className="bg-gray-50 p-2 border border-gray-200 border-t-0 rounded-b-md shadow-sm space-y-3">
              {generalPriceCategoriesGrouped.map(group => (
                group.prices.length > 0 && (
                  <div key={group.categoryName} className="bg-white rounded-md shadow-xs overflow-hidden border border-gray-200">
                    <div className="bg-gray-100 px-3 py-1 border-b border-gray-200">
                      <h5 className="font-medium text-sm text-gray-600">{group.categoryName || "Uncategorized"}</h5>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {renderPricesListInSection(group.prices, itemId, "category")}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loadingAccess) return <div>Loading Access...</div>;
  if (!menuAccess) return null;

  return (
    <div className="ml-60 p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Price Management</h1>
      <div className="mb-6">
        {hasFeatureAccess(menuAccess, "managepricecategory") && (
          <button
            onClick={() => setIsModalPriceCategoryOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
          >
            Manage Price Categories
          </button>
        )}

        <ModalCrudPriceCategory
          isOpen={isModalPriceCategoryOpen}
          onClose={() => setIsModalPriceCategoryOpen(false)}
        />
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">🔍 Filter Price by Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="searchItemCode" className="block text-sm font-medium text-gray-600 mb-1">Search Item Code</label>
            <input id="searchItemCode" type="text" placeholder="e.g. AH300-0025" value={searchItemCode}
              onChange={(e) => {
                setSearchItemCode(e.target.value);
                setSelectedProduct(null); setSelectedPartNumber(null); setExpandedItem(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="selectProduct" className="block text-sm font-medium text-gray-600 mb-1">Product</label>
            <select id="selectProduct" className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedProduct ? selectedProduct.Id : ""}
              onChange={(e) => {
                const prodId = Number(e.target.value);
                const prod = products.find(p => p.Id === prodId);
                setSelectedProduct(prod || null); setSelectedPartNumber(null); setExpandedItem(null); setSearchItemCode("");
              }}
            >
              <option value="">-- Select Product --</option>
              {products.map(product => (<option key={product.Id} value={product.Id}>{product.Name}</option>))}
            </select>
          </div>
          {selectedProduct && (
            <div>
              <label htmlFor="selectPartNumber" className="block text-sm font-medium text-gray-600 mb-1">Part Number</label>
              <select id="selectPartNumber" className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPartNumber ? selectedPartNumber.Id : ""}
                onChange={(e) => {
                  const partId = Number(e.target.value);
                  const part = selectedProduct.PartNumber.find(p => p.Id === partId);
                  setSelectedPartNumber(part || null); setExpandedItem(null); setSearchItemCode("");
                }}
              >
                <option value="">-- Select Part Number --</option>
                {selectedProduct.PartNumber.map(part => (<option key={part.Id} value={part.Id}>{part.Name}</option>))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredProducts.map(product => (
          <div key={product.Id} className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">📦 {product.Name}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {product.PartNumber.map(part => (
                <div key={part.Id} className="px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">🔧 {part.Name}</h3>
                  <ul className="space-y-3">
                    {part.ItemCode.map(item => (
                      <li key={item.Id} className="bg-white border border-gray-300 rounded-md p-3 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm text-gray-800 flex-grow"> {item.Name}</span>
                          <div className="flex gap-2 items-center ml-4 flex-shrink-0">
                            {hasFeatureAccess(menuAccess, "addprice") && (
                              <button onClick={() => openCreateDealerModal(item.Id)} className="text-xs px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow-sm transition-colors" title="Add Dealer/Wholesale Price">
                                + Specific
                              </button>
                            )}
                            {hasFeatureAccess(menuAccess, "addprice") && (
                              <button onClick={() => openCreatePriceModal(item.Id)} className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded shadow-sm transition-colors" title="Add Category Price">
                                + Category
                              </button>
                            )}
                            <button onClick={() => toggleExpand(item.Id)} className="text-xs font-medium text-blue-600 hover:text-blue-800 py-1 px-2 rounded bg-blue-100 hover:bg-blue-200" title={expandedItem === item.Id ? "Hide" : "View"}>
                              {expandedItem === item.Id ? "▲ Hide" : "▼ View"}
                            </button>
                          </div>
                        </div>
                        {expandedItem === item.Id && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-4"> {/* Increased padding */}
                            {renderPriceDetails(item.Id)}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="mt-6 mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded-md">{error}</div>}

      {/* --- Modals (struktur tetap sama, hanya beberapa label mungkin perlu disesuaikan jika ingin lebih spesifik) --- */}
      {createPriceModal && currentItemId && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create General Category Price</h2>
            <label htmlFor="priceCategorySelect" className="block text-sm font-medium text-gray-700 mb-1">Select Price Category</label>
            <select id="priceCategorySelect" value={selectedPriceCategory || ""} onChange={e => setSelectedPriceCategory(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            >
              <option value="">-- Select Price Category --</option>
              {priceCategories.map(pc => (<option key={pc.Id} value={pc.Id}>{pc.Name}</option>))}
            </select>
            <label htmlFor="newCatPriceInput" className="block text-sm font-medium text-gray-700 mb-1">Enter Price</label>
            <input id="newCatPriceInput" type="number" value={newPrice || ""} onChange={e => setNewPrice(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" placeholder="Enter Price"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCreatePriceModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
              <button onClick={handleCreatePrice} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {createDealerModal && currentItemId && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create Specific Price</h2>
            <label htmlFor="priceTypeSelect" className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
            <select id="priceTypeSelect" value={priceType} onChange={(e) => setPriceType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            >
              <option value="dealer">Dealer Specific Price</option>
              <option value="wholesale">Wholesale Price</option>
            </select>
            <label htmlFor="dealerSelect" className="block text-sm font-medium text-gray-700 mb-1 mt-2">Dealer</label>
            <Select
              id="dealerSelect"
              className="mb-3"
              isClearable
              placeholder="Search or select dealer..."
              options={dealers.map((dealer) => ({
                value: dealer.Id,
                label: dealer.CompanyName,
              }))}
              value={dealers.find((d) => d.Id === selectedDealerId)
                ? { value: selectedDealerId, label: dealers.find((d) => d.Id === selectedDealerId)?.CompanyName }
                : null}
              onChange={(selectedOption) => {
                setSelectedDealerId(selectedOption ? selectedOption.value : null);
              }}
            />
            <label htmlFor="newDealerPriceInput" className="block text-sm font-medium text-gray-700 mb-1">Enter Price</label>
            <input id="newDealerPriceInput" type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" placeholder="Enter Price"
            />
            {priceType === "wholesale" && (
              <>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 mt-2 mb-3 rounded">
                  <p className="text-sm"><strong>Wholesale Price</strong> applies when order quantity is between min and max values.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor="minQtyInput" className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
                    <input id="minQtyInput" type="number" value={minQuantity} onChange={(e) => setMinQuantity(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min Qty"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxQtyInput" className="block text-sm font-medium text-gray-700 mb-1">Max Quantity</label>
                    <input id="maxQtyInput" type="number" value={maxQuantity} onChange={(e) => setMaxQuantity(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Max Qty"
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setCreateDealerModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
              <button onClick={handleCreateDealerPrice} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && editPrice && currentItemId && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Price for Item ID: {currentItemId}</h2>
            <p className="text-sm text-gray-600 mb-1">Editing Price ID: {editPrice.Id}</p>
            {editPrice.Dealer && <p className="text-sm text-gray-600 mb-1">Dealer: {editPrice.Dealer}</p>}
            {editPrice.isWholesale && <p className="text-sm text-green-600 mb-1">Type: Wholesale Price</p>}

            <label htmlFor="editPriceInput" className="block text-sm font-medium text-gray-700 mb-1 mt-3">Price</label>
            <input id="editPriceInput" type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" placeholder="Enter Price"
            />
            {editPrice.isWholesale && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor="editMinQtyInput" className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
                    <input id="editMinQtyInput" type="number" value={editPrice.MinQuantity || ""}
                      onChange={(e) => setEditPrice((prev) => prev ? { ...prev, MinQuantity: Number(e.target.value) } : null)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min Qty"
                    />
                  </div>
                  <div>
                    <label htmlFor="editMaxQtyInput" className="block text-sm font-medium text-gray-700 mb-1">Max Quantity</label>
                    <input id="editMaxQtyInput" type="number" value={editPrice.MaxQuantity || ""}
                      onChange={(e) => setEditPrice((prev) => prev ? { ...prev, MaxQuantity: Number(e.target.value) } : null)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Max Qty"
                    />
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceList;