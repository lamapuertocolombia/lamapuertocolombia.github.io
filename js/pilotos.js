function estadoBadgeClass(estado) {
  const map = {
    "Full Color": "badge-full-color",
    Prospecto: "badge-prospecto",
    "En Licencia": "badge-en-licencia",
    Retirado: "badge-retirado",
  };
  return map[estado] || "badge-prospecto";
}

function pilotoCardHTML(p) {
  const anioIngreso = p.FechaIngreso ? p.FechaIngreso.split("-")[0] : "";
  return `
    <div class="card">
      <div class="card-media">${
        p.Foto || p.Apodo || p.Nombre
          ? imgWithFallback(p.Foto, `assets/pilotos/${slugify(p.Apodo || p.Nombre)}.jpg`, p.Apodo || p.Nombre, "moto")
          : ICONS.moto
      }</div>
      <div class="card-body">
        ${p.Cargo ? `<p class="cargo-tag">${escapeHTML(p.Cargo)}</p>` : ""}
        <h3>${escapeHTML(p.Apodo || p.Nombre)}</h3>
        <p class="card-meta">${escapeHTML(p.Nombre)}</p>
        <p class="card-meta">${escapeHTML(p.Moto || "")}</p>
        ${anioIngreso ? `<p class="card-meta">Miembro desde ${escapeHTML(anioIngreso)}</p>` : ""}
        <span class="badge ${estadoBadgeClass(p.Estado)}">${escapeHTML(p.Estado || "Prospecto")}</span>
      </div>
    </div>`;
}

async function renderPilotos() {
  const juntaGrid = document.getElementById("juntaGrid");
  const grid = document.getElementById("pilotosGrid");
  try {
    const pilotos = await fetchSheet(CONFIG.sheets.pilotos);
    if (pilotos.length === 0) {
      juntaGrid.innerHTML = '<p class="state">Aún no hay pilotos registrados.</p>';
      grid.innerHTML = "";
      return;
    }

    const junta = pilotos.filter((p) => p.Cargo && p.Cargo.trim());
    const resto = pilotos.filter((p) => !(p.Cargo && p.Cargo.trim()));

    juntaGrid.innerHTML =
      junta.length > 0
        ? junta.map(pilotoCardHTML).join("")
        : '<p class="state">Aún no se ha asignado la Junta Directiva. Agrégala en la hoja de Pilotos usando la columna Cargo.</p>';

    grid.innerHTML =
      resto.length > 0 ? resto.map(pilotoCardHTML).join("") : '<p class="state">Aún no hay más pilotos registrados.</p>';
  } catch (err) {
    juntaGrid.innerHTML = '<p class="state">No se pudo cargar la junta directiva.</p>';
    grid.innerHTML = '<p class="state">No se pudo cargar la lista de pilotos.</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderPilotos);
