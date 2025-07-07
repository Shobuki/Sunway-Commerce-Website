import React, { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuAccess, setMenuAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);

  useEffect(() => {
    // Ambil akses menu user (biasanya dari API menu access matrix)
    axios.get("/api/admin/admin/access/my-menu").then((res) => {
      const data = res.data || [];
      const found = data.find(
        (m) => m.Name && m.Name.toLowerCase() === "manageuser"
      );
      setMenuAccess(found || null);
      setLoadingAccess(false);
      // Jika tidak ada akses, redirect!
      if (!found || !hasMenuAccess(found)) {
        setTimeout(() => (window.location.href = "/access-denied"), 0);
      }
    });
  }, []);

  useEffect(() => {
    if (menuAccess && hasMenuAccess(menuAccess)) {
      fetchUsers();
    }
  }, [menuAccess]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/admin/admin/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen" style={{ marginLeft: "16.25rem", width: "calc(100% - 16.25rem)" }}>
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <input
        type="text"
        placeholder="Search user by name..."
        className="border p-2 rounded w-full mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Province</th>
              <th className="p-3 border">Dealer Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.Id} className="hover:bg-gray-100">
                  <td className="p-3 border">{user.Name || "-"}</td>
                  <td className="p-3 border">{user.Email}</td>
                  <td className="p-3 border">{user.Province || "-"}</td>
                  <td className="p-3 border text-center">
                    {user.Dealer ? (
                      <span className="text-green-600 font-semibold">
                        {user.Dealer.CompanyName}
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">Not a Dealer</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
