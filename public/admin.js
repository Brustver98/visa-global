function fmt(s){
  try{ return new Date(s).toLocaleString(); }catch{ return s || ""; }
}
async function api(url, opts){
  const res = await fetch(url, opts);
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
async function loadCases(){
  const tbody = document.getElementById("rows");
  tbody.innerHTML = "";
  const data = await api("/api/admin/cases");
  for (const r of (data.rows || [])){
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.id}</td>
      <td style="font-weight:900;">${r.code}</td>
      <td>${r.status}</td>
      <td>${(r.title || "").replaceAll("<","&lt;")}</td>
      <td>${fmt(r.created_at)}</td>
      <td>${r.expires_at ? fmt(r.expires_at) : "-"}</td>
      <td class="actions">
        <button class="btnGhost" data-act="copy" data-code="${r.code}">Copy code</button>
        <button class="btnGhost" data-act="edit" data-id="${r.id}">Edit</button>
        <button class="btnGhost" data-act="del" data-id="${r.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}
async function createCase(){
  const status = document.getElementById("status").value;
  const ttl_days = Number(document.getElementById("ttl").value || 0);
  const title = document.getElementById("title").value;
  const note = document.getElementById("note").value;

  const msg = document.getElementById("createMsg");
  msg.textContent = "";
  try{
    const data = await api("/api/admin/cases", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ status, ttl_days, title, note })
    });
    msg.textContent = `Created: ${data.code}`;
    await loadCases();
  }catch(e){
    msg.textContent = e.message;
  }
}
async function logout(){
  try{ await api("/api/admin/logout", { method:"POST" }); }catch{}
  window.location.href = "/admin/login";
}
async function editCase(id){
  const newStatus = prompt("New status: PENDING / ISSUED / CANCELLED (leave blank to keep)");
  const newTitle = prompt("New title (leave blank to keep)");
  const newNote = prompt("New note (leave blank to keep)");

  const payload = {};
  if (newStatus) payload.status = newStatus;
  if (newTitle !== null && newTitle !== "") payload.title = newTitle;
  if (newNote !== null && newNote !== "") payload.note = newNote;

  if (!Object.keys(payload).length) return;

  await api(`/api/admin/cases/${id}`, {
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(payload)
  });
  await loadCases();
}
async function deleteCase(id){
  if (!confirm("Delete this case?")) return;
  await api(`/api/admin/cases/${id}`, { method:"DELETE" });
  await loadCases();
}

document.addEventListener("DOMContentLoaded", async ()=>{
  document.getElementById("create").addEventListener("click", createCase);
  document.getElementById("logout").addEventListener("click", logout);

  document.getElementById("rows").addEventListener("click", async (e)=>{
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.getAttribute("data-act");
    if (act === "copy"){
      const code = btn.getAttribute("data-code");
      try{ await navigator.clipboard.writeText(code); alert("Copied: " + code); }catch{ alert(code); }
    }
    if (act === "edit"){
      await editCase(btn.getAttribute("data-id"));
    }
    if (act === "del"){
      await deleteCase(btn.getAttribute("data-id"));
    }
  });

  try{
    await loadCases();
  }catch(e){
    alert("Admin session expired. Please login again.");
    window.location.href = "/admin/login";
  }
});