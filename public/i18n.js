(function(){
  const dict = {
    en: {
      appName: "Visa Global",
      nav_home: "Home",
      nav_check: "Check Invitation Status",
      hero_title_home: "Check Consulate\nInterview Invitation\nStatus",
      hero_sub_home: "Verify if you have been issued an invitation for a consulate interview by clicking the button below.",
      hero_button_home: "CHECK INVITATION STATUS",
      bullet1: "Your data is protected.",
      bullet2: "Verification is automated.",
      bullet3: "Information provided by Visa Global.",
      footer: "© Visa Global • All rights reserved",

      check_title: "Check Invitation Status",
      check_sub: "Enter your unique reference number issued by Visa Global to verify your invitation.",
      check_placeholder: "Enter your invitation number",
      check_button: "VERIFY",
      check_hint: "Please enter the number exactly as provided, without spaces.",

      status_title_default: "Invitation status",
      status_code: "Reference",
      status_state: "Status",
      status_note: "Note",
      status_files: "Files",

      admin_login_title: "Administrator login",
      admin_user: "Username",
      admin_pass: "Password",
      admin_login_btn: "Sign in",
      admin_login_bad: "Invalid login",

      admin_title: "Administrator panel",
      admin_desc: "Create reference codes, set status, attach PDF/image files and add notes.",
      admin_logout: "Log out",
      admin_create: "Create",
      admin_new_case: "Create new case",
      admin_status: "Status",
      admin_title_ph: "Title (e.g., Invitation to consular interview)",
      admin_note_ph: "Note (optional)",
      created_hint: "The created code will appear below. Share it with the client.",

      col_id: "ID",
      col_code: "Code",
      col_status: "Status",
      col_active: "Active",
      col_created: "Created",
      col_actions: "Actions",

      edit_title: "Edit case",
      edit_save: "Save changes",
      edit_upload: "Upload files",
      edit_pick: "Choose files",
      edit_files: "Files",
      edit_delete_case: "Delete case",
      confirm_delete_case: "Delete this case and ALL its files?",
      confirm_delete_file: "Delete this file?",
      yes: "Yes",
      no: "No",

      status_PENDING: "PENDING",
      status_ISSUED: "ISSUED",
      status_CANCELLED: "CANCELLED",
      active_yes: "YES",
      active_no: "NO",
    },
    ru: {
      appName: "Visa Global",
      nav_home: "Главная",
      nav_check: "Проверка статуса",
      hero_title_home: "Проверка статуса\nприглашения на\nсобеседование",
      hero_sub_home: "Проверьте, выдано ли вам приглашение на собеседование, нажав кнопку ниже.",
      hero_button_home: "ПРОВЕРИТЬ СТАТУС",
      bullet1: "Ваши данные защищены.",
      bullet2: "Проверка автоматизирована.",
      bullet3: "Информация предоставлена Visa Global.",
      footer: "© Visa Global • Все права защищены",

      check_title: "Проверка статуса",
      check_sub: "Введите уникальный код, выданный Visa Global, чтобы проверить приглашение.",
      check_placeholder: "Введите номер приглашения",
      check_button: "ПРОВЕРИТЬ",
      check_hint: "Введите номер точно как выдано, без пробелов.",

      status_title_default: "Статус приглашения",
      status_code: "Код",
      status_state: "Статус",
      status_note: "Примечание",
      status_files: "Файлы",

      admin_login_title: "Вход администратора",
      admin_user: "Логин",
      admin_pass: "Пароль",
      admin_login_btn: "Войти",
      admin_login_bad: "Неверный логин или пароль",

      admin_title: "Панель администратора",
      admin_desc: "Создавайте коды, устанавливайте статус, прикрепляйте PDF/изображения и добавляйте примечания.",
      admin_logout: "Выйти",
      admin_create: "Создать",
      admin_new_case: "Создать новое дело",
      admin_status: "Статус",
      admin_title_ph: "Заголовок (например, Приглашение на собеседование)",
      admin_note_ph: "Примечание (необязательно)",
      created_hint: "Созданный код появится ниже. Поделитесь им с клиентом.",

      col_id: "Идентификатор",
      col_code: "Код",
      col_status: "Статус",
      col_active: "Активный",
      col_created: "Созданный",
      col_actions: "Действия",

      edit_title: "Редактирование",
      edit_save: "Сохранить",
      edit_upload: "Загрузить файлы",
      edit_pick: "Выбрать файлы",
      edit_files: "Файлы",
      edit_delete_case: "Удалить дело",
      confirm_delete_case: "Удалить это дело и ВСЕ файлы?",
      confirm_delete_file: "Удалить этот файл?",
      yes: "Да",
      no: "Нет",

      status_PENDING: "В ОЖИДАНИИ",
      status_ISSUED: "ИЗДАННЫЙ",
      status_CANCELLED: "ОТМЕНЕНО",
      active_yes: "ДА",
      active_no: "НЕТ",
    }
  };

  function getLang(){
    const saved = localStorage.getItem("vg_lang");
    if (saved === "ru" || saved === "en") return saved;
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("ru") ? "ru" : "en";
  }

  function setLang(lang){
    localStorage.setItem("vg_lang", lang);
    apply(lang);
  }

  function t(key, lang){
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
  }

  function apply(lang){
    document.documentElement.setAttribute("lang", lang);

    // text nodes
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key, lang);
    });

    // placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key, lang));
    });

    // status badges
    document.querySelectorAll("[data-i18n-status]").forEach(el => {
      const code = el.getAttribute("data-i18n-status");
      el.textContent = t("status_" + code, lang);
    });

    // active
    document.querySelectorAll("[data-i18n-active]").forEach(el => {
      const v = el.getAttribute("data-i18n-active");
      el.textContent = v === "1" ? t("active_yes", lang) : t("active_no", lang);
    });

    // multi-line hero title
    document.querySelectorAll("[data-i18n-multiline]").forEach(el => {
      const key = el.getAttribute("data-i18n-multiline");
      el.innerHTML = t(key, lang).replace(/\n/g, "<br>");
    });

    // update language select(s)
    document.querySelectorAll("select[data-lang-select]").forEach(sel => {
      sel.value = lang;
    });
  }

  window.VG_I18N = {
    dict,
    getLang,
    setLang,
    t: (key) => t(key, getLang()),
    apply,
  };
})();
