const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ==== Settings (CHANGE THESE) ====
const APP_NAME = "Visa Global";
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_ME_SUPER_LONG_SECRET_123456789";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin12345"; // CHANGE!
// =================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Static
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOAD_DIR));

// Pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/check", (req, res) => res.sendFile(path.join(__dirname, "public", "check.html")));
app.get("/admin/login", (req, res) => res.sendFile(path.join(__dirname, "public", "admin-login.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

// ===== DB =====
const db = new sqlite3.Database(path.join(__dirname, "db.sqlite"));

function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        title TEXT DEFAULT '',
        note TEXT DEFAULT '',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL,
        original_name TEXT NOT NULL,
        stored_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
      )
    `);
  });
}
initDb();

function nowIso() {
  return new Date().toISOString();
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rnd = (n) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `VG-${rnd(4)}-${rnd(4)}`;
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.vg_admin;
  if (!token) return res.status(401).json({ ok: false, message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload?.u !== ADMIN_USER) throw new Error("bad user");
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
}

// ===== Uploads =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only PDF/JPG/PNG/WEBP allowed"), ok);
  },
});

// ===== Client API =====
app.get("/api/check", (req, res) => {
  const code = (req.query.code || "").trim().toUpperCase();
  if (!code) return res.status(400).json({ ok: false, message: "Please enter a reference code." });

  db.get(`SELECT * FROM cases WHERE code = ?`, [code], (err, row) => {
    if (err) return res.status(500).json({ ok: false, message: "Server error." });
    if (!row || row.is_active !== 1)
      return res.status(404).json({ ok: false, message: "Reference code not found." });

    db.all(
      `SELECT id, original_name, stored_name, mime_type, size FROM files WHERE case_id = ? ORDER BY id DESC`,
      [row.id],
      (e2, files) => {
        if (e2) return res.status(500).json({ ok: false, message: "Server error." });

        const mapped = (files || []).map((f) => ({
          id: f.id,
          name: f.original_name,
          mime: f.mime_type,
          size: f.size,
          url: `/uploads/${f.stored_name}`,
        }));

        return res.json({
          ok: true,
          appName: APP_NAME,
          code: row.code,
          status: row.status,
          title: row.title || "Invitation status",
          note: row.note || "",
          files: mapped,
        });
      }
    );
  });
});

// ===== Admin API =====
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ ok: false, message: "Missing credentials." });
  if (username !== ADMIN_USER) return res.status(401).json({ ok: false, message: "Invalid login." });

  const hash = await bcrypt.hash(ADMIN_PASS, 10);
  const match = await bcrypt.compare(password, hash);
  if (!match) return res.status(401).json({ ok: false, message: "Invalid login." });

  const token = jwt.sign({ u: ADMIN_USER }, JWT_SECRET, { expiresIn: "7d" });

  // Railway -> HTTPS, cookie secure in production
  const secureCookie = process.env.NODE_ENV === "production";

  res.cookie("vg_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ ok: true });
});

app.post("/api/admin/logout", authMiddleware, (req, res) => {
  res.clearCookie("vg_admin");
  res.json({ ok: true });
});

app.post("/api/admin/cases", authMiddleware, (req, res) => {
  const { status, title, note } = req.body || {};
  const code = genCode();

  const st = (status || "PENDING").toUpperCase();
  const allowed = ["PENDING", "ISSUED", "CANCELLED"];
  if (!allowed.includes(st)) return res.status(400).json({ ok: false, message: "Bad status." });

  db.run(
    `INSERT INTO cases (code, status, title, note, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)`,
    [code, st, title || "Invitation status", note || "", nowIso()],
    function (err) {
      if (err) return res.status(500).json({ ok: false, message: "DB error." });
      return res.json({ ok: true, id: this.lastID, code });
    }
  );
});

app.get("/api/admin/cases", authMiddleware, (req, res) => {
  db.all(
    `SELECT id, code, status, title, note, is_active, created_at FROM cases ORDER BY id DESC LIMIT 200`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, message: "DB error." });
      res.json({ ok: true, rows });
    }
  );
});

app.put("/api/admin/cases/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { status, title, note, is_active } = req.body || {};

  const st = (status || "").toUpperCase();
  const allowed = ["PENDING", "ISSUED", "CANCELLED"];
  if (st && !allowed.includes(st)) return res.status(400).json({ ok: false, message: "Bad status." });

  db.run(
    `UPDATE cases
     SET status = COALESCE(?, status),
         title  = COALESCE(?, title),
         note   = COALESCE(?, note),
         is_active = COALESCE(?, is_active)
     WHERE id = ?`,
    [
      st || null,
      title !== undefined ? title : null,
      note !== undefined ? note : null,
      typeof is_active === "number" ? is_active : null,
      id,
    ],
    function (err) {
      if (err) return res.status(500).json({ ok: false, message: "DB error." });
      res.json({ ok: true, changed: this.changes });
    }
  );
});

app.post("/api/admin/cases/:id/files", authMiddleware, upload.array("files", 10), (req, res) => {
  const id = Number(req.params.id);

  db.get(`SELECT id FROM cases WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).json({ ok: false, message: "Case not found." });

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ ok: false, message: "No files uploaded." });

    const stmt = db.prepare(
      `INSERT INTO files (case_id, original_name, stored_name, mime_type, size, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const f of files) {
      stmt.run(id, f.originalname, f.filename, f.mimetype, f.size, nowIso());
    }

    stmt.finalize(() => res.json({ ok: true, count: files.length }));
  });
});

app.get("/api/admin/cases/:id/files", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  db.all(
    `SELECT id, original_name, stored_name, mime_type, size, uploaded_at
     FROM files WHERE case_id = ? ORDER BY id DESC`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ ok: false, message: "DB error." });
      const mapped = rows.map((r) => ({
        id: r.id,
        name: r.original_name,
        mime: r.mime_type,
        size: r.size,
        url: `/uploads/${r.stored_name}`,
        uploaded_at: r.uploaded_at,
      }));
      res.json({ ok: true, rows: mapped });
    }
  );
});

app.delete("/api/admin/files/:fileId", authMiddleware, (req, res) => {
  const fileId = Number(req.params.fileId);

  db.get(`SELECT stored_name FROM files WHERE id = ?`, [fileId], (err, row) => {
    if (err || !row) return res.status(404).json({ ok: false, message: "File not found." });

    const filePath = path.join(UPLOAD_DIR, row.stored_name);

    db.run(`DELETE FROM files WHERE id = ?`, [fileId], function (err2) {
      if (err2) return res.status(500).json({ ok: false, message: "DB error." });
      fs.unlink(filePath, () => res.json({ ok: true }));
    });
  });
});

// Healthcheck
app.get("/health", (req, res) => res.status(200).send("ok"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${APP_NAME} running on port ${PORT}`);
  console.log(`Admin: /admin/login`);
});
