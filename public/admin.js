function showMsg(t){const el=document.getElementById("msg"); el.style.display="block"; el.textContent=t;}
function hideMsg(){const el=document.getElementById("msg"); el.style.display="none"; el.textContent="";}
function fmt(iso){if(!iso)return"—"; try{return new Date(iso).toLocaleString();}catch(e){return iso;}}
function statusPill(st){const s=(st||"PENDING").toUpperCase(); const label=(s==="ISSUED")?t("issued"):(s==="CANCELLED")?t("cancelled"):t("pending"); return `<span class="status-pill ${s}">${label}</span>`;}
let activeId=null, activeCode=null;
async function api(url,opts={}){const r=await fetch(url,{credentials:"include",...opts}); const d=await r.json().catch(()=>({ok:false,message:"Server error."}));
if(!r.ok||!d.ok){ if(r.status===401) location.href="/admin/login"; throw new Error(d.message||"Error"); } return d;}
async function loadCases(){const d=await api("/api/admin/cases"); const tb=document.getElementById("tbody"); tb.innerHTML="";
for(const row of d.rows){const tr=document.createElement("tr"); tr.className="row"; tr.innerHTML=`
<td>${row.id}</td><td class="mono">${row.code}</td><td>${statusPill(row.status)}</td><td>${(row.title||"").replace(/[<>]/g,"")}</td>
<td>${fmt(row.created_at)}</td><td>${fmt(row.expires_at)}</td>
<td style="white-space:nowrap;display:flex;gap:8px;flex-wrap:wrap;">
<button class="iconbtn" data-open="${row.id}" data-code="${row.code}">📎</button>
<button class="iconbtn danger" data-del="${row.id}">✖</button></td>`; tb.appendChild(tr);}
tb.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openFiles(b.dataset.open,b.dataset.code)));
tb.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",()=>delCase(b.dataset.del)));
}
async function createCase(){hideMsg();
try{const status=document.getElementById("status").value; const ttl_days=Number(document.getElementById("ttl").value);
const title=document.getElementById("title").value.trim(); const note=document.getElementById("note").value;
const d=await api("/api/admin/cases",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,title,note,ttl_days})});
showMsg(`Created: ${d.code}`); document.getElementById("title").value=""; document.getElementById("note").value=""; await loadCases();
}catch(e){showMsg(e.message);}}
async function delCase(id){if(!confirm(t("confirmDeleteCase"))) return;
try{await api(`/api/admin/cases/${id}`,{method:"DELETE"}); if(activeId===Number(id)){document.getElementById("filesBox").style.display="none"; activeId=null; activeCode=null;}
await loadCases();}catch(e){showMsg(e.message);}}
async function openFiles(id,code){activeId=Number(id); activeCode=code; document.getElementById("filesBox").style.display="block"; document.getElementById("activeCode").textContent=code; await loadFiles();}
async function loadFiles(){const list=document.getElementById("fileList"); list.innerHTML=""; if(!activeId) return;
const d=await api(`/api/admin/cases/${activeId}/files`); const rows=d.rows||[]; if(!rows.length){const div=document.createElement("div"); div.className="notice"; div.textContent="—"; list.appendChild(div); return;}
for(const f of rows){const row=document.createElement("div"); row.className="file";
row.innerHTML=`<div><div class="name">${f.name}</div><div class="small">${Math.round((f.size||0)/1024)} KB • ${fmt(f.uploaded_at)}</div></div>
<div style="display:flex;gap:8px;align-items:center;">
<a class="btn secondary" style="padding:10px 12px; min-height:40px;" href="${f.url}" target="_blank" rel="noopener">Open</a>
<button class="iconbtn danger" data-filedel="${f.id}">✖</button></div>`;
list.appendChild(row);}
list.querySelectorAll("[data-filedel]").forEach(b=>b.addEventListener("click",()=>delFile(b.dataset.filedel)));
}
async function uploadFiles(){hideMsg(); if(!activeId){showMsg("Select a case first."); return;}
const inp=document.getElementById("fileInput"); if(!inp.files||!inp.files.length){showMsg("No files selected."); return;}
const fd=new FormData(); for(const f of inp.files) fd.append("files",f);
try{await api(`/api/admin/cases/${activeId}/files`,{method:"POST",body:fd}); inp.value=""; await loadFiles();}catch(e){showMsg(e.message);}}
async function delFile(fileId){if(!confirm("Delete this file?")) return; try{await api(`/api/admin/files/${fileId}`,{method:"DELETE"}); await loadFiles();}catch(e){showMsg(e.message);}}
async function logout(){try{await api("/api/admin/logout",{method:"POST"});}catch(e){} location.href="/admin/login";}
(function init(){const sel=document.querySelector("[data-lang-select]"); if(sel) sel.addEventListener("change",e=>{setLang(e.target.value);applyI18n(); loadCases();});
applyI18n(); document.getElementById("btnCreate").addEventListener("click",createCase); document.getElementById("btnUpload").addEventListener("click",uploadFiles); document.getElementById("btnLogout").addEventListener("click",logout);
loadCases().catch(()=>{});})();