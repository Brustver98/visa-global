(function(){
  const dict = {
    ru:{brandTag:"Портал проверки приглашений",homeTitle:"Проверить статус приглашения",homeKicker:"Безопасная проверка статуса по ссылкам на консульские приглашения.",homeH1:"Проверить статус приглашения",homeSub:"Введите свой реферальный код, чтобы проверить статус приглашения.",homeBtn:"ПЕРЕЙТИ К ПРОВЕРКЕ",bullet1:"Ваши данные защищены.",bullet2:"Проверка автоматизирована.",bullet3:"Информация предоставлена Visa Global.",footer:"© Visa Global. Все права защищены.",checkTitle:"Visa Global — Проверка статуса",checkH1:"Проверка статуса приглашения на собеседование",checkSub:"Введите уникальный код, выданный Visa Global, чтобы проверить приглашение.",checkPlaceholder:"Введите номер приглашения",checkBtn:"ПРОВЕРИТЬ",checkHint:"Введите номер точно как выдано, без пробелов.",backBtn:"Назад"},
    en:{brandTag:"Invitation verification portal",homeTitle:"Check Invitation Status",homeKicker:"Secure verification of consulate invitation links.",homeH1:"Check Invitation Status",homeSub:"Enter your reference code to verify your invitation status.",homeBtn:"GO TO CHECK",bullet1:"Your data is protected.",bullet2:"Verification is automated.",bullet3:"Information provided by Visa Global.",footer:"© Visa Global. All rights reserved.",checkTitle:"Visa Global — Check Status",checkH1:"Check Consulate Interview Invitation Status",checkSub:"Enter your unique reference number issued by Visa Global to verify your invitation.",checkPlaceholder:"Enter your invitation number",checkBtn:"VERIFY",checkHint:"Please enter the number exactly as provided, without spaces.",backBtn:"Back"},
    de:{brandTag:"Portal zur Einladungsprüfung",homeTitle:"Einladungsstatus prüfen",homeKicker:"Sichere Prüfung von Konsulatseinladungen.",homeH1:"Einladungsstatus prüfen",homeSub:"Geben Sie Ihren Referenzcode ein, um den Status der Einladung zu prüfen.",homeBtn:"ZUR PRÜFUNG",bullet1:"Ihre Daten sind geschützt.",bullet2:"Die Prüfung ist automatisiert.",bullet3:"Informationen von Visa Global.",footer:"© Visa Global. Alle Rechte vorbehalten.",checkTitle:"Visa Global — Status prüfen",checkH1:"Status der Einladung zum Konsulatstermin prüfen",checkSub:"Geben Sie Ihre eindeutige Referenznummer ein, um die Einladung zu prüfen.",checkPlaceholder:"Einladungsnummer eingeben",checkBtn:"PRÜFEN",checkHint:"Bitte Nummer genau wie angegeben eingeben, ohne Leerzeichen.",backBtn:"Zurück"},
    fr:{brandTag:"Portail de vérification",homeTitle:"Vérifier le statut",homeKicker:"Vérification sécurisée des invitations au consulat.",homeH1:"Vérifier le statut",homeSub:"Saisissez votre code de référence pour vérifier le statut de l’invitation.",homeBtn:"ALLER À LA VÉRIFICATION",bullet1:"Vos données sont protégées.",bullet2:"La vérification est automatisée.",bullet3:"Informations fournies par Visa Global.",footer:"© Visa Global. Tous droits réservés.",checkTitle:"Visa Global — Vérification",checkH1:"Vérifier le statut de l’invitation à l’entretien consulaire",checkSub:"Saisissez votre référence unique fournie par Visa Global pour vérifier votre invitation.",checkPlaceholder:"Saisir le numéro d’invitation",checkBtn:"VÉRIFIER",checkHint:"Saisissez le numéro exactement comme fourni, sans espaces.",backBtn:"Retour"}
  };
  function initial(){
    const saved=localStorage.getItem("vg_lang");
    if(saved && dict[saved]) return saved;
    const nav=(navigator.language||"en").toLowerCase();
    if(nav.startsWith("ru")) return "ru";
    if(nav.startsWith("de")) return "de";
    if(nav.startsWith("fr")) return "fr";
    return "en";
  }
  function apply(lang){
    const t=dict[lang]||dict.en;
    document.documentElement.lang=lang;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k=el.getAttribute("data-i18n"); if(t[k]!==undefined) el.textContent=t[k];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
      const k=el.getAttribute("data-i18n-placeholder"); if(t[k]!==undefined) el.setAttribute("placeholder",t[k]);
    });
    const titleKey=document.body.getAttribute("data-title-key");
    if(titleKey && t[titleKey]) document.title=t[titleKey];
    localStorage.setItem("vg_lang",lang);
    const sel=document.getElementById("lang"); if(sel) sel.value=lang;
  }
  document.addEventListener("DOMContentLoaded",()=>{
    const sel=document.getElementById("lang");
    if(sel) sel.addEventListener("change",e=>apply(e.target.value));
    apply(initial());
  });
})();