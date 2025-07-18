const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const A4_WIDTH = 595.28;   // pt
const A4_HEIGHT = 841.89;  // pt

async function cropAndResizePdfNode(inputPath: any, outputPath: any) {
  const fileBuffer = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    // --- FIT PDF ke A4: Scale & center content ---
    // Scale isi page biar pas ke A4 (tanpa memotong proporsi, tidak melebihi batas)
    const scaleX = A4_WIDTH / width;
    const scaleY = A4_HEIGHT / height;
    const scale = Math.min(scaleX, scaleY);

    page.scaleContent(scale, scale);

    // Center kan
    const newX = (A4_WIDTH - width * scale) / 2;
    const newY = (A4_HEIGHT - height * scale) / 2;
    page.translateContent(newX, newY);

    // Pastikan ukuran A4
    page.setMediaBox(0, 0, A4_WIDTH, A4_HEIGHT);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

module.exports = { cropAndResizePdfNode };
