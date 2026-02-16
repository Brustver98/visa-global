async function login(){
  const u = document.getElementById("u").value.trim();
  const p = document.getElementById("p").value.trim();
  const err = document.getElementById("err");
  err.style.display = "none";
  err.textContent = "";

  try{
    const res = await fetch("/api/admin/login", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ username:u, password:p })
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok || !data.ok){
      err.style.display = "block";
      err.textContent = data.message || "Login failed.";
      return;
    }
    window.location.href = "/admin";
  }catch(e){
    err.style.display = "block";
    err.textContent = "Network error.";
  }
}
document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("p").addEventListener("keydown", (e)=>{ if(e.key==="Enter") login(); });
});