import React, { useEffect, useState } from 'react';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';
import Navbar from '../../components/header/navbar';

interface PartNumber {
  Name: string;
}

interface ItemCode {
  Id: number;
  Name: string;
  Weight: number | null;
  MinOrderQuantity: number;
  OrderStep: number;
  AllowItemCodeSelection: boolean;
  PartNumber: PartNumber;
}

interface CartItem {
  Id: number;
  ItemCodeId: number;
  Quantity: number;
  DisplayName: string;
  Price: number;
  ItemCode: ItemCode;
}

interface CartData {
  Id: number;
  UserId: number;
  CartItems: CartItem[];
}

const CheckoutPage = () => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});
  const router = useRouter();

  const [orderRules, setOrderRules] = useState<Record<number, { min: number; step: number }>>({});

  const [activeTaxes, setActiveTaxes] = useState<Record<number, { Id: number; Name: string; Percentage: number }>>({});
  const [uniqueTax, setUniqueTax] = useState<{ Id: number, Percentage: number, Name: string } | null>(null);
  const [taxError, setTaxError] = useState<string | null>(null);
  const [stockRules, setStockRules] = useState<Record<number, number>>({});
  const [stockErrors, setStockErrors] = useState<Record<number, string>>({});

  // Konstanta untuk tarif pajak (11%)
  // Subtotal harga barang (tanpa pajak, tanpa pembulatan)


  useEffect(() => {
    setUserId(sessionStorage.getItem('userId'));
  }, []);
  const token = typeof window !== "undefined" ? sessionStorage.getItem('userToken') : null;



  useEffect(() => {

    fetchCart();
  }, [userId]);

  useEffect(() => {
    if (!cart) return;

    // Setiap kali cart berubah, reset tax
    setActiveTaxes({});
    setUniqueTax(null);
    setTaxError(null);

    const fetchAllRules = async () => {
      let foundTaxes: { Id: number; Name: string; Percentage: number }[] = [];
      for (const item of cart.CartItems) {
        const id = item.ItemCodeId;
        try {
          const rulesData = await fetchOrderRules(id);

          // Ambil tax dari API rules (ActiveTax di response)
          if (rulesData && rulesData.ActiveTax) {
            foundTaxes.push({
              Id: rulesData.ActiveTax.Id,
              Name: rulesData.ActiveTax.Name,
              Percentage: rulesData.ActiveTax.Percentage
            });
            setActiveTaxes(prev => ({
              ...prev,
              [id]: {
                Id: rulesData.ActiveTax.Id,
                Name: rulesData.ActiveTax.Name,
                Percentage: rulesData.ActiveTax.Percentage
              }
            }));
          }
        } catch (err) {
          // skip
        }
      }

      // Cek semua tax harus sama
      const uniqueList = [
        ...new Map(foundTaxes.map(tax => [tax.Id + '-' + tax.Percentage, tax])).values()
      ];
      if (uniqueList.length === 1) {
        setUniqueTax(uniqueList[0]);
        setTaxError(null);
      } else if (uniqueList.length > 1) {
        setTaxError('Pajak tidak konsisten pada semua item, silakan hubungi admin.');
      }
    };

    fetchAllRules();
    // eslint-disable-next-line
  }, [cart]);

  useEffect(() => {
    if (!cart || cart.CartItems.length === 0) {
      setPricingSummary(null);
      return;
    }
    const items = cart.CartItems.map((item) => ({
      ItemCodeId: item.ItemCodeId,
      Quantity: localQuantities[item.ItemCodeId] ?? item.Quantity,
      Price: item.Price,
      // Kalau FE tahu tax masing2, bisa kirim TaxPercentage
      TaxPercentage: activeTaxes[item.ItemCodeId]?.Percentage ?? undefined,
    }));

    fetchPricingSummary(items, !!uniqueTax)
      .then((result) => setPricingSummary(result))
      .catch(() => setPricingSummary(null));
    // eslint-disable-next-line
  }, [cart, localQuantities, activeTaxes, uniqueTax]);

  const fetchCart = async () => {
    if (!userId || !token) return;

    try {
      const res = await fetch('/api/dealer/dealer/cart/get', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // ⬅️ tambahkan token selalu!
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UserId: userId }),
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCart(data.data);

      const qtyMap: Record<number, number> = {};
      data.data.CartItems.forEach((item: CartItem) => {
        qtyMap[item.ItemCodeId] = item.Quantity;
      });
      setLocalQuantities(qtyMap);
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data keranjang.');
    }
  };

  const fetchOrderRules = async (itemCodeId: number) => {
    const token = sessionStorage.getItem('userToken');
    const res = await fetch('/api/dealer/dealer/cart/rules', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ItemCodeId: itemCodeId }),
    });

    if (!res.ok) throw new Error('Gagal mengambil aturan pemesanan');
    const data = await res.json();

    setOrderRules((prev) => ({
      ...prev,
      [itemCodeId]: { min: data.MinOrderQuantity, step: data.OrderStep },
    }));
    setStockRules((prev) => ({
      ...prev,
      [itemCodeId]: data.TotalStock // <- simpan TotalStock
    }));

    return data;
  };

  const debouncedUpdate = React.useRef(
    debounce((itemId: number, value: number) => {
      validateAndUpdate(itemId, value);
    }, 500)
  ).current;

  if (cart) {
    console.log('===== [CHECKOUT PAGE] =====');
    cart.CartItems.forEach((item, idx) => {
      const qty = localQuantities[item.ItemCodeId] ?? item.Quantity;
      const price = item.Price || 0;
      const tax = activeTaxes[item.ItemCodeId]?.Percentage ?? uniqueTax?.Percentage ?? 0;
      const subtotal = price * qty;
      const finalPerItem = Math.round(qty * price * (1 + tax / 100));
      console.log(`[${idx}]`, {
        ItemCodeId: item.ItemCodeId,
        Qty: qty,
        Price: price,
        Tax: tax,
        Subtotal: subtotal,
        FinalWithTax: finalPerItem,
      });
    });
    const sumQty = cart.CartItems.reduce((sum, item) => sum + (localQuantities[item.ItemCodeId] ?? item.Quantity), 0);
    const sumFinal = cart.CartItems.reduce((sum, item) => {
      const qty = localQuantities[item.ItemCodeId] ?? item.Quantity;
      const price = item.Price || 0;
      const tax = activeTaxes[item.ItemCodeId]?.Percentage ?? uniqueTax?.Percentage ?? 0;
      return sum + Math.round(qty * price * (1 + tax / 100));
    }, 0);
    console.log('TOTAL QTY:', sumQty, 'TOTAL FINAL PRICE:', sumFinal);
  }

  async function fetchPricingSummary(items: {
    ItemCodeId: number;
    Quantity: number;
    Price: number;
    TaxPercentage?: number | null;
  }[], forceApplyActiveTax: boolean = false) {
    const token = sessionStorage.getItem("userToken");
    const res = await fetch("/api/global/pricing/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        details: items,
        forceApplyActiveTax,
      }),
    });
    if (!res.ok) throw new Error("Gagal kalkulasi harga");
    return await res.json();
  }
  const [pricingSummary, setPricingSummary] = useState<null | {
    details: any[];
    subtotal: number;
    totalTax: number;
    totalWithTax: number;
    activeTax?: { Id: number; Name?: string; Percentage: number } | null;
  }>(null);

  const updateQuantityBackend = async (itemId: number, quantity: number) => {
    try {
      const token = sessionStorage.getItem('userToken');
      const userId = sessionStorage.getItem('userId');
      if (!token || !userId) return;

      const res = await fetch('/api/dealer/dealer/cart/add-update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserId: Number(userId),
          ItemCodeId: itemId,
          Quantity: quantity,
          mode: 'set',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui kuantitas.');

      setCart((prev) => {
        if (!prev) return null;
        const updatedItems = quantity <= 0
          ? prev.CartItems.filter((item) => item.ItemCodeId !== itemId)
          : prev.CartItems.map((item) =>
            item.ItemCodeId === itemId ? { ...item, Quantity: quantity } : item
          );
        return { ...prev, CartItems: updatedItems };
      });
      await fetchCart();
      setSuccess('Kuantitas berhasil diperbarui!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Gagal memperbarui kuantitas.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const validateAndUpdate = async (itemId: number, newQty: number) => {
    const rules = orderRules[itemId] || await fetchOrderRules(itemId); // pastikan rules pasti ada
    const min = rules.min ?? 1; // <- pastikan tidak undefined
    const step = rules.step ?? null;
    const totalStock = stockRules[itemId] ?? Number.POSITIVE_INFINITY;

    // Validasi qty
    let errorMsg = "";
    if (newQty > totalStock) {
      errorMsg = `Permintaan melebihi stok maksimal: ${totalStock}`;
      setStockErrors((prev) => ({ ...prev, [itemId]: errorMsg }));
      setError(errorMsg);
      setTimeout(() => setError(null), 4000);
      return; // BLOCK update
    } else {
      setStockErrors((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
    }

    setLocalQuantities((prev) => ({ ...prev, [itemId]: newQty }));

    let isValid = newQty >= min;
    if (step && step > 0) {
      // Toleransi pembulatan floating point
      isValid = isValid && (Math.abs((newQty - min) % step) < 1e-8 || Math.abs(step - ((newQty - min) % step)) < 1e-8);
    }
    if (isValid) {
      await updateQuantityBackend(itemId, newQty);
      setError(null);
    } else {
      if (step && step > 0) {
        setError(`Kuantitas harus ≥ ${min} dan kelipatan ${step}`);
      } else {
        setError(`Kuantitas harus ≥ ${min}`);
      }
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      const token = sessionStorage.getItem('userToken');
      const userId = sessionStorage.getItem('userId');
      if (!token || !userId) {
        setError('User belum login.');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const res = await fetch('/api/dealer/dealer/salesorder/convert-cart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UserId: Number(userId) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Gagal mengirim pesanan.');
        setTimeout(() => setError(null), 3000);
        return;
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError('Gagal mengirim pesanan.');
      setTimeout(() => setError(null), 3000);
    }
  };
  const hasStockError = Object.keys(stockErrors).length > 0;
  const totalQty = cart?.CartItems.reduce((sum, i) => sum + i.Quantity, 0) || 0;
  const totalWeight = cart?.CartItems.reduce((sum, i) => sum + (i.ItemCode.Weight || 0) * i.Quantity, 0) || 0;
  const getTotalPricePerItem = (item: CartItem) => (item.Price || 0) * (localQuantities[item.ItemCodeId] ?? item.Quantity);


  // Perhitungan Pajak
  const taxPercentage = uniqueTax?.Percentage || 0;

  const getItemTaxPercentage = (item: CartItem) =>
    activeTaxes[item.ItemCodeId]?.Percentage ?? uniqueTax?.Percentage ?? 0;
  const subtotal = cart?.CartItems.reduce(
    (sum, item) => sum + (item.Price || 0) * (localQuantities[item.ItemCodeId] ?? item.Quantity),
    0
  ) || 0;

  // Total pajak (dari pembulatan per item)
  const totalTax = cart?.CartItems.reduce((sum, item) => {
    const qty = localQuantities[item.ItemCodeId] ?? item.Quantity;
    const price = item.Price || 0;
    const tax = getItemTaxPercentage(item);
    const finalPerItem = Math.round(qty * price * (1 + tax / 100));
    return sum + (finalPerItem - (qty * price));
  }, 0) || 0;

  // FINAL PRICE per item (sudah include pajak per item)
  const getFinalPricePerItem = (item: CartItem) => {
    const qty = localQuantities[item.ItemCodeId] ?? item.Quantity;
    const price = item.Price || 0;
    const tax = getItemTaxPercentage(item);
    return Math.round(qty * price * (1 + tax / 100)); // <- BUKAN Math.floor, BUKAN di total, tapi per item!
  }
  // Grand total (total akhir)
  const totalWithTax = cart?.CartItems.reduce(
    (sum, item) => sum + getFinalPricePerItem(item), 0
  ) || 0;



  // Subtotal (harga barang sebelum pajak)
  const subtotalPrice = cart?.CartItems.reduce(
    (sum, item) => sum + (item.Price || 0) * (localQuantities[item.ItemCodeId] ?? item.Quantity),
    0
  ) || 0;

  // Pajak total = Sum pajak per item





  const getTotalFinalPricePerItem = (item: CartItem) => {
    const qty = localQuantities[item.ItemCodeId] ?? item.Quantity;
    const price = item.Price || 0;
    const tax = activeTaxes[item.ItemCodeId]?.Percentage ?? (uniqueTax?.Percentage ?? 0);
    return qty * price * (1 + tax / 100);
  };


  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">✅ Pesanan Berhasil!</h2>
            <p className="mb-4">Pesanan Anda telah berhasil dikirim.</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/home');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {(error || success) && (
        <div className="fixed top-24 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg flex items-center ${error ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
            {error && (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{error}</span>
              </>
            )}
            {success && (
              <>
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{success}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto py-8 pt-25 px-4 md:px-0">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        {taxError && (
          <div className="mb-4 text-red-600 font-semibold border border-red-300 bg-red-50 p-3 rounded">
            {taxError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kolom Kiri: Daftar Item Keranjang */}
          <div className="md:col-span-2">
            {!cart || cart.CartItems.length === 0 ? (
              <div className="text-center text-gray-500 mt-6 p-4 border rounded-lg bg-white shadow">
                Item kosong, silakan masukkan barang lain
              </div>
            ) : (
              cart.CartItems.map((item) => {
                const min = item.ItemCode.MinOrderQuantity || 1;
                const step = item.ItemCode.OrderStep || 1;
                const currentQuantity = localQuantities[item.ItemCodeId] ?? item.Quantity;

                return (
                  <div key={item.Id} className="border p-4 rounded-lg shadow mb-4 bg-white">
                    <h2 className="text-lg font-bold mb-2">{item.DisplayName}</h2>
                    <p className="text-sm text-gray-600 mb-1">
                      Part Number: {item.ItemCode.PartNumber?.Name || item.DisplayName}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">Berat Satuan: {item.ItemCode.Weight || 0} kg</p>

                    {/* Detail Harga yang lebih rapi */}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                        <span>Harga Satuan:</span>
                        <span>Rp {item.Price?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                        <span>Kuantitas:</span>
                        <span>{currentQuantity}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold text-gray-800 border-t border-gray-300 pt-1 mt-1">
                        <span>Subtotal Item:</span>
                        <span>
                          Rp {pricingSummary?.details?.find(d => d.ItemCodeId === item.ItemCodeId)?.FinalPrice?.toLocaleString() ?? 0}
                        </span>
                      </div>
                    </div>

                    {(orderRules[item.ItemCodeId]) ? (
                      <p className="text-xs text-gray-500 mt-2">
                        Min Order: {orderRules[item.ItemCodeId].min ?? '-'} | Kelipatan: {(orderRules[item.ItemCodeId].step && orderRules[item.ItemCodeId].step > 0) ? orderRules[item.ItemCodeId].step : '-'}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">Mengambil aturan pemesanan...</p>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={async () => {
                          const rules = orderRules[item.ItemCodeId] || await fetchOrderRules(item.ItemCodeId);
                          const minRule = rules.min;
                          const stepRule = rules.step;
                          const currentQty = localQuantities[item.ItemCodeId] || 0;

                          const nextQty = currentQty - stepRule;

                          if (nextQty < minRule) {
                            await updateQuantityBackend(item.ItemCodeId, 0);
                            setLocalQuantities((prev) => {
                              const updated = { ...prev };
                              delete updated[item.ItemCodeId];
                              return updated;
                            });
                          } else {
                            await validateAndUpdate(item.ItemCodeId, nextQty);
                          }
                        }}
                        className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 transition duration-150 ease-in-out"
                        disabled={localQuantities[item.ItemCodeId] <= (orderRules[item.ItemCodeId]?.min || 0)}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        value={currentQuantity}
                        onChange={async (e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setLocalQuantities((prev) => {
                              const updated = { ...prev };
                              delete updated[item.ItemCodeId];
                              return updated;
                            });
                            return;
                          }
                          if (/^\d*\.?\d*$/.test(value)) {
                            const numVal = parseFloat(value);
                            setLocalQuantities((prev) => ({
                              ...prev,
                              [item.ItemCodeId]: numVal
                            }));

                            // Cek apakah orderRules sudah ada
                            if (!orderRules[item.ItemCodeId]) {
                              await fetchOrderRules(item.ItemCodeId); // pastikan rules ada
                            }
                            // Debounced auto update
                            debouncedUpdate(item.ItemCodeId, numVal);
                          }
                        }}
                        // onBlur: bisa tetap dipakai untuk backup
                        onBlur={() => {
                          let val = localQuantities[item.ItemCodeId];
                          if (!val || isNaN(val)) {
                            const fallback = orderRules[item.ItemCodeId]?.min || 1;
                            setLocalQuantities((prev) => ({ ...prev, [item.ItemCodeId]: fallback }));
                            validateAndUpdate(item.ItemCodeId, fallback);
                            return;
                          }
                          if (val === 0) {
                            updateQuantityBackend(item.ItemCodeId, 0);
                            setLocalQuantities((prev) => {
                              const updated = { ...prev };
                              delete updated[item.ItemCodeId];
                              return updated;
                            });
                          } else {
                            validateAndUpdate(item.ItemCodeId, val);
                          }
                        }}
                        className="w-24 text-center border rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                        min={orderRules[item.ItemCodeId]?.min || 1}
                        step={(orderRules[item.ItemCodeId]?.step && orderRules[item.ItemCodeId].step > 0) ? orderRules[item.ItemCodeId].step : 1}
                      />

                      <button
                        onClick={async () => {
                          const rules = orderRules[item.ItemCodeId] || await fetchOrderRules(item.ItemCodeId);
                          const minRule = rules.min;
                          const stepRule = rules.step;

                          const currentQty = localQuantities[item.ItemCodeId];
                          const nextQty = currentQty < minRule
                            ? minRule
                            : currentQty + stepRule;

                          await validateAndUpdate(item.ItemCodeId, nextQty);
                        }}
                        className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 transition duration-150 ease-in-out"
                      >
                        +
                      </button>
                    </div>
                    {stockErrors[item.ItemCodeId] && (
                      <div className="text-sm text-red-600 mt-1">
                        {stockErrors[item.ItemCodeId]}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Kolom Kanan: Ringkasan Pesanan */}
          <div className="md:col-span-1">
            <div className="sticky top-28 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Ringkasan Pesanan</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex justify-between">
                  <span>Total Kuantitas:</span>
                  <span className="font-semibold">{totalQty}</span>
                </p>
                <p className="flex justify-between">
                  <span>Total Berat:</span>
                  <span className="font-semibold">{totalWeight.toFixed(2)} kg</span>
                </p>
                <div className="border-t border-gray-200 pt-2 mt-2"></div>
                <p className="flex justify-between">
                  <span>Subtotal (Harga Barang):</span>
                  <span className="font-semibold">
                    Rp {pricingSummary ? pricingSummary.subtotal.toLocaleString() : 0}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Pajak ({pricingSummary?.activeTax?.Percentage ?? 0}%):</span>
                  <span className="font-semibold">
                    Rp {pricingSummary ? pricingSummary.totalTax.toLocaleString() : 0}
                  </span>
                </p>
                <p className="flex justify-between text-lg font-bold mt-4 border-t pt-4 text-red-600">
                  <span>TOTAL AKHIR:</span>
                  <span>
                    Rp {pricingSummary ? pricingSummary.totalWithTax.toLocaleString() : 0}
                  </span>
                </p>
              </div>
              <button
                onClick={handleSubmitOrder}
                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-lg font-semibold transition duration-200 ease-in-out"
                disabled={!cart || cart.CartItems.length === 0 || !!taxError || hasStockError}
              >
                Kirim Pesanan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;