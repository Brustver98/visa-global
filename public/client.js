const codeEl = document.getElementById("code");
const btn = document.getElementById("btn");
const msg = document.getElementById("msg");
const result = document.getElementById("result");
const titleEl = document.getElementById("title");
const codeOut = document.getElementById("codeOut");
const noteText = document.getElementById("noteText");
const filesEl = document.getElementById("files");
const statusPill = document.getElementById("statusPill");

function showMsg(t){ msg.style.display="block"; msg.textContent=t; }
function hideMsg(){ msg.style.display="none"; msg.textContent=""; }
function setStatus(s){
  const st = (s || "PENDING").toUpperCase();
  statusPill.textContent = st;
  statusPill.className = "pill " + (st==="ISSUED" ? "issued" : st==="CANCELLED" ? "cancelled" : "pending");
}

async function verify(){
  hideMsg();
  result.style.display="none";
  filesEl.innerHTML="";
  const code = codeEl.value.trim().toUpperCase();
  if(!code){ showMsg("Please enter a reference code."); return; }

  btn.disabled=true;
  btn.textContent="VERIFYING...";

  try{
    const r = await fetch(`/api/check?code=${encodeURIComponent(code)}`);
    const data = await r.json();
    if(!data.ok){ showMsg(data.message || "Not found."); return; }

    titleEl.textContent = data.title || "Invitation status";
    codeOut.textContent = `Reference: ${data.code}`;
    setStatus(data.status);
    noteText.textContent = data.note || "";

    const files = data.files || [];
    if(files.length){
      for(const f of files){
        const div = document.createElement("div");
        div.className="file";
        div.innerHTML = `<div><a href="${f.url}" target="_blank" rel="noreferrer">${f.name}</a><div><small>${f.mime}</small></div></div><div><small>${Math.round((f.size||0)/1024)} KB</small></div>`;
        filesEl.appendChild(div);
      }
    } else {
      const empty=document.createElement("div");
      empty.className="small";
      empty.textContent="No documents have been uploaded for this reference yet.";
      filesEl.appendChild(empty);
    }
    result.style.display="block";
  } catch(e){
    showMsg("Connection error. Please try again.");
  } finally {
    btn.disabled=false;
    btn.textContent="VERIFY";
  }
}

btn.addEventListener("click", verify);
codeEl.addEventListener("keydown", (e)=>{ if(e.key==="Enter") verify(); });
