async function renderFundadores() {
  const grid = document.getElementById("fundadoresGrid");
  try {
    const fundadores = await fetchSheet(CONFIG.sheets.fundadores);
    if (fundadores.length === 0) {
      grid.innerHTML =
        '<p class="state">Aún no se han añadido los miembros fundadores. Agrégalos en la hoja de Google Sheets de Fundadores para rendirles homenaje aquí.</p>';
      return;
    }

    grid.innerHTML = fundadores
      .map(
        (f) => `
        <div class="card">
          <div class="card-media">${f.Foto ? `<img src="${escapeHTML(f.Foto)}" alt="${escapeHTML(f.Nombre)}">` : "🎖️"}</div>
          <div class="card-body">
            <h3>${escapeHTML(f.Apodo || f.Nombre)}</h3>
            <p class="card-meta">${escapeHTML(f.Nombre)}</p>
            ${f.Rol ? `<p class="card-meta">${escapeHTML(f.Rol)}</p>` : ""}
            ${f.Mensaje ? `<p style="margin-top:8px">${escapeHTML(f.Mensaje)}</p>` : ""}
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    grid.innerHTML = '<p class="state">No se pudo cargar la lista de fundadores.</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderFundadores);
