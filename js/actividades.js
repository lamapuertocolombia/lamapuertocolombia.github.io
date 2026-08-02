async function renderActividades() {
  const list = document.getElementById("actividadesList");
  try {
    const actividades = await fetchSheet(CONFIG.sheets.actividades);
    if (actividades.length === 0) {
      list.innerHTML = '<p class="state">No hay actividades programadas.</p>';
      return;
    }

    const ordenadas = actividades
      .filter((a) => a.Fecha)
      .map((a) => ({ ...a, fechaObj: parseFechaLocal(a.Fecha) }))
      .sort((a, b) => a.fechaObj - b.fechaObj);

    list.innerHTML = ordenadas
      .map((a) => {
        const dia = a.fechaObj.getDate();
        const mes = a.fechaObj.toLocaleDateString("es-CO", { month: "short" });
        return `
        <div class="activity-row">
          <div class="activity-date">${dia}<span>${mes}</span></div>
          <div>
            <h3 style="margin:0 0 4px">${escapeHTML(a.Nombre)}</h3>
            <p class="card-meta" style="margin:0 0 6px">${escapeHTML(a.Lugar || "")}</p>
            <p style="margin:0 0 10px">${escapeHTML(a.Descripcion || "")}</p>
            ${a.LinkRegistro ? `<a class="btn btn-outline" href="${escapeHTML(a.LinkRegistro)}" target="_blank" rel="noopener">Registrarme</a>` : ""}
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    list.innerHTML = '<p class="state">No se pudo cargar la lista de actividades.</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderActividades);
