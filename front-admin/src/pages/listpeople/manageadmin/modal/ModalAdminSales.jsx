import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModalEditAdmin.css';

const ModalAdminSales = ({ admin, onClose, onSave }) => {
  // Gunakan optional chaining & default value agar tidak error jika admin undefined
  const [isSales, setIsSales] = useState(admin?.IsSales || false);

  useEffect(() => {
    // Cegah akses jika admin belum ada (undefined/null)
    if (!admin || !admin.Id) return;

    const fetchRegionsSales = async () => {
      try {
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
  }, [admin?.Id]); // <-- Pakai optional chaining!

  const handleSave = async () => {
    try {
      // Cegah akses jika admin belum ada
      if (!admin || !admin.Id) {
        alert('Admin not loaded!');
        return;
      }

      await axios.patch(
        `/api/admin/admin/admins/salesstatus/${admin.Id}`,
        { isSales }
      );

      alert('Sales status updated successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating sales status:', error);
      alert('Failed to update sales status');
    }
  };

  // Jangan render apapun kalau admin belum ada (SSR safety!)
  if (!admin || !admin.Id) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
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
          <div className="modal-actions">
            <button type="button" className="submit-button" onClick={handleSave}>
              Save
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAdminSales;
