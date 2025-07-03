import React, { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";

const EditStock = ({ item, onClose, onSave }) => {
  const [qtyPO, setQtyPO] = useState(item.QtyPO || 0);
  const [warehouseStocks, setWarehouseStocks] = useState(
    item.WarehouseStocks?.map(ws => ({
      WarehouseId: ws.WarehouseId,
      QtyOnHand: ws.QtyOnHand || 0,
      Warehouse: ws.Warehouse
    })) || []
  );
  const [warehouses, setWarehouses] = useState([]);
  const [searchWarehouse, setSearchWarehouse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingAccess, setLoadingAccess] = useState(true);
  const [menuAccess, setMenuAccess] = useState(null);

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
    
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await axios.get("/api/admin/admin/products/warehouses");
        setWarehouses(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch warehouses", error);
      }
    };
    fetchWarehouses();
  }, []);

  const handleAddWarehouse = (warehouseId) => {
    const selected = warehouses.find(w => w.Id === Number(warehouseId));
    if (!selected) return;
    const alreadyAdded = warehouseStocks.some(ws => ws.WarehouseId === selected.Id);
    if (alreadyAdded) return;

    setWarehouseStocks(prev => [
      ...prev,
      {
        WarehouseId: selected.Id,
        QtyOnHand: 0,
        Warehouse: selected,
      },
    ]);
  };

  const handleAdjustQty = (index, type) => {
    const newStocks = [...warehouseStocks];
    const adjust = type === 'increase' ? 1 : -1;
    newStocks[index].QtyOnHand = Math.max(0, newStocks[index].QtyOnHand + adjust);
    setWarehouseStocks(newStocks);
  };

  const handleQtyChange = (index, value) => {
    const newStocks = [...warehouseStocks];
    newStocks[index].QtyOnHand = Math.max(0, parseInt(value) || 0);
    setWarehouseStocks(newStocks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatePromises = warehouseStocks.map(ws =>
        axios.put(`/api/admin/admin/products/stock`, {
          ItemCodeId: item.Id,
          WarehouseId: ws.WarehouseId,
          QtyOnHand: ws.QtyOnHand,
          QtyPO: qtyPO,
        })
      );
      await Promise.all(updatePromises);
      await onSave();
      onClose();
    } catch (error) {
      console.error("Error updating stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Stock - {item.Name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Qty PO (ItemCode)</label>
              <input
                type="number"
                value={qtyPO}
                onChange={(e) => setQtyPO(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-32 px-3 py-2 border rounded-lg text-center"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Qty On Hand per Warehouse</label>
              {warehouseStocks.length === 0 ? (
                <div className="text-sm text-gray-500">Belum ada warehouse dipilih.</div>
              ) : (
                <div className="space-y-3">
                  {warehouseStocks.map((ws, index) => (
                    <div key={index} className="flex items-center justify-between border p-2 rounded">
                      <div>
                        <div className="font-medium">{ws.Warehouse?.Name || 'Unknown Warehouse'}</div>
                        <div className="text-xs text-gray-500">{ws.Warehouse?.Location || ''}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (ws.QtyOnHand === 0) {
                              setWarehouseStocks(prev => prev.filter((_, i) => i !== index));
                            } else {
                              handleAdjustQty(index, 'decrease');
                            }
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          title={ws.QtyOnHand === 0 ? "Remove warehouse" : "Decrease stock"}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={ws.QtyOnHand}
                          onChange={(e) => handleQtyChange(index, e.target.value)}
                          className="w-20 px-2 py-1 border rounded-lg text-center"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdjustQty(index, 'increase')}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStock;
