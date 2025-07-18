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
  <div style={{
    width: '100%',
    maxWidth: 600, // batas maksimum lebar pdf (optional)
    maxHeight: 600, // batas maksimum tinggi pdf (optional)
    margin: '0 auto',
    borderRadius: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    background: "#fff",
    overflow: "hidden"
  }}>
    <iframe
      src={
        fileUrl +
        '#toolbar=0&navpanes=0&scrollbar=0&zoom=page-width'
      }
      style={{
        width: '100%',
        height: 700,
        border: 'none',
        display: 'block',
        background: "#fff",
      }}
      title="PDF Preview"
      allowFullScreen
    />
  </div>
);

export default PdfPreview;
