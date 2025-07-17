'use client';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";

const NOTIF_API_URL = "/api/admin/admin/notification";
const MARK_READ_API_URL = "/api/admin/admin/notification/read";
const MARK_ALL_READ_API_URL = "/api/admin/admin/notification/read/markallread";

const Headbar = ({ isSidebarOpen, setSidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/40");
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const notifDropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Fetch notification list
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const { data } = await axios.get(NOTIF_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 10 }
      });
      setNotifications(data.data || []);
      setNotifCount((data.data || []).filter(n => !n.IsRead).length);
    } catch {
      setNotifications([]);
      setNotifCount(0);
    }
  };

  // Open notification dropdown
  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) fetchNotifications();
  };

  // Mark as read and redirect
  const handleNotifRead = async (notif) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.patch(MARK_READ_API_URL, { notifId: notif.Id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => n.Id === notif.Id ? { ...n, IsRead: true } : n)
      );
      setNotifCount((prev) => Math.max(0, prev - 1));
      // Redirect jika Path ada
      if (notif.Path) {
        window.location.href = notif.Path;
      }
    } catch {
      alert("Gagal menandai notifikasi.");
    }
  };

  // Mark as read (button only, tanpa redirect)
  const handleMarkReadBtn = async (notifId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.patch(MARK_READ_API_URL, { notifId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => n.Id === notifId ? { ...n, IsRead: true } : n)
      );
      setNotifCount((prev) => Math.max(0, prev - 1));
    } catch {
      alert("Gagal menandai notifikasi.");
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.patch(MARK_ALL_READ_API_URL, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map(n => ({ ...n, IsRead: true })));
      setNotifCount(0);
    } catch {
      alert("Gagal menandai semua notifikasi.");
    }
  };

  // Close notif dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    function handleClickOutside(event) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    // Fetch profile image
    const fetchProfileImage = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get("/api/admin/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const id = response.data?.Id || response.data?.admin?.Id;
        if (id) {
          const imageResponse = await axios.get(`/api/admin/admin/profile/image/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          });
          const imageUrl = URL.createObjectURL(imageResponse.data);
          setProfileImage(imageUrl);
        }
      } catch { /* ignore */ }
    };
    fetchProfileImage();
  }, []);

  // Poll badge
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch("/api/admin/admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      sessionStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-full fixed top-0 left-0 bg-white text-white flex items-center justify-between p-4 shadow-md z-50 h-16">
      {/* --- Kiri: Logo & toggle sidebar --- */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center bg-[#C8102E] hover:bg-red-800 text-white rounded-full shadow-md transition duration-300 border border-white/20"
          title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
        >
          {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        <img src="/images/logo.png" alt="Sunway Logo" className="h-8 w-auto object-contain" />
      </div>

      {/* --- Kanan: Notification + Profile (flex gap) --- */}
      <div className="flex items-center gap-4 ml-auto pr-2">
        {/* --- Lonceng Notification --- */}
        <div className="relative">
          <button
            onClick={handleNotifClick}
            className="relative focus:outline-none"
            aria-label="Notifikasi"
          >
            <svg className="h-8 w-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405C18.052 15.368 18 15.184 18 15V11a6 6 0 00-9.33-4.945M8 11V9a4 4 0 018 0v2M5 17h14M12 19a2 2 0 11-4 0" />
            </svg>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse">
                {notifCount}
              </span>
            )}
          </button>
          {/* Dropdown Notifikasi */}
          {notifOpen && (
            <div
              className="absolute right-0 mt-3 w-[350px] bg-white shadow-lg rounded-xl border border-gray-200 z-50 max-h-[410px] overflow-y-auto"
              ref={notifDropdownRef}
            >
              <div className="p-3 border-b font-bold text-gray-900 flex justify-between items-center">
                <span>Notifikasi</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-700 hover:underline disabled:text-gray-400"
                    disabled={notifCount === 0}
                  >
                    Mark all as read
                  </button>
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      window.location.href = "/listapprovalsalesorder/approvalsalesorder";
                    }}
                    className="text-xs text-blue-700 hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>
              </div>
              <ul className="divide-y">
                {notifications.length === 0 ? (
                  <li className="py-5 text-center text-gray-400">Tidak ada notifikasi baru.</li>
                ) : (
                  [...notifications]
                    // 1. Urutkan: unread dulu, lalu berdasarkan tanggal terbaru
                    .sort((a, b) => {
                      if (a.IsRead === b.IsRead) {
                        // terbaru dulu
                        return new Date(b.CreatedAt) - new Date(a.CreatedAt);
                      }
                      return a.IsRead ? 1 : -1; // unread di atas
                    })
                    // 2. Ambil 10 teratas saja
                    .slice(0, 10)
                    .map((notif) => (
                      <li
                        key={notif.Id}
                        className={`px-4 py-3 flex items-start gap-2 transition ${!notif.IsRead ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex-1 cursor-pointer"
                          onClick={() => handleNotifRead(notif)}
                        >
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {notif.Title || "Notifikasi"}
                          </div>
                          <div className="text-xs text-gray-700 mb-1">{notif.Body}</div>
                          <div className="text-[11px] text-gray-400">
                            {notif.SalesOrder?.Dealer && (
                              <>Dealer: <span className="text-gray-700">{notif.SalesOrder.Dealer}</span></>
                            )}
                            <span className="ml-2">{new Date(notif.CreatedAt).toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                        {!notif.IsRead && (
                          <button
                            className="text-xs text-blue-700 hover:underline ml-1 mt-1"
                            onClick={(e) => { e.stopPropagation(); handleMarkReadBtn(notif.Id); }}
                          >
                            Mark as read
                          </button>
                        )}
                      </li>
                    ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* --- Profile Avatar --- */}
        <div className="relative">
          <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
            <img
              src={profileImage}
              alt="Profile"
              className="w-12 h-12 bg-white rounded shadow border border-gray-200 object-contain p-1"
            />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-md overflow-hidden z-10">
              <ul>
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  <Link href="/profile/editprofile">Edit Profile</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  <Link href="/settings">Settings</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={handleLogout}>
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Headbar;
