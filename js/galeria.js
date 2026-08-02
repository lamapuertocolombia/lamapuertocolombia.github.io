async function renderGaleria() {
  const grid = document.getElementById("galeriaGrid");
  try {
    const items = await fetchSheet(CONFIG.sheets.galeria);
    if (items.length === 0) {
      grid.innerHTML = '<p class="state">Aún no hay fotos ni videos.</p>';
      return;
    }

    grid.innerHTML = items
      .map((item) => {
        const esVideo = (item.Tipo || "").toLowerCase() === "video";
        const icono = esVideo ? "🎬" : "📷";
        const media = item.Miniatura
          ? `<img src="${escapeHTML(item.Miniatura)}" alt="${escapeHTML(item.Evento)}">`
          : icono;
        const contenido = item.URL
          ? `<a href="${escapeHTML(item.URL)}" target="_blank" rel="noopener" class="card-media">${media}</a>`
          : `<div class="card-media">${media}</div>`;

        return `
        <div class="card">
          ${contenido}
          <div class="card-body">
            <h3>${escapeHTML(item.Evento || "")}</h3>
            <p class="card-meta">${escapeHTML(item.Fecha || "")} · ${esVideo ? "Video" : "Foto"}</p>
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    grid.innerHTML = '<p class="state">No se pudo cargar la galería.</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderGaleria);
