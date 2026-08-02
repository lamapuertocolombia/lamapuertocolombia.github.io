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

let fotosLightbox = [];
let indiceLightbox = 0;

function mostrarFotoLightbox(idx) {
  const img = document.getElementById("lightboxImg");
  if (!img || fotosLightbox.length === 0) return;
  indiceLightbox = (idx + fotosLightbox.length) % fotosLightbox.length;
  img.src = fotosLightbox[indiceLightbox];
}

function abrirLightbox(idx) {
  const overlay = document.getElementById("lightboxOverlay");
  if (!overlay) return;
  mostrarFotoLightbox(idx);
  overlay.classList.add("open");
  const mostrarFlechas = fotosLightbox.length > 1 ? "flex" : "none";
  document.getElementById("lightboxPrev").style.display = mostrarFlechas;
  document.getElementById("lightboxNext").style.display = mostrarFlechas;
}

function cerrarLightbox() {
  const overlay = document.getElementById("lightboxOverlay");
  const img = document.getElementById("lightboxImg");
  overlay?.classList.remove("open");
  if (img) img.src = "";
}

function initLightbox() {
  document.getElementById("lightboxClose")?.addEventListener("click", cerrarLightbox);
  document.getElementById("lightboxPrev")?.addEventListener("click", () => mostrarFotoLightbox(indiceLightbox - 1));
  document.getElementById("lightboxNext")?.addEventListener("click", () => mostrarFotoLightbox(indiceLightbox + 1));
  document.getElementById("lightboxOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "lightboxOverlay") cerrarLightbox();
  });
  document.addEventListener("keydown", (e) => {
    const overlay = document.getElementById("lightboxOverlay");
    if (!overlay || !overlay.classList.contains("open")) return;
    if (e.key === "Escape") cerrarLightbox();
    if (e.key === "ArrowLeft") mostrarFotoLightbox(indiceLightbox - 1);
    if (e.key === "ArrowRight") mostrarFotoLightbox(indiceLightbox + 1);
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

    fotosLightbox = items.filter((item) => (item.Tipo || "").toLowerCase() !== "video").map((item) => item.URL || item.Miniatura);
    let contadorFotos = 0;

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
          const idxFoto = contadorFotos++;
          contenido = `<div class="card-media clicable" role="button" tabindex="0" data-lightbox-idx="${idxFoto}">${media}</div>`;
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

    grid.querySelectorAll("[data-lightbox-idx]").forEach((el) => {
      const abrir = () => abrirLightbox(Number(el.dataset.lightboxIdx));
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
