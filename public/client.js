function humanStatus(st){const s=(st||"").toUpperCase(); if(s==="ISSUED")return t("issued"); if(s==="CANCELLED")return t("cancelled"); return t("pending");}
function showMsg(text){const el=document.getElementById("msg"); if(!el)return; el.style.display="block"; el.textContent=text;}
function hideMsg(){const el=document.getElementById("msg"); if(!el)return; el.style.display="none"; el.textContent="";}
function renderNote(note){const safe=(note||"").replace(/[&<>]/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;" }[c])); return safe.replace(/\n/g,"<br>");}
async function doCheck(){hideMsg(); const code=(document.getElementById("code")?.value||"").trim(); if(!code){showMsg(t("codePlaceholder")); return;}
document.getElementById("result").style.display="none";
try{const r=await fetch(`/api/check?code=${encodeURIComponent(code)}`); const data=await r.json().catch(()=>({ok:false,message:t("serverError")}));
if(!r.ok||!data.ok){showMsg(data.message||t("notFound")); return;}
const pill=document.getElementById("statusPill"); pill.textContent=humanStatus(data.status); pill.className=`status-pill ${String(data.status||"").toUpperCase()}`;
document.getElementById("note").innerHTML=renderNote(data.note||"");
const filesEl=document.getElementById("files"); filesEl.innerHTML="";
const files=data.files||[]; if(!files.length){const div=document.createElement("div"); div.className="notice"; div.textContent="—"; filesEl.appendChild(div);}
else{for(const f of files){const row=document.createElement("div"); row.className="file";
row.innerHTML=`<div><div class="name">${f.name}</div><div class="small">${Math.round((f.size||0)/1024)} KB</div></div>
<a class="btn secondary" style="padding:10px 12px; min-height:40px;" href="${f.url}" target="_blank" rel="noopener">Open</a>`;
filesEl.appendChild(row);}}
document.getElementById("result").style.display="block";
}catch(e){showMsg(t("serverError"));}}
(function init(){const sel=document.querySelector("[data-lang-select]"); if(sel) sel.addEventListener("change",e=>{setLang(e.target.value);applyI18n();});
applyI18n(); document.getElementById("btnCheck").addEventListener("click",doCheck); document.getElementById("code").addEventListener("keydown",e=>{if(e.key==="Enter")doCheck();});})();