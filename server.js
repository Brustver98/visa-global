const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 8080;

// ===== Config =====
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123"; // change in Railway variables!
const COOKIE_NAME = "vg_admin";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "cases.json");
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, "uploads");

// Railway: ephemeral disk. If you need persistent storage, use an external storage.
// Still OK for simple use / demos.

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===== Helpers =====
function nowISO() {
  return new Date().toISOString();
}

function readCases() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function writeCases(cases) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cases, null, 2), "utf-8");
}

function genCode() {
  // like VG-AB12C-3D4E
  const a = crypto.randomBytes(2).toString("hex").toUpperCase();
  const b = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `VG-${a}-${b}`;
}

function signSession(value) {
  const secret = process.env.SESSION_SECRET || "change-me-please";
  const h = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${h}`;
}

function verifySession(signed) {
  if (!signed || typeof signed !== "string") return false;
  const secret = process.env.SESSION_SECRET || "change-me-please";
  const parts = signed.split(".");
  if (parts.length < 2) return false;
  const value = parts.slice(0, -1).join(".");
  const sig = parts[parts.length - 1];
  const h = crypto.createHmac("sha256", secret).update(value).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(h));
}

function isAuthed(req) {
  const v = req.cookies[COOKIE_NAME];
  return verifySession(v);
}

function requireAuth(req, res, next) {
  if (!isAuthed(req)) return res.status(401).json({ error: "unauthorized" });
  next();
}

function safeText(s) {
  if (typeof s !== "string") return "";
  return s.slice(0, 5000);
}

function normalizeStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "ИЗДАННЫЙ" || v === "ISSUED") return "ISSUED";
  if (v === "ОТМЕНЕНО" || v === "CANCELLED" || v === "ОТМЕНЁНО") return "CANCELLED";
  return "PENDING";
}

// ===== Cleanup expired cases =====
function cleanupExpired() {
  const cases = readCases();
  const now = Date.now();
  const kept = [];
  for (const c of cases) {
    if (c.expiresAt && Date.parse(c.expiresAt) <= now) {
      // delete uploads folder
      if (c.code) {
        const dir = path.join(UPLOADS_DIR, c.code);
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
      }
      continue;
    }
    kept.push(c);
  }
  if (kept.length !== cases.length) writeCases(kept);
}
setInterval(cleanupExpired, 60 * 1000);
cleanupExpired();

// ===== Static =====
app.use("/public", express.static(path.join(__dirname, "public"), { maxAge: "1h" }));
app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "0" }));

// Pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/check", (req, res) => res.sendFile(path.join(__dirname, "public", "check.html")));
app.get("/admin-login", (req, res) => res.sendFile(path.join(__dirname, "public", "admin-login.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

// ===== Multer upload =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const code = String(req.params.code || "");
    const dir = path.join(UPLOADS_DIR, code);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-()\s]/g, "_").slice(0, 120);
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 } // 10MB each
});

// ===== API: Auth =====
app.post("/api/admin/login", (req, res) => {
  const user = String(req.body.username || "");
  const pass = String(req.body.password || "");
  // timing-safe compare
  const okUser = crypto.timingSafeEqual(Buffer.from(user), Buffer.from(ADMIN_USER));
  const okPass = crypto.timingSafeEqual(Buffer.from(pass), Buffer.from(ADMIN_PASS));
  if (!okUser || !okPass) return res.status(401).json({ error: "invalid" });

  const token = signSession(`${user}:${Date.now()}`);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // Railway has HTTPS at edge; still ok. If using custom HTTPS, can set true.
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get("/api/admin/me", (req, res) => {
  res.json({ authed: isAuthed(req) });
});

// ===== API: Cases =====
app.get("/api/cases", requireAuth, (req, res) => {
  cleanupExpired();
  const cases = readCases().sort((a,b)=> Date.parse(b.createdAt)-Date.parse(a.createdAt));
  res.json(cases);
});

app.post("/api/cases", requireAuth, (req, res) => {
  cleanupExpired();
  const cases = readCases();
  const title = safeText(req.body.title || "").trim();
  const notes = safeText(req.body.notes || "").trim();
  const status = normalizeStatus(req.body.status);
  const ttlDays = Number(req.body.ttlDays || 0);

  if (!title) return res.status(400).json({ error: "title_required" });

  let code = genCode();
  while (cases.some(c => c.code === code)) code = genCode();

  const createdAt = nowISO();
  let expiresAt = null;
  if (ttlDays && ttlDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + Math.min(ttlDays, 60)); // cap 60 days
    expiresAt = d.toISOString();
  }

  const nextId = (cases.reduce((m,c)=>Math.max(m, c.id||0), 0) || 0) + 1;

  const item = {
    id: nextId,
    code,
    status,
    title,
    notes,
    createdAt,
    expiresAt,
    files: [] // will be filled from disk
  };

  cases.push(item);
  writeCases(cases);
  res.json(item);
});

app.delete("/api/cases/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const cases = readCases();
  const idx = cases.findIndex(c => Number(c.id) === id);
  if (idx === -1) return res.status(404).json({ error: "not_found" });

  const [removed] = cases.splice(idx, 1);
  writeCases(cases);

  if (removed && removed.code) {
    const dir = path.join(UPLOADS_DIR, removed.code);
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
  res.json({ ok: true });
});

app.post("/api/cases/:id/status", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const cases = readCases();
  const idx = cases.findIndex(c => Number(c.id) === id);
  if (idx === -1) return res.status(404).json({ error: "not_found" });

  cases[idx].status = normalizeStatus(req.body.status);
  writeCases(cases);
  res.json(cases[idx]);
});

app.post("/api/cases/:id/notes", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const cases = readCases();
  const idx = cases.findIndex(c => Number(c.id) === id);
  if (idx === -1) return res.status(404).json({ error: "not_found" });

  cases[idx].notes = safeText(req.body.notes || "").trim();
  writeCases(cases);
  res.json(cases[idx]);
});

app.post("/api/cases/:code/upload", requireAuth, upload.array("files", 10), (req, res) => {
  const code = String(req.params.code);
  const cases = readCases();
  const idx = cases.findIndex(c => c.code === code);
  if (idx === -1) return res.status(404).json({ error: "not_found" });

  res.json({ ok: true });
});

// ===== Public check =====
function listFilesForCode(code) {
  const dir = path.join(UPLOADS_DIR, code);
  if (!fs.existsSync(dir)) return [];
  const items = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => d.name)
    .sort();
  return items.map(name => ({
    name,
    url: `/uploads/${encodeURIComponent(code)}/${encodeURIComponent(name)}`
  }));
}

app.get("/api/check/:code", (req, res) => {
  cleanupExpired();
  const code = String(req.params.code || "").trim().toUpperCase();
  const cases = readCases();
  const item = cases.find(c => c.code === code);
  if (!item) return res.status(404).json({ error: "not_found" });

  const files = listFilesForCode(code);
  res.json({
    code: item.code,
    status: item.status,
    title: item.title,
    notes: item.notes || "",
    createdAt: item.createdAt,
    expiresAt: item.expiresAt,
    files
  });
});

// Health
app.get("/health", (req,res)=>res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Visa Global running on :${PORT}`);
});
