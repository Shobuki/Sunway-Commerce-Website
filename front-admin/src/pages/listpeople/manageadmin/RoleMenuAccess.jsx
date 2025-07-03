'use client';
import React, { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/router";



// Toast
const Toast = ({ show, message, type, onClose }) => (
  <div
    className={`fixed top-8 right-8 z-50 transition-all duration-300 ${show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 pointer-events-none"
      }`}
  >
    <div
      className={`flex items-center px-5 py-3 rounded shadow-lg font-medium
        ${type === "success"
          ? "bg-green-500 text-white"
          : type === "error"
            ? "bg-red-500 text-white"
            : "bg-blue-500 text-white"}
      `}
    >
      <span className="mr-3 text-lg">
        {type === "success" && "✅"}
        {type === "error" && "❌"}
        {type === "info" && "ℹ️"}
      </span>
      <span>{message}</span>
      <button className="ml-4 text-xl font-bold focus:outline-none" onClick={onClose}>×</button>
    </div>
  </div>
);

const accessLevels = [
  { key: "NONE", label: "None", color: "bg-gray-300", icon: "🚫" },
  { key: "WRITE", label: "Write", color: "bg-yellow-200", icon: "✏️" },
];

const STORAGE_KEY = "selectedRoleId";

const RoleAccessMenu = () => {
  const router = useRouter();

  // State proteksi akses menu
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [hasMenuAccess, setHasMenuAccess] = useState(false);
  // CRUD Roles
  const [roles, setRoles] = useState([]);
  const [rolePopup, setRolePopup] = useState(false);
  const [roleForm, setRoleForm] = useState({ Name: "", Description: "", Id: null });
  const [roleMode, setRoleMode] = useState("create"); // create/edit/delete
  const [roleLoading, setRoleLoading] = useState(false);

  // Akses Menu
  const [matrix, setMatrix] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [draftMatrix, setDraftMatrix] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [roleList, setRoleList] = useState([]);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // === Fetch & Normalize Roles ===
  const normalizeRole = (r) => ({
    RoleId: r.RoleId ?? r.Id,
    RoleName: r.RoleName ?? r.Name,
    Description: r.Description ?? "",
  });

  // CEK AKSES MENU - SELALU DIJALANKAN, TIDAK ADA RETURN DI ATAS HOOK LAIN
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;
    axios.get("/api/admin/admin/access/my-menu")
      .then(res => {
        const allow = (res.data || []).some(
          m => m.Name?.toLowerCase() === "rolemenuaccess" && m.Access !== "NONE"
        );
        setHasMenuAccess(allow);
        setLoadingAccess(false);
        if (!allow) {
          setTimeout(() => {
            router.push("/access-denied");
          }, 0);
        }
      })
      .catch(() => {
        setHasMenuAccess(false);
        setLoadingAccess(false);
        router.push("/access-denied");
      });
  }, [router.asPath]);

  useEffect(() => {
    setRoles(matrix.map(normalizeRole));
  }, [matrix]);

  const fetchRoleList = async () => {
    try {
      setRoleLoading(true);
      const res = await axios.get("/api/admin/admin/roles");
      setRoleList(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      showToast("Gagal load role", "error");
    } finally {
      setRoleLoading(false);
    }
  };


  // Fetch roles from API (list role)
  const fetchRoles = async () => {
    try {
      setRoleLoading(true);
      const res = await axios.get("/api/admin/admin/roles");
      // Pastikan data array dan di-normalize
      setRoles(Array.isArray(res.data) ? res.data.map(normalizeRole) : []);
    } catch {
      showToast("Gagal load role", "error");
    } finally {
      setRoleLoading(false);
    }
  };

  // Fetch matrix (akses + role list dari akses)
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/admin/admin/access/matrix")
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setMatrix(data);
        setRoles(data.map(normalizeRole));
        const savedRoleId = Number(localStorage.getItem(STORAGE_KEY));
        const firstRoleId = data[0]?.RoleId || null;
        setSelectedRole(data.some((d) => d.RoleId === savedRoleId) ? savedRoleId : firstRoleId);
      })
      .catch(() => showToast("Gagal load data akses.", "error"))
      .finally(() => setLoading(false));
  }, []);

  // Sync draft matrix (tabel akses menu)
  useEffect(() => {
    if (!selectedRole) return;
    const found = matrix.find((r) => r.RoleId === selectedRole);
    setDraftMatrix(
      found?.Menus.map((menu) => ({
        ...menu,
        Features: menu.Features.map((f) => ({
          ...f,
        })),
        MenuAccess: menu.MenuAccess,
      })) || []
    );
    localStorage.setItem(STORAGE_KEY, selectedRole);
    // Flying toast
    if (selectedRole && Array.isArray(roles) && roles.length > 0) {
      const roleName = roles.find((r) => r.RoleId === selectedRole)?.RoleName || "";
      if (roleName) showToast(`Sedang mengatur role: ${roleName}`, "info");
    }
  }, [matrix, selectedRole, roles]);


  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/admin/access/matrix");
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setMatrix(data);
      setRoles(data.map(normalizeRole));
      // Otomatis pilih role terakhir dipilih (persisted in localStorage)
      const savedRoleId = Number(localStorage.getItem(STORAGE_KEY));
      const firstRoleId = data[0]?.RoleId || null;
      setSelectedRole(data.some((d) => d.RoleId === savedRoleId) ? savedRoleId : firstRoleId);
    } catch {
      showToast("Gagal load data akses.", "error");
    } finally {
      setLoading(false);
    }
  };

  // CRUD ROLE HANDLER
  const openRolePopup = (mode = "create", role = null) => {
    setRoleMode(mode);
    setRoleForm(
      role
        ? { Name: role.RoleName, Description: role.Description, Id: role.RoleId }
        : { Name: "", Description: "", Id: null }
    );
    setRolePopup(true);
  };

  const handleRoleSave = async (e) => {
    e.preventDefault();
    try {
      setRoleLoading(true);
      if (roleMode === "create") {
        await axios.post("/api/admin/admin/roles", { Name: roleForm.Name, Description: roleForm.Description });
        showToast("Role berhasil ditambahkan!", "success");
      } else if (roleMode === "edit") {
        await axios.put(`/api/admin/admin/roles/${roleForm.Id}`, {
          Name: roleForm.Name,
          Description: roleForm.Description,
        });
        showToast("Role berhasil diedit!", "success");
      } else if (roleMode === "delete") {
        await axios.delete(`/api/admin/admin/roles/${roleForm.Id}`);
        showToast("Role berhasil dihapus!", "success");
      }
      setRolePopup(false);
      await fetchMatrix();  // Sync ulang matrix dan roles!
    } catch {
      showToast("Gagal update role.", "error");
    } finally {
      setRoleLoading(false);
    }
  };


  // Akses Menu Handler
  const handleMenuLevelChange = (menuId, level) => {
    setDraftMatrix((prev) =>
      prev.map((menu) =>
        menu.MenuId !== menuId
          ? menu
          : {
            ...menu,
            MenuAccess: level,
            Features: level === "NONE"
              ? menu.Features.map((f) => ({ ...f, FeatureAccess: "NONE" }))
              : menu.Features,
          }
      )
    );
  };
  const handleLevelChange = (menuId, featureId, level) => {
    setDraftMatrix((prev) =>
      prev.map((menu) =>
        menu.MenuId !== menuId
          ? menu
          : {
            ...menu,
            Features: menu.Features.map((f) =>
              f.FeatureId !== featureId
                ? f
                : { ...f, FeatureAccess: menu.MenuAccess === "NONE" ? "NONE" : level }
            ),
          }
      )
    );
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      for (const menu of draftMatrix) {
        await axios.put("/api/admin/admin/access/role/menu", {
          RoleId: selectedRole,
          MenuId: menu.MenuId,
          Access: menu.MenuAccess,
        });
        for (const f of menu.Features) {
          await axios.put("/api/admin/admin/access/role/menu", {
            RoleId: selectedRole,
            MenuFeatureId: f.FeatureId,
            Access: f.FeatureAccess,
          });
        }
      }
      showToast("Akses berhasil disimpan!", "success");
    } catch (err) {
      showToast("Gagal menyimpan akses.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Pastikan roles array
  const roleName =
    Array.isArray(roles) && roles.length > 0
      ? roles.find((r) => r.RoleId === selectedRole)?.RoleName || ""
      : "";

  if (loadingAccess) return <div>Loading Access...</div>;
  if (!hasMenuAccess) return null;

  // Render
  return (
    <div className="max-w-6xl mx-auto my-12 p-8 bg-white rounded-xl shadow-lg relative">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
      {/* Sticky role info */}
      <div className="sticky top-4 z-20 mb-4 flex items-center gap-3">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded flex items-center gap-2">
          <span className="font-semibold">⚙️ Sedang mengatur akses untuk role:</span>
          <span className="text-lg font-bold text-blue-800">{roleName}</span>
        </div>
        <button
          className="ml-4 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition font-semibold"
          onClick={() => {
            fetchRoleList();
            openRolePopup("create");
          }}
        >
          Kelola Role
        </button>

      </div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Set Role Akses Menu</h2>
      {/* Role Picker */}
      <div className="mb-8 flex items-center gap-4">
        <label className="font-semibold text-gray-700">Role:</label>
        <select
          className="p-2 border rounded"
          value={selectedRole || ""}
          onChange={(e) => setSelectedRole(Number(e.target.value))}
        >
          {Array.isArray(roles) &&
            roles.map((role) => (
              <option key={role.RoleId} value={role.RoleId}>
                {role.RoleName}
              </option>
            ))}
        </select>
      </div>
      {/* Access Table */}
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
          <table className="w-full border-collapse shadow-sm rounded-lg">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 rounded-tl-lg min-w-[220px]">
                  Menu
                </th>
                {accessLevels.map((level) => (
                  <th key={level.key} className="text-center text-sm font-semibold">
                    <span className={`px-2 py-1 rounded ${level.color}`}>{level.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draftMatrix.map((menu) => (
                <React.Fragment key={menu.MenuId}>
                  {/* Baris menu utama */}
                  <tr className="bg-gray-200 border-b">
                    <td className="font-bold text-lg text-gray-900 py-3" style={{ verticalAlign: "middle" }}>
                      {menu.MenuName}
                      <div className="text-xs text-gray-500 font-normal">{menu.Path}</div>
                    </td>
                    {accessLevels.map((level) => (
                      <td className="px-2 py-2 text-center" key={level.key}>
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name={`menu-access-${menu.MenuId}`}
                            value={level.key}
                            checked={menu.MenuAccess === level.key}
                            onChange={() => handleMenuLevelChange(menu.MenuId, level.key)}
                            className="hidden"
                          />
                          <span
                            className={`inline-block w-10 h-10 flex items-center justify-center rounded-full text-lg transition
                              ${menu.MenuAccess === level.key
                                ? `${level.color} ring-2 ring-gray-500`
                                : "bg-gray-100"
                              }`}
                          >
                            {level.icon}
                          </span>
                        </label>
                      </td>
                    ))}
                  </tr>
                  {/* Baris fitur */}
                  {Array.isArray(menu.Features) &&
                    menu.Features.map((feature) => (
                      <tr key={`${menu.MenuId}-${feature.FeatureId}`}>
                        <td className="pl-10 py-2 font-mono text-gray-700">
                          <span className="bg-blue-100 text-xs px-2 py-1 rounded border border-blue-300 font-semibold">
                            {feature.Feature}
                          </span>
                        </td>
                        {accessLevels.map((level) => (
                          <td className="px-2 py-2 text-center" key={level.key}>
                            <label className={`cursor-pointer ${menu.MenuAccess === "NONE" ? "opacity-60 pointer-events-none" : ""}`}>
                              <input
                                type="radio"
                                name={`feature-access-${menu.MenuId}-${feature.FeatureId}`}
                                value={level.key}
                                checked={feature.FeatureAccess === level.key}
                                onChange={() => handleLevelChange(menu.MenuId, feature.FeatureId, level.key)}
                                className="hidden"
                                disabled={menu.MenuAccess === "NONE"}
                              />
                              <span
                                className={`inline-block w-10 h-10 flex items-center justify-center rounded-full text-lg transition
                                  ${feature.FeatureAccess === level.key
                                    ? `${level.color} ring-2 ring-gray-500`
                                    : "bg-gray-100"
                                  }`}
                              >
                                {level.icon}
                              </span>
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-end">
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded transition"
              onClick={() => window.location.reload()}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* --------- SINGLE POPUP: CRUD ROLE --------- */}
      {rolePopup && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-7 relative animate-fade-in">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-600 hover:text-red-600"
              onClick={() => setRolePopup(false)}
              autoFocus
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Manajemen Role</h3>
            {/* List Role */}
            <div className="max-h-52 overflow-y-auto mb-5">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 text-left">Nama</th>
                    <th className="py-2 px-3 text-left">Deskripsi</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(roleList) &&
                    roleList.map((role) => (
                      <tr key={role.Id} className="hover:bg-gray-50">
                        <td className="py-1 px-3">{role.Name}</td>
                        <td className="py-1 px-3">{role.Description}</td>
                        <td className="py-1 px-3 flex gap-2">
                          <button
                            className="p-1 text-blue-600 hover:underline"
                            onClick={() => openRolePopup("edit", {
                              RoleName: role.Name,
                              Description: role.Description,
                              RoleId: role.Id
                            })}
                          >Edit</button>
                          <button
                            className="p-1 text-red-500 hover:underline"
                            onClick={() => openRolePopup("delete", {
                              RoleName: role.Name,
                              Description: role.Description,
                              RoleId: role.Id
                            })}
                          >Delete</button>
                        </td>
                      </tr>
                    ))}

                </tbody>
              </table>
            </div>
            {/* Form Edit/Create/Delete */}
            <form
              className="space-y-4"
              onSubmit={handleRoleSave}
              autoComplete="off"
              onKeyDown={e => { if (e.key === "Escape") setRolePopup(false); }}
            >
              {(roleMode === "edit" || roleMode === "create") && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Nama Role</label>
                    <input
                      type="text"
                      className="border px-3 py-2 rounded w-full"
                      maxLength={30}
                      value={roleForm.Name}
                      onChange={e => setRoleForm(f => ({ ...f, Name: e.target.value }))}
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Deskripsi</label>
                    <input
                      type="text"
                      className="border px-3 py-2 rounded w-full"
                      maxLength={100}
                      value={roleForm.Description}
                      onChange={e => setRoleForm(f => ({ ...f, Description: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setRolePopup(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      disabled={roleLoading}
                    >
                      {roleLoading
                        ? "Menyimpan..."
                        : (roleMode === "edit" ? "Simpan Perubahan" : "Tambah Role")}
                    </button>
                  </div>
                </>
              )}
              {roleMode === "delete" && (
                <>
                  <div className="text-red-600 font-bold mb-2">Yakin ingin menghapus role ini?</div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setRolePopup(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                      disabled={roleLoading}
                    >
                      {roleLoading ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleAccessMenu;
