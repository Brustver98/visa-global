const I18N = {
  en: { appName:"Visa Global", tagline:"Secure status verification for consular invitation references.",
    startBtn:"Check invitation status", startHint:"Enter your reference code to view the invitation status and attached documents.",
    checkTitle:"Invitation Status Verification", checkSubtitle:"Please enter your reference code exactly as provided.",
    codeLabel:"Reference Code", codePlaceholder:"e.g. VG-ABCD-1234", checkBtn:"Verify", backBtn:"Back",
    resultTitle:"Result", status:"Status", documents:"Documents", note:"Client instructions",
    notFound:"Reference code not found.", serverError:"Server error.", pending:"Pending", issued:"Issued", cancelled:"Cancelled",
    adminLogin:"Admin Login", username:"Username", password:"Password", signIn:"Sign in", logout:"Logout",
    adminPanel:"Admin Panel", createCase:"Create new case", caseTitle:"Title", caseNote:"Note / instructions for the client",
    caseStatus:"Status", expiry:"Auto-delete after", expiryNone:"No auto-delete", days3:"3 days", days5:"5 days", days7:"7 days", days14:"14 days",
    create:"Create", cases:"Cases", actions:"Actions", delete:"Delete", upload:"Upload documents", uploadBtn:"Upload", files:"Files",
    confirmDeleteCase:"Delete this case and all its files? This cannot be undone.", footer:"© Visa Global. All rights reserved." },
  ru: { appName:"Visa Global", tagline:"Безопасная проверка статуса приглашения на консульскую беседу.",
    startBtn:"Проверить статус приглашения", startHint:"Введите ваш код, чтобы увидеть статус приглашения и прикреплённые документы.",
    checkTitle:"Проверка статуса приглашения", checkSubtitle:"Введите код точно так, как он указан в вашем приглашении.",
    codeLabel:"Код", codePlaceholder:"например: VG-ABCD-1234", checkBtn:"Проверить", backBtn:"Назад",
    resultTitle:"Результат", status:"Статус", documents:"Документы", note:"Инструкция для клиента",
    notFound:"Код не найден.", serverError:"Ошибка сервера.", pending:"В ожидании", issued:"Издано", cancelled:"Отменено",
    adminLogin:"Вход администратора", username:"Логин", password:"Пароль", signIn:"Войти", logout:"Выйти",
    adminPanel:"Панель администратора", createCase:"Создать новое дело", caseTitle:"Заголовок", caseNote:"Примечание / инструкция для клиента",
    caseStatus:"Статус", expiry:"Автоудаление через", expiryNone:"Без автоудаления", days3:"3 дня", days5:"5 дней", days7:"7 дней", days14:"14 дней",
    create:"Создать", cases:"Дела", actions:"Действия", delete:"Удалить", upload:"Загрузить документы", uploadBtn:"Загрузить", files:"Файлы",
    confirmDeleteCase:"Удалить дело и все его файлы? Это действие нельзя отменить.", footer:"© Visa Global. Все права защищены." },
  de: { appName:"Visa Global", tagline:"Sichere Statusprüfung für konsularische Einladungsreferenzen.",
    startBtn:"Einladungsstatus prüfen", startHint:"Geben Sie Ihren Referenzcode ein, um Status und Dokumente zu sehen.",
    checkTitle:"Einladungsstatus-Prüfung", checkSubtitle:"Bitte geben Sie den Referenzcode genau wie angegeben ein.",
    codeLabel:"Referenzcode", codePlaceholder:"z.B. VG-ABCD-1234", checkBtn:"Prüfen", backBtn:"Zurück",
    resultTitle:"Ergebnis", status:"Status", documents:"Dokumente", note:"Hinweise für den Kunden",
    notFound:"Referenzcode nicht gefunden.", serverError:"Serverfehler.", pending:"Ausstehend", issued:"Ausgestellt", cancelled:"Storniert",
    adminLogin:"Admin-Anmeldung", username:"Benutzername", password:"Passwort", signIn:"Anmelden", logout:"Abmelden",
    adminPanel:"Admin-Panel", createCase:"Neuen Fall erstellen", caseTitle:"Titel", caseNote:"Notiz / Hinweise für den Kunden",
    caseStatus:"Status", expiry:"Automatisch löschen nach", expiryNone:"Keine automatische Löschung", days3:"3 Tage", days5:"5 Tage", days7:"7 Tage", days14:"14 Tage",
    create:"Erstellen", cases:"Fälle", actions:"Aktionen", delete:"Löschen", upload:"Dokumente hochladen", uploadBtn:"Hochladen", files:"Dateien",
    confirmDeleteCase:"Diesen Fall und alle Dateien löschen? Dies kann nicht rückgängig gemacht werden.", footer:"© Visa Global. Alle Rechte vorbehalten." },
  fr: { appName:"Visa Global", tagline:"Vérification sécurisée du statut d'invitation consulaire.",
    startBtn:"Vérifier le statut de l’invitation", startHint:"Saisissez votre code de référence pour voir le statut et les documents.",
    checkTitle:"Vérification du statut", checkSubtitle:"Veuillez saisir le code exactement comme fourni.",
    codeLabel:"Code de référence", codePlaceholder:"ex. VG-ABCD-1234", checkBtn:"Vérifier", backBtn:"Retour",
    resultTitle:"Résultat", status:"Statut", documents:"Documents", note:"Instructions client",
    notFound:"Code introuvable.", serverError:"Erreur serveur.", pending:"En attente", issued:"Émis", cancelled:"Annulé",
    adminLogin:"Connexion administrateur", username:"Nom d'utilisateur", password:"Mot de passe", signIn:"Se connecter", logout:"Se déconnecter",
    adminPanel:"Panneau d’administration", createCase:"Créer un dossier", caseTitle:"Titre", caseNote:"Note / instructions client",
    caseStatus:"Statut", expiry:"Suppression automatique après", expiryNone:"Pas de suppression automatique", days3:"3 jours", days5:"5 jours", days7:"7 jours", days14:"14 jours",
    create:"Créer", cases:"Dossiers", actions:"Actions", delete:"Supprimer", upload:"Téléverser des documents", uploadBtn:"Téléverser", files:"Fichiers",
    confirmDeleteCase:"Supprimer ce dossier et tous ses fichiers ? Action irréversible.", footer:"© Visa Global. Tous droits réservés." }
};

function getLang(){ const s=localStorage.getItem("vg_lang"); return (s && I18N[s]) ? s : "en"; }
function setLang(l){ if(I18N[l]) localStorage.setItem("vg_lang", l); }
function t(k){ const l=getLang(); return (I18N[l] && I18N[l][k]) ? I18N[l][k] : (I18N.en[k] || k); }
function applyI18n(root=document){
  const lang=getLang();
  const sel=root.querySelector("[data-lang-select]"); if(sel) sel.value=lang;
  root.querySelectorAll("[data-i18n]").forEach(el=>{ el.textContent=t(el.getAttribute("data-i18n")); });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{ el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder"))); });
}
