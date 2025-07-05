import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

// HARUS PAKAI require AGAR TIDAK ESM ERROR
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

const prisma = new PrismaClient();
const upload = multer({ dest: path.join(__dirname, "../../../uploads/pdf") });

// ========== Convert pecahan ke float ==========
function parseFraction(str: string): number | null {
    let s = (str || "").replace(/\s/g, "").replace(/[^\d\-\/\.]/g, "");
    if (!s) return null;
    if (/^-?\d+\-\d+\/\d+$/.test(s)) {
        let [main, frac] = s.split("-");
        let [num, den] = frac.split("/");
        return parseInt(main, 10) + (parseInt(num, 10) / parseInt(den, 10));
    }
    if (/^-?\d+\/\d+$/.test(s)) {
        let [num, den] = s.split("/");
        return parseInt(num, 10) / parseInt(den, 10);
    }
    if (/^-?\d+(\.\d+)?$/.test(s)) {
        return parseFloat(s);
    }
    return null;
}

async function extractTextWithPos(filePath: string, log: any[]) {
    const data = new Uint8Array(fs.readFileSync(filePath));
    log.push({ step: "pdfjs_load", filePath });

    const doc = await pdfjsLib.getDocument({ data }).promise;
    log.push({ step: "pdfjs_loaded", numPages: doc.numPages });

    const page = await doc.getPage(1);
    const content = await page.getTextContent();

    let items = content.items.map((item: any) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height
    }));

    log.push({ step: "text_items", count: items.length, sample: items.slice(0, 5) });

    // Group by Y (row)
    const yMap: Record<string, any[]> = {};
    items.forEach((it: { y: number; }) => {
        let foundY = Object.keys(yMap).find(yKey => Math.abs(Number(yKey) - it.y) < 2);
        const yKey = typeof foundY === "string" ? foundY : String(it.y);
        if (!yMap[yKey]) yMap[yKey] = [];
        yMap[yKey].push(it);
    });

    let lines: string[] = [];
    Object.entries(yMap)
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .forEach(([y, arr]) => {
            const line = arr.sort((a, b) => a.x - b.x).map(it => it.str).join(" | ");
            lines.push(line);
        });

    log.push({ step: "lines", lines: lines.slice(0, 10) });
    return lines;
}

function isPartNumber(str: string) {
    return /^[A-Z0-9]+-\w+/i.test(str);
}
function toProductName(partnumber: string) {
    return partnumber.split("-")[0].trim();
}
function parseTable(lines: string[]) {
    let headerIdx = lines.findIndex(line => /Part Number/i.test(line));
    if (headerIdx === -1) return { header: [], rows: [] };
    let headerLine = lines[headerIdx];
    let header = headerLine.split("|").map(h => h.trim());
    let rows: string[][] = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        if (/Page/i.test(lines[i])) break;
        let row = lines[i].split("|").map(c => c.trim());
        if (row.some(isPartNumber)) rows.push(row);
    }
    return { header, rows };
}
function extractDescription(lines: string[], headerIdx: number) {
    return lines.slice(0, headerIdx)
        .filter(l => l && !/^ *\|? *Page/i.test(l))
        .map(l => l.replace(/^\s*\|?/, "").trim())
        .join("\n");
}
function mapHeaderToField(header: string): string | null {
    const lower = header.toLowerCase();
    if (/(i\.?d\.?|inner)/.test(lower)) return "InnerDiameter";
    if (/(o\.?d\.?|outer)/.test(lower)) return "OuterDiameter";
    if (/working.?pressure/i.test(lower) || /w\.?p\.?/i.test(lower)) return "WorkingPressure";
    if (/bursting.?pressure/i.test(lower) || /b\.?p\.?/i.test(lower)) return "BurstingPressure";
    if (/bend/i.test(lower)) return "BendingRadius";
    if (/weight/i.test(lower)) return "HoseWeight";
    if (/dash/i.test(lower)) return "Dash";
    return null;
}

