function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (nonEmptyRows.length === 0) return [];

  const headers = nonEmptyRows[0].map((h) => h.trim());
  return nonEmptyRows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/["']/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function imgWithFallback(explicitUrl, fallbackPath, alt, fallbackIcon) {
  const src = explicitUrl || fallbackPath;
  return `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" onerror="this.onerror=null; this.closest('.card-media').innerHTML='${fallbackIcon}';">`;
}

function parseFechaLocal(fechaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

async function fetchSheet(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
  const text = await response.text();
  return parseCSV(text);
}
