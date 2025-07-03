import React, { useState, useEffect } from "react";
import axios from "axios";

const ItemCodeCreateModal = ({ isOpen, onClose, onSave, partNumberId }) => {
  const [formData, setFormData] = useState({
    Name: "",
    BrandCodeId: "",
    OEM: "",
    Weight: "",
    QtyOnHand: "",
    QtyPO: "",
  });

  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
    }
  }, [isOpen]);

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/api/admin/admin/products/product-brands");
      const brandsData = response.data.data || [];

      // Format nama brand menjadi "Code (Name)" jika nama tidak kosong
      const formattedBrands = brandsData.map((brand) => ({
        Id: brand.Id,
        DisplayName: brand.ProductBrandName
          ? `${brand.ProductBrandCode} (${brand.ProductBrandName})`
          : brand.ProductBrandCode, // Jika nama kosong, hanya tampilkan kode
      }));

      setBrands(formattedBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};
    
    if (!formData.Name.trim()) newErrors.Name = "Name is required";
   

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!partNumberId) {
      setErrors({ global: "PartNumber ID is missing." });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        "/api/admin/admin/products/item-codes",
        {
          PartNumberId: partNumberId,
          ...formData,
          BrandCodeId: formData.BrandCodeId ? parseInt(formData.BrandCodeId, 10) : null,
          Weight: formData.Weight ? parseFloat(formData.Weight) : null,
          QtyOnHand: formData.QtyOnHand ? parseInt(formData.QtyOnHand, 10) : 0,
          QtyPO: formData.QtyPO ? parseInt(formData.QtyPO, 10) : 0,
        }
      );

      if (response.status !== 201) {
        throw new Error(response.data.message || "Failed to create Item Code");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error creating Item Code:", err);
      setErrors({ global: err.response?.data?.message || "An error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white w-[90%] max-w-4xl p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create Item Code</h2>

        {errors.global && <p className="text-red-500">{errors.global}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Item Code</label>
            <input type="text" name="Name" value={formData.Name} onChange={handleInputChange} className="border p-2 w-full rounded" />
            {errors.Name && <p className="text-red-500 text-sm">{errors.Name}</p>}
          </div>
          <div>
            <label className="block font-medium">Brand</label>
            <select name="BrandCodeId" value={formData.BrandCodeId} onChange={handleInputChange} className="border p-2 w-full rounded">
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.Id} value={brand.Id}>
                  {brand.DisplayName}
                </option>
              ))}
            </select>
            {errors.BrandCodeId && <p className="text-red-500 text-sm">{errors.BrandCodeId}</p>}
          </div>
          <div>
            <label className="block font-medium">OEM</label>
            <input type="text" name="OEM" value={formData.OEM} onChange={handleInputChange} className="border p-2 w-full rounded" />
            {errors.OEM && <p className="text-red-500 text-sm">{errors.OEM}</p>}
          </div>
          <div>
            <label className="block font-medium">Weight (kg)</label>
            <input type="number" name="Weight" value={formData.Weight} onChange={handleInputChange} className="border p-2 w-full rounded" />
            {errors.Weight && <p className="text-red-500 text-sm">{errors.Weight}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCodeCreateModal;
