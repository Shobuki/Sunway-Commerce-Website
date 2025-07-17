import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

/**
 * Tipe input detail untuk perhitungan kalkulasi
 */
export interface PricingItemInput {
    ItemCodeId: number;
    Quantity: number;
    Price: number;
    TaxPercentage?: number | null;
}

/**
 * Output hasil kalkulasi per item
 */
export interface PricingItemOutput {
    ItemCodeId: number;
    Quantity: number;
    Price: number;
    Subtotal: number;
    TaxPercentage: number;
    TaxAmount: number;
    FinalPrice: number;
}

/**
 * Output hasil kalkulasi summary seluruh order
 */
export interface PricingSummary {
    details: PricingItemOutput[];
    subtotal: number;
    totalTax: number;
    totalWithTax: number;
    activeTax?: {
        Id: number;
        Name?: string;
        Percentage: number;
    } | null;
}

/**
 * Fungsi untuk ambil tax aktif (hanya jika forceApplyActiveTax true)
 */
async function getActiveTax() {
    return prisma.tax.findFirst({
        where: { IsActive: true, DeletedAt: null },
        orderBy: { Id: "desc" }
    });
}

/**
 * Fungsi utama kalkulasi pricing
 */
export async function calculateOrderSummary(
    items: PricingItemInput[],
    forceApplyActiveTax: boolean = false
): Promise<PricingSummary> {
    let activeTax = null;

    if (forceApplyActiveTax) {
        activeTax = await getActiveTax();
    }

    const detailResults: PricingItemOutput[] = items.map(item => {
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
                Name: activeTax.Name ?? undefined,
                Percentage: activeTax.Percentage
            }
            : null
    };
}

/**
 * API Handler untuk Pricing Calculation
 */
export async function apiPricingCalculate(req: Request, res: Response) {
    try {
        const { details, forceApplyActiveTax } = req.body;
        if (!Array.isArray(details) || details.length === 0) {
            res.status(400).json({ message: "Detail tidak boleh kosong" });
            return;
        }
        const result = await calculateOrderSummary(details, !!forceApplyActiveTax);
        console.log("FETCH WH WAREHOUSE, PAYLOAD:", req.body)
        res.json(result);
    } catch (err) {
        console.error("Pricing Calculate Error:", err);
        res.status(500).json({ message: "Terjadi error perhitungan" });
    }
}
