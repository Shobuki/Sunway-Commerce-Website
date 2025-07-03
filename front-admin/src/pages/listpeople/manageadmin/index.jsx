import React, { useState, useEffect } from 'react';

import axios from "@/utils/axios";
import ModalCreateAdmin from "./modal/ModalCreateAdmin";
import ModalEditAdmin from './modal/ModalEditAdmin';
import ModalAdminSales from './modal/ModalAdminSales';
import ModalSessionAdmin from './modal/ModalSessionAdmin';
import "./ManageAdmin.css";


// Utilitas untuk cek akses fitur (string comparison, agar tidak tergantung id)
function hasFeatureAccess(menuAccess, feature) {
  // menuAccess.Features: [{Feature: 'create', Access: 'WRITE'}]
  return (
    menuAccess?.Features?.some(
      (f) => f.Feature === feature && f.Access === "WRITE"
    ) ?? false
  );
}

const ManageAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [isModalSalesOpen, setIsModalSalesOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState("");
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);

  // State akses menu & feature
  const [menuAccess, setMenuAccess] = useState(null); // akses menu "manageadmin" dari /my-menu

  const [isModalSessionOpen, setIsModalSessionOpen] = useState(false);




  const fetchAdmins = async () => {
    try {
      const response = await axios.get('/api/admin/admin/admins');
      const data = response.data?.data || [];
      console.log('Fetched admins:', data);
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdmins([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('/api/admin/admin/roles');
      const data = response.data?.data || [];
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    axios
      .get("/api/admin/admin/access/my-menu")
      .then((res) => {
        const access = (res.data || []).find(
          (m) => m.Name?.toLowerCase() === "manageadmin" // <-- pakai toLowerCase untuk jaga-jaga
        );
        console.log("Dapat akses:", access);
        console.log(res.data)
        setMenuAccess(access || null);
        setLoadingAccess(false);
        if (!access) {
          setTimeout(() => window.location.href = "/access-denied", 0);
        }
      })
      .catch(() => {
        setMenuAccess(null);
        setLoadingAccess(false);
        setTimeout(() => window.location.href = "/access-denied", 0);
      });

    fetchAdmins();
    fetchRoles();
  }, []);

  if (loadingAccess) {
    return <div>Loading Access...</div>;
  }
  if (!menuAccess) {
    return null; // Sudah redirect, aman!
  }



  function validateAdminInput(input) {
    if (!input.Username || input.Username.length > 30) return "Username maksimal 30 karakter";
    if (!input.Password || input.Password.length > 150) return "Password maksimal 150 karakter";
    if (!input.Email || input.Email.length > 75) return "Email maksimal 75 karakter";
    if (input.Name && input.Name.length > 50) return "Name maksimal 50 karakter";
    if (input.PhoneNumber && input.PhoneNumber.length > 20) return "PhoneNumber maksimal 20 karakter";
    if (input.Address && input.Address.length > 150) return "Address maksimal 150 karakter";
    if (input.Gender && input.Gender.length > 10) return "Gender maksimal 10 karakter";
    return null;
  }

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setIsModalEditOpen(true);
    setDropdownOpen(null);
  };

  const handleDelete = (admin) => {
    setSelectedAdmin(admin);
    setIsModalDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/admin/admins/${selectedAdmin.Id}`);
      alert('Admin deleted successfully');
      setIsModalDeleteOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert(error.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleSales = (admin) => {
    setSelectedAdmin(admin);
    setIsModalSalesOpen(true);
  };

  const handleCreate = () => {
    setSelectedAdmin(null);
    setIsModalCreateOpen(true);
    setDropdownOpen(null);
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleSendForgotPassword = async (admin) => {
    if (!admin?.Email) {
      alert("Email admin tidak tersedia.");
      return;
    }
    if (!window.confirm(`Kirim link reset password ke email ${admin.Email}?`)) return;

    setForgotLoading(true);
    setForgotStatus("");
    try {
      const res = await axios.post("/api/admin/admin/profile/reset/forgotpassword", {
        email: admin.Email,
      });
      setForgotStatus(res.data?.message || "Berhasil mengirim email reset password.");
      alert(res.data?.message || "Reset password link sent!");
    } catch (err) {
      setForgotStatus(err.response?.data?.message || "Gagal mengirim email.");
      alert(err.response?.data?.message || "Gagal mengirim email.");
    }
    setForgotLoading(false);
  };


  return (
    <div className="manage-admin-container ml-60">
      <div className="header">
        <h1>Manage Admins</h1>
        {hasFeatureAccess(menuAccess, "create") && (
          <button className="create-button" onClick={handleCreate}>
            + Create Admin
          </button>
        )}
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Name</th>
            <th>IsSales?</th>
            <th>Gender</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.length > 0 ? (
            admins.map((admin, idx) => (
              <tr key={admin.Id}>
                <td>{idx + 1}</td>
                <td>{admin.Username}</td>
                <td>{admin.Email}</td>
                <td>{admin.Name}</td>
                <td>
                  {/* Render IsSales as a read-only checkbox */}
                  <input
                    type="checkbox"
                    checked={admin.IsSales}
                    readOnly
                    className="readonly-checkbox"
                  />
                </td>
                <td>{admin.Gender}</td>
                <td>{admin.Role}</td>
                <td className="relative">
                  <button
                    className="dropdown-button"
                    onClick={() => toggleDropdown(admin.Id)}
                  >
                    ...
                  </button>
                  {dropdownOpen === admin.Id && (
                    <div className="dropdown-menu">
                      {hasFeatureAccess(menuAccess, "edit") && (
                        <button className="dropdown-item" onClick={() => handleEdit(admin)}>
                          Edit
                        </button>
                      )}
                      {/* Set Sales */}
                      {hasFeatureAccess(menuAccess, "setsales") && (
                        <button className="dropdown-item" onClick={() => handleSales(admin)}>
                          Set Sales
                        </button>
                      )}
                      {/* Send Forgot Password */}
                      {hasFeatureAccess(menuAccess, "sendforgotpassword") && (
                        <button
                          className="dropdown-item"
                          disabled={forgotLoading}
                          onClick={() => handleSendForgotPassword(admin)}
                        >
                          {forgotLoading ? "Sending..." : "Send Forgot Password"}
                        </button>
                      )}
                      {hasFeatureAccess(menuAccess, "session") && (
                      <button className="dropdown-item" onClick={() => { setSelectedAdmin(admin); setIsModalSessionOpen(true); }}>Session List</button>
                      )}
                      {/* Delete */}
                      {hasFeatureAccess(menuAccess, "delete") && (
                        <button className="dropdown-item delete" onClick={() => handleDelete(admin)}>
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="no-data">
                No admins found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalCreateOpen && (
        <ModalCreateAdmin onClose={() => setIsModalCreateOpen(false)} onSave={fetchAdmins} />
      )}
      {isModalEditOpen && (
        <ModalEditAdmin
          admin={selectedAdmin}
          roles={roles}
          onClose={() => setIsModalEditOpen(false)}
          onSave={fetchAdmins}
        />
      )}
      {isModalSessionOpen && (
        <ModalSessionAdmin adminId={selectedAdmin?.Id} onClose={() => setIsModalSessionOpen(false)} />
      )}
      {isModalSalesOpen && (
        <ModalAdminSales
          admin={selectedAdmin}
          onClose={() => setIsModalSalesOpen(false)}
          onSave={fetchAdmins}
        />
      )}
      {isModalDeleteOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this admin?</p>
            <p>
              <strong>{selectedAdmin?.Username}</strong>
            </p>
            <div className="modal-actions">
              <button className="submit-button" onClick={confirmDelete}>
                Confirm
              </button>
              <button className="cancel-button" onClick={() => setIsModalDeleteOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default ManageAdmin;
