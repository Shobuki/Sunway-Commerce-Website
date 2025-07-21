import React, { useEffect, useState } from "react";

export default function GlobalErrorPopup() {
  const [err, setErr] = useState(null);

  useEffect(() => {
    function handler(e) {
      const msg = e.detail?.message || "Unknown error";

      // Global pengecualian error:
      // - mengandung 'request'
      // - mengandung 'status'
      // - mengandung '500'
      // - mengandung 'internal'
      // - mengandung 'server error'
      // - mengandung 'request failed'
      // Semua tidak case sensitive
      const denyPattern = /(request|status|500|internal|server\s*error|request\s*failed)/i;
      if (denyPattern.test(msg)) {
        return; // Tidak tampilkan error ini di popup
      }

      setErr(msg);

      setTimeout(() => setErr(null), 3000);
    }

    window.addEventListener("global-error", handler);
    return () => window.removeEventListener("global-error", handler);
  }, []);

  if (!err) return null;
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%",
      transform: "translateX(-50%)",
      background: "#ff4747", color: "#fff", padding: "16px 24px",
      borderRadius: 8, zIndex: 2000, minWidth: 300, textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,.15)"
    }}>
      {err}
      <button onClick={() => setErr(null)}
        style={{
          marginLeft: 16, background: "transparent", color: "#fff",
          border: "none", fontWeight: "bold", fontSize: 18, cursor: "pointer"
        }}>
        &times;
      </button>
    </div>
  );
}
