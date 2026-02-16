document.addEventListener("DOMContentLoaded", () => {
  const lang = window.VG_I18N.getLang();
  window.VG_I18N.applyI18n(lang);

  const sel = document.getElementById("lang");
  if (sel){
    sel.value = lang;
    sel.addEventListener("change", () => {
      window.VG_I18N.setLang(sel.value);
      window.VG_I18N.applyI18n(sel.value);
    });
  }

  const btn = document.getElementById("goCheck");
  if (btn){
    btn.addEventListener("click", () => {
      window.location.href = "/check";
    });
  }
});