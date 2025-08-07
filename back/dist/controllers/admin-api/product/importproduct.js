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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPDF = exports.importProductFromPDF = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
// HARUS PAKAI require AGAR TIDAK ESM ERROR
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ dest: path_1.default.join(__dirname, "../../../uploads/pdf") });
// ========== Convert pecahan ke float ==========
function parseFraction(str) {
    let s = (str || "").replace(/\s/g, "").replace(/[^\d\-\/\.]/g, "");
    if (!s)
        return null;
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
function extractTextWithPos(filePath, log) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = new Uint8Array(fs_1.default.readFileSync(filePath));
        log.push({ step: "pdfjs_load", filePath });
        const doc = yield pdfjsLib.getDocument({ data }).promise;
        log.push({ step: "pdfjs_loaded", numPages: doc.numPages });
        const page = yield doc.getPage(1);
        const content = yield page.getTextContent();
        let items = content.items.map((item) => ({
            str: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height
        }));
        log.push({ step: "text_items", count: items.length, sample: items.slice(0, 5) });
        // Group by Y (row)
        const yMap = {};
        items.forEach((it) => {
            let foundY = Object.keys(yMap).find(yKey => Math.abs(Number(yKey) - it.y) < 2);
            const yKey = typeof foundY === "string" ? foundY : String(it.y);
            if (!yMap[yKey])
                yMap[yKey] = [];
            yMap[yKey].push(it);
        });
        let lines = [];
        Object.entries(yMap)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .forEach(([y, arr]) => {
            const line = arr.sort((a, b) => a.x - b.x).map(it => it.str).join(" | ");
            lines.push(line);
        });
        log.push({ step: "lines", lines: lines.slice(0, 10) });
        return lines;
    });
}
function isPartNumber(str) {
    return /^[A-Z0-9]+-\w+/i.test(str);
}
function toProductName(partnumber) {
    return partnumber.split("-")[0].trim();
}
function parseTable(lines) {
    let headerIdx = lines.findIndex(line => /Part Number/i.test(line));
    if (headerIdx === -1)
        return { header: [], rows: [] };
    let headerLine = lines[headerIdx];
    let header = headerLine.split("|").map(h => h.trim());
    let rows = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
        if (/Page/i.test(lines[i]))
            break;
        let row = lines[i].split("|").map(c => c.trim());
        if (row.some(isPartNumber))
            rows.push(row);
    }
    return { header, rows };
}
function extractDescription(lines, headerIdx) {
    return lines.slice(0, headerIdx)
        .filter(l => l && !/^ *\|? *Page/i.test(l))
        .map(l => l.replace(/^\s*\|?/, "").trim())
        .join("\n");
}
function mapHeaderToField(header) {
    const lower = header.toLowerCase();
    if (/(i\.?d\.?|inner)/.test(lower))
        return "InnerDiameter";
    if (/(o\.?d\.?|outer)/.test(lower))
        return "OuterDiameter";
    if (/working.?pressure/i.test(lower) || /w\.?p\.?/i.test(lower))
        return "WorkingPressure";
    if (/bursting.?pressure/i.test(lower) || /b\.?p\.?/i.test(lower))
        return "BurstingPressure";
    if (/bend/i.test(lower))
        return "BendingRadius";
    if (/weight/i.test(lower))
        return "HoseWeight";
    if (/dash/i.test(lower))
        return "Dash";
    return null;
}
// ========== CORE PDF to DB & REMOVE DUPLICATE ==========
function processPDFtoDB(lines, log) {
    return __awaiter(this, void 0, void 0, function* () {
        let allParts = [];
        lines.forEach(line => line.split("|").forEach(cell => {
            let c = cell.trim();
            if (isPartNumber(c))
                allParts.push(c);
        }));
        allParts = [...new Set(allParts)];
        if (allParts.length === 0)
            throw new Error("No partnumber found in lines");
        const productName = toProductName(allParts[0]);
        log.push({ step: "detected_product", productName, partExample: allParts[0] });
        const { header, rows } = parseTable(lines);
        let headerIdx = lines.findIndex(line => /Part Number/i.test(line));
        const description = extractDescription(lines, headerIdx === -1 ? lines.length : headerIdx);
        log.push({ step: "parsed_description", description });
        // Cek duplikat product
        const existingProducts = yield prisma.product.findMany({
            where: { Name: productName }
        });
        if (existingProducts.length > 1) {
            for (const prod of existingProducts) {
                yield prisma.partNumber.deleteMany({ where: { ProductId: prod.Id } });
                yield prisma.product.delete({ where: { Id: prod.Id } });
                log.push({ step: "harddelete_duplicate_product", id: prod.Id });
            }
        }
        else if (existingProducts.length === 1) {
            if (existingProducts[0].DeletedAt) {
                yield prisma.product.update({
                    where: { Id: existingProducts[0].Id },
                    data: { DeletedAt: null, Description: description }
                });
                log.push({ step: "reactivate_product", id: existingProducts[0].Id });
                yield prisma.partNumber.deleteMany({ where: { ProductId: existingProducts[0].Id } });
            }
            else {
                yield prisma.product.update({
                    where: { Id: existingProducts[0].Id },
                    data: { Description: description }
                });
                yield prisma.partNumber.deleteMany({ where: { ProductId: existingProducts[0].Id } });
                log.push({ step: "replace_existing_product", id: existingProducts[0].Id });
            }
        }
        // Insert product baru jika belum ada
        let product = yield prisma.product.findFirst({
            where: { Name: productName, DeletedAt: null }
        });
        if (!product) {
            product = yield prisma.product.create({
                data: { Name: productName, Description: description }
            });
            log.push({ step: "insert_product", id: product.Id });
        }
        // Insert semua partnumber baru
        for (const row of rows) {
            let partObj = {};
            header.forEach((col, i) => {
                let field = mapHeaderToField(col);
                let rawVal = row[i] ? row[i].trim() : "";
                let value = rawVal.replace(",", ".").replace(/[^0-9\.\-\/]/g, "");
                if (field && value && value.length > 0) {
                    if (field === "Dash")
                        partObj.Dash = parseFraction(value) ? parseInt(value, 10) : null;
                    else
                        partObj[field] = parseFraction(value);
                }
            });
            let pn = row.find(isPartNumber);
            if (!pn)
                continue;
            let descArr = [];
            header.forEach((col, i) => {
                let field = mapHeaderToField(col);
                if (!field && row[i] && row[i] !== pn)
                    descArr.push(`${col}: ${row[i]}`);
            });
            let partDesc = descArr.join(", ") || null;
            // Cek partnumber duplikat
            const existParts = yield prisma.partNumber.findMany({ where: { Name: pn } });
            if (existParts.length > 1) {
                for (const oldpn of existParts) {
                    yield prisma.partNumber.delete({ where: { Id: oldpn.Id } });
                    log.push({ step: "harddelete_duplicate_partnumber", id: oldpn.Id });
                }
            }
            else if (existParts.length === 1) {
                yield prisma.partNumber.update({
                    where: { Id: existParts[0].Id },
                    data: Object.assign({ DeletedAt: null, ProductId: product.Id, Description: partDesc }, partObj)
                });
                log.push({ step: "reactivate_partnumber", id: existParts[0].Id, part: pn });
                continue;
            }
            const created = yield prisma.partNumber.create({
                data: Object.assign({ Name: pn, ProductId: product.Id, Description: partDesc }, partObj)
            });
            log.push({ step: "insert_partnumber", part: pn, desc: partDesc, partObj });
        }
    });
}
// =======================
// Multi-file Support
// =======================
exports.importProductFromPDF = [
    upload.array("file", 50), // max 10 files, sesuaikan kalau mau lebih
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const logs = [];
        try {
            if (!req.files || !req.files.length) {
                logs.push({ step: "file_missing" });
                res.status(400).json({ message: "No PDF file uploaded.", log: logs });
                return;
            }
            // Proses semua file satu per satu, log masing-masing
            for (const file of req.files) {
                const sublog = [];
                try {
                    sublog.push({ step: "file_ok", file: file.path });
                    const lines = yield extractTextWithPos(file.path, sublog);
                    sublog.push({ step: "extract_done", lineCount: lines.length, preview: lines.slice(0, 8) });
                    yield processPDFtoDB(lines, sublog);
                }
                catch (err) {
                    sublog.push({ step: "ERROR", err: err.message });
                }
                logs.push({ file: file.originalname, log: sublog });
            }
            res.json({ message: "Import success", logs });
        }
        catch (error) {
            logs.push({ step: "ERROR", err: error.message });
            res.status(500).json({ message: "Import failed", error: error.message, logs });
        }
    })
];
exports.uploadPDF = upload;
