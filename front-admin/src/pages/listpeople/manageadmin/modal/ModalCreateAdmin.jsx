import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ModalCreateAdmin.css";

const ModalCreateAdmin = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    Username: "",
    Password: "",
    Email: "",
    Name: "",
    Birthdate: "",
    PhoneNumber: "",
    Address: "",
    Gender: "",
    RoleId: "",
  });
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          "/api/admin/admin/roles"
        );
        setRoles(response.data.data || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();

    // Reset formData to default empty values when modal opens
    setFormData({
      Username: "",
      Password: "",
      Email: "",
      Name: "",
      Birthdate: "",
      PhoneNumber: "",
      Address: "",
      Gender: "",
      RoleId: "",
    });
  }, []); // Empty dependency ensures it runs only on mount

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/admin/admins", formData);
      alert("Admin created successfully!");
      onSave(); // Refresh admin list
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error creating admin:", error);
      alert(error.response?.data?.error || "Failed to create admin");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Create Admin</h2>
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
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="Password"
                value={formData.Password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                maxLength={150}
              />
              <button
                type="button"
                className="show-password-button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
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
              name="RoleId"
              value={formData.RoleId}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.Id} value={role.Id}>
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
              Create
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

export default ModalCreateAdmin;
