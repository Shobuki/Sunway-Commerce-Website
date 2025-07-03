// src/components/GlobalErrorPopup.tsx
import React, { useEffect, useState } from "react";

const GlobalErrorPopup: React.FC = () => {
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    function handler(e: any) {
      setErr(e.detail?.message || "Unknown error");
      setTimeout(() => setErr(null), 3500);
    }
    window.addEventListener("global-error", handler);
    return () => window.removeEventListener("global-error", handler);
  }, []);

  if (!err) return null;
  return (
    <div style={{
      position: "fixed",
      bottom: 30,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#ff4747",
      color: "#fff",
      padding: "16px 24px",
      borderRadius: 8,
      zIndex: 2000,
      minWidth: 300,
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,.15)"
    }}>
      {err}
      <button
        onClick={() => setErr(null)}
        style={{
          marginLeft: 16,
          background: "transparent",
          color: "#fff",
          border: "none",
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer"
        }}>
        &times;
      </button>
    </div>
  );
};

export default GlobalErrorPopup;
