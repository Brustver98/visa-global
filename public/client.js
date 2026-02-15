document.addEventListener("DOMContentLoaded", () => {
  const lang = window.VG_I18N.applyI18n(window.VG_I18N.getLang());
  document.getElementById("goCheck").addEventListener("click", () => {
    window.location.href = "/check";
  });
});