// ========== CORE PDF to DB & REMOVE DUPLICATE ==========
async function processPDFtoDB(lines: string[], log: any[]) {
    let allParts: string[] = [];
    lines.forEach(line => line.split("|").forEach(cell => {
        let c = cell.trim();
        if (isPartNumber(c)) allParts.push(c);
    }));
    allParts = [...new Set(allParts)];
    if (allParts.length === 0) throw new Error("No partnumber found in lines");
    const productName = toProductName(allParts[0]);
    log.push({ step: "detected_product", productName, partExample: allParts[0] });

    const { header, rows } = parseTable(lines);
    let headerIdx = lines.findIndex(line => /Part Number/i.test(line));
    const description = extractDescription(lines, headerIdx === -1 ? lines.length : headerIdx);
    log.push({ step: "parsed_description", description });

    // Cek duplikat product
    const existingProducts = await prisma.product.findMany({
        where: { Name: productName }
    });
    if (existingProducts.length > 1) {
        for (const prod of existingProducts) {
            await prisma.partNumber.deleteMany({ where: { ProductId: prod.Id } });
            await prisma.product.delete({ where: { Id: prod.Id } });
            log.push({ step: "harddelete_duplicate_product", id: prod.Id });
        }
    } else if (existingProducts.length === 1) {
        if (existingProducts[0].DeletedAt) {
            await prisma.product.update({
                where: { Id: existingProducts[0].Id },
                data: { DeletedAt: null, Description: description }
            });
            log.push({ step: "reactivate_product", id: existingProducts[0].Id });
            await prisma.partNumber.deleteMany({ where: { ProductId: existingProducts[0].Id } });
        } else {
            await prisma.product.update({
                where: { Id: existingProducts[0].Id },
                data: { Description: description }
            });
            await prisma.partNumber.deleteMany({ where: { ProductId: existingProducts[0].Id } });
            log.push({ step: "replace_existing_product", id: existingProducts[0].Id });
        }
    }

    // Insert product baru jika belum ada
    let product = await prisma.product.findFirst({
        where: { Name: productName, DeletedAt: null }
    });
    if (!product) {
        product = await prisma.product.create({
            data: { Name: productName, Description: description }
        });
        log.push({ step: "insert_product", id: product.Id });
    }

    // Insert semua partnumber baru
    for (const row of rows) {
        let partObj: any = {};
        header.forEach((col, i) => {
            let field = mapHeaderToField(col);
            let rawVal = row[i] ? row[i].trim() : "";
            let value = rawVal.replace(",", ".").replace(/[^0-9\.\-\/]/g, "");
            if (field && value && value.length > 0) {
                if (field === "Dash") partObj.Dash = parseFraction(value) ? parseInt(value, 10) : null;
                else partObj[field] = parseFraction(value);
            }
        });
        let pn = row.find(isPartNumber);
        if (!pn) continue;
        let descArr: string[] = [];
        header.forEach((col, i) => {
            let field = mapHeaderToField(col);
            if (!field && row[i] && row[i] !== pn) descArr.push(`${col}: ${row[i]}`);
        });
        let partDesc = descArr.join(", ") || null;

        // Cek partnumber duplikat
        const existParts = await prisma.partNumber.findMany({ where: { Name: pn } });
        if (existParts.length > 1) {
            for (const oldpn of existParts) {
                await prisma.partNumber.delete({ where: { Id: oldpn.Id } });
                log.push({ step: "harddelete_duplicate_partnumber", id: oldpn.Id });
            }
        } else if (existParts.length === 1) {
            await prisma.partNumber.update({
                where: { Id: existParts[0].Id },
                data: { DeletedAt: null, ProductId: product.Id, Description: partDesc, ...partObj }
            });
            log.push({ step: "reactivate_partnumber", id: existParts[0].Id, part: pn });
            continue;
        }
        const created = await prisma.partNumber.create({
            data: {
                Name: pn,
                ProductId: product.Id,
                Description: partDesc,
                ...partObj
            }
        });
        log.push({ step: "insert_partnumber", part: pn, desc: partDesc, partObj });
    }
}

// =======================
// Multi-file Support
// =======================
export const importProductFromPDF = [
    upload.array("file", 50), // max 10 files, sesuaikan kalau mau lebih
    async (req: Request, res: Response) => {
        const logs: any[] = [];
        try {
            if (!req.files || !(req.files as Express.Multer.File[]).length) {
                logs.push({ step: "file_missing" });
                res.status(400).json({ message: "No PDF file uploaded.", log: logs });
                return;
            }
            // Proses semua file satu per satu, log masing-masing
            for (const file of req.files as Express.Multer.File[]) {
                const sublog: any[] = [];
                try {
                    sublog.push({ step: "file_ok", file: file.path });
                    const lines = await extractTextWithPos(file.path, sublog);
                    sublog.push({ step: "extract_done", lineCount: lines.length, preview: lines.slice(0, 8) });
                    await processPDFtoDB(lines, sublog);
                } catch (err) {
                    sublog.push({ step: "ERROR", err: (err as Error).message });
                }
                logs.push({ file: file.originalname, log: sublog });
            }
            res.json({ message: "Import success", logs });
        } catch (error) {
            logs.push({ step: "ERROR", err: (error as Error).message });
            res.status(500).json({ message: "Import failed", error: (error as Error).message, logs });
        }
    }
];

export const uploadPDF = upload;
