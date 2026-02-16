/* Client (check page) */

const langSelect = document.getElementById("langSelect");
const savedLang = localStorage.getItem("vg_lang");
if (savedLang && langSelect) langSelect.value = savedLang;

function applyLang() {
  const lang = (langSelect && langSelect.value) || "en";
  localStorage.setItem("vg_lang", lang);
  if (window.VG_I18N) window.VG_I18N.setLang(lang);
}

if (langSelect) {
  langSelect.addEventListener("change", applyLang);
}
applyLang();

const form = document.getElementById("checkForm");
const codeInput = document.getElementById("codeInput");
const msg = document.getElementById("message");
const result = document.getElementById("result");

function showMsg(type, text) {
  msg.style.display = "block";
  msg.className = `msg ${type}`;
  msg.textContent = text;
}

function hideMsg() {
  msg.style.display = "none";
}

function bytesToSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = Number(bytes);
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function statusText(raw) {
  const st = String(raw || "").toUpperCase();
  const lang = window.VG_I18N ? window.VG_I18N.getLang() : "en";
  const map = {
    en: { PENDING: "PENDING", ISSUED: "ISSUED", CANCELLED: "CANCELLED" },
    ru: { PENDING: "В ОЖИДАНИИ", ISSUED: "ИЗДАННЫЙ", CANCELLED: "ОТМЕНЕНО" },
  };
  return (map[lang] && map[lang][st]) || st;
}

async function doCheck(code) {
  hideMsg();
  result.style.display = "none";

  const q = encodeURIComponent(code.trim());
  const r = await fetch(`/api/check?code=${q}`);
  const data = await r.json().catch(() => ({}));

  if (!r.ok || !data.ok) {
    const key = r.status === 404 ? "msg_not_found" : "msg_server_error";
    const txt = window.VG_I18N ? window.VG_I18N.t(key) : (data.message || "Error");
    showMsg("err", txt);
    return;
  }

  document.getElementById("rCode").textContent = data.code || "";
  document.getElementById("rStatus").textContent = statusText(data.status);
  document.getElementById("rTitle").textContent = data.title || "";
  document.getElementById("rNote").textContent = data.note || "";

  const filesBox = document.getElementById("filesBox");
  const filesList = document.getElementById("filesList");
  filesList.innerHTML = "";

  if (Array.isArray(data.files) && data.files.length) {
    filesBox.style.display = "block";
    for (const f of data.files) {
      const a = document.createElement("a");
      a.href = f.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "file";
      a.innerHTML = `<span class="name">${escapeHtml(f.name || "file")}</span><span class="meta">${bytesToSize(f.size)}</span>`;
      filesList.appendChild(a);
    }
  } else {
    filesBox.style.display = "none";
  }

  result.style.display = "block";
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = (codeInput.value || "").trim();
    if (!code) {
      const txt = window.VG_I18N ? window.VG_I18N.t("msg_enter_code") : "Enter code";
      showMsg("err", txt);
      return;
    }

    try {
      showMsg("", "");
      msg.style.display = "none";
      await doCheck(code);
    } catch (err) {
      const txt = window.VG_I18N ? window.VG_I18N.t("msg_server_error") : "Server error";
      showMsg("err", txt);
    }
  });
}
