const Database = require("better-sqlite3");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DB_PATH = "data/vault.db";
const db = new Database(DB_PATH);

// 1. Get the session key (we use the most recent active session)
const session = db.prepare("SELECT key_b64 FROM sessions WHERE expires_at > ? ORDER BY created_at DESC LIMIT 1").get(Date.now());
if (!session) {
    console.error("No active session found. Please log in to the app first.");
    process.exit(1);
}
const key = Buffer.from(session.key_b64, "base64");

// Crypto helpers (matching src/lib/crypto.ts)
function encrypt(text, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString("base64");
}

function newId(prefix) {
    return prefix + "_" + crypto.randomBytes(12).toString("hex");
}

const desktopPath = "/Users/rahul/Desktop/Private & Shared";
const csvPath = path.join(desktopPath, "JV Client Website List e69dae8d0967431d8690ed44d0f250fd_all.csv");
const mdDir = path.join(desktopPath, "JV Client Website List");

if (!fs.existsSync(csvPath)) {
    console.error("CSV not found at " + csvPath);
    process.exit(1);
}

const csvContent = fs.readFileSync(csvPath, "utf-8");
const lines = csvContent.split("\n").filter(l => l.trim());
const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));

// Find primary workspace
let ws = db.prepare("SELECT id FROM workspaces LIMIT 1").get();
if (!ws) {
    const wsId = `ws_${Date.now()}`;
    db.prepare("INSERT INTO workspaces (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)")
      .run(wsId, "Primary Workspace", Date.now(), Date.now());
    ws = { id: wsId };
}
const wsId = ws.id;

// Clear existing clients to give "full workspace"
db.prepare("DELETE FROM clients WHERE workspace_id = ?").run(wsId);
console.log("Cleared existing clients in workspace: " + wsId);

const mdFiles = fs.readdirSync(mdDir).filter(f => f.endsWith(".md"));
let count = 0;

function parseCsvLine(line) {
    const result = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = "";
        } else {
            cur += c;
        }
    }
    result.push(cur.trim());
    return result;
}

function parseMarkdownSections(md) {
    const sections = [];
    const parts = md.split(/^### /m);
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const lines = part.split("\n").filter(l => l.trim());
        if (lines.length < 3) continue;

        const title = lines[0].trim();
        const headerLine = lines[1];
        const separatorLine = lines[2];
        if (!headerLine.includes("|") || !separatorLine.includes("---")) continue;

        const headers = headerLine.split("|").map(h => h.trim()).filter(h => h);
        const columns = headers.map((h, idx) => ({
            id: `c${idx}_${Math.random().toString(36).slice(2, 6)}`,
            name: h,
            type: h.toLowerCase().includes("password") || h.toLowerCase().includes("pass") ? "secret" : 
                  h.toLowerCase().includes("url") ? "url" :
                  h.toLowerCase().includes("email") || h.toLowerCase().includes("login") ? "email" :
                  h.toLowerCase().includes("date") || h.toLowerCase().includes("expiry") ? "date" : "text",
            width: 200
        }));

        const rows = [];
        for (let j = 3; j < lines.length; j++) {
            const cells = lines[j].split("|").map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
            if (cells.length === 0) continue;

            const rowCells = {};
            columns.forEach((col, idx) => {
                let val = cells[idx] || "";
                if (val.startsWith("[") && val.includes("](")) {
                    const match = val.match(/\[(.*?)\]\((.*?)\)/);
                    if (match) val = match[1];
                }
                rowCells[col.id] = val;
            });
            rows.push({ id: `r${j}_${Math.random().toString(36).slice(2, 6)}`, cells: rowCells });
        }
        sections.push({ id: `sec_${i}_${Math.random().toString(36).slice(2, 6)}`, title, columns, rows });
    }
    return sections;
}

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/[^a-z0-9]/g, "") // Remove all non-alphanumeric
        .trim();
}

for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.length < headers.length) continue;

    const websiteName = row[0];
    const attrs = {
        col_website: row[0],
        col_amc: row[1],
        col_domain: row[2],
        col_backup: row[4],
        col_note: row[5],
        col_jv_client: row[6],
    };

    const mdFile = mdFiles.find(f => {
        const namePart = f.replace(/\s[a-f0-9]{32}\.md$/, "").replace(/\.md$/, "");
        const n1 = normalize(namePart);
        const n2 = normalize(websiteName);
        // Direct match or one contains the other (for things like "Icbc jaiveeru site" vs "Icbc.jaiveeru.site")
        return n1 === n2 || n1.includes(n2) || n2.includes(n1);
    });

    let sections = [];
    if (mdFile) {
        const mdContent = fs.readFileSync(path.join(mdDir, mdFile), "utf-8");
        sections = parseMarkdownSections(mdContent);
    }

    // If still no sections, provide the default template structure
    if (sections.length === 0) {
        const DEFAULT_SECTIONS = [
            { id: "sec_web_admin", title: "Website Admin", columns: [
                { id: "c1", name: "Admin Login URL", type: "url", width: 220 },
                { id: "c2", name: "Username", type: "text", width: 150 },
                { id: "c3", name: "Password", type: "secret", width: 150 },
                { id: "c4", name: "Email", type: "email", width: 200 }
            ], rows: [] },
            { id: "sec_hosting", title: "Hosting cPanel / hPanel", columns: [
                { id: "h1", name: "Login URL", type: "url", width: 220 },
                { id: "h2", name: "Username", type: "text", width: 150 },
                { id: "h3", name: "Password", type: "secret", width: 150 },
                { id: "h4", name: "Expiration date", type: "date", width: 180 }
            ], rows: [] }
        ];
        // Deep clone and add an empty row to each to make them ready to fill
        sections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS)).map(sec => ({
            ...sec,
            id: sec.id + "_" + Math.random().toString(36).slice(2, 6),
            rows: [{ id: "r1", cells: {} }]
        }));
    }

    const id = newId("cli");
    db.prepare(
      `INSERT INTO clients (id, workspace_id, name, position, attrs_ct, sections_ct, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      wsId,
      websiteName,
      i,
      encrypt(JSON.stringify(attrs), key),
      encrypt(JSON.stringify(sections), key),
      Date.now(),
      Date.now()
    );
    count++;
}

console.log(`Successfully imported ${count} clients into ${wsId}`);
