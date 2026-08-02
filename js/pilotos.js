function estadoBadgeClass(estado) {
  const map = {
    "Full Color": "badge-full-color",
    Prospecto: "badge-prospecto",
    "En Licencia": "badge-en-licencia",
    Retirado: "badge-retirado",
  };
  return map[estado] || "badge-prospecto";
}

let pilotosData = [];

function pilotoInfoHTML(p) {
  const fechaIngresoObj = p.FechaIngreso ? parseFechaLocal(p.FechaIngreso) : null;
  const anioIngreso = fechaIngresoObj ? fechaIngresoObj.getFullYear() : "";
  const tieneApodoDistinto = p.Apodo && p.Apodo.trim() && p.Apodo.trim() !== p.Nombre.trim();
  return `
    ${p.Cargo ? `<p class="cargo-tag">${escapeHTML(p.Cargo)}</p>` : ""}
    <h3>${escapeHTML(p.Apodo || p.Nombre)}</h3>
    ${tieneApodoDistinto ? `<p class="card-meta">${escapeHTML(p.Nombre)}</p>` : ""}
    <p class="card-meta">${escapeHTML(p.Moto || "")}</p>
    ${anioIngreso ? `<p class="card-meta">Miembro desde ${anioIngreso}</p>` : ""}
    <span class="badge ${estadoBadgeClass(p.Estado)}">${escapeHTML(p.Estado || "Prospecto")}</span>`;
}

function pilotoMediaHTML(p) {
  return p.Foto || p.Apodo || p.Nombre
    ? imgWithFallback(p.Foto, `assets/pilotos/${slugify(p.Apodo || p.Nombre)}.jpg`, p.Apodo || p.Nombre, "moto")
    : ICONS.moto;
}

function pilotoCardHTML(p, idx) {
  return `
    <div class="card clicable" data-piloto-idx="${idx}" role="button" tabindex="0">
      <div class="card-media">${pilotoMediaHTML(p)}</div>
      <div class="card-body">${pilotoInfoHTML(p)}</div>
    </div>`;
}

function abrirPilotoModal(idx) {
  const p = pilotosData[idx];
  if (!p) return;
  document.getElementById("pilotModalMedia").innerHTML = pilotoMediaHTML(p);
  document.getElementById("pilotModalInfo").innerHTML = pilotoInfoHTML(p);
  document.getElementById("pilotModalOverlay").classList.add("open");
}

function cerrarPilotoModal() {
  document.getElementById("pilotModalOverlay")?.classList.remove("open");
}

function initPilotoModal() {
  document.getElementById("pilotModalClose")?.addEventListener("click", cerrarPilotoModal);
  document.getElementById("pilotModalOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "pilotModalOverlay") cerrarPilotoModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarPilotoModal();
  });
}

function activarClicsPiloto(contenedor) {
  contenedor.querySelectorAll("[data-piloto-idx]").forEach((el) => {
    const abrir = () => abrirPilotoModal(Number(el.dataset.pilotoIdx));
    el.addEventListener("click", abrir);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrir();
      }
    });
  });
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

    pilotosData = pilotos;
    const junta = pilotos.map((p, idx) => ({ p, idx })).filter(({ p }) => p.Cargo && p.Cargo.trim());
    const resto = pilotos.map((p, idx) => ({ p, idx })).filter(({ p }) => !(p.Cargo && p.Cargo.trim()));

    juntaGrid.innerHTML =
      junta.length > 0
        ? junta.map(({ p, idx }) => pilotoCardHTML(p, idx)).join("")
        : '<p class="state">Aún no se ha asignado la Junta Directiva. Agrégala en la hoja de Pilotos usando la columna Cargo.</p>';

    grid.innerHTML =
      resto.length > 0
        ? resto.map(({ p, idx }) => pilotoCardHTML(p, idx)).join("")
        : '<p class="state">Aún no hay más pilotos registrados.</p>';

    activarClicsPiloto(juntaGrid);
    activarClicsPiloto(grid);
  } catch (err) {
    juntaGrid.innerHTML = '<p class="state">No se pudo cargar la junta directiva.</p>';
    grid.innerHTML = '<p class="state">No se pudo cargar la lista de pilotos.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initPilotoModal();
  renderPilotos();
});
