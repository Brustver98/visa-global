function fmtDate(s){
  if (!s) return "—";
  try{
    const d = new Date(s);
    return d.toLocaleString();
  }catch{
    return s;
  }
}

function statusText(lang, st){
  const t = window.VG_I18N.t;
  if (st === "ISSUED") return t(lang, "statusIssued");
  if (st === "CANCELLED") return t(lang, "statusCancelled");
  return t(lang, "statusPending");
}

async function ensureAuth(){
  const r = await fetch("/api/admin/me");
  const j = await r.json();
  if (!j.authed) window.location.href = "/admin-login";
}

async function loadCases(){
  const lang = window.VG_I18N.getLang();
  const tbody = document.getElementById("tbody");
  const res = await fetch("/api/cases");
  if (!res.ok){
    tbody.innerHTML = `<tr><td colspan="8" style="color:#b00020">Unauthorized</td></tr>`;
    return;
  }
  const cases = await res.json();
  if (!cases.length){
    tbody.innerHTML = `<tr><td colspan="8" style="color:var(--muted)" data-i18n="adminEmpty">${window.VG_I18N.t(lang,"adminEmpty")}</td></tr>`;
    return;
  }

  tbody.innerHTML = cases.map(c=>{
    const expires = c.expiresAt ? fmtDate(c.expiresAt) : "—";
    const status = statusText(lang, c.status);
    const checkUrl = `/check#${encodeURIComponent(c.code)}`;
    return `
      <tr>
        <td>${c.id}</td>
        <td><div style="font-weight:800">${c.code}</div><div class="hint"><a href="/check?code=${encodeURIComponent(c.code)}" target="_blank">/check</a></div></td>
        <td>${status}</td>
        <td>${escapeHtml(c.title || "")}</td>
        <td>${fmtDate(c.createdAt)}</td>
        <td>${expires}</td>
        <td><a class="smallBtn" href="/check?code=${encodeURIComponent(c.code)}" target="_blank">Open</a></td>
        <td>
          <div class="actions">
            <button class="smallBtn primary" data-upload="${c.code}">${window.VG_I18N.t(lang,"adminUpload")}</button>
            <button class="smallBtn danger" data-del="${c.id}">✕ ${window.VG_I18N.t(lang,"adminDelete")}</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  // wire actions
  tbody.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const id = btn.getAttribute("data-del");
      if (!confirm(window.VG_I18N.t(lang,"adminConfirmDelete"))) return;
      await fetch(`/api/cases/${encodeURIComponent(id)}`, { method:"DELETE" });
      await loadCases();
    });
  });

  const picker = document.getElementById("filePicker");
  let currentCode = null;

  tbody.querySelectorAll("[data-upload]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      currentCode = btn.getAttribute("data-upload");
      picker.value = "";
      picker.click();
    });
  });

  picker.onchange = async ()=>{
    if (!currentCode) return;
    if (!picker.files || !picker.files.length) return;

    const fd = new FormData();
    for (const f of picker.files) fd.append("files", f);

    const res = await fetch(`/api/cases/${encodeURIComponent(currentCode)}/upload`, {
      method:"POST",
      body: fd
    });

    if (!res.ok) alert("Upload failed");
    currentCode = null;
  };
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

async function createCase(){
  const lang = window.VG_I18N.getLang();
  const out = document.getElementById("createOut");
  out.style.display = "none";

  const status = document.getElementById("status").value;
  const ttlDays = Number(document.getElementById("ttl").value || 0);
  const title = document.getElementById("title").value || "";
  const notes = document.getElementById("notes").value || "";

  const res = await fetch("/api/cases", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ status, ttlDays, title, notes })
  });

  if (!res.ok){
    out.style.display = "block";
    out.style.color = "#b00020";
    out.textContent = "Error creating case.";
    return;
  }

  const data = await res.json();
  out.style.display = "block";
  out.style.color = "var(--muted)";
  out.innerHTML = `Created: <b>${data.code}</b> — <a href="/check?code=${encodeURIComponent(data.code)}" target="_blank">open</a>`;

  document.getElementById("title").value = "";
  document.getElementById("notes").value = "";
  await loadCases();
}

async function logout(){
  await fetch("/api/admin/logout", { method:"POST" });
  window.location.href = "/admin-login";
}

document.addEventListener("DOMContentLoaded", async () => {
  window.VG_I18N.applyI18n(window.VG_I18N.getLang());
  await ensureAuth();

  document.getElementById("createBtn").addEventListener("click", createCase);
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // If user opens /admin?lang=xx etc, ignored; they can switch via selector
  await loadCases();
});
