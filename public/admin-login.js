async function login(){
  const u = document.getElementById("username").value || "";
  const p = document.getElementById("password").value || "";
  const err = document.getElementById("loginError");
  err.style.display = "none";

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username: u, password: p })
  });

  if (!res.ok){
    err.style.display = "block";
    return;
  }
  window.location.href = "/admin";
}

document.addEventListener("DOMContentLoaded", async () => {
  window.VG_I18N.applyI18n(window.VG_I18N.getLang());

  // If already logged in, jump to admin
  try{
    const r = await fetch("/api/admin/me");
    const j = await r.json();
    if (j.authed) window.location.href = "/admin";
  }catch{}

  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("password").addEventListener("keydown", (e)=>{
    if (e.key === "Enter") login();
  });
});
