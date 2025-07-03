import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModalEditAdmin.css'; // Reuse the same CSS file for consistency

const ModalAdminSales = ({ admin, onClose, onSave }) => {
  const [isSales, setIsSales] = useState(admin?.IsSales || false);


  useEffect(() => {
    const fetchRegionsSales = async () => {
      try {
        // Fetch admin details
        const adminResponse = await axios.get(
          `/api/admin/admin/admins/${admin.Id}`
        );
        const adminData = adminResponse.data?.data;

        if (adminData) {
          setIsSales(adminData.IsSales);
        }


      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data');
      }
    };

    fetchRegionsSales();
  }, [admin.Id]);

  const handleSave = async () => {
    try {
    
      // Send PATCH request
      await axios.patch(
        `/api/admin/admin/admins/salesstatus/${admin.Id}`,
        {
          isSales,
        }
      );

      alert('Sales status updated successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating sales status:', error);
      alert('Failed to update sales status');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Set Sales Status</h2>
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isSales}
                onChange={(e) => setIsSales(e.target.checked)}
              />
              Is Sales?
            </label>
          </div>
          {/* Add additional fields here if needed when isSales is true */}
          <div className="modal-actions">
            <button
              type="button"
              className="submit-button"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAdminSales;
