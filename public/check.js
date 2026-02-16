async function runCheck() {
  const codeInput = document.getElementById("code");
  const resultBox = document.getElementById("out");

  const code = (codeInput.value || "").trim().toUpperCase();
  if (!code) return;

  resultBox.style.display = "none";
  resultBox.innerHTML = "";

  try {
    const res = await fetch(`/api/check?code=${encodeURIComponent(code)}`);
    const data = await res.json();

    if (!data.ok) {
      resultBox.style.display = "block";
      resultBox.innerHTML = `<div style="color:#b00020">Reference code not found.</div>`;
      return;
    }

    resultBox.style.display = "block";
    resultBox.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px;">
        Status: ${data.status}
      </div>
      <div>${data.title || ""}</div>
      <div style="margin-top:6px;">${data.note || ""}</div>
    `;

  } catch (err) {
    resultBox.style.display = "block";
    resultBox.innerHTML = `<div style="color:#b00020">Server error.</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnCheck").addEventListener("click", runCheck);

  document.getElementById("code").addEventListener("keydown", (e) => {
    if (e.key === "Enter") runCheck();
  });
});
