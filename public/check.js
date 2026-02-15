function badgeClass(status){
  if (status === "ISSUED") return "issued";
  if (status === "CANCELLED") return "cancelled";
  return "pending";
}

function statusLabel(lang, status){
  const t = window.VG_I18N.t;
  if (status === "ISSUED") return t(lang, "statusIssued");
  if (status === "CANCELLED") return t(lang, "statusCancelled");
  return t(lang, "statusPending");
}

async function runCheck(){
  const lang = window.VG_I18N.getLang();
  const codeEl = document.getElementById("code");
  const out = document.getElementById("out");
  const code = (codeEl.value || "").trim().toUpperCase().replace(/\s+/g,"");
  if (!code) return;

  out.style.display = "none";
  out.innerHTML = "";

  try{
    const res = await fetch(`/api/check/${encodeURIComponent(code)}`);
    if (!res.ok){
      out.style.display = "block";
      out.innerHTML = `<div class="hint" style="color:#b00020">${window.VG_I18N.t(lang,"checkNotFound")}</div>`;
      return;
    }
    const data = await res.json();

    const badge = `<div class="badge ${badgeClass(data.status)}">${statusLabel(lang, data.status)}</div>`;
    const title = `<div style="margin-top:10px;font-weight:800;font-size:16px">${escapeHtml(data.title || "")}</div>`;
    const notes = data.notes ? `<div class="prewrap">${escapeHtml(data.notes)}</div>` : "";
    const files = (data.files || []).length
      ? `<div class="fileList">${data.files.map(f=>`<a class="fileLink" target="_blank" rel="noopener" href="${f.url}">${escapeHtml(f.name)}</a>`).join("")}</div>`
      : "";

    out.style.display = "block";
    out.innerHTML = `${badge}${title}${notes}${files}`;
  }catch(e){
    out.style.display = "block";
    out.innerHTML = `<div class="hint" style="color:#b00020">${window.VG_I18N.t(lang,"checkError")}</div>`;
  }
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

document.addEventListener("DOMContentLoaded", () => {
  window.VG_I18N.applyI18n(window.VG_I18N.getLang());

  document.getElementById("btnCheck").addEventListener("click", runCheck);
  
  // Prefill from ?code=
  try{
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c){
      document.getElementById("code").value = c;
      runCheck();
    }
  }catch{}

  document.getElementById("code").addEventListener("keydown", (e)=>{
    if (e.key === "Enter") runCheck();
  });
});
