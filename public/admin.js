/* Admin panel */

const langSelect = document.getElementById("langSelect");
const savedLang = localStorage.getItem("vg_lang");
if (savedLang && langSelect) langSelect.value = savedLang;

function applyLang() {
  const lang = (langSelect && langSelect.value) || "en";
  localStorage.setItem("vg_lang", lang);
  if (window.VG_I18N) window.VG_I18N.setLang(lang);
  // Re-render some dynamic labels if editor is open
  renderEditor();
}

if (langSelect) {
  langSelect.addEventListener("change", applyLang);
}
applyLang();

const el = {
  logout: document.getElementById("logoutBtn"),
  newStatus: document.getElementById("newStatus"),
  newTitle: document.getElementById("newTitle"),
  create: document.getElementById("createCaseBtn"),
  createdHint: document.getElementById("createdHint"),
  createdCode: document.getElementById("createdCode"),
  createdCopy: document.getElementById("createdCopy"),
  tableBody: document.getElementById("casesBody"),

  editor: document.getElementById("editor"),
  edCode: document.getElementById("edCode"),
  edStatus: document.getElementById("edStatus"),
  edActive: document.getElementById("edActive"),
  edTitle: document.getElementById("edTitle"),
  edNote: document.getElementById("edNote"),
  edSave: document.getElementById("edSave"),
  edDelete: document.getElementById("edDelete"),
  filesList: document.getElementById("filesList"),
  fileInput: document.getElementById("fileInput"),
  uploadBtn: document.getElementById("uploadBtn"),

  closeEditor: document.getElementById("closeEditor"),
};

let state = {
  cases: [],
  selected: null,
};

function t(key) {
  return (window.VG_I18N && window.VG_I18N.t && window.VG_I18N.t(key)) || key;
}

async function api(url, opts = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: opts.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const msg = data.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function showToast(msg) {
  alert(msg);
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 19).replace("T", " ");
  } catch {
    return iso;
  }
}

function statusLabel(st) {
  const s = String(st || "").toUpperCase();
  if (s === "ISSUED") return t("status_ISSUED");
  if (s === "CANCELLED") return t("status_CANCELLED");
  return t("status_PENDING");
}

function activeLabel(a) {
  return Number(a) === 1 ? t("yes") : t("no");
}

function renderTable() {
  el.tableBody.innerHTML = "";
  for (const row of state.cases) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.id}</td>
      <td><strong>${row.code}</strong></td>
      <td>${statusLabel(row.status)}</td>
      <td>${activeLabel(row.is_active)}</td>
      <td>${formatDate(row.created_at)}</td>
    `;
    tr.addEventListener("click", () => openEditor(row.id));
    el.tableBody.appendChild(tr);
  }
}

function openEditor(id) {
  const row = state.cases.find((r) => r.id === id);
  if (!row) return;
  state.selected = { ...row };
  el.edCode.textContent = row.code;
  el.edStatus.value = String(row.status || "PENDING").toUpperCase();
  el.edActive.value = Number(row.is_active) === 1 ? "1" : "0";
  el.edTitle.value = row.title || "";
  el.edNote.value = row.note || "";
  el.fileInput.value = "";
  el.editor.classList.remove("hidden");
  renderEditor();
  loadFiles();
}

function closeEditor() {
  el.editor.classList.add("hidden");
  state.selected = null;
}

function renderEditor() {
  if (!state.selected) return;
  // Button texts are already translated by i18n, but keep editor open text consistent
}

async function loadCases() {
  const data = await api("/api/admin/cases");
  state.cases = data.rows || [];
  renderTable();
}

async function createCase() {
  const status = el.newStatus.value;
  const title = el.newTitle.value;
  const data = await api("/api/admin/cases", {
    method: "POST",
    body: JSON.stringify({ status, title, note: "" }),
  });

  el.createdHint.classList.remove("hidden");
  el.createdCode.textContent = data.code;

  await loadCases();
}

async function saveCase() {
  if (!state.selected) return;
  const id = state.selected.id;
  await api(`/api/admin/cases/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      status: el.edStatus.value,
      title: el.edTitle.value,
      note: el.edNote.value,
      is_active: Number(el.edActive.value),
    }),
  });
  await loadCases();
  showToast(t("toast_saved"));
}

async function deleteCase() {
  if (!state.selected) return;
  const ok = confirm(t("confirm_delete_case"));
  if (!ok) return;
  const id = state.selected.id;
  await api(`/api/admin/cases/${id}`, { method: "DELETE" });
  closeEditor();
  await loadCases();
  showToast(t("toast_deleted"));
}

function fileRow(f) {
  const li = document.createElement("li");
  li.className = "file-row";

  const left = document.createElement("div");
  left.className = "file-left";
  const name = document.createElement("a");
  name.href = f.url;
  name.target = "_blank";
  name.rel = "noreferrer";
  name.textContent = f.name;

  const meta = document.createElement("div");
  meta.className = "muted";
  meta.textContent = `${f.mime} • ${Math.round((f.size || 0) / 1024)} KB`;

  left.appendChild(name);
  left.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "file-actions";

  const del = document.createElement("button");
  del.className = "btn danger sm";
  del.type = "button";
  del.textContent = t("delete_file");
  del.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = confirm(t("confirm_delete_file"));
    if (!ok) return;
    await api(`/api/admin/files/${f.id}`, { method: "DELETE" });
    await loadFiles();
  });

  actions.appendChild(del);
  li.appendChild(left);
  li.appendChild(actions);
  return li;
}

async function loadFiles() {
  if (!state.selected) return;
  const id = state.selected.id;
  const data = await api(`/api/admin/cases/${id}/files`);
  const rows = data.rows || [];
  el.filesList.innerHTML = "";
  if (!rows.length) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = t("no_files");
    el.filesList.appendChild(empty);
    return;
  }
  rows.forEach((f) => el.filesList.appendChild(fileRow(f)));
}

async function uploadFiles() {
  if (!state.selected) return;
  const id = state.selected.id;
  const files = el.fileInput.files;
  if (!files || !files.length) {
    showToast(t("pick_files"));
    return;
  }

  const fd = new FormData();
  for (const f of files) fd.append("files", f);

  await api(`/api/admin/cases/${id}/files`, {
    method: "POST",
    body: fd,
  });

  el.fileInput.value = "";
  await loadFiles();
  showToast(t("toast_uploaded"));
}

async function logout() {
  await api("/api/admin/logout", { method: "POST" });
  location.href = "/admin/login";
}

// --- Wire events ---
if (el.logout) el.logout.addEventListener("click", logout);
if (el.create) el.create.addEventListener("click", () => createCase().catch((e) => showToast(e.message)));
if (el.createdCopy) el.createdCopy.addEventListener("click", () => {
  const code = el.createdCode.textContent || "";
  navigator.clipboard?.writeText(code);
});

if (el.closeEditor) el.closeEditor.addEventListener("click", closeEditor);
if (el.edSave) el.edSave.addEventListener("click", () => saveCase().catch((e) => showToast(e.message)));
if (el.edDelete) el.edDelete.addEventListener("click", () => deleteCase().catch((e) => showToast(e.message)));
if (el.uploadBtn) el.uploadBtn.addEventListener("click", () => uploadFiles().catch((e) => showToast(e.message)));

// initial
loadCases().catch((e) => {
  // If not authorized, go to login
  if (String(e.message || "").toLowerCase().includes("unauthorized")) {
    location.href = "/admin/login";
  } else {
    showToast(e.message);
  }
});
