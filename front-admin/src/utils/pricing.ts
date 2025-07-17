// utils/pricing.ts

/**
 * Hitung final price per item (sudah termasuk pajak, dibulatkan per item).
 * @param {number} qty - Quantity item.
 * @param {number} price - Harga satuan.
 * @param {number} taxPct - Persen pajak (misal: 11, 100).
 * @returns {number} Final price per item (sudah dibulatkan).
 */
export function getFinalPricePerItem(qty: number, price: number, taxPct: number): number {
  return Math.round(qty * price * (1 + (taxPct || 0) / 100));
}

/**
 * Hitung subtotal (tanpa pajak)
 */
export function getSubtotal(items: { qty: number, price: number }[]) {
  return items.reduce((sum, i) => sum + i.qty * i.price, 0);
}

/**
 * Hitung total pajak (dari selisih final - subtotal per item)
 */
export function getTotalTax(items: { qty: number, price: number, taxPct: number }[]) {
  return items.reduce((sum, i) => sum + (getFinalPricePerItem(i.qty, i.price, i.taxPct) - i.qty * i.price), 0);
}

/**
 * Hitung total akhir (sum semua final price per item)
 */
export function getTotalWithTax(items: { qty: number, price: number, taxPct: number }[]) {
  return items.reduce((sum, i) => sum + getFinalPricePerItem(i.qty, i.price, i.taxPct), 0);
}
