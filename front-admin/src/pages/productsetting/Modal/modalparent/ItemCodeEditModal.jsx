import React, { useState, useEffect } from "react";
import axios from "axios";

const ItemCodeEditModal = ({ isOpen, onClose, onSave, productId }) => {  // ✅ Pastikan ID dikirim dengan benar
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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [partNumbers, setPartNumbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      fetchAllData();
      fetchItemCodeImages();
    }
  }, [isOpen, productId]);

  const fetchAllData = async () => {
    try {
      await Promise.all([fetchBrands(), fetchPartNumbers()]);

      // Ambil detail ItemCode berdasarkan `productId`
      const itemCodeResponse = await axios.get(
        `/api/admin/admin/products/item-codes/${productId}`
      );

      if (itemCodeResponse.data?.data) {
        const itemCode = itemCodeResponse.data.data;

        // Cari PartNumber yang sesuai
        const selectedPart = partNumbers.find(
          (p) => p.Id.toString() === itemCode.PartNumberId?.toString()
        );

        setFormData({
          ...itemCode,
          BrandCodeId: itemCode.BrandCodeId?.toString() || "",
          Weight: itemCode.Weight?.toString() || "",
          PartNumberId: itemCode.PartNumberId?.toString() || "",
          partNumberName: selectedPart?.Name || "Select Part Number",
          AllowItemCodeSelection: itemCode.AllowItemCodeSelection ?? false,
          MinOrderQuantity: itemCode.MinOrderQuantity?.toString() || "",
          OrderStep: itemCode.OrderStep?.toString() || ""
        });

      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data, silakan coba lagi");
    }
  };

  const fetchPartNumbers = async () => {
    try {
      const response = await axios.get(
        "/api/admin/admin/products/part-numbers"
      );

      setPartNumbers(response.data.data.flatMap(part =>
        part.PartNumber.length > 0
          ? part.PartNumber.map(subPart => ({
            Id: subPart.Id,
            Name: subPart.Name
          }))
          : []
      ));
    } catch (error) {
      console.error("Error fetching part numbers:", error);
      alert("Gagal memuat part numbers");
    }
  };


  // Fungsi untuk mendapatkan detail part number dari API
  const fetchPartNumberById = async (partNumberId) => {
    try {
      const response = await axios.get(
        `/api/admin/admin/products/item-codes/item/${partNumberId}`
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching part number:", error);
      return null;
    }
  };


  const fetchBrands = async () => {
    try {
      const response = await axios.get("/api/admin/admin/products/product-brands");
      const formattedBrands = response.data.data.map((brand) => ({
        Id: brand.Id,
        DisplayName: brand.ProductBrandName
          ? `${brand.ProductBrandCode} (${brand.ProductBrandName})`
          : brand.ProductBrandCode,
      }));
      setBrands(formattedBrands);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchItemCodeImages = async () => {
    if (!productId) {
      console.warn("fetchItemCodeImages called with undefined productId");
      return; // 🚀 Cegah request jika productId tidak valid
    }

    console.log("Fetching images for productId:", productId); // ✅ Debugging Log

    try {
      const response = await axios.get(
        `/api/admin/admin/products/item-codes/images/${productId}`
      );

      if (response.data?.data?.length > 0) {
        setImages(
          response.data.data.map((img) => ({
            Id: img.Id,
            ImageUrl: `/${img.ImageUrl}`, // ✅ Pastikan URL gambar benar
            CreatedAt: img.CreatedAt,
          }))
        );
      } else {
        console.warn("No images found for productId:", productId);
        setImages([]); // Jika tidak ada gambar, kosongkan daftar
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("No images found for productId:", productId);
        setImages([]); // Jika tidak ada gambar, kosongkan daftar
      } else {
        console.error("Error fetching item code images:", error);
      }
    }
  };



  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("ItemCodeId", productId);
    formData.append("image", file);

    try {
      setUploading(true);
      await axios.post("/api/admin/admin/products/item-codes/images", formData, {
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value === "" ? null : value });
  };


  const handleSubmit = async () => {
    if (!productId) {
      console.error("Product ID is missing");
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(
        `/api/admin/admin/products/item-codes/${productId}`,
        formData
      );

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
          </div>

          <div className="col-span-2 flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              name="AllowItemCodeSelection"
              checked={formData.AllowItemCodeSelection}
              onChange={(e) =>
                setFormData({ ...formData, AllowItemCodeSelection: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label className="font-medium">Allow ItemCode Selection (Dropdown)</label>
          </div>


        </div>


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
        </div>

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
                    onError={(e) => (e.target.src = "/images/default-placeholder.png")}
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
