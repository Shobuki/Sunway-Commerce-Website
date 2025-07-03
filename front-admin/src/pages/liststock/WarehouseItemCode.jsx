import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import axios from "@/utils/axios";

const WarehouseItemCode = ({
    itemCode,
    isOpen,
    onClose,
    allWarehouses = [],
    onAnyChange,
}) => {
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [loading, setLoading] = useState(false);

    // Selalu sync saat modal dibuka/ubah item
    useEffect(() => {
        if (itemCode?.WarehouseStocks) {
            setWarehouses(itemCode.WarehouseStocks.filter(ws => ws.DeletedAt === null));
        } else {
            setWarehouses([]);
        }
        setSelectedWarehouseId("");
    }, [itemCode, isOpen]);

    // Tambah relasi warehouse ke itemcode
    const handleAdd = async () => {
        if (!selectedWarehouseId) return;
        setLoading(true);
        try {
            const res = await axios.post("/api/admin/admin/products/warehouses/itemcode/add", {
                WarehouseId: Number(selectedWarehouseId),
                ItemCodeId: itemCode.Id
            });
            // Tambahkan manual ke state lokal
            const wh = allWarehouses.find(w => w.Id === Number(selectedWarehouseId));
            setWarehouses([
                ...warehouses,
                {
                    WarehouseId: Number(selectedWarehouseId),
                    Warehouse: wh,
                    QtyOnHand: 0,
                }
            ]);
            setSelectedWarehouseId("");
            if (onAnyChange) onAnyChange(); // <- tambahkan baris ini
        } finally {
            setLoading(false);
        }
    };

    // Hapus relasi warehouse dari itemcode
    const handleDelete = async (warehouseId) => {
        setLoading(true);
        try {
            await axios.delete("/api/admin/admin/products/warehouses/itemcode/remove", {
                data: { WarehouseId: warehouseId, ItemCodeId: itemCode.Id }
            });
            setWarehouses(warehouses.filter(w => w.WarehouseId !== warehouseId));
            if (onAnyChange) onAnyChange(); // <- tambahkan baris ini
        } finally {
            setLoading(false);
        }
    };


    // Filter warehouse yang belum terhubung ke itemcode ini
    const warehousesLinkedIds = warehouses.map(w => w.WarehouseId);
    const availableWarehouses = allWarehouses.filter(
        wh => !warehousesLinkedIds.includes(wh.Id)
    );

    if (!isOpen || !itemCode) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-600 hover:text-red-600" onClick={onClose}>
                    <FiX size={22} />
                </button>
                <h2 className="text-xl font-bold mb-4">Manage Warehouse for <span className="text-blue-600">{itemCode.Name}</span></h2>

                <div className="mb-4 flex gap-2">
                    <select
                        className="border px-2 py-1 rounded w-full"
                        value={selectedWarehouseId}
                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Pilih Warehouse</option>
                        {availableWarehouses.map((wh) => (
                            <option key={wh.Id} value={wh.Id}>
                                {wh.Name} ({wh.BusinessUnit})
                            </option>
                        ))}
                    </select>
                    <button
                        className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-1 hover:bg-green-700 disabled:opacity-50"
                        disabled={!selectedWarehouseId || loading}
                        onClick={handleAdd}
                    >
                        <FiPlus /> Tambah
                    </button>
                </div>

                <div className="overflow-y-auto max-h-56 border rounded">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Warehouse</th>
                                <th className="p-2 text-left">Location</th>
                                <th className="p-2 text-left">BusinessUnit</th>
                                <th className="p-2 text-left"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.length === 0 ? (
                                <tr>
                                    <td className="p-2 text-gray-400" colSpan={4}>No warehouse linked</td>
                                </tr>
                            ) : (
                                warehouses.map((w) => (
                                    <tr key={w.WarehouseId}>
                                        <td className="p-2">{w.Warehouse?.Name || '-'}</td>
                                        <td className="p-2">{w.Warehouse?.Location || '-'}</td>
                                        <td className="p-2">{w.Warehouse?.BusinessUnit || '-'}</td>
                                        <td className="p-2">
                                            <button
                                                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                                onClick={() => handleDelete(w.WarehouseId)}
                                                disabled={loading}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-4">
                    <button className="px-4 py-2 border rounded hover:bg-gray-50" onClick={onClose}>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehouseItemCode;
