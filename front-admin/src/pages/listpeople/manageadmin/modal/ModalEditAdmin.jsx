import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModalEditAdmin.css';

const ModalEditAdmin = ({ admin, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    Username: '',
    Email: '',
    Name: '',
    Birthdate: '',
    PhoneNumber: '',
    Address: '',
    Gender: '',
    Role: '', // Menggunakan string "Role" dari API
  });
  const [roles, setRoles] = useState([]);
  const [adminDetails, setAdminDetails] = useState(null);

  useEffect(() => {
    // Fetch roles untuk dropdown
    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/admin/admin/roles');
        setRoles(response.data.data); // Mengambil data roles
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    // Fetch admin details untuk default values
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get(`/api/admin/admin/admins/${admin.Id}`);
        const adminData = response.data?.data;
        setAdminDetails(adminData);

        // Set default form data
        setFormData({
          Username: adminData?.Username || '',
          Email: adminData?.Email || '',
          Name: adminData?.Name || '',
          Birthdate: adminData?.Birthdate
            ? new Date(adminData.Birthdate).toISOString().split('T')[0]
            : '',
          PhoneNumber: adminData?.PhoneNumber || '',
          Address: adminData?.Address || '',
          // Normalisasi gender: huruf pertama kapital, sisanya kecil
          Gender: adminData?.Gender
            ? adminData.Gender.charAt(0).toUpperCase() + adminData.Gender.slice(1).toLowerCase()
            : '',
          Role: adminData?.Role || '',
        });
      } catch (error) {
        console.error('Error fetching admin details:', error);
      }
    };

    fetchRoles();
    if (admin?.Id) fetchAdminDetails();
  }, [admin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (admin) {
        // Update admin yang sudah ada
        await axios.put(`/api/admin/admin/admins/${admin.Id}`, formData);
      } else {
        // Buat admin baru
        await axios.post('/api/admin/admin/admins', formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving admin:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">{admin ? 'Edit Admin' : 'Create Admin'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="Username"
              value={formData.Username}
              onChange={handleChange}
              placeholder="Enter username"
              required
              maxLength={30}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              placeholder="Enter email"
              required
              maxLength={75}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              name="Role"
              value={formData.Role} // Menggunakan "Role" dari API
              onChange={handleChange}
              required
            >
              <option value="">No Role</option>
              {roles.map((role) => (
                <option key={role.Id} value={role.Name}>
                  {role.Name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="Enter full name"
              maxLength={50}
            />
          </div>
          <div className="form-group">
            <label>Birthdate</label>
            <input
              type="date"
              name="Birthdate"
              value={formData.Birthdate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="PhoneNumber"
              value={formData.PhoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              maxLength={20}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              placeholder="Enter address"
              maxLength={150}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit" className="submit-button">
              {admin ? 'Update' : 'Create'}
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

export default ModalEditAdmin;
