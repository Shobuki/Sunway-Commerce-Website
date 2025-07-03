import React, { useEffect, useState } from 'react';
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
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  // Konstanta untuk tarif pajak (11%)

  useEffect(() => {
    setUserId(sessionStorage.getItem('userId'));
  }, []);
  const token = typeof window !== "undefined" ? sessionStorage.getItem('userToken') : null;

  useEffect(() => {
    // Fetch tax dari API
    const fetchActiveTax = async () => {
      try {
        const res = await fetch('/api/admin/admin/salesorder/tax/getactive');
        const result = await res.json();
        if (result?.data && typeof result.data.Percentage === 'number') {
          setTaxPercentage(result.data.Percentage);
        } else {
          setTaxPercentage(0); // fallback tanpa pajak
        }
      } catch (e) {
        setTaxPercentage(0);
      }
    };

    fetchActiveTax();
  }, []);


  useEffect(() => {
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

    fetchCart();
  }, [userId]);

  useEffect(() => {
    if (!cart) return;

    const fetchAllRules = async () => {
      for (const item of cart.CartItems) {
        const id = item.ItemCodeId;
        if (!orderRules[id]) {
          try {
            await fetchOrderRules(id);
          } catch (err) {
            console.error(`Gagal mengambil aturan untuk item ${id}:`, err);
          }
        }
      }
    };

    fetchAllRules();
  }, [cart]);

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

    return data;
  };

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

      setSuccess('Kuantitas berhasil diperbarui!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Gagal memperbarui kuantitas.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const validateAndUpdate = async (itemId: number, newQty: number) => {
    const rules = orderRules[itemId] || await fetchOrderRules(itemId);
    const min = rules.min;
    const step = rules.step;

    setLocalQuantities((prev) => ({ ...prev, [itemId]: newQty }));

    const isValid = newQty >= min && newQty % step === 0;
    if (isValid) {
      await updateQuantityBackend(itemId, newQty);
      setError(null);
    } else {
      setError(`Kuantitas harus ≥ ${min} dan kelipatan ${step}`);
      setTimeout(() => setError(null), 5000);
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

  const totalQty = cart?.CartItems.reduce((sum, i) => sum + i.Quantity, 0) || 0;
  const totalWeight = cart?.CartItems.reduce((sum, i) => sum + (i.ItemCode.Weight || 0) * i.Quantity, 0) || 0;
  const getTotalPricePerItem = (item: CartItem) => (item.Price || 0) * (localQuantities[item.ItemCodeId] ?? item.Quantity);
  const grandTotalPrice = cart?.CartItems.reduce(
    (sum, i) => sum + getTotalPricePerItem(i),
    0
  ) || 0;

  // Perhitungan Pajak
  const taxAmount = grandTotalPrice * (taxPercentage / 100);
  const finalTotalPrice = grandTotalPrice + taxAmount;

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
                        <span>Rp {(getTotalPricePerItem(item)).toLocaleString()}</span>
                      </div>
                    </div>

                    {(orderRules[item.ItemCodeId]) ? (
                      <p className="text-xs text-gray-500 mt-2">
                        Min Order: {orderRules[item.ItemCodeId].min} | Kelipatan: {orderRules[item.ItemCodeId].step}
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
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLocalQuantities((prev) => ({ ...prev, [item.ItemCodeId]: val }));
                        }}
                        onBlur={() => {
                          const val = localQuantities[item.ItemCodeId];
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
                        step={orderRules[item.ItemCodeId]?.step || 1}
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
                <div className="border-t border-gray-200 pt-2 mt-2"></div> {/* Garis pemisah */}
                <p className="flex justify-between">
                  <span>Subtotal (Harga Barang):</span>
                  <span className="font-semibold">Rp {grandTotalPrice.toLocaleString()}</span>
                </p>
                <p className="flex justify-between">
                  <span>Pajak ({taxPercentage}%):</span>
                  <span className="font-semibold">Rp {taxAmount.toLocaleString()}</span>
                </p>

                <p className="flex justify-between text-lg font-bold mt-4 border-t pt-4 text-red-600">
                  <span>TOTAL AKHIR:</span>
                  <span>Rp {finalTotalPrice.toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={handleSubmitOrder}
                className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-lg font-semibold transition duration-200 ease-in-out"
                disabled={!cart || cart.CartItems.length === 0}
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