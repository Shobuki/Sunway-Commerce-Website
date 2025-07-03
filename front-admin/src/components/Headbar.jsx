import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

// ⬇ Tambahkan parameter props dari Layout
const Headbar = ({ isSidebarOpen, setSidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/40");

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen); // ← sudah benar

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    ; // ⬅ perbaiki di sini
    try {
      await fetch("/api/admin/admin/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      sessionStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


  useEffect(() => {
    const fetchProfileImage = async () => {
      const token = localStorage.getItem("token");;
      if (!token) return;

      try {
        const response = await axios.get("/api/admin/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Ini aman untuk semua bentuk response
        const id = response.data?.Id || response.data?.admin?.Id;
        if (id) {
          const imageResponse = await axios.get(
            `/api/admin/admin/profile/image/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              responseType: "blob",
            }
          );
          const imageUrl = URL.createObjectURL(imageResponse.data);
          setProfileImage(imageUrl);
        }

      } catch (error) {
        console.error("Failed to fetch profile image:", error.response?.data || error.message);
      }
    };

    fetchProfileImage();
  }, []);

  return (
    <div className="w-full fixed top-0 left-0 bg-white text-white flex items-center justify-between p-4 shadow-md z-50 h-16">
      {/* 🔘 Toggle + Logo */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 flex items-center justify-center bg-[#C8102E] hover:bg-red-800 text-white rounded-full shadow-md transition duration-300 border border-white/20"
          title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
        >
          {isSidebarOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>



        <img src="/images/logo.png" alt="Sunway Logo" className="h-8 w-auto object-contain" />
      </div>

      {/* 👤 Profile */}
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
  );
};

export default Headbar;
