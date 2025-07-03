import React from "react";
import { useAccess } from "../../contexts/AccessContext"; // pastikan ini diimport

const FailedAccess = ({ message = "Failed Access! Please login again." }) => {
  const { failDetailMsg, setFailedAccess } = useAccess?.() || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
        <div className="text-4xl mb-3 text-red-500">⛔</div>
        <div className="text-lg font-semibold text-red-700 mb-2">{message}</div>
        {failDetailMsg && (
          <div className="text-xs text-gray-500 italic mt-1">{failDetailMsg}</div>
        )}
        <button
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
          onClick={() => {
            // Hanya tutup popup
            if (setFailedAccess) setFailedAccess(false);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FailedAccess;
