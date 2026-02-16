(function(){
  const DICT = {
    ru: {
      langName: "Русский",
      homeBreadcrumb: "Home",
      checkBreadcrumb: "Check Invitation Status",
      adminBreadcrumb: "Admin Panel",
      loginBreadcrumb: "Admin Login",

      homeTitle: "Проверить статус приглашения",
      homeKicker: "Безопасная проверка статуса для консульских приглашений.",
      homeSub: "Введите свой референс‑код, чтобы проверить статус приглашения.",

      homeBtnCheck: "Проверить статус приглашения",

      b1Title: "Ваши данные защищены.",
      b2Title: "Проверка автоматизирована.",
      b3Title: "Информация предоставлена Visa Global.",

      checkTitle: "Проверка приглашения",
      checkSub: "Введите свой уникальный референс‑номер, выданный Visa Global, чтобы проверить приглашение.",
      checkPlaceholder: "Введите номер приглашения",
      checkBtn: "Проверить",
      checkHint: "Введите номер точно как в приглашении, без пробелов.",
      checkNotFound: "Код не найден. Проверьте номер и попробуйте снова.",
      checkError: "Ошибка проверки. Повторите попытку позже.",

      statusIssued: "Изданный",
      statusPending: "В ожидании",
      statusCancelled: "Отменено",

      adminLoginTitle: "Вход администратора",
      adminLoginSub: "Введите логин и пароль администратора.",
      adminUser: "Логин",
      adminPass: "Пароль",
      adminLoginBtn: "Войти",
      adminLoginError: "Ошибка входа.",

      adminTitle: "Панель администратора",
      adminCreate: "Создать новое дело",
      adminStatus: "Статус",
      adminTTL: "Автоматическое удаление после",
      adminTTLOff: "Автоудаление отключено",
      adminTitleLabel: "Заголовок",
      adminNotesLabel: "Примечание/инструкции для клиента",
      adminNotesPh: "Напишите инструкции…",
      adminCreateBtn: "Создать",
      adminCases: "Случаи",
      adminColId: "ИД",
      adminColCode: "Код",
      adminColStatus: "Статус",
      adminColTitle: "Заголовок",
      adminColCreated: "Создан",
      adminColExpires: "Срок действия истекает",
      adminColFiles: "Файлы",
      adminColActions: "Действия",
      adminUpload: "Загрузить",
      adminDelete: "Удалить",
      adminLogout: "Выход",
      adminConfirmDelete: "Удалить это дело полностью? Файлы тоже удалятся.",
      adminEmpty: "Пока нет дел.",

      uploadTitle: "Загрузка файлов",
      uploadSub: "Загрузите документы для этого кода.",
    },
    en: {
      langName: "English",
      homeBreadcrumb: "Home",
      checkBreadcrumb: "Check Invitation Status",
      adminBreadcrumb: "Admin Panel",
      loginBreadcrumb: "Admin Login",

      homeTitle: "Check invitation status",
      homeKicker: "Secure verification of consulate invitation status.",
      homeSub: "Enter your reference code to check the invitation status.",

      homeBtnCheck: "Check invitation status",

      b1Title: "Your data is protected.",
      b2Title: "Verification is automated.",
      b3Title: "Information provided by Visa Global.",

      checkTitle: "Check invitation",
      checkSub: "Enter your unique reference number issued by Visa Global to verify the invitation.",
      checkPlaceholder: "Enter your invitation number",
      checkBtn: "Check",
      checkHint: "Enter the number exactly as provided, without spaces.",
      checkNotFound: "Code not found. Please check and try again.",
      checkError: "Verification error. Please try again later.",

      statusIssued: "Issued",
      statusPending: "Pending",
      statusCancelled: "Cancelled",

      adminLoginTitle: "Administrator login",
      adminLoginSub: "Enter the administrator username and password.",
      adminUser: "Username",
      adminPass: "Password",
      adminLoginBtn: "Sign in",
      adminLoginError: "Login failed.",

      adminTitle: "Admin panel",
      adminCreate: "Create new case",
      adminStatus: "Status",
      adminTTL: "Auto-delete after",
      adminTTLOff: "Auto-delete disabled",
      adminTitleLabel: "Title",
      adminNotesLabel: "Notes/instructions for the client",
      adminNotesPh: "Write instructions…",
      adminCreateBtn: "Create",
      adminCases: "Cases",
      adminColId: "ID",
      adminColCode: "Code",
      adminColStatus: "Status",
      adminColTitle: "Title",
      adminColCreated: "Created",
      adminColExpires: "Expires",
      adminColFiles: "Files",
      adminColActions: "Actions",
      adminUpload: "Upload",
      adminDelete: "Delete",
      adminLogout: "Logout",
      adminConfirmDelete: "Delete this case completely? Files will be deleted too.",
      adminEmpty: "No cases yet.",

      uploadTitle: "Upload files",
      uploadSub: "Upload documents for this code.",
    },
    de: {
      langName: "Deutsch",
      homeBreadcrumb: "Start",
      checkBreadcrumb: "Einladungsstatus prüfen",
      adminBreadcrumb: "Admin-Bereich",
      loginBreadcrumb: "Admin-Login",

      homeTitle: "Einladungsstatus prüfen",
      homeKicker: "Sichere Prüfung des Konsulat‑Einladungsstatus.",
      homeSub: "Geben Sie Ihren Referenzcode ein, um den Status zu prüfen.",

      homeBtnCheck: "Einladungsstatus prüfen",

      b1Title: "Ihre Daten sind geschützt.",
      b2Title: "Die Prüfung ist automatisiert.",
      b3Title: "Informationen von Visa Global.",

      checkTitle: "Einladung prüfen",
      checkSub: "Geben Sie Ihre eindeutige Referenznummer ein, die von Visa Global ausgestellt wurde.",
      checkPlaceholder: "Einladungsnummer eingeben",
      checkBtn: "Prüfen",
      checkHint: "Geben Sie die Nummer exakt ein, ohne Leerzeichen.",
      checkNotFound: "Code nicht gefunden. Bitte prüfen und erneut versuchen.",
      checkError: "Prüffehler. Bitte später erneut versuchen.",

      statusIssued: "Ausgestellt",
      statusPending: "Ausstehend",
      statusCancelled: "Storniert",

      adminLoginTitle: "Administrator‑Login",
      adminLoginSub: "Geben Sie Benutzername und Passwort ein.",
      adminUser: "Benutzername",
      adminPass: "Passwort",
      adminLoginBtn: "Anmelden",
      adminLoginError: "Login fehlgeschlagen.",

      adminTitle: "Admin‑Panel",
      adminCreate: "Neuen Fall erstellen",
      adminStatus: "Status",
      adminTTL: "Automatisch löschen nach",
      adminTTLOff: "Auto‑Löschen deaktiviert",
      adminTitleLabel: "Titel",
      adminNotesLabel: "Hinweise/Anweisungen für den Kunden",
      adminNotesPh: "Anweisungen schreiben…",
      adminCreateBtn: "Erstellen",
      adminCases: "Fälle",
      adminColId: "ID",
      adminColCode: "Code",
      adminColStatus: "Status",
      adminColTitle: "Titel",
      adminColCreated: "Erstellt",
      adminColExpires: "Läuft ab",
      adminColFiles: "Dateien",
      adminColActions: "Aktionen",
      adminUpload: "Hochladen",
      adminDelete: "Löschen",
      adminLogout: "Abmelden",
      adminConfirmDelete: "Diesen Fall komplett löschen? Dateien werden auch gelöscht.",
      adminEmpty: "Noch keine Fälle.",

      uploadTitle: "Dateien hochladen",
      uploadSub: "Dokumente für diesen Code hochladen.",
    },
    fr: {
      langName: "Français",
      homeBreadcrumb: "Accueil",
      checkBreadcrumb: "Vérifier le statut",
      adminBreadcrumb: "Espace admin",
      loginBreadcrumb: "Connexion admin",

      homeTitle: "Vérifier le statut de l’invitation",
      homeKicker: "Vérification sécurisée du statut d’invitation consulaire.",
      homeSub: "Entrez votre code de référence pour vérifier le statut.",

      homeBtnCheck: "Vérifier le statut",

      b1Title: "Vos données sont protégées.",
      b2Title: "La vérification est automatisée.",
      b3Title: "Informations fournies par Visa Global.",

      checkTitle: "Vérifier l’invitation",
      checkSub: "Entrez votre numéro de référence unique émis par Visa Global.",
      checkPlaceholder: "Entrez votre numéro d’invitation",
      checkBtn: "Vérifier",
      checkHint: "Saisissez le numéro exactement comme fourni, sans espaces.",
      checkNotFound: "Code introuvable. Vérifiez et réessayez.",
      checkError: "Erreur de vérification. Réessayez plus tard.",

      statusIssued: "Émise",
      statusPending: "En attente",
      statusCancelled: "Annulée",

      adminLoginTitle: "Connexion administrateur",
      adminLoginSub: "Entrez l’identifiant et le mot de passe administrateur.",
      adminUser: "Identifiant",
      adminPass: "Mot de passe",
      adminLoginBtn: "Se connecter",
      adminLoginError: "Échec de la connexion.",

      adminTitle: "Panneau d’administration",
      adminCreate: "Créer un dossier",
      adminStatus: "Statut",
      adminTTL: "Suppression auto après",
      adminTTLOff: "Suppression auto désactivée",
      adminTitleLabel: "Titre",
      adminNotesLabel: "Notes/instructions pour le client",
      adminNotesPh: "Écrivez les instructions…",
      adminCreateBtn: "Créer",
      adminCases: "Dossiers",
      adminColId: "ID",
      adminColCode: "Code",
      adminColStatus: "Statut",
      adminColTitle: "Titre",
      adminColCreated: "Créé",
      adminColExpires: "Expire",
      adminColFiles: "Fichiers",
      adminColActions: "Actions",
      adminUpload: "Téléverser",
      adminDelete: "Supprimer",
      adminLogout: "Déconnexion",
      adminConfirmDelete: "Supprimer ce dossier complètement ? Les fichiers seront aussi supprimés.",
      adminEmpty: "Aucun dossier pour l’instant.",

      uploadTitle: "Téléversement",
      uploadSub: "Téléversez des documents pour ce code.",
    }
  };

  const LANGS = ["ru","en","de","fr"];

  function getLang(){
    const saved = localStorage.getItem("vg_lang");
    if (saved && LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "en").slice(0,2).toLowerCase();
    return LANGS.includes(nav) ? nav : "en";
  }

  function setLang(lang){
    if (!LANGS.includes(lang)) lang = "en";
    localStorage.setItem("vg_lang", lang);
    return lang;
  }

  function t(lang, key){
    return (DICT[lang] && DICT[lang][key]) || (DICT.en && DICT.en[key]) || key;
  }

  function apply(lang){
    lang = setLang(lang || getLang());
    document.documentElement.setAttribute("lang", lang);

    // update selects
    document.querySelectorAll("[data-lang-select]").forEach(sel => {
      if (sel.value !== lang) sel.value = lang;
    });

    // text nodes
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      el.textContent = t(lang, key);
    });

    // placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(lang, key));
    });

    // options (like TTL off)
    document.querySelectorAll("[data-i18n-option]").forEach(el=>{
      const key = el.getAttribute("data-i18n-option");
      el.textContent = t(lang, key);
    });

    return lang;
  }

  // expose
  window.VG_I18N = { DICT, LANGS, getLang, setLang, t, applyI18n: apply };

  document.addEventListener("change", (e)=>{
    const target = e.target;
    if (target && target.matches("[data-lang-select]")){
      apply(target.value);
    }
  });

})();
