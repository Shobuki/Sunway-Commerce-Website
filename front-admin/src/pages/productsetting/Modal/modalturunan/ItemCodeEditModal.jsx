import React, { useState, useEffect } from "react";
import axios from "axios";

const ItemCodeEditModal = ({ isOpen, onClose, onSave, Id }) => {
  const [formData, setFormData] = useState({
    Name: "",
    BrandCodeId: "",
    OEM: "",
    Weight: "",
    PartNumberId: "",
    partNumberName: "Select Part Number",
    AllowItemCodeSelection: false,
    MinOrderQuantity: "",
    OrderStep: ""
  });

  const [brands, setBrands] = useState([]);
  const [partNumbers, setPartNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && Id) {
      fetchAllData();
      fetchItemCodeImages();
    }
    // eslint-disable-next-line
  }, [isOpen, Id]);

  const fetchAllData = async () => {
  try {
    const [brandsResult, partNumbersResult] = await Promise.all([fetchBrands(), fetchPartNumbers()]);
    const response = await axios.get(`/api/admin/admin/products/item-codes/${Id}`);
    const data = response.data.data;

    // Pakai hasil partNumbersResult (bukan state)
    const flatPartNumbers = partNumbersResult || [];
    const selectedPart = flatPartNumbers.find(
      (p) => p.Id.toString() === data.PartNumberId?.toString()
    );

    setFormData({
      Name: data.Name || "",
      BrandCodeId: data.BrandCodeId ? data.BrandCodeId.toString() : "",
      OEM: data.OEM || "",
      Weight: data.Weight ? data.Weight.toString() : "",
      PartNumberId: data.PartNumberId ? data.PartNumberId.toString() : "",
      partNumberName: selectedPart?.Name || "Select Part Number",
      AllowItemCodeSelection: data.AllowItemCodeSelection ?? false,
      MinOrderQuantity: data.MinOrderQuantity?.toString() || "",
      OrderStep: data.OrderStep?.toString() || "",
    });

    // update brands & partNumbers state
    setBrands(brandsResult);
    setPartNumbers(flatPartNumbers);
  } catch (error) {
    console.error("Error fetching Item Code details:", error);
  }
};

 const fetchBrands = async () => {
  try {
    const response = await axios.get("/api/admin/admin/products/product-brands");
    return response.data.data.map((brand) => ({
      Id: brand.Id,
      DisplayName: brand.ProductBrandName
        ? `${brand.ProductBrandCode} (${brand.ProductBrandName})`
        : brand.ProductBrandCode,
    }));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
};

  const fetchPartNumbers = async () => {
  try {
    const response = await axios.get("/api/admin/admin/products/part-numbers");
    return response.data.data.flatMap(part =>
      part.PartNumber.length > 0
        ? part.PartNumber.map(subPart => ({
            Id: subPart.Id,
            Name: subPart.Name
          }))
        : []
    );
  } catch (error) {
    console.error("Error fetching part numbers:", error);
    return [];
  }
};

  const fetchItemCodeImages = async () => {
    if (!Id) return;
    try {
      const response = await axios.get(`/api/admin/admin/products/item-codes/images/${Id}`);
      if (response.data?.data?.length > 0) {
        setImages(response.data.data.map((img) => ({
          Id: img.Id,
          ImageUrl: `/${img.ImageUrl}`,
          CreatedAt: img.CreatedAt,
        })));
      } else {
        setImages([]);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setImages([]);
      } else {
        console.error("Error fetching item code images:", error);
      }
    }
  };

  // Update part number name ketika data partNumbers berubah
  useEffect(() => {
    if (formData.PartNumberId && partNumbers.length > 0) {
      const selectedPart = partNumbers.find(
        p => p.Id.toString() === formData.PartNumberId
      );
      if (selectedPart) {
        setFormData(prev => ({
          ...prev,
          partNumberName: selectedPart.Name
        }));
      }
    }
  }, [partNumbers, formData.PartNumberId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Image Upload
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uploadForm = new FormData();
    uploadForm.append("ItemCodeId", Id);
    uploadForm.append("image", file);

    try {
      setUploading(true);
      await axios.post("/api/admin/admin/products/item-codes/images", uploadForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchItemCodeImages();
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await axios.delete(`/api/admin/admin/products/item-codes/images/${imageId}`);
      setImages(images.filter(img => img.Id !== imageId));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.Name.trim()) newErrors.Name = "Item Code is required";
    if (!formData.PartNumberId) newErrors.PartNumberId = "Part Number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await axios.put(`/api/admin/admin/products/item-codes/${Id}`, {
        ...formData,
        BrandCodeId: formData.BrandCodeId ? parseInt(formData.BrandCodeId, 10) : null,
        Weight: formData.Weight ? parseFloat(formData.Weight) : null,
        PartNumberId: formData.PartNumberId ? parseInt(formData.PartNumberId, 10) : null,
        MinOrderQuantity: formData.MinOrderQuantity ? parseInt(formData.MinOrderQuantity, 10) : null,
        OrderStep: formData.OrderStep ? parseInt(formData.OrderStep, 10) : null,
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating Item Code:", error);
      alert("Failed to update Item Code.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPartNumbers = partNumbers
    .filter(part =>
      part.Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.Name.localeCompare(b.Name));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white w-[90%] max-w-4xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Item Code</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Item Code</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
            />
            {errors.Name && <p className="text-red-500 text-sm">{errors.Name}</p>}
          </div>
          <div>
            <label className="block font-medium">Brand</label>
            <select
              name="BrandCodeId"
              value={formData.BrandCodeId}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
            >
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
            <input
              type="text"
              name="OEM"
              value={formData.OEM}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
            />
            {errors.OEM && <p className="text-red-500 text-sm">{errors.OEM}</p>}
          </div>
          <div>
            <label className="block font-medium">Weight (kg)</label>
            <input
              type="number"
              name="Weight"
              value={formData.Weight}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
            />
            {errors.Weight && <p className="text-red-500 text-sm">{errors.Weight}</p>}
          </div>
          <div>
            <label className="block font-medium">Minimum Order Quantity</label>
            <input
              type="number"
              name="MinOrderQuantity"
              value={formData.MinOrderQuantity}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              min="1"
            />
            {errors.MinOrderQuantity && <p className="text-red-500 text-sm">{errors.MinOrderQuantity}</p>}
          </div>
          <div>
            <label className="block font-medium">Order Step (Kelipatan)</label>
            <input
              type="number"
              name="OrderStep"
              value={formData.OrderStep}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              min="1"
            />
            {errors.OrderStep && <p className="text-red-500 text-sm">{errors.OrderStep}</p>}
          </div>
          <div className="col-span-2 flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              name="AllowItemCodeSelection"
              checked={formData.AllowItemCodeSelection}
              onChange={handleInputChange}
              className="w-4 h-4"
            />
            <label className="font-medium">Allow ItemCode Selection (Dropdown)</label>
          </div>
        </div>

        {/* Dropdown Part Number */}
        <div className="relative w-full mt-4">
          <label className="block font-medium">Part Number</label>
          <div className="relative">
            <div
              className="border p-2 rounded-lg w-full cursor-pointer bg-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {formData.partNumberName}
            </div>
            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Cari Part Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredPartNumbers.length === 0 ? (
                    <div className="p-2 text-gray-500">Tidak ditemukan</div>
                  ) : (
                    filteredPartNumbers.map((part) => (
                      <div
                        key={part.Id}
                        className="p-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            PartNumberId: part.Id.toString(),
                            partNumberName: part.Name,
                          }));
                          setIsDropdownOpen(false);
                        }}
                      >
                        {part.Name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {errors.PartNumberId && <p className="text-red-500 text-sm">{errors.PartNumberId}</p>}
        </div>

        {/* Upload Images */}
        <div className="mt-4">
          <label className="block font-medium">Upload Item Code Image</label>
          <input type="file" className="border p-2 w-full rounded" onChange={handleUpload} disabled={uploading} />
        </div>
        <div className="mt-4">
          <h3 className="font-bold">Uploaded Images:</h3>
          {images.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.Id} className="relative group">
                  <img
                    src={image.ImageUrl}
                    alt="Item Code"
                    className="w-full h-32 object-contain rounded-md shadow-md"
                  />
                  <button
                    onClick={() => handleDelete(image.Id)}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm rounded-md opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No images available.</p>
          )}
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

export default ItemCodeEditModal;
