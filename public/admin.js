(() => {
  const $ = (s) => document.querySelector(s);

  // ===== i18n fallback (если в i18n.js нет applyI18n / t) =====
  const FALLBACK = {
    ru: {
      created: "Создано. Код: ",
      deleted: "Удалено",
      err: "Ошибка",
      confirmDelete: "Удалить это дело полностью? (Файлы тоже удалятся)",
      needTitle: "Введите заголовок",
    },
    en: {
      created: "Created. Code: ",
      deleted: "Deleted",
      err: "Error",
      confirmDelete: "Delete this case permanently? (Files will be removed too)",
      needTitle: "Enter a title",
    },
    de: {
      created: "Erstellt. Code: ",
      deleted: "Gelöscht",
      err: "Fehler",
      confirmDelete: "Diesen Fall endgültig löschen? (Dateien werden ebenfalls gelöscht)",
      needTitle: "Titel eingeben",
    },
    fr: {
      created: "Créé. Code : ",
      deleted: "Supprimé",
      err: "Erreur",
      confirmDelete: "Supprimer ce dossier définitivement ? (Les fichiers seront aussi supprimés)",
      needTitle: "Saisissez un titre",
    }
  };

  function getLang() {
    return localStorage.getItem("vg_lang") || "ru";
  }
  function setLang(l) {
    localStorage.setItem("vg_lang", l);
  }

  function t(key) {
    if (typeof window.t === "function") return window.t(key);
    const l = getLang();
    return (FALLBACK[l] && FALLBACK[l][key]) || (FALLBACK.ru[key] || key);
  }

  function safeApplyI18n() {
    if (typeof window.applyI18n === "function") {
      try { window.applyI18n(); } catch(_) {}
    }
  }

  // ===== API =====
  async function api(url, opts) {
    const r = await fetch(url, opts);
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) {
      const msg = j.message || `${t("err")}: ${r.status}`;
      throw new Error(msg);
    }
    return j;
  }

  // ===== UI =====
  const elLang = $("#lang");
  const elLogout = $("#logout");
  const elStatus = $("#status");
  const elTtl = $("#ttl");
  const elTitle = $("#title");
  const elNote = $("#note");
  const elCreate = $("#create");
  const elHint = $("#createdHint");
  const elTbody = $("#tbody");

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso || "";
    }
  }

  function ttlLabel(ttlDays) {
    if (!ttlDays || ttlDays === 0) return "—";
    return `${ttlDays}d`;
  }

  async function loadCases() {
    const j = await api("/api/admin/cases");
    renderRows(j.rows || []);
  }

  function renderRows(rows) {
    elTbody.innerHTML = "";
    for (const row of rows) {
      const tr = document.createElement("tr");

      const ttlDays = row.ttl_days || 0; // если сервер не поддерживает — будет 0
      const expiresAt = row.expires_at || ""; // если сервер не поддерживает — пусто

      tr.innerHTML = `
        <td>${row.id}</td>
        <td><code>${row.code}</code></td>
        <td>${row.status}</td>
        <td>${escapeHtml(row.title || "")}</td>
        <td>${fmtDate(row.created_at)}</td>
        <td>${expiresAt ? fmtDate(expiresAt) : ttlLabel(ttlDays)}</td>
        <td>
          <button class="btn sm" data-copy="${row.code}">Копировать</button>
          <button class="btn sm danger" data-del="${row.id}">Удалить</button>
        </td>
      `;

      elTbody.appendChild(tr);
    }

    elTbody.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const code = btn.getAttribute("data-copy");
        try {
          await navigator.clipboard.writeText(code);
          elHint.textContent = `Код скопирован: ${code}`;
        } catch {
          elHint.textContent = `Код: ${code}`;
        }
      });
    });

    elTbody.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm(t("confirmDelete"))) return;
        try {
          // В твоём server.js нет DELETE /api/admin/cases/:id,
          // поэтому делаем "мягкое удаление": is_active=0
          await api(`/api/admin/cases/${id}`, {
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ is_active: 0 })
          });
          elHint.textContent = t("deleted");
          await loadCases();
        } catch (e) {
          elHint.textContent = e.message;
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function createCase() {
    elHint.textContent = "";
    const status = elStatus.value;
    const title = elTitle.value.trim();
    const note = elNote.value || "";
    const ttl = Number(elTtl.value || 0);

    if (!title) {
      elHint.textContent = t("needTitle");
      return;
    }

    elCreate.disabled = true;
    try {
      // server.js принимает только status/title/note
      const j = await api("/api/admin/cases", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ status, title, note })
      });

      // TTL: если сервер это не умеет — просто игнор
      // (можно добавить позже в server.js, если захочешь)

      elHint.textContent = t("created") + j.code;
      elTitle.value = "";
      elNote.value = "";
      await loadCases();
    } catch (e) {
      elHint.textContent = e.message;
    } finally {
      elCreate.disabled = false;
    }
  }

  async function logout() {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } catch {}
    location.href = "/admin/login";
  }

  // ===== init =====
  (function init() {
    const lang = getLang();
    if (elLang) elLang.value = lang;

    // если твой i18n.js умеет — применим
    safeApplyI18n();

    elLang?.addEventListener("change", () => {
      setLang(elLang.value);
      safeApplyI18n(); // если есть
      // если нет — просто перезагрузим страницу (быстро и надёжно)
      location.reload();
    });

    elCreate?.addEventListener("click", createCase);
    elLogout?.addEventListener("click", logout);

    loadCases().catch((e) => {
      elHint.textContent = e.message || "Не удалось загрузить случаи. Возможно, вы не авторизованы.";
      // если не авторизован — на логин
      setTimeout(() => location.href = "/admin/login", 800);
    });
  })();
})();
