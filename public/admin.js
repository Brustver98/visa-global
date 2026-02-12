(() => {
  const dict = {
    en: {
      title: "Admin panel",
      logout: "Logout",
      createTitle: "Create new case",
      statusPending: "PENDING",
      statusIssued: "ISSUED",
      statusCancelled: "CANCELLED",
      titlePlaceholder: "Title (e.g., Consulate interview invitation)",
      create: "CREATE",
      cases: "Cases",
      tip:
        "Tip: click a row to edit, upload files, update status, or delete.",
      thId: "ID",
      thCode: "Code",
      thStatus: "Status",
      thActive: "Active",
      thCreated: "Created",
      thDelete: "Delete",

      edit: "Edit case",
      save: "SAVE",
      deactivate: "Deactivate",
      activate: "Activate",
      deleteCase: "Delete case",
      deleteCaseConfirm:
        "Delete this case completely? All files and the code will be removed.",
      deleteFile: "Delete file",
      deleteFileConfirm: "Delete this file?",
      upload: "Upload files",
      uploadHint: "PDF/JPG/PNG/WEBP up to 15MB each",
      noFile: "No file selected",
      err: "Error",
      deleted: "Deleted.",
      updated: "Updated.",
      uploaded: "Uploaded.",
      yes: "Yes",
      no: "No",
      activeYes: "YES",
      activeNo: "NO",
    },
    ru: {
      title: "Панель администратора",
      logout: "Выйти",
      createTitle: "Создать новое дело",
      statusPending: "В ОЖИДАНИИ",
      statusIssued: "ИЗДАННЫЙ",
      statusCancelled: "ОТМЕНЕНО",
      titlePlaceholder: "Заголовок (например, Приглашение на собеседование)",
      create: "СОЗДАТЬ",
      cases: "Случаи",
      tip:
        "Совет: щёлкните по строке дела, чтобы отредактировать, загрузить файлы, обновить статус или удалить.",
      thId: "ИД",
      thCode: "Код",
      thStatus: "Статус",
      thActive: "Активный",
      thCreated: "Создан",
      thDelete: "Удалить",

      edit: "Редактирование",
      save: "СОХРАНИТЬ",
      deactivate: "Деактивировать",
      activate: "Активировать",
      deleteCase: "Удалить дело",
      deleteCaseConfirm:
        "Удалить дело полностью? Код и все файлы будут удалены.",
      deleteFile: "Удалить файл",
      deleteFileConfirm: "Удалить этот файл?",
      upload: "Загрузить файлы",
      uploadHint: "PDF/JPG/PNG/WEBP до 15МБ каждый",
      noFile: "Файл не выбран",
      err: "Ошибка",
      deleted: "Удалено.",
      updated: "Обновлено.",
      uploaded: "Загружено.",
      yes: "Да",
      no: "Нет",
      activeYes: "ДА",
      activeNo: "НЕТ",
    },
  };

  const autoLang = () => {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "ru") return saved;
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("ru") ? "ru" : "en";
  };

  let lang = autoLang();
  const t = (k) => (dict[lang] && dict[lang][k]) || dict.en[k] || k;

  function applyI18n() {
    document.documentElement.lang = lang;

    const sel = document.getElementById("langSelect");
    if (sel) {
      sel.value = lang;
      sel.onchange = () => {
        lang = sel.value;
        localStorage.setItem("lang", lang);
        applyI18n();
        // re-render status labels
        loadCases();
        if (currentCase) openCase(currentCase.id);
      };
    }

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
  }

  // Elements
  const msgEl = document.getElementById("msg");
  const newStatusEl = document.getElementById("newStatus");
  const newTitleEl = document.getElementById("newTitle");
  const createBtn = document.getElementById("createBtn");
  const tableBody = document.getElementById("caseRows");

  const editor = document.getElementById("editor");
  const editIdEl = document.getElementById("editId");
  const editCodeEl = document.getElementById("editCode");
  const editStatusEl = document.getElementById("editStatus");
  const editTitleEl = document.getElementById("editTitle");
  const editNoteEl = document.getElementById("editNote");
  const editActiveEl = document.getElementById("editActive");
  const saveBtn = document.getElementById("saveBtn");
  const toggleActiveBtn = document.getElementById("toggleActiveBtn");
  const deleteCaseBtn = document.getElementById("deleteCaseBtn");

  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const filesList = document.getElementById("filesList");

  let currentCase = null;

  function setMsg(text, isError = false) {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className = isError ? "msg error" : "msg";
  }

  const statusText = (st) => {
    const up = String(st || "").toUpperCase();
    if (up === "PENDING") return t("statusPending");
    if (up === "ISSUED") return t("statusIssued");
    if (up === "CANCELLED") return t("statusCancelled");
    return up;
  };

  const boolText = (b) => (Number(b) === 1 ? t("activeYes") : t("activeNo"));

  async function api(url, opts) {
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      const m = data.message || `${t("err")}: ${res.status}`;
      throw new Error(m);
    }
    return data;
  }

  async function loadCases() {
    try {
      const data = await api("/api/admin/cases");
      const rows = data.rows || [];

      tableBody.innerHTML = rows
        .map(
          (r) => `
          <tr data-id="${r.id}">
            <td>${r.id}</td>
            <td class="mono">${r.code}</td>
            <td>${statusText(r.status)}</td>
            <td>${boolText(r.is_active)}</td>
            <td class="mono">${new Date(r.created_at).toISOString().replace('T',' ').slice(0,19)}</td>
            <td style="text-align:right">
              <button class="iconBtn danger" title="${t("deleteCase")}" data-delcase="${r.id}">✕</button>
            </td>
          </tr>`
        )
        .join("");

      // Row click -> open
      tableBody.querySelectorAll("tr").forEach((tr) => {
        tr.addEventListener("click", (e) => {
          // ignore if clicked delete button
          if (e.target && e.target.matches("[data-delcase]")) return;
          const id = Number(tr.dataset.id);
          const r = rows.find((x) => x.id === id);
          if (r) openCase(r.id);
        });
      });

      // Delete case buttons
      tableBody.querySelectorAll("[data-delcase]").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const id = Number(btn.getAttribute("data-delcase"));
          if (!confirm(t("deleteCaseConfirm"))) return;
          try {
            await api(`/api/admin/cases/${id}`, { method: "DELETE" });
            setMsg(t("deleted"));
            if (currentCase && currentCase.id === id) {
              currentCase = null;
              editor.classList.add("hidden");
            }
            await loadCases();
          } catch (err) {
            setMsg(err.message, true);
          }
        });
      });
    } catch (err) {
      setMsg(err.message, true);
    }
  }

  async function openCase(id) {
    const data = await api("/api/admin/cases");
    const row = (data.rows || []).find((r) => r.id === id);
    if (!row) throw new Error("Not found");

    currentCase = row;
    editor.classList.remove("hidden");

    editIdEl.textContent = String(row.id);
    editCodeEl.textContent = row.code;
    editStatusEl.value = String(row.status || "PENDING").toUpperCase();
    editTitleEl.value = row.title || "";
    editNoteEl.value = row.note || "";
    editActiveEl.checked = Number(row.is_active) === 1;

    toggleActiveBtn.textContent = editActiveEl.checked
      ? t("deactivate")
      : t("activate");

    await loadFiles(id);
  }

  async function loadFiles(caseId) {
    const data = await api(`/api/admin/cases/${caseId}/files`);
    const rows = data.rows || [];

    filesList.innerHTML = rows
      .map(
        (f) => `
      <div class="fileRow">
        <a class="fileLink" href="${f.url}" target="_blank" rel="noreferrer">
          ${f.name}
        </a>
        <div class="fileMeta mono">${Math.round((f.size || 0) / 1024)} KB</div>
        <button class="iconBtn" data-delfile="${f.id}">${t("deleteFile")}</button>
      </div>`
      )
      .join("");

    filesList.querySelectorAll("[data-delfile]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(t("deleteFileConfirm"))) return;
        try {
          await api(`/api/admin/files/${btn.getAttribute("data-delfile")}`, {
            method: "DELETE",
          });
          setMsg(t("deleted"));
          await loadFiles(caseId);
        } catch (err) {
          setMsg(err.message, true);
        }
      });
    });
  }

  createBtn?.addEventListener("click", async () => {
    try {
      const payload = {
        status: newStatusEl.value,
        title: newTitleEl.value,
        note: "",
      };
      const data = await api("/api/admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMsg(`OK: ${data.code}`);
      newTitleEl.value = "";
      await loadCases();
    } catch (err) {
      setMsg(err.message, true);
    }
  });

  saveBtn?.addEventListener("click", async () => {
    if (!currentCase) return;
    try {
      await api(`/api/admin/cases/${currentCase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatusEl.value,
          title: editTitleEl.value,
          note: editNoteEl.value,
          is_active: editActiveEl.checked ? 1 : 0,
        }),
      });
      setMsg(t("updated"));
      await loadCases();
    } catch (err) {
      setMsg(err.message, true);
    }
  });

  toggleActiveBtn?.addEventListener("click", async () => {
    if (!currentCase) return;
    editActiveEl.checked = !editActiveEl.checked;
    toggleActiveBtn.textContent = editActiveEl.checked
      ? t("deactivate")
      : t("activate");
  });

  deleteCaseBtn?.addEventListener("click", async () => {
    if (!currentCase) return;
    if (!confirm(t("deleteCaseConfirm"))) return;
    try {
      await api(`/api/admin/cases/${currentCase.id}`, { method: "DELETE" });
      setMsg(t("deleted"));
      currentCase = null;
      editor.classList.add("hidden");
      await loadCases();
    } catch (err) {
      setMsg(err.message, true);
    }
  });

  uploadBtn?.addEventListener("click", async () => {
    if (!currentCase) return;
    const files = fileInput.files;
    if (!files || !files.length) {
      setMsg(t("noFile"), true);
      return;
    }
    try {
      const fd = new FormData();
      for (const f of files) fd.append("files", f);

      await api(`/api/admin/cases/${currentCase.id}/files`, {
        method: "POST",
        body: fd,
      });

      fileInput.value = "";
      setMsg(t("uploaded"));
      await loadFiles(currentCase.id);
    } catch (err) {
      setMsg(err.message, true);
    }
  });

  applyI18n();
  loadCases();
})();
