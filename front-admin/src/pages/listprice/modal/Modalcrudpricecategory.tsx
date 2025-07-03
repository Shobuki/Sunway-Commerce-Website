import React, { useEffect, useState } from "react";
import axios from "axios";

interface PriceCategory {
  Id: number;
  Name: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalCrudPriceCategory: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPriceCategories();
    }
  }, [isOpen]);

  const fetchPriceCategories = async () => {
    try {
      const response = await axios.get("/api/admin/admin/pricecategory");
      setPriceCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching price categories:", error);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      await axios.post("/api/admin/admin/pricecategory", { Name: name });
      fetchPriceCategories();
      setName("");
      setError("");
    } catch (error) {
      console.error("Error creating price category:", error);
    }
  };

  const handleEdit = (category: PriceCategory) => {
    setName(category.Name);
    setEditId(category.Id);
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      await axios.put(`/api/admin/admin/pricecategory/${editId}`, { Name: name });
      fetchPriceCategories();
      setName("");
      setEditId(null);
      setError("");
    } catch (error) {
      console.error("Error updating price category:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/admin/pricecategory/${id}`);
      fetchPriceCategories();
    } catch (error) {
      console.error("Error deleting price category:", error);
    }
  };

  const closeModal = () => {
    setName("");
    setEditId(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editId ? "Edit Price Category" : "Manage Price Categories"}</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Input Field */}
        <div className="flex flex-col gap-4 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg p-2 w-full"
            placeholder="Enter category name"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mb-4">
          {editId ? (
            <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Update
            </button>
          ) : (
            <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Create
            </button>
          )}
          <button onClick={closeModal} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Cancel
          </button>
        </div>

        {/* Category List */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priceCategories.map((category) => (
                <tr key={category.Id}>
                  <td className="px-6 py-4">{category.Name}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.Id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ModalCrudPriceCategory;
