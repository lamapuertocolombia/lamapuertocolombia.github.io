function formatFechaLarga(fechaStr) {
  return parseFechaLocal(fechaStr).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

async function renderProximaActividad() {
  const el = document.getElementById("proximaActividad");
  try {
    const actividades = await fetchSheet(CONFIG.sheets.actividades);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const proximas = actividades
      .map((a) => ({
        ...a,
        fechaObj: parseFechaLocal(a.Fecha),
        fechaFinObj: a.FechaFin ? parseFechaLocal(a.FechaFin) : null,
      }))
      .filter((a) => a.fechaObj && (a.fechaFinObj || a.fechaObj) >= hoy)
      .sort((a, b) => a.fechaObj - b.fechaObj);

    if (proximas.length === 0) {
      el.textContent = "No hay actividades próximas por ahora.";
      el.classList.add("state");
      return;
    }

    const a = proximas[0];
    const { dia, sub } = formatRangoFecha(a.fechaObj, a.fechaFinObj);
    const rangoTexto = a.fechaFinObj
      ? `${formatFechaLarga(a.Fecha)} al ${formatFechaLarga(a.FechaFin)}`
      : formatFechaLarga(a.Fecha);
    el.classList.remove("state");
    el.innerHTML = `
      <div class="activity-date">${dia}<span>${sub}</span></div>
      <div>
        <h3 style="margin:0 0 4px">${escapeHTML(a.Nombre)}</h3>
        <p class="card-meta" style="margin:0 0 6px">${rangoTexto} · ${escapeHTML(a.Lugar || "")}</p>
        <p style="margin:0">${escapeHTML(a.Descripcion || "")}</p>
      </div>
    `;
  } catch (err) {
    el.textContent = "No se pudo cargar la próxima actividad.";
  }
}

document.addEventListener("DOMContentLoaded", renderProximaActividad);
