document.addEventListener("DOMContentLoaded",()=>{
  const btn=document.getElementById("verifyBtn");
  const input=document.getElementById("code");
  const back=document.getElementById("backBtn");
  const norm=v=>(v||"").trim().replace(/\s+/g,"");
  function go(){
    const code=norm(input.value);
    if(!code){input.focus();input.classList.add("shake");setTimeout(()=>input.classList.remove("shake"),350);return;}
    alert("OK: "+code);
  }
  if(btn)btn.addEventListener("click",go);
  if(input)input.addEventListener("keydown",(e)=>{if(e.key==="Enter")go();});
  if(back)back.addEventListener("click",()=>window.location.href="/");
});
