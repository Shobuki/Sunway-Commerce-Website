import React, { useEffect, useState } from 'react';

interface StockResolvedItem {
  warehouse: string;
  qty: number;
}

interface PartNumber {
  IdPartNumber: number;
  Name: string;
  AllowItemCodeSelection: boolean;
  IdItemCode: number;
  PriceResolved?: number;
  NormalPrice: number;
  WholesalePrice?: number | null;      // <--- tambahkan
  MinQtyWholesale?: number | null;     // <--- tambahkan
  MaxQtyWholesale?: number | null;     // <--- tambahkan
  MinOrderQuantity?: number;
  OrderStep?: number;
  IsWholesalePrice?: boolean;
  StockResolved: StockResolvedItem[];
}

const PopupChoose: React.FC<{ productId: number; onClose?: () => void }> = ({ productId, onClose }) => {
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [minOrder, setMinOrder] = useState(1);
  const [stepOrder, setStepOrder] = useState(1);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [customErrorMessage, setCustomErrorMessage] = useState<string | null>(null);

  const [finalItemCodeId, setFinalItemCodeId] = useState<number | null>(null);

  const [orderRule, setOrderRule] = useState<any>(null);
  const [loadingRule, setLoadingRule] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const token = sessionStorage.getItem('userToken');
      if (!token) return setError('Please login first.');

      try {
        const res = await fetch('/api/dealer/dealer/auth', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUserId(data.user.Id);
      } catch (err) {
        setError('Gagal mengambil profil pengguna');
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const token = sessionStorage.getItem('userToken');
      try {
        const res = await fetch(`/api/dealer/dealer/product/detail/options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId, userId })
        });
        const result = await res.json();
        if (Array.isArray(result.data)) {
          setPartNumbers(result.data);
          setError('');
        } else {
          setError('Data produk tidak ditemukan atau format salah.');
          setPartNumbers([]);
        }
      } catch (err) {
        setError('Gagal mengambil data produk');
        setPartNumbers([]);
      }
    };
    fetchData();
  }, [productId, userId]);

  // Fetch rules tiap kali ganti pilihan
 useEffect(() => {
  if (selectedIdx === null || partNumbers.length === 0) return;

  const fetchOrderRules = async () => {
    const itemCodeId = partNumbers[selectedIdx].IdItemCode;
    if (!itemCodeId) return;
    setLoadingRule(true);
    setOrderRule(null);
    setError(null);

    const token = sessionStorage.getItem('userToken');
    try {
      // HANYA kirim ItemCodeId dan Quantity, JANGAN UserId
      const res = await fetch('/api/dealer/dealer/cart/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ItemCodeId: itemCodeId, Quantity: quantity }),
      });
      const data = await res.json();

      if (!res.ok) {
        setOrderRule(null);
        setError(data?.Message || data?.message || 'Gagal mengambil aturan order');
        return;
      }

      setOrderRule(data);
      setMinOrder(data.MinOrderQuantity || 1);
      setStepOrder(data.OrderStep || 1);
      setError('');
    } catch {
      setOrderRule(null);
      setError('Gagal mengambil aturan order');
    } finally {
      setLoadingRule(false);
    }
  };
  fetchOrderRules();
}, [selectedIdx, quantity, partNumbers]);

  useEffect(() => {
    if (orderRule) {
      setMinOrder(orderRule.MinOrderQuantity || 1);
      setStepOrder(orderRule.OrderStep || 1);
      if (quantity < (orderRule.MinOrderQuantity || 1)) {
        setQuantity(orderRule.MinOrderQuantity || 1);
      }
    }
  }, [orderRule]);

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    setFinalItemCodeId(partNumbers[idx].IdItemCode);
    setQuantity(partNumbers[idx].MinOrderQuantity || 1);
    setError(null);
  };

   const addToCart = async () => {
    if (selectedIdx === null) {
      setError('Pilih produk terlebih dahulu');
      setShowFail(true);
      return;
    }
    // Cek orderRule dari backend
    if (!orderRule) {
      setError('Tidak dapat memproses, aturan order belum siap');
      setShowFail(true);
      return;
    }
    if (!orderRule.PriceValid) {
      setError(orderRule.Message || 'Harga tidak valid');
      setShowFail(true);
      return;
    }
    if (!orderRule.StockValid) {
      setError(orderRule.Message || 'Stok tidak cukup');
      setShowFail(true);
      return;
    }
    if (quantity < orderRule.MinOrderQuantity) {
      setError(`Kuantitas harus minimal ${orderRule.MinOrderQuantity}`);
      setShowFail(true);
      return;
    }
    if (quantity % orderRule.OrderStep !== 0) {
      setError(`Kuantitas harus kelipatan ${orderRule.OrderStep}`);
      setShowFail(true);
      return;
    }
    const token = sessionStorage.getItem('userToken');
    const itemCodeId = partNumbers[selectedIdx].IdItemCode;
    if (!itemCodeId) {
      setError('Item tidak valid');
      setShowFail(true);
      return;
    }
    const body = {
      UserId: userId,
      ItemCodeId: itemCodeId,
      Quantity: quantity,
      mode: 'set'
    };
    try {
      const res = await fetch('/api/dealer/dealer/cart/add-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          if (onClose) onClose();
        }, 1000);
      } else {
        setError(result.message || 'Gagal menambahkan ke keranjang');
        setShowFail(true);
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi.');
      setShowFail(true);
    }
  };


  // Responsive: grid mobile 1, sm 2, md 3, lg 4
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pilih Produk</h2>
      {error && <p className="text-red-600">{error}</p>}

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Pilih Variant/Part Number</h3>
        <div className="max-h-[65vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {partNumbers.map((part, idx) => {
              const selected = selectedIdx === idx;
              return (
                <button
                  key={part.IdItemCode}
                  onClick={() => handleSelect(idx)}
                  className={
                    "w-full h-48 sm:h-52 md:h-56 flex flex-col justify-start items-stretch text-left p-0 rounded-lg shadow-sm transition-all border-2 " +
                    (selected ? "border-red-600 bg-red-50" : "border-red-300 bg-white") +
                    " hover:shadow-md"
                  }
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                  }}
                >
                  {/* KOTAK JUDUL MERAH */}
                  <div
                    className="w-full rounded-t-lg rounded-b-lg bg-red-600 text-white font-semibold text-base text-center px-1 py-2"
                    style={{
                      borderTopLeftRadius: '0.5rem',
                      borderTopRightRadius: '0.5rem',
                      borderBottomLeftRadius: '0.5rem',
                      borderBottomRightRadius: '0.5rem',
                      marginBottom: '0.6rem',
                      minHeight: 38,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      letterSpacing: '0.01em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={part.Name}
                  >
                    {part.Name}
                  </div>

                  {/* ISI KONTEN */}
                  <div className="flex-1 flex flex-col justify-between px-3 pb-2 pt-0">
                    {/* HARGA */}
                    {/* HARGA */}
<div className="mb-1 text-sm text-gray-700 min-h-[2.3rem] flex flex-col gap-0.5">
  {(part.NormalPrice > 0 || part.WholesalePrice) ? (
    <>
      {/* Harga Normal */}
      {part.NormalPrice > 0 && (
        <span>
          <span className="font-medium">Harga:</span>&nbsp;
          <span className="font-semibold">Rp{Number(part.NormalPrice).toLocaleString()}</span>
        </span>
      )}
      {/* Harga Grosir */}
      {part.WholesalePrice && part.MinQtyWholesale && part.MaxQtyWholesale ? (
        <span className="text-xs text-green-700 mt-0.5">
          Harga grosir min pembelian {part.MinQtyWholesale}-{part.MaxQtyWholesale}:&nbsp;
          <span className="font-semibold">Rp{Number(part.WholesalePrice).toLocaleString()}</span>
        </span>
      ) : null}
    </>
  ) : (
    <span className="text-gray-400 italic">No price found</span>
  )}
</div>
                    {/* STOK */}
                    <ul className="text-xs text-gray-700 mb-2">
                      {(part.StockResolved || []).map((s, i) => (
                        <li key={i}>
                          <span className="font-semibold">{s.warehouse}:</span> {Number(s.qty).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                    {/* MIN/STEP */}
                    <div className="flex justify-between items-center w-full text-xs text-gray-500">
                      <span>Min: {part.MinOrderQuantity || 1}</span>
                      <span>Step: {part.OrderStep || 1}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kontrol Qty + Tombol */}
      {selectedIdx !== null && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Min Order: {minOrder} | Step: {stepOrder}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => {
                let nextQty = quantity - stepOrder;
                if (nextQty < minOrder) {
                  nextQty = minOrder;
                }
                setQuantity(nextQty);
              }}
              className="px-3 py-1 border border-red-600 rounded text-red-700 font-bold"
            >-</button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const manualQty = Number(e.target.value);
                setQuantity(manualQty);
              }}
              className="px-2 py-1 border border-red-500 rounded w-16 text-center text-black"
              step={stepOrder}
              min={minOrder}
            />
            <button
              onClick={() => {
                let nextQty = quantity < minOrder ? minOrder : quantity + stepOrder;
                setQuantity(nextQty);
              }}
              className="px-3 py-1 border border-red-600 rounded text-red-700 font-bold"
            >+</button>
          </div>
        </div>
      )}

      <button
  onClick={addToCart}
  disabled={!userId || selectedIdx === null || loadingRule || !orderRule || !orderRule.PriceValid || !orderRule.StockValid}
  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed w-full font-semibold mt-2"
>
  Tambahkan ke Keranjang
</button>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded p-6 shadow-lg text-center">
            <h3 className="text-green-600 text-lg font-bold mb-2">✅ Berhasil Ditambahkan</h3>
            <p className="mb-4">Item berhasil dimasukkan ke keranjang</p>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={() => setShowSuccess(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      {showFail && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded p-6 shadow-lg text-center">
            <h3 className="text-red-600 text-lg font-bold mb-2">❌ Gagal Menambahkan</h3>
            <p className="mb-4">Periksa kembali pilihan item dan kuantitas</p>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => setShowFail(false)}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}
      {customErrorMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded p-6 shadow-lg text-center">
            <h3 className="text-red-600 text-lg font-bold mb-2">❌ Stok Tidak Cukup</h3>
            <p className="mb-4">{customErrorMessage}</p>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => setCustomErrorMessage(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      {loadingRule ? (
        <div className="my-2 text-sm text-gray-500">Memuat aturan order...</div>
      ) : orderRule ? (
        <div>
  <span className="font-semibold">Harga:&nbsp;</span>
  {orderRule.MinQtyWholesale && orderRule.MaxQtyWholesale && orderRule.PriceSource === 'wholesale' ? (
    <>
      QTY grosir {orderRule.MinQtyWholesale}-{orderRule.MaxQtyWholesale} mendapat harga&nbsp;
      <span className="font-semibold">
        Rp{Number(orderRule.Price).toLocaleString()}
      </span>
      {orderRule.PriceSource && (
        <span className="text-xs text-gray-400 ml-2">({orderRule.PriceSource})</span>
      )}
      <br />
      harga normal {orderRule.NormalPrice
        ? `Rp${Number(orderRule.NormalPrice).toLocaleString()}`
        : "-"}
    </>
  ) : (
    <>
      harga normal&nbsp;
      <span className="font-semibold">
        Rp{Number(orderRule.Price).toLocaleString()}
      </span>
      {orderRule.PriceSource && (
        <span className="text-xs text-gray-400 ml-2">({orderRule.PriceSource})</span>
      )}
    </>
  )}
</div>
      ) : null}
    </div>
  );
};

export default PopupChoose;
