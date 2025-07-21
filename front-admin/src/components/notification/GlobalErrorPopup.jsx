import React from "react";
import { useError } from "../../contexts/ErrorContext";

export default function GlobalErrorPopup() {
  const { error, clearError } = useError();

  if (!error) return null;
  return (
    <div style={{
      position: "fixed", bottom: 30, left: "50%",
      transform: "translateX(-50%)",
      background: "#ff4747", color: "#fff", padding: "16px 24px",
      borderRadius: 8, zIndex: 2000, minWidth: 300, textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,.15)"
    }}>
      {error}
      <button onClick={clearError}
        style={{
          marginLeft: 16, background: "transparent", color: "#fff",
          border: "none", fontWeight: "bold", fontSize: 18, cursor: "pointer"
        }}>
        &times;
      </button>
    </div>
  );
}
