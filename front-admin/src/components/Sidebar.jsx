import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import useSession from "../hoc/useSession";

// ICON MAP
// ICON MAP



const Sidebar = ({ isOpen }) => {
  const { session, loading } = useSession();
  const [accessMenus, setAccessMenus] = useState([]);
  const [loadingAccess, setLoadingAccess] = useState(true);

  // Order & drag state
  const [menuOrder, setMenuOrder] = useState([]);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(null);

  // Fetch access menu
  useEffect(() => {
    const fetchMenuAccess = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setAccessMenus([]);
          setLoadingAccess(false);
          return;
        }
        const response = await fetch("/api/admin/admin/access/my-menu", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch access");
        const data = await response.json();
        setAccessMenus(Array.isArray(data) ? data : (data.menus || []));
      } catch {
        setAccessMenus([]);
      } finally {
        setLoadingAccess(false);
      }
    };
    fetchMenuAccess();
  }, []);

  // Restore menu order dari localStorage
  useEffect(() => {
    if (accessMenus.length === 0) return;
    const stored = localStorage.getItem("sidebarOrder");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter(path => accessMenus.find(m => m.Path === path));
        const fullOrder = [
          ...filtered,
          ...accessMenus.filter(m => !filtered.includes(m.Path)).map(m => m.Path)
        ];
        setMenuOrder(fullOrder);
      } catch {
        setMenuOrder(accessMenus.map(m => m.Path));
      }
    } else {
      setMenuOrder(accessMenus.map(m => m.Path));
    }
  }, [accessMenus]);

  // Sorted menu berdasarkan menuOrder
  const sortedMenus = menuOrder
    .map(path => accessMenus.find(m => m.Path === path))
    .filter(Boolean);

  // --- Drag logic ---
  const handleDragStart = (idx) => {
    if (!dragEnabled) return;
    setDraggingIdx(idx);
  };

  const handleDragOver = (idx) => {
    if (!dragEnabled || draggingIdx === null || draggingIdx === idx) return;
    setHoverIdx(idx);
  };

  const handleDrop = (idx) => {
    if (!dragEnabled || draggingIdx === null || draggingIdx === idx) return;
    const newOrder = [...menuOrder];
    const [removed] = newOrder.splice(draggingIdx, 1);
    newOrder.splice(idx, 0, removed);
    setMenuOrder(newOrder);
    localStorage.setItem("sidebarOrder", JSON.stringify(newOrder));
    setDraggingIdx(null);
    setHoverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    setHoverIdx(null);
  };

  if (loading || loadingAccess)
    return <div className="h-screen w-64 bg-gray-800 text-white fixed">Loading...</div>;
  if (!session)
    return <div className="h-screen w-64 bg-gray-800 text-white fixed">Please login first</div>;

  return (
    <div
      className={`fixed top-16 left-0 h-full bg-white text-black shadow-lg border-r border-gray-300 z-40 transition-all duration-300 ${
        isOpen ? "w-[14.5rem]" : "w-0 overflow-hidden"
      }`}
    >
      <nav className="mt-4 flex-grow">
        <ul className="list-none">
          {sortedMenus.map((menu, idx) => (
            <li
              key={menu.Path}
              className={`py-2 px-6 flex items-center select-none transition-all
                ${draggingIdx === idx ? "bg-yellow-100 ring-2 ring-yellow-500" : ""}
                ${hoverIdx === idx && draggingIdx !== null ? "bg-blue-100" : ""}
                hover:bg-gray-100`}
              draggable={dragEnabled}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => {
                e.preventDefault();
                handleDragOver(idx);
              }}
              onDrop={e => {
                e.preventDefault();
                handleDrop(idx);
              }}
              onDragEnd={handleDragEnd}
              style={dragEnabled ? { cursor: "grab" } : {}}
            >
              {dragEnabled && (
                <span
                  className="mr-2 cursor-grab text-lg text-gray-500 select-none"
                  title="Drag menu"
                >⠿</span>
              )}

              {isOpen && <Link href={menu.Path}>{menu.Name[0].toUpperCase() + menu.Name.slice(1)}</Link>}
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-gray-300 p-4 flex flex-col gap-2">
        <p className="text-sm text-gray-400 mb-2">Logged in as: {session?.AdminName || "Admin"}</p>
        <button
          onClick={() => setDragEnabled(v => !v)}
          className={`flex items-center gap-2 px-2 py-1 rounded border text-sm font-semibold transition
            ${dragEnabled ? "bg-yellow-100 border-yellow-500 text-yellow-700" : "bg-gray-100 border-gray-400 text-gray-600"}
            hover:bg-yellow-50`}
        >
          <span className="text-lg">⠿</span>
          {dragEnabled ? "Drag Mode: ON" : "Enable Drag Menu"}
        </button>
        {dragEnabled && (
          <span className="text-xs text-yellow-600">Geser menu ke atas/bawah lalu matikan drag jika sudah!</span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
