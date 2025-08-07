"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderSummary = calculateOrderSummary;
exports.apiPricingCalculate = apiPricingCalculate;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Fungsi untuk ambil tax aktif (hanya jika forceApplyActiveTax true)
 */
function getActiveTax() {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.tax.findFirst({
            where: { IsActive: true, DeletedAt: null },
            orderBy: { Id: "desc" }
        });
    });
}
/**
 * Fungsi utama kalkulasi pricing
 */
function calculateOrderSummary(items_1) {
    return __awaiter(this, arguments, void 0, function* (items, forceApplyActiveTax = false) {
        var _a;
        let activeTax = null;
        if (forceApplyActiveTax) {
            activeTax = yield getActiveTax();
        }
        const detailResults = items.map(item => {
            const price = item.Price || 0;
            const qty = item.Quantity || 0;
            const baseTax = forceApplyActiveTax
                ? (activeTax ? activeTax.Percentage : 0)
                : (item.TaxPercentage !== undefined && item.TaxPercentage !== null ? item.TaxPercentage : 0);
            const subtotal = price * qty;
            const finalPrice = Math.round(subtotal * (1 + baseTax / 100));
            const taxAmount = finalPrice - subtotal;
            items.forEach((item, i) => {
                // Jika pakai map: const detailResults = items.map((item, i) => { ... });
                const price = item.Price || 0;
                const qty = item.Quantity || 0;
                const baseTax = forceApplyActiveTax
                    ? (activeTax ? activeTax.Percentage : 0)
                    : (item.TaxPercentage !== undefined && item.TaxPercentage !== null ? item.TaxPercentage : 0);
                // DEBUG LOG
                console.log(`[DEBUG PRICING] item[${i}]:`, {
                    forceApplyActiveTax,
                    activeTax: activeTax ? { id: activeTax.Id, perc: activeTax.Percentage } : null,
                    itemTax: item.TaxPercentage,
                    baseTax,
                    qty,
                    price
                });
                // ... lanjut kalkulasi
            });
            return {
                ItemCodeId: item.ItemCodeId,
                Quantity: qty,
                Price: price,
                Subtotal: subtotal,
                TaxPercentage: baseTax,
                TaxAmount: taxAmount,
                FinalPrice: finalPrice
            };
        });
        const subtotal = detailResults.reduce((sum, d) => sum + d.Subtotal, 0);
        const totalWithTax = detailResults.reduce((sum, d) => sum + d.FinalPrice, 0);
        const totalTax = totalWithTax - subtotal;
        return {
            details: detailResults,
            subtotal,
            totalTax,
            totalWithTax,
            activeTax: activeTax
                ? {
                    Id: activeTax.Id,
                    Name: (_a = activeTax.Name) !== null && _a !== void 0 ? _a : undefined,
                    Percentage: activeTax.Percentage
                }
                : null
        };
    });
}
/**
 * API Handler untuk Pricing Calculation
 */
function apiPricingCalculate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { details, forceApplyActiveTax } = req.body;
            if (!Array.isArray(details) || details.length === 0) {
                res.status(400).json({ message: "Detail tidak boleh kosong" });
                return;
            }
            const result = yield calculateOrderSummary(details, !!forceApplyActiveTax);
            console.log("FETCH WH WAREHOUSE, PAYLOAD:", req.body);
            res.json(result);
        }
        catch (err) {
            console.error("Pricing Calculate Error:", err);
            res.status(500).json({ message: "Terjadi error perhitungan" });
        }
    });
}
