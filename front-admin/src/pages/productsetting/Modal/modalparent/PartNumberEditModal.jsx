import React, { useState, useEffect } from "react";
import axios from "axios";

const PartNumberEditModal = ({ isOpen, onClose, onSave, partNumberId }) => {
  const [formData, setFormData] = useState({
    Id: "",
    Name: "",
    Description: "",
    Dash: "",
    InnerDiameter: "",
    OuterDiameter: "",
    WorkingPressure: "",
    BurstingPressure: "",
    BendingRadius: "",
    HoseWeight: "",
    ProductId: "",
    productName: "Select Product"
  });

  // Satuan untuk kolom yang perlu dropdown
  const [unit, setUnit] = useState({
    innerDiameterUnit: "mm",
    outerDiameterUnit: "mm",
    workingPressureUnit: "psi",
    burstPressureUnit: "psi",
    bendRadiusUnit: "mm",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debugging untuk memastikan `Id` diterima
  useEffect(() => {
    if (isOpen && partNumberId) {
      fetchPartNumberDetails(partNumberId);
      fetchProducts();
    }
  }, [isOpen, partNumberId]);

  const fetchPartNumberDetails = async (id) => {
  try {
    const res = await axios.get(`/api/admin/admin/products/part-numbers/${id}`);
    const partNumber = res.data.data;
    if (partNumber) {
      setFormData({
        Name: partNumber.Name || "",
        Description: partNumber.Description || "",
        Dash: partNumber.Dash || "",
        InnerDiameter: partNumber.InnerDiameter || "",
        OuterDiameter: partNumber.OuterDiameter || "",
        WorkingPressure: partNumber.WorkingPressure || "",
        BurstingPressure: partNumber.BurstingPressure || "",
        BendingRadius: partNumber.BendingRadius || "",
        HoseWeight: partNumber.HoseWeight || "",
        ProductId: partNumber.ProductId || "",  // <-- tambahkan ProductId
      });
    } else {
      setError("Part number not found.");
    }
  } catch (err) {
    setError("Failed to load part number details.");
    console.error("Error fetching part numbers:", err);
  } finally {
    setIsLoading(false);
  }
};

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/admin/admin/products/part-numbers");
      const productList = response.data.data.map(product => ({
        Id: product.Id,
        Name: product.Name
      }));
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products.");
    }
  };

  const fetchProductById = async (productId) => {
    if (!productId) return null;
    try {
      const response = await axios.get(`/api/admin/admin/products/part-numbers/products/${productId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      return null;
    }
  };

  // Konversi saat unit diubah
  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    setUnit((prevUnit) => ({
      ...prevUnit,
      [name]: value,
    }));

    // Diameter (mm <-> inch)
    if (name === "innerDiameterUnit" && formData.InnerDiameter) {
      setFormData((prev) => ({
        ...prev,
        InnerDiameter:
          value === "inch"
            ? (parseFloat(prev.InnerDiameter) / 25.4).toFixed(2)
            : (parseFloat(prev.InnerDiameter) * 25.4).toFixed(2),
      }));
    } else if (name === "outerDiameterUnit" && formData.OuterDiameter) {
      setFormData((prev) => ({
        ...prev,
        OuterDiameter:
          value === "inch"
            ? (parseFloat(prev.OuterDiameter) / 25.4).toFixed(2)
            : (parseFloat(prev.OuterDiameter) * 25.4).toFixed(2),
      }));
    }
    // Pressure (psi <-> bar)
    else if (name === "workingPressureUnit" && formData.WorkingPressure) {
      setFormData((prev) => ({
        ...prev,
        WorkingPressure:
          value === "bar"
            ? (parseFloat(prev.WorkingPressure) / 14.5038).toFixed(2)
            : (parseFloat(prev.WorkingPressure) * 14.5038).toFixed(2),
      }));
    } else if (name === "burstPressureUnit" && formData.BurstingPressure) {
      setFormData((prev) => ({
        ...prev,
        BurstingPressure:
          value === "bar"
            ? (parseFloat(prev.BurstingPressure) / 14.5038).toFixed(2)
            : (parseFloat(prev.BurstingPressure) * 14.5038).toFixed(2),
      }));
    }
    // Bend Radius (mm <-> inch)
    else if (name === "bendRadiusUnit" && formData.BendingRadius) {
      setFormData((prev) => ({
        ...prev,
        BendingRadius:
          value === "inch"
            ? (parseFloat(prev.BendingRadius) / 25.4).toFixed(2)
            : (parseFloat(prev.BendingRadius) * 25.4).toFixed(2),
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

 const handleSubmit = async () => {
  if (!partNumberId || !formData.ProductId) {
    setError("Missing PartNumberId or ProductId.");
    return;
  }
  setIsLoading(true);
  setError("");
  // pastikan satuan sesuai (mm/psi)
  const payload = {
    Id: Number(partNumberId),
    ProductId: Number(formData.ProductId),
    Name: formData.Name || null,
    Description: formData.Description || null,
    Dash: formData.Dash ? Number(formData.Dash) : null,
    InnerDiameter: unit.innerDiameterUnit === "mm" ? parseFloat(formData.InnerDiameter) : parseFloat(formData.InnerDiameter) * 25.4,
    OuterDiameter: unit.outerDiameterUnit === "mm" ? parseFloat(formData.OuterDiameter) : parseFloat(formData.OuterDiameter) * 25.4,
    WorkingPressure: unit.workingPressureUnit === "psi" ? parseFloat(formData.WorkingPressure) : parseFloat(formData.WorkingPressure) * 14.5038,
    BurstingPressure: unit.burstPressureUnit === "psi" ? parseFloat(formData.BurstingPressure) : parseFloat(formData.BurstingPressure) * 14.5038,
    BendingRadius: unit.bendRadiusUnit === "mm" ? parseFloat(formData.BendingRadius) : parseFloat(formData.BendingRadius) * 25.4,
    HoseWeight: formData.HoseWeight ? parseFloat(formData.HoseWeight) : null,
  };

  try {
    await axios.put("/api/admin/admin/products/part-numbers", payload);
    onSave();
    onClose();
  } catch (err) {
    console.error("Error updating part number:", err);
    setError("An error occurred while updating.");
  } finally {
    setIsLoading(false);
  }
};

  const filteredProducts = products
    .filter(product =>
      product.Name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.Name.localeCompare(b.Name));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white w-[90%] max-w-5xl p-6 rounded-lg shadow-lg overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Edit Part Number</h2>
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Name</label>
            <input type="text" name="Name" value={formData.Name} onChange={handleInputChange} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium">Description</label>
            <input type="text" name="Description" value={formData.Description} onChange={handleInputChange} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium">Dash</label>
            <input type="number" name="Dash" value={formData.Dash} onChange={handleInputChange} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block font-medium">Inner Diameter</label>
            <div className="flex items-center gap-2">
              <input type="number" name="InnerDiameter" value={formData.InnerDiameter} onChange={handleInputChange} className="border rounded p-2 w-full" />
              <select name="innerDiameterUnit" value={unit.innerDiameterUnit} onChange={handleUnitChange} className="border rounded p-2">
                <option value="mm">mm</option>
                <option value="inch">inch</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium">Outer Diameter</label>
            <div className="flex items-center gap-2">
              <input type="number" name="OuterDiameter" value={formData.OuterDiameter} onChange={handleInputChange} className="border rounded p-2 w-full" />
              <select name="outerDiameterUnit" value={unit.outerDiameterUnit} onChange={handleUnitChange} className="border rounded p-2">
                <option value="mm">mm</option>
                <option value="inch">inch</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium">Max Working Pressure</label>
            <div className="flex items-center gap-2">
              <input type="number" name="WorkingPressure" value={formData.WorkingPressure} onChange={handleInputChange} className="border rounded p-2 w-full" />
              <select name="workingPressureUnit" value={unit.workingPressureUnit} onChange={handleUnitChange} className="border rounded p-2">
                <option value="psi">psi</option>
                <option value="bar">bar</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium">Min Burst Pressure</label>
            <div className="flex items-center gap-2">
              <input type="number" name="BurstingPressure" value={formData.BurstingPressure} onChange={handleInputChange} className="border rounded p-2 w-full" />
              <select name="burstPressureUnit" value={unit.burstPressureUnit} onChange={handleUnitChange} className="border rounded p-2">
                <option value="psi">psi</option>
                <option value="bar">bar</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium">Min Bend Radius</label>
            <div className="flex items-center gap-2">
              <input type="number" name="BendingRadius" value={formData.BendingRadius} onChange={handleInputChange} className="border rounded p-2 w-full" />
              <select name="bendRadiusUnit" value={unit.bendRadiusUnit} onChange={handleUnitChange} className="border rounded p-2">
                <option value="mm">mm</option>
                <option value="inch">inch</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium">Hose Weight (kg/m)</label>
            <input type="number" name="HoseWeight" value={formData.HoseWeight} onChange={handleInputChange} className="border rounded p-2 w-full" />
          </div>
        </div>

        {/* Dropdown Product */}
        <div className="relative w-full mt-4">
          <label className="block font-medium">Product</label>
          <div className="relative">
            <div className="border p-2 rounded-lg w-full cursor-pointer bg-white" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {formData.productName}
            </div>
            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg">
                <div className="p-2 border-b">
                  <input type="text" placeholder="Cari Product..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md focus:outline-none" autoFocus />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-2 text-gray-500">Tidak ditemukan</div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div key={product.Id} className="p-2 hover:bg-blue-50 cursor-pointer" onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          ProductId: product.Id.toString(),
                          productName: product.Name
                        }));
                        setIsDropdownOpen(false);
                      }}>{product.Name}</div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartNumberEditModal;
