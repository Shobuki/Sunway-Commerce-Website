import React, { useState, useEffect } from "react";
import axios from "axios";

const CreateDealer = ({ isOpen, onClose, refreshDealers }) => {
  const [formData, setFormData] = useState({
    CompanyName: "",
    Region: "",
    PriceCategoryId: "",
    StoreCode: "",
    SalesIds: []
  });

  const [priceCategories, setPriceCategories] = useState([]);
  const [salesOptions, setSalesOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchPriceCategories();
      fetchSales();
    }
  }, [isOpen]);

  const fetchPriceCategories = async () => {
    try {
      const res = await axios.get("/api/admin/admin/pricecategory");
      setPriceCategories(res.data.data);
    } catch (error) {
      console.error("Error fetching price categories:", error);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get("/api/admin/admin/admins/list/sales");
      setSalesOptions(res.data.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalesChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => Number(option.value));
    setFormData(prev => ({ ...prev, SalesIds: selected }));
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.StoreCode.trim()) {
      alert("StoreCode is required");
      return;
    }
  
    console.log("📦 Payload:", formData); // DEBUG: pastikan SalesIds = [number]
  
    try {
      await axios.post("/api/admin/admin/dealers", formData);
      alert("Dealer created successfully");
      refreshDealers();
      onClose();
    } catch (error) {
      console.error("Error creating dealer:", error.response?.data || error.message);
      alert("Error creating dealer.");
    }
  };
  
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[500px] max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create Dealer</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Company Name</label>
            <input
              type="text"
              name="CompanyName"
              value={formData.CompanyName}
              maxLength={100}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Region</label>
            <input
              type="text"
              name="Region"
              value={formData.Region}
              maxLength={50}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Store Code *</label>
            <input
              type="text"
              name="StoreCode"
              maxLength={30}
              value={formData.StoreCode}
              onChange={handleChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Price Category</label>
            <select
              name="PriceCategoryId"
              value={formData.PriceCategoryId}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="">Select Price Category</option>
              {priceCategories.map((cat) => (
                <option key={cat.Id} value={cat.Id}>{cat.Name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Sales Representative(s)</label>
            <select
              multiple
              onChange={handleSalesChange}
              className="border p-2 w-full rounded h-32"
            >
              {salesOptions.map((sales) => (
                <option key={sales.Id} value={sales.SalesId}>
                  {sales.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDealer;
