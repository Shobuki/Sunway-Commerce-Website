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
    if (orderRule.OrderStep && orderRule.OrderStep > 0 && quantity % orderRule.OrderStep !== 0) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {partNumbers.map((part, idx) => {
              const selected = selectedIdx === idx;
              return (
                <div
                  key={part.IdItemCode}
                  onClick={() => handleSelect(idx)}
                  className={
                    "w-full min-h-48 sm:min-h-56 md:min-h-[15rem] flex flex-col justify-between items-stretch text-left p-0 rounded-lg shadow-sm transition-all border-2 " +
                    (selected ? "border-red-600 bg-red-50" : "border-red-300 bg-white") +
                    " hover:shadow-md cursor-pointer"
                  }
                  style={{
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    position: 'relative'
                  }}
                >
                  {/* HEADER NAMA */}
                  <div
                    className="w-full bg-red-600 text-white font-semibold text-base text-center px-1 py-2 rounded-t-lg"
                    style={{
                      letterSpacing: '0.01em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={part.Name}
                  >
                    {part.Name}
                  </div>

                  {/* ISI ATAS */}
                  <div className="flex-1 flex flex-col justify-between px-4 pt-2 pb-0">
                    {/* LIST WAREHOUSE - TINGGI MAXIMAL DENGAN SCROLL */}
                    <ul className="text-xs text-gray-700 mb-1 max-h-20 overflow-y-auto">
                      {(part.StockResolved || []).map((s, i) => (
                        <li key={i}>
                          <span className="font-semibold">{s.warehouse}:</span> {Number(s.qty).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                    {/* HARGA DAN MIN/STEP, SELALU DI BAWAH DAN FIX HEIGHT */}
                    <div className="mt-2 flex flex-col justify-end min-h-[3.2rem]">
                      {(part.NormalPrice > 0 || part.WholesalePrice) ? (
                        <>
                          <div className="text-sm text-gray-700 font-medium leading-snug">
                            Harga: <span className="font-semibold">Rp{Number(part.NormalPrice).toLocaleString()}</span>
                          </div>
                          {part.WholesalePrice && part.MinQtyWholesale && part.MaxQtyWholesale && (
                            <div className="text-xs text-green-700 leading-snug">
                              Grosir {part.MinQtyWholesale}-{part.MaxQtyWholesale}: <span className="font-semibold">Rp{Number(part.WholesalePrice).toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-400 italic text-sm leading-snug">No price found</div>
                      )}
                      <div className="flex flex-row gap-4 text-xs text-gray-500 mt-1">
                        <span>Min: {part.MinOrderQuantity ?? '-'}</span>
                        <span>Step: {part.OrderStep && part.OrderStep > 0 ? part.OrderStep : '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER BAWAH: QTY FULL */}
                  <div className="flex justify-center items-center px-4 pb-3 w-full min-h-[38px]">
                    {selected ? (
                      <div
                        className="flex items-center justify-center w-full bg-white/90 rounded px-2 py-1 shadow"
                        style={{ maxWidth: 210, margin: '0 auto' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            let nextQty = quantity - stepOrder;
                            if (nextQty < minOrder) nextQty = minOrder;
                            setQuantity(nextQty);
                          }}
                          className="px-2 py-1 border border-red-600 rounded text-red-700 font-bold"
                          type="button"
                        >-</button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const manualQty = Number(e.target.value);
                            setQuantity(manualQty);
                          }}
                          className="px-2 py-1 border border-red-500 rounded w-20 sm:w-32 text-center text-black mx-1"
                          style={{ fontSize: "1rem" }}
                          step={stepOrder}
                          min={minOrder}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <button
                          onClick={() => {
                            let nextQty = quantity < minOrder ? minOrder : quantity + stepOrder;
                            setQuantity(nextQty);
                          }}
                          className="px-2 py-1 border border-red-600 rounded text-red-700 font-bold"
                          type="button"
                        >+</button>
                      </div>
                    ) : (
                      <div className="min-h-[36px] w-full"></div>
                    )}
                  </div>
                </div>
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
