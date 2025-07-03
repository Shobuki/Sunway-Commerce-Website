import React, { useState, useEffect } from "react";
import axios from "axios";

const CreatePartNumberModal = ({ isOpen, onClose, onSave, productId }) => {
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

  useEffect(() => {
    if (!isOpen) {
      setFormData({
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
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    console.log("Received productId in CreatePartNumberModal:", productId);
  }, [productId]);

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

    const conversionFactor = {
      mmToInch: 25.4,
      psiToBar: 14.5038,
    };

    if (name === "innerDiameterUnit" && formData.InnerDiameter) {
      setFormData((prevData) => ({
        ...prevData,
        InnerDiameter:
          value === "inch"
            ? (prevData.InnerDiameter / conversionFactor.mmToInch).toFixed(2)
            : (prevData.InnerDiameter * conversionFactor.mmToInch).toFixed(2),
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
    else if (name === "bendRadiusUnit" && formData.BendingRadius) {
      setFormData((prevData) => ({
        ...prevData,
        BendingRadius:
          value === "inch"
            ? (prevData.BendingRadius / conversionFactor.mmToInch).toFixed(2)
            : (prevData.BendingRadius * conversionFactor.mmToInch).toFixed(2),
      }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/api/admin/admin/products/part-numbers",
        {
          ProductId: parseInt(productId, 10),
          ...formData,
        }
      );

      if (response.status !== 201) {
        throw new Error(response.data.message || "Failed to create Part Number");
      }

      onSave(); // Trigger refresh data di parent component
      onClose();
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white w-[90%] max-w-5xl p-6 rounded-lg shadow-lg overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Create Part Number</h2>
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
                <input
                  type="number"
                  name="BurstingPressure"
                  value={formData.BurstingPressure}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
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
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePartNumberModal;
