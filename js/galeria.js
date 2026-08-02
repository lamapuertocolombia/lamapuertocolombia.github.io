function nombreBonito(archivo) {
  const sinExtension = archivo.replace(/\.[^.]+$/, "");
  return sinExtension
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

async function fetchFotosCarpeta() {
  const archivos = await fetchArchivosCarpeta(CONFIG.galeriaCarpeta, EXTENSIONES_IMAGEN);
  return archivos.map((a) => ({
    Evento: nombreBonito(a.name),
    Fecha: "",
    Tipo: "foto",
    URL: a.download_url,
    Miniatura: a.download_url,
    origen: "carpeta",
  }));
}

function abrirLightbox(url) {
  const overlay = document.getElementById("lightboxOverlay");
  const img = document.getElementById("lightboxImg");
  if (!overlay || !img) return;
  img.src = url;
  overlay.classList.add("open");
}

function cerrarLightbox() {
  const overlay = document.getElementById("lightboxOverlay");
  const img = document.getElementById("lightboxImg");
  overlay?.classList.remove("open");
  if (img) img.src = "";
}

function initLightbox() {
  document.getElementById("lightboxClose")?.addEventListener("click", cerrarLightbox);
  document.getElementById("lightboxOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "lightboxOverlay") cerrarLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarLightbox();
  });
}

async function renderGaleria() {
  const grid = document.getElementById("galeriaGrid");
  try {
    const [itemsHoja, fotosCarpeta] = await Promise.all([
      fetchSheet(CONFIG.sheets.galeria).catch(() => []),
      fetchFotosCarpeta().catch(() => []),
    ]);

    const items = [...fotosCarpeta, ...itemsHoja];

    if (items.length === 0) {
      grid.innerHTML = '<p class="state">Aún no hay fotos ni videos.</p>';
      return;
    }

    grid.innerHTML = items
      .map((item) => {
        const esVideo = (item.Tipo || "").toLowerCase() === "video";
        const icono = esVideo ? ICONS.video : ICONS.camara;
        const media = item.Miniatura
          ? `<img src="${escapeHTML(item.Miniatura)}" alt="${escapeHTML(item.Evento)}">`
          : icono;

        let contenido;
        if (esVideo) {
          contenido = item.URL
            ? `<a href="${escapeHTML(item.URL)}" target="_blank" rel="noopener" class="card-media">${media}</a>`
            : `<div class="card-media">${media}</div>`;
        } else if (item.URL || item.Miniatura) {
          contenido = `<div class="card-media clicable" role="button" tabindex="0" data-lightbox-url="${escapeHTML(item.URL || item.Miniatura)}">${media}</div>`;
        } else {
          contenido = `<div class="card-media">${media}</div>`;
        }

        const mostrarTitulo = item.origen !== "carpeta";

        return `
        <div class="card">
          ${contenido}
          ${
            mostrarTitulo
              ? `<div class="card-body">
                  <h3>${escapeHTML(item.Evento || "")}</h3>
                  <p class="card-meta">${escapeHTML(item.Fecha || "")} · ${esVideo ? "Video" : "Foto"}</p>
                </div>`
              : ""
          }
        </div>`;
      })
      .join("");

    grid.querySelectorAll("[data-lightbox-url]").forEach((el) => {
      const abrir = () => abrirLightbox(el.dataset.lightboxUrl);
      el.addEventListener("click", abrir);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir();
        }
      });
    });
  } catch (err) {
    grid.innerHTML = '<p class="state">No se pudo cargar la galería.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLightbox();
  renderGaleria();
});
