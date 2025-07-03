import React, { useState, useEffect } from 'react';
import axios from "@/utils/axios";

const WarehouseModal = ({ isOpen, onClose }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ Name: '', BusinessUnit: '', Location: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchWarehouses();
  }, [isOpen]);

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get('/api/admin/admin/products/warehouses');
      setWarehouses(res.data.data);
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  };

  const handleSubmit = async () => {
    if (!form.Name || !form.BusinessUnit || !form.Location) return;
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/admin/admin/products/warehouses/${editingId}`, form);
      } else {
        await axios.post('/api/admin/admin/products/warehouses', form);
      }
      setForm({ Name: '', BusinessUnit: '', Location: '' });
      setEditingId(null);
      fetchWarehouses();
    } catch (err) {
      console.error('Failed to save warehouse:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (warehouse) => {
    setForm({
      Name: warehouse.Name,
      BusinessUnit: warehouse.BusinessUnit,
      Location: warehouse.Location
    });
    setEditingId(warehouse.Id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await axios.delete(`/api/admin/admin/products/warehouses/${id}`);
      fetchWarehouses();
    } catch (err) {
      console.error('Failed to delete warehouse:', err);
    }
  };

  const lowerSearch = searchTerm.toLowerCase();

const filteredWarehouses = searchTerm.trim()
  ? warehouses.filter((w) =>
      (w.Name && w.Name.toLowerCase().includes(lowerSearch)) ||
      (w.Location && w.Location.toLowerCase().includes(lowerSearch)) ||
      (w.BusinessUnit && w.BusinessUnit.toLowerCase().includes(lowerSearch))
    )
  : warehouses; // jika tidak ada search, tampilkan semua




  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage Warehouses</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Name"
            value={form.Name}
            onChange={(e) => setForm({ ...form, Name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Business Unit"
            value={form.BusinessUnit}
            onChange={(e) => setForm({ ...form, BusinessUnit: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Location"
            value={form.Location}
            onChange={(e) => setForm({ ...form, Location: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setForm({ Name: '', BusinessUnit: '', Location: '' });
                setEditingId(null);
              }}
              className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">🔍 Search Warehouse</label>
          <input
            type="text"
            placeholder="e.g. Jakarta or Bandung"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Warehouse List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWarehouses.map((w) => (
            <div key={w.Id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="font-semibold text-lg">{w.Name}</div>
              <div className="text-sm text-gray-500 mb-1">📍 {w.Location}</div>
              <div className="text-sm text-gray-500 mb-3">🏢 BU: {w.BusinessUnit}</div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(w)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(w.Id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filteredWarehouses.length === 0 && (
            <div className="text-sm text-gray-500 col-span-full">No warehouses found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarehouseModal;
