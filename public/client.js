(() => {
  const dict = {
    en: {
      navCheck: "Check Invitation Status ›",
      navHome: "Home ›",
      indexTitle: "Track your invitation status",
      indexSubtitle:
        "Verify your reference code, see the latest status, and download attached files.",
      goCheck: "Go to check page",
      feat1: "Your data is protected.",
      feat2: "Verification is automated.",
      feat3: "Information provided by Visa Global.",
      footer: "© Visa Global • All rights reserved",

      checkTitle: "Check Consulate Interview Invitation Status",
      checkSubtitle:
        "Enter your unique reference number issued by Visa Global to verify your invitation.",
      checkPlaceholder: "Enter your invitation number",
      verify: "VERIFY",
      checkHint: "Please enter the number exactly as provided, without spaces.",
      errEnterCode: "Please enter a reference code.",
      errNotFound: "Reference code not found.",
      errServer: "Server error.",

      status_PENDING: "PENDING",
      status_ISSUED: "ISSUED",
      status_CANCELLED: "CANCELLED",
      files: "Files",
    },
    ru: {
      navCheck: "Проверить статус приглашения ›",
      navHome: "Главная ›",
      indexTitle: "Проверяйте статус приглашения",
      indexSubtitle:
        "Введите код, посмотрите текущий статус и скачайте прикреплённые файлы.",
      goCheck: "Перейти к проверке",
      feat1: "Ваши данные защищены.",
      feat2: "Проверка автоматизирована.",
      feat3: "Информация предоставляется Visa Global.",
      footer: "© Visa Global • Все права защищены",

      checkTitle: "Проверка статуса приглашения на собеседование",
      checkSubtitle:
        "Введите уникальный код, выданный Visa Global, чтобы проверить приглашение.",
      checkPlaceholder: "Введите номер приглашения",
      verify: "ПРОВЕРИТЬ",
      checkHint: "Введите номер точно как выдано, без пробелов.",
      errEnterCode: "Введите код.",
      errNotFound: "Код не найден.",
      errServer: "Ошибка сервера.",

      status_PENDING: "В ОЖИДАНИИ",
      status_ISSUED: "ИЗДАННЫЙ",
      status_CANCELLED: "ОТМЕНЕНО",
      files: "Файлы",
    },
  };

  const getDefaultLang = () => {
    const saved = localStorage.getItem("vg_lang");
    if (saved && dict[saved]) return saved;
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("ru") ? "ru" : "en";
  };

  let lang = getDefaultLang();

  const t = (k) => dict[lang]?.[k] ?? dict.en[k] ?? k;

  const applyI18n = () => {
    document.documentElement.lang = lang;

    const sel = document.getElementById("langSelect");
    if (sel) sel.value = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      el.setAttribute("placeholder", t(key));
    });
  };

  const setLang = (next) => {
    if (!dict[next]) return;
    lang = next;
    localStorage.setItem("vg_lang", lang);
    applyI18n();
  };

  // Wire language select if present
  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => setLang(e.target.value));
  }

  // Apply once on load
  applyI18n();

  // ===== Check page logic (guards so it doesn't break on other pages) =====
  const codeEl = document.getElementById("code");
  const form = document.getElementById("form");
  const out = document.getElementById("out");
  const result = document.getElementById("result");

  if (!form || !codeEl || !out || !result) return;

  const statusText = (raw) => {
    const st = (raw || "").toUpperCase();
    if (st === "PENDING") return t("status_PENDING");
    if (st === "ISSUED") return t("status_ISSUED");
    if (st === "CANCELLED") return t("status_CANCELLED");
    return st;
  };

  const fmtSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = (codeEl.value || "").trim().toUpperCase();
    out.textContent = "";
    result.innerHTML = "";

    if (!code) {
      out.textContent = t("errEnterCode");
      return;
    }

    try {
      const r = await fetch(`/api/check?code=${encodeURIComponent(code)}`);
      const j = await r.json().catch(() => ({}));

      if (!r.ok || !j.ok) {
        out.textContent = j.message || (r.status === 404 ? t("errNotFound") : t("errServer"));
        return;
      }

      const files = Array.isArray(j.files) ? j.files : [];

      const fileList = files.length
        ? `<div class="files"><div class="filesTitle">${t("files")}</div>${files
            .map(
              (f) =>
                `<a class="file" href="${f.url}" target="_blank" rel="noopener">` +
                `<span>${f.name}</span>` +
                `<span class="small">${fmtSize(f.size)}</span>` +
                `</a>`
            )
            .join("")}</div>`
        : "";

      result.innerHTML = `
        <div class="resultCard">
          <div class="resultTop">
            <div>
              <div class="resultTitle">${j.title || "Invitation status"}</div>
              <div class="small">${j.code}</div>
            </div>
            <div class="pill ${String(j.status || "").toUpperCase()}">${statusText(j.status)}</div>
          </div>
          ${j.note ? `<div class="note">${j.note}</div>` : ""}
          ${fileList}
        </div>
      `;
    } catch (err) {
      out.textContent = t("errServer");
    }
  });
})();
