function setStatusPill(el, status) {
  el.classList.remove("pending", "issued", "cancelled");
  if (status === "ISSUED") el.classList.add("issued");
  else if (status === "CANCELLED") el.classList.add("cancelled");
  else el.classList.add("pending");
  el.textContent = status || "PENDING";
}

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

async function runCheck() {
  const codeEl = document.getElementById("code");
  const btn = document.getElementById("btnCheck");
  const msg = document.getElementById("msg");
  const result = document.getElementById("result");
  const title = document.getElementById("title");
  const codeOut = document.getElementById("codeOut");
  const statusPill = document.getElementById("statusPill");
  const noteText = document.getElementById("noteText");
  const filesWrap = document.getElementById("files");

  const code = (codeEl.value || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return;

  // reset UI
  msg.style.display = "none";
  msg.textContent = "";
  result.style.display = "none";
  filesWrap.innerHTML = "";
  noteText.textContent = "";

  btn.disabled = true;

  try {
    // ✅ ВАЖНО: именно так у тебя сделан server.js
    const res = await fetch(`/api/check?code=${encodeURIComponent(code)}`);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.ok !== true) {
      msg.style.display = "block";
      msg.style.color = "#b00020";
      msg.textContent = (data && data.message) ? data.message : "Reference code not found.";
      return;
    }

    // render
    title.textContent = data.title || "Application status";
    codeOut.textContent = data.code || code;
    setStatusPill(statusPill, data.status || "PENDING");

    if (data.note) noteText.textContent = data.note;

    const files = Array.isArray(data.files) ? data.files : [];
    if (files.length) {
      filesWrap.innerHTML = files.map(f => {
        const name = escapeHtml(f.name || "file");
        const url = f.url || "#";
        return `<div class="file">
          <a href="${url}" target="_blank" rel="noopener">${name}</a>
          <span class="small">${(f.size ? Math.round(f.size/1024) + " KB" : "")}</span>
        </div>`;
      }).join("");
    }

    result.style.display = "block";
  } catch (e) {
    msg.style.display = "block";
    msg.style.color = "#b00020";
    msg.textContent = "Server error. Please try again later.";
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnCheck").addEventListener("click", runCheck);

  document.getElementById("code").addEventListener("keydown", (e) => {
    if (e.key === "Enter") runCheck();
  });

  // если открылось так: /check?code=VG-....
  const params = new URLSearchParams(location.search);
  const c = params.get("code");
  if (c) {
    document.getElementById("code").value = c;
    runCheck();
  }
});
