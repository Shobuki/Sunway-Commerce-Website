import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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
  Price?: number; // ← tambahkan ini
  ItemCode: ItemCode;
}


interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);

  const [orderRules, setOrderRules] = useState<Record<number, { MinOrderQuantity: number, OrderStep: number }>>({});

  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      const token = sessionStorage.getItem('userToken');
      const userId = sessionStorage.getItem('userId');
      if (!token || !userId) return;

      try {
        const res = await fetch('/api/dealer/dealer/cart/get', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ UserId: Number(userId) }),
        });

        // Tambahan ini
        if (res.status === 404) {
          // Cart kosong, bukan error.
          setCartItems([]);
          setError(null);
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setCartItems(data.data.CartItems);

        const qtyMap: Record<number, number> = {};
        data.data.CartItems.forEach((item: CartItem) => {
          qtyMap[item.ItemCodeId] = item.Quantity;
        });
        setLocalQuantities(qtyMap);

        data.data.CartItems.forEach((item: CartItem) => {
          qtyMap[item.ItemCodeId] = item.Quantity;
          fetchOrderRule(item.ItemCodeId); // Fetch aturan min & step dari backend
        });

        setError(null); // pastikan reset error
      } catch (err) {
        // Tampilkan error hanya jika selain 404/not found
        console.error(err);
        setError('Gagal mengambil data keranjang.');
      }
    };

    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);



  const fetchOrderRule = async (itemCodeId: number) => {
    const token = sessionStorage.getItem('userToken');
    try {
      const res = await fetch('/api/dealer/dealer/cart/getorderrules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ItemCodeId: itemCodeId }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderRules(prev => ({
          ...prev,
          [itemCodeId]: {
            MinOrderQuantity: data.MinOrderQuantity,
            OrderStep: data.OrderStep,
          }
        }));
      }
    } catch (err) {
      console.error('Failed to fetch order rules for', itemCodeId);
    }
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui kuantitas.');

      setCartItems(prev => prev.map(i => i.ItemCodeId === itemId ? { ...i, Quantity: quantity } : i));
    } catch (err) {
      console.error(err);
      setError('Gagal memperbarui kuantitas.');
    }
  };

  const validateAndUpdate = (itemId: number, newQty: number) => {
    setLocalQuantities(prev => ({ ...prev, [itemId]: newQty }));

    const item = cartItems.find(i => i.ItemCodeId === itemId);
    if (!item) return;

    const rule = orderRules[item.ItemCodeId] || { MinOrderQuantity: 1, OrderStep: 1 };
    const min = rule.MinOrderQuantity;
    const step = rule.OrderStep;


    const isValid = newQty >= min && newQty % step === 0;


    if (isValid) {
      setError(null);
      updateQuantityBackend(itemId, newQty);
    } else {
      setError(`❌ ${item.DisplayName} harus ≥ ${min} dan kelipatan ${step}`);
    }
  };

  const handleQuantityChange = async (itemId: number, delta: number) => {
    const current = localQuantities[itemId] ?? 0;
    const item = cartItems.find(i => i.ItemCodeId === itemId);
    if (!item) return;

    const step = item.ItemCode.OrderStep || 1;
    const nextQty = current + delta;

    // Jika kuantitas <= 0, langsung hapus
    if (nextQty <= 0) {
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
            Quantity: 0, // ⬅️ trigger backend delete
          }),
        });

        if (!res.ok) throw new Error('Gagal menghapus item dari keranjang.');

        // Hapus dari tampilan frontend juga
        setCartItems(prev => prev.filter(i => i.ItemCodeId !== itemId));
        setLocalQuantities(prev => {
          const updated = { ...prev };
          delete updated[itemId];
          return updated;
        });
      } catch (err) {
        console.error(err);
        setError('Gagal menghapus item.');
      }

      return;
    }

    // Lanjutkan update biasa jika jumlah > 0
    const min = item.ItemCode.MinOrderQuantity || 1;
    const isValid = nextQty >= min && (nextQty % step === 0);

    setLocalQuantities(prev => ({ ...prev, [itemId]: nextQty }));

    if (isValid) {
      await updateQuantityBackend(itemId, nextQty);
      setError(null);
    } else {
      setError(`❌ ${item.DisplayName} harus ≥ ${min} dan kelipatan ${step}`);
    }
  };


  const totalQty = cartItems.reduce((sum, i) => sum + i.Quantity, 0);
  const totalWeight = cartItems.reduce((sum, i) => sum + (i.ItemCode.Weight || 0) * i.Quantity, 0);
  const totalHarga = cartItems.reduce((sum, i) => sum + (i.Price ?? 0) * i.Quantity, 0);

  const handleCheckout = () => {
    onClose();
    router.push('/checkout/checkoutpage');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50 w-96 bg-white border rounded-lg shadow-xl p-4">
      <h2 className="text-xl font-bold mb-4">Keranjang</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      {cartItems.length === 0 ? (
        <p className="text-gray-600">Keranjang Anda kosong.</p>
      ) : (
        <>
          <div className="max-h-64 overflow-y-auto space-y-4">
            {cartItems.map(item => {
              const allow = item.ItemCode.AllowItemCodeSelection;
              const qty = localQuantities[item.ItemCodeId] ?? item.Quantity;
              const min = item.ItemCode.MinOrderQuantity || 1;
              const step = item.ItemCode.OrderStep || 1;
              const totalItemHarga = (item.Price ?? 0) * qty;



              return (
                <div key={item.Id} className="border-b pb-2">
                  <h3 className="font-semibold">
                    {item.DisplayName}
                  </h3>
                  <p className="text-sm text-gray-500">Harga/unit: Rp {(item.Price ?? 0).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total: Rp {totalItemHarga.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Min: {min} | Step: {step}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      className="px-3 py-1 border rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(item.ItemCodeId, -step);
                      }}
                    >
                      -
                    </button>


                    <input
                      type="number"
                      value={qty}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => validateAndUpdate(item.ItemCodeId, Number(e.target.value))}
                      className="w-20 text-center border rounded px-2 py-1"
                    />


                    <button
                      type="button"
                      className="px-3 py-1 border rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuantityChange(item.ItemCodeId, step);
                      }}
                    >
                      +
                    </button>


                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-gray-700 border-t pt-3">
            <p>Total Item: {totalQty}</p>
            <p>Total Harga: Rp {totalHarga.toLocaleString()}</p>

          </div>

          <button
            type="button"
            onClick={handleCheckout}
            className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Checkout Sekarang
          </button>

        </>
      )}
    </div>
  );
};

export default CartPopup;
