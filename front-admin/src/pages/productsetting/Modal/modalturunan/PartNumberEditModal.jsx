import React, { useState, useEffect } from "react";
import axios from "axios";

const PartNumberEditModal = ({ isOpen, onClose, onSave, partNumberId, productId }) => {
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Dash: "",
    InnerDiameter: "",
    OuterDiameter: "",
    WorkingPressure: "",
    BurstingPressure: "",
    BendingRadius: "",
    HoseWeight: "",
  });

  const [unit, setUnit] = useState({
    innerDiameterUnit: "mm",
    outerDiameterUnit: "mm",
    workingPressureUnit: "psi",
    burstPressureUnit: "psi",
    bendRadiusUnit: "mm",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // --- GANTI LOGIKA FETCH HANYA DARI LIST ---
  useEffect(() => {
    if (isOpen && partNumberId) {
      setIsLoading(true);
      fetchPartNumberDetails(partNumberId);
    }
  }, [isOpen, partNumberId]);

  // Hanya fetch sekali dari /part-numbers lalu ambil PartNumber by Id
  const fetchPartNumberDetails = async (id) => {
    try {
      const res = await axios.get("/api/admin/admin/products/part-numbers");
      const allProducts = res.data.data || [];
      // flatten all part numbers across all products
      const allPartNumbers = allProducts.flatMap(prod =>
        (prod.PartNumber || []).map(part => ({
          ...part,
          ProductId: prod.Id, // ini benar
          ProductName: prod.Name
        }))
      );
      const partNumber = allPartNumbers.find(pn => pn.Id === Number(id));
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
          ProductId: partNumber.ProductId || "",  // **Tambahkan Ini**
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


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    setUnit((prevUnit) => ({
      ...prevUnit,
      [name]: value,
    }));

    if (name === "innerDiameterUnit" && formData.InnerDiameter) {
      setFormData((prevData) => ({
        ...prevData,
        InnerDiameter:
          value === "inch"
            ? (prevData.InnerDiameter / 25.4).toFixed(2)
            : (prevData.InnerDiameter * 25.4).toFixed(2),
      }));
    } else if (name === "workingPressureUnit" && formData.WorkingPressure) {
      setFormData((prevData) => ({
        ...prevData,
        WorkingPressure:
          value === "bar"
            ? (prevData.WorkingPressure / 14.5038).toFixed(2)
            : (prevData.WorkingPressure * 14.5038).toFixed(2),
      }));
    } else if (name === "outerDiameterUnit" && formData.OuterDiameter) {
      setFormData((prevData) => ({
        ...prevData,
        OuterDiameter:
          value === "inch"
            ? (prevData.OuterDiameter / 25.4).toFixed(2)
            : (prevData.OuterDiameter * 25.4).toFixed(2),
      }));
    }
    else if (name === "burstPressureUnit" && formData.BurstingPressure) {
      setFormData((prevData) => ({
        ...prevData,
        BurstingPressure:
          value === "bar"
            ? (prevData.BurstingPressure / 14.5038).toFixed(2)
            : (prevData.BurstingPressure * 14.5038).toFixed(2),
      }));
    } else if (name === "bendRadiusUnit" && formData.BendingRadius) {
      setFormData((prevData) => ({
        ...prevData,
        BendingRadius:
          value === "inch"
            ? (prevData.BendingRadius / 25.4).toFixed(2)
            : (prevData.BendingRadius * 25.4).toFixed(2),
      }));
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleSubmit = async () => {
  if (!partNumberId || !formData.ProductId) {
    setError("Missing PartNumberId or ProductId.");
    return;
  }
  setIsLoading(true);
  setError("");

  try {
    const response = await axios.put(
      `/api/admin/admin/products/part-numbers`,
      {
        Id: partNumberId,
        ProductId: formData.ProductId,
        Name: formData.Name,
        Description: formData.Description,
        Dash: formData.Dash,
        InnerDiameter: formData.InnerDiameter,
        OuterDiameter: formData.OuterDiameter,
        WorkingPressure: formData.WorkingPressure,
        BurstingPressure: formData.BurstingPressure,
        BendingRadius: formData.BendingRadius,
        HoseWeight: formData.HoseWeight,
      }
    );

    if (response.status !== 200) {
      throw new Error(response.data.message || "Failed to update Part Number");
    }

    setShowSuccessToast(true); // Tampilkan toast
    setTimeout(() => setShowSuccessToast(false), 2500); // Sembunyikan setelah 2.5 detik

    onSave();
    onClose();
  } catch (err) {
    console.error("Error updating part number:", err);
    setError(err.response?.data?.message || "An error occurred while updating.");
  } finally {
    setIsLoading(false);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white w-[90%] max-w-5xl p-6 rounded-lg shadow-lg overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Edit Part Number</h2>
        <div className="flex justify-between gap-4">
          <div className="w-1/2">
            <h3 className="font-semibold">Part Specifications</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-medium">Name</label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block font-medium">Description</label>
                <input
                  type="text"
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block font-medium">Dash</label>
                <input
                  type="number"
                  name="Dash"
                  value={formData.Dash}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block font-medium">Inner Diameter</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="InnerDiameter"
                    value={formData.InnerDiameter}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <select
                    name="innerDiameterUnit"
                    value={unit.innerDiameterUnit}
                    onChange={handleUnitChange}
                    className="border rounded p-2"
                  >
                    <option value="mm">mm</option>
                    <option value="inch">inch</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium">Outer Diameter</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="OuterDiameter"
                    value={formData.OuterDiameter}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <select
                    name="outerDiameterUnit"
                    value={unit.outerDiameterUnit}
                    onChange={handleUnitChange}
                    className="border rounded p-2"
                  >
                    <option value="mm">mm</option>
                    <option value="inch">inch</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/2">
            <h3 className="font-semibold">Pressure and Weight</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-medium">Max Working Pressure</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="WorkingPressure"
                    value={formData.WorkingPressure}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <select
                    name="workingPressureUnit"
                    value={unit.workingPressureUnit}
                    onChange={handleUnitChange}
                    className="border rounded p-2"
                  >
                    <option value="psi">psi</option>
                    <option value="bar">bar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium">Min Burst Pressure</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="BurstingPressure"
                    value={formData.BurstingPressure}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <select
                    name="burstPressureUnit"
                    value={unit.burstPressureUnit}
                    onChange={handleUnitChange}
                    className="border rounded p-2"
                  >
                    <option value="psi">psi</option>
                    <option value="bar">bar</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium">Min Bend Radius</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="BendingRadius"
                    value={formData.BendingRadius}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full"
                  />
                  <select
                    name="bendRadiusUnit"
                    value={unit.bendRadiusUnit}
                    onChange={handleUnitChange}
                    className="border rounded p-2"
                  >
                    <option value="mm">mm</option>
                    <option value="inch">inch</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium">Hose Weight (kg/m)</label>
                <input
                  type="number"
                  name="HoseWeight"
                  value={formData.HoseWeight}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

    </div>
  );
};

export default PartNumberEditModal;
