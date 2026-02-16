function setPill(el, status, lang){
  el.classList.remove("pending","issued","cancelled");
  if (status === "ISSUED") el.classList.add("issued");
  else if (status === "CANCELLED") el.classList.add("cancelled");
  else el.classList.add("pending");

  if (status === "ISSUED") el.textContent = window.VG_I18N.t(lang, "statusIssued");
  else if (status === "CANCELLED") el.textContent = window.VG_I18N.t(lang, "statusCancelled");
  else el.textContent = window.VG_I18N.t(lang, "statusPending");
}

async function runCheck(){
  const lang = window.VG_I18N.getLang();
  const codeEl = document.getElementById("code");
  const msg = document.getElementById("msg");
  const result = document.getElementById("result");

  const code = (codeEl.value || "").trim().toUpperCase().replace(/\s+/g,"");
  msg.style.display = "none";
  msg.textContent = "";
  result.style.display = "none";

  if (!code){
    msg.style.display = "block";
    msg.style.color = "#b00020";
    msg.textContent = window.VG_I18N.t(lang, "empty");
    return;
  }

  try{
    const res = await fetch(`/api/check?code=${encodeURIComponent(code)}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok){
      msg.style.display = "block";
      msg.style.color = "#b00020";
      msg.textContent = window.VG_I18N.t(lang, "notFound");
      return;
    }

    document.getElementById("codeOut").textContent = data.code || code;
    const titleEl = document.getElementById("title");
    titleEl.textContent = (data.title && String(data.title).trim()) ? data.title : window.VG_I18N.t(lang,"defaultTitle");

    const pill = document.getElementById("statusPill");
    setPill(pill, (data.status || "PENDING").toUpperCase(), lang);

    const noteEl = document.getElementById("noteText");
    noteEl.textContent = data.note ? String(data.note) : "";

    const filesEl = document.getElementById("files");
    filesEl.innerHTML = "";
    const files = Array.isArray(data.files) ? data.files : [];
    for (const f of files){
      const wrap = document.createElement("div");
      wrap.className = "file";
      const a = document.createElement("a");
      a.href = f.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = f.name || "file";
      const meta = document.createElement("div");
      meta.className = "small";
      meta.textContent = (f.mime ? f.mime : "") + (f.size ? ` • ${Math.round(f.size/1024)} KB` : "");
      wrap.appendChild(a);
      wrap.appendChild(meta);
      filesEl.appendChild(wrap);
    }

    result.style.display = "block";
  }catch(e){
    msg.style.display = "block";
    msg.style.color = "#b00020";
    msg.textContent = window.VG_I18N.t(lang, "serverError");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const lang = window.VG_I18N.getLang();
  window.VG_I18N.applyI18n(lang);

  const sel = document.getElementById("lang");
  if (sel){
    sel.value = lang;
    sel.addEventListener("change", () => {
      window.VG_I18N.setLang(sel.value);
      window.VG_I18N.applyI18n(sel.value);
    });
  }

  const btn = document.getElementById("btnVerify");
  if (btn) btn.addEventListener("click", runCheck);

  const codeEl = document.getElementById("code");
  if (codeEl){
    codeEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runCheck();
    });
  }

  try{
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c){
      document.getElementById("code").value = c;
      runCheck();
    }
  }catch{}
});