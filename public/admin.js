const tableBody=document.querySelector("#table tbody");
const createBtn=document.getElementById("create");
const createOut=document.getElementById("createOut");
const logoutBtn=document.getElementById("logout");
const newStatus=document.getElementById("newStatus");
const newTitle=document.getElementById("newTitle");
const editor=document.getElementById("editor");
const eCode=document.getElementById("eCode");
const eStatus=document.getElementById("eStatus");
const eActive=document.getElementById("eActive");
const eTitle=document.getElementById("eTitle");
const eNote=document.getElementById("eNote");
const saveBtn=document.getElementById("save");
const fileInput=document.getElementById("fileInput");
const uploadBtn=document.getElementById("upload");
const filesList=document.getElementById("filesList");
const eMsg=document.getElementById("eMsg");
let selectedCase=null;
async function api(url,opts){const r=await fetch(url,opts);const d=await r.json().catch(()=>({ok:false,message:"Bad response"}));if(r.status===401){location.href="/admin/login";return{ok:false,message:"Unauthorized"}}return d}
async function loadCases(){const d=await api("/api/admin/cases");if(!d.ok)return;tableBody.innerHTML="";for(const row of d.rows){const tr=document.createElement("tr");tr.style.cursor="pointer";tr.innerHTML=`<td>${row.id}</td><td><b>${row.code}</b></td><td>${row.status}</td><td>${row.is_active?"YES":"NO"}</td><td>${row.created_at.slice(0,19).replace("T"," ")}</td>`;tr.addEventListener("click",()=>openEditor(row));tableBody.appendChild(tr)}}
function openEditor(row){selectedCase=row;editor.style.display="block";eCode.textContent=row.code;eStatus.value=row.status;eActive.value=String(row.is_active);eTitle.value=row.title||"";eNote.value=row.note||"";eMsg.textContent="";loadFiles(row.id);window.scrollTo({top:editor.offsetTop-10,behavior:"smooth"})}
async function loadFiles(caseId){filesList.innerHTML="";const d=await api(`/api/admin/cases/${caseId}/files`);if(!d.ok)return;if(!d.rows.length){const empty=document.createElement("div");empty.className="small";empty.textContent="No files uploaded yet.";filesList.appendChild(empty);return}for(const f of d.rows){const div=document.createElement("div");div.className="file";div.innerHTML=`<div><a href="${f.url}" target="_blank" rel="noreferrer">${f.name}</a><div><small>${f.mime}</small></div></div><div class="actions"><button class="btnSecondary" data-del="${f.id}">Delete</button></div>`;div.querySelector("[data-del]").addEventListener("click",()=>delFile(f.id));filesList.appendChild(div)}}
async function delFile(fileId){if(!selectedCase)return;eMsg.textContent="Deleting...";const d=await api(`/api/admin/files/${fileId}`,{method:"DELETE"});eMsg.textContent=d.ok?"Deleted.":(d.message||"Error");loadFiles(selectedCase.id)}
createBtn.addEventListener("click",async()=>{createOut.textContent="Creating...";const d=await api("/api/admin/cases",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:newStatus.value,title:newTitle.value,note:""})});if(!d.ok){createOut.textContent=d.message||"Error";return}createOut.innerHTML=`Created: <b>${d.code}</b> — copy and send to client.`;await loadCases()});
saveBtn.addEventListener("click",async()=>{if(!selectedCase)return;eMsg.textContent="Saving...";const d=await api(`/api/admin/cases/${selectedCase.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:eStatus.value,title:eTitle.value,note:eNote.value,is_active:Number(eActive.value)})});eMsg.textContent=d.ok?"Saved.":(d.message||"Error");await loadCases()});
uploadBtn.addEventListener("click",async()=>{if(!selectedCase)return;const files=fileInput.files;if(!files||!files.length){eMsg.textContent="Select files first.";return}eMsg.textContent="Uploading...";const fd=new FormData();for(const f of files)fd.append("files",f);const r=await fetch(`/api/admin/cases/${selectedCase.id}/files`,{method:"POST",body:fd});const d=await r.json().catch(()=>({ok:false,message:"Upload error"}));if(r.status===401){location.href="/admin/login";return}eMsg.textContent=d.ok?`Uploaded: ${d.count}`:(d.message||"Upload failed");fileInput.value="";loadFiles(selectedCase.id)});
logoutBtn.addEventListener("click",async(e)=>{e.preventDefault();await api("/api/admin/logout",{method:"POST"});location.href="/admin/login"});
loadCases();
