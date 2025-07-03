import React from "react";
import Link from "next/link";

const clearAllCacheAndReload = () => {
  // Hapus cache localStorage, sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {}

  // Hapus semua service worker (kalau ada PWA/service worker)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => reg.unregister());
    });
  }

  // Hapus semua cache storage (HTTP Cache, jika ada)
  if (window.caches && caches.keys) {
    caches.keys().then(function(names) {
      for (let name of names) caches.delete(name);
    });
  }

  // Lakukan full reload dari server (paksa)
  window.location.replace("/"); // atau gunakan location.reload(true) (tapi sudah deprecated)
};

const AccessDenied = ({ detail }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-100 to-gray-300">
    <div className="bg-white rounded-xl p-10 shadow-xl flex flex-col items-center">
      <div className="text-6xl text-red-500 mb-4">⛔</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-4">Anda tidak memiliki akses ke halaman ini.</p>
      {detail && (
        <div className="text-xs text-gray-400 italic mb-4">{detail}</div>
      )}
      <button
        onClick={clearAllCacheAndReload}
        className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition"
      >
        Coba Lagi (Super Refresh)
      </button>
      <Link href="/" passHref>
        <button className="mt-2 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded font-bold transition">
          Kembali ke Dashboard
        </button>
      </Link>
    </div>
  </div>
);

export default AccessDenied;
