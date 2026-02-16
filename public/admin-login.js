const langSelect = document.getElementById("langSelect");
const savedLang = localStorage.getItem("vg_lang");
if (savedLang && langSelect) langSelect.value = savedLang;

function applyLang() {
  const lang = (langSelect && langSelect.value) || "en";
  localStorage.setItem("vg_lang", lang);
  if (window.VG_I18N) window.VG_I18N.setLang(lang);
}

if (langSelect) {
  langSelect.addEventListener("change", applyLang);
}
applyLang();

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok) {
      msg.textContent = data.message || "Login failed";
      return;
    }

    window.location.href = "/admin";
  } catch (err) {
    msg.textContent = "Network error";
  }
});
