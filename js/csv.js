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

function mostrarIconoFallback(img, iconKey) {
  img.onerror = null;
  const contenedor = img.closest(".card-media");
  if (contenedor) contenedor.innerHTML = (typeof ICONS !== "undefined" && ICONS[iconKey]) || "";
}

function imgWithFallback(explicitUrl, fallbackPath, alt, iconKey) {
  const src = explicitUrl || fallbackPath;
  return `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" onerror="mostrarIconoFallback(this, '${iconKey}')">`;
}

function parseFechaLocal(fechaStr) {
  if (!fechaStr) return null;

  const iso = fechaStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const us = fechaStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, m, d, y] = us;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  return null;
}

const EXTENSIONES_IMAGEN = ["jpg", "jpeg", "png", "gif", "webp"];

async function fetchArchivosCarpeta(carpeta, extensiones) {
  const { githubOwner, githubRepo } = CONFIG;
  if (!githubOwner || !githubRepo || !carpeta) return [];

  const url = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${carpeta}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return [];

  const archivos = await response.json();
  if (!Array.isArray(archivos)) return [];

  return archivos
    .filter((a) => a.type === "file")
    .filter((a) => extensiones.includes((a.name.split(".").pop() || "").toLowerCase()))
    .sort((a, b) => b.name.localeCompare(a.name));
}

function buscarArchivoPorNombre(archivos, nombreBase) {
  const objetivo = slugify(nombreBase);
  if (!objetivo) return null;
  return archivos.find((a) => slugify(a.name.replace(/\.[^.]+$/, "")) === objetivo) || null;
}

function formatRangoFecha(fechaObj, fechaFinObj) {
  const mesAbrev = (d) => d.toLocaleDateString("es-CO", { month: "short" });
  if (!fechaFinObj || fechaFinObj.getTime() === fechaObj.getTime()) {
    return { dia: String(fechaObj.getDate()), sub: mesAbrev(fechaObj) };
  }
  if (fechaObj.getMonth() === fechaFinObj.getMonth() && fechaObj.getFullYear() === fechaFinObj.getFullYear()) {
    return { dia: `${fechaObj.getDate()}-${fechaFinObj.getDate()}`, sub: mesAbrev(fechaObj) };
  }
  return { dia: `${fechaObj.getDate()} ${mesAbrev(fechaObj)}`, sub: `${fechaFinObj.getDate()} ${mesAbrev(fechaFinObj)}` };
}

async function fetchSheet(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
  const text = await response.text();
  return parseCSV(text);
}
