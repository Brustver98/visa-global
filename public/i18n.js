(function(){
  const dict = {
    en: {
      navCheck: "Check the status of your visa application \u00A0\u203A",
      navHome: "Home \u00A0\u203A",
      tagline: "Secure verification status of your visa application.",
      h1Home: "Check status of your visa application",
      subHome: "To check the status of your visa application, please enter your individual Registration Number.",
      btnHome: "CHECK STATUS OF YOUR VISA APPLICATION",
      h1Check: "Check the status of your visa application",
      subCheck: "Enter your individual Registration Number to check the status of your visa application.",
      phCheck: "Enter your visa application number",
      btnVerify: "VERIFY",
      hint: "Please enter the number exactly as provided, without spaces.",
      defaultTitle: "Application status",
      p1: "Your data is protected.",
      p2: "Verification is automated.",
      p3: "Information provided by Visa Global.",
      notFound: "Reference code not found.",
      serverError: "Server error. Please try again.",
      empty: "Please enter your Registration Number.",
      statusPending: "PENDING",
      statusIssued: "ISSUED",
      statusCancelled: "CANCELLED"
    },
    ru: {
      navCheck: "Проверить статус визовой заявки \u00A0\u203A",
      navHome: "Дом \u00A0\u203A",
      tagline: "Безопасная проверка статуса вашей визовой заявки.",
      h1Home: "Проверьте статус вашей визовой заявки",
      subHome: "Чтобы проверить статус вашей визовой заявки, пожалуйста, введите свой индивидуальный регистрационный номер.",
      btnHome: "ПРОВЕРИТЬ СТАТУС",
      h1Check: "Проверьте статус вашей визовой заявки",
      subCheck: "Введите свой индивидуальный регистрационный номер, чтобы проверить статус вашей визовой заявки.",
      phCheck: "Введите номер вашей визовой заявки",
      btnVerify: "ПРОВЕРИТЬ",
      hint: "Пожалуйста, введите число точно так, как указано, без пробелов.",
      defaultTitle: "Статус заявки",
      p1: "Ваши данные защищены.",
      p2: "Проверка автоматизирована.",
      p3: "Информация предоставлена Visa Global.",
      notFound: "Код не найден.",
      serverError: "Ошибка сервера. Попробуйте ещё раз.",
      empty: "Введите регистрационный номер.",
      statusPending: "ОЖИДАЕТСЯ",
      statusIssued: "ВЫДАНО",
      statusCancelled: "ОТМЕНЕНО"
    }
  };

  function getLang(){
    const saved = localStorage.getItem("vg_lang");
    if (saved && (saved === "en" || saved === "ru")) return saved;
    return "en";
  }
  function setLang(lang){ localStorage.setItem("vg_lang", lang); }

  function applyI18n(lang){
    const d = dict[lang] || dict.en;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      if (d[key] != null) el.textContent = d[key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
      const key = el.getAttribute("data-i18n-placeholder");
      if (d[key] != null) el.setAttribute("placeholder", d[key]);
    });
    const sel = document.getElementById("lang");
    if (sel) sel.value = lang;
  }

  function t(lang, key){
    const d = dict[lang] || dict.en;
    return d[key] ?? (dict.en[key] ?? key);
  }

  window.VG_I18N = { getLang, setLang, applyI18n, t };
})();