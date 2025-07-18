// src/components/PdfPreview.js
import React from "react";

/**
 * Komponen untuk preview PDF tanpa toolbar, navpanes, scrollbar,
 * dan fit otomatis ke lebar container (page-width)
 *
 * @param {Object} props
 * @param {string} props.fileUrl - URL file PDF
 */
const PdfPreview = ({ fileUrl }) => (
  <iframe
    src={
      fileUrl +
      "#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=150"
      // ^ tambahkan view=FitH dan zoom=150 atau zoom=200 (atau zoom=page-width)
    }
    style={{
      width: "100%",
      maxWidth: 1200,
      height: 900, // Perbesar jika ingin lebih tinggi
      border: "none",
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      background: "#fff",
      display: "block",
    }}
    title="PDF Preview"
  />
);

export default PdfPreview;
