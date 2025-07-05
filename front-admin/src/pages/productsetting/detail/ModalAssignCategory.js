import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";

const ModalAssignCategory = ({
  isOpen,
  onClose,
  productId,
  initialCategoryId = null,
  productName = "",
  productDescription = "",
  productCodeName = "",
  onSuccess,
}) => {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(initialCategoryId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedId(initialCategoryId || null);
    fetchCategories();
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/admin/products/categories");
      setCategories(res.data.data || []);
    } catch (e) {
      setError("Gagal memuat daftar kategori.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await axios.put(`/api/admin/admin/products/main`, {
        id: productId,
        Name: productName, // harus dikirim!
        Description: productDescription,
        CodeName: productCodeName,
        ProductCategoryIds: selectedId ? [selectedId] : [],
      });
      if (onSuccess) onSuccess(selectedId);
      onClose();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
        "Gagal meng-assign kategori. Coba ulangi."
      );
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-30 inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <h3 className="text-lg font-semibold mb-3">Assign Category to Product</h3>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            {error && (
              <div className="mb-2 p-2 text-sm rounded bg-red-100 text-red-700 border border-red-200">
                {error}
              </div>
            )}
            <div className="mb-4">
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                value={categories
                  .map((cat) => ({
                    value: cat.Id,
                    label: cat.ParentCategory
                      ? `${cat.Name} (${cat.ParentCategory.Name})`
                      : cat.Name,
                  }))
                  .find((opt) => opt.value === selectedId) || null}
                onChange={(opt) => setSelectedId(opt ? opt.value : null)}
                options={categories.map((cat) => ({
                  value: cat.Id,
                  label: cat.ParentCategory
                    ? `${cat.Name} (${cat.ParentCategory.Name})`
                    : cat.Name,
                }))}
                placeholder="Select a category..."
                isClearable
                isSearchable
                menuPlacement="auto"
                noOptionsMessage={() => "No category found"}
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !selectedId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ModalAssignCategory;
