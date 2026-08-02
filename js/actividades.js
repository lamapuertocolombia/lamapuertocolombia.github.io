const NOMBRES_MES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

let actividadesConFecha = [];
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();

function agruparPorDia(actividades) {
  const mapa = new Map();
  actividades.forEach((a) => {
    const fin = a.fechaFinObj || a.fechaObj;
    const cursor = new Date(a.fechaObj);
    while (cursor <= fin) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
      if (!mapa.has(key)) mapa.set(key, []);
      mapa.get(key).push(a);
      cursor.setDate(cursor.getDate() + 1);
    }
  });
  return mapa;
}


function renderCalendario() {
  const cont = document.getElementById("actividadesCalendario");
  const porDia = agruparPorDia(actividadesConFecha);
  const primerDiaMes = new Date(anioActual, mesActual, 1);
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const inicioSemana = primerDiaMes.getDay();
  const hoy = new Date();

  let celdas = "";
  for (let i = 0; i < inicioSemana; i++) {
    celdas += `<div class="calendario-dia vacio"></div>`;
  }
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const eventos = porDia.get(`${anioActual}-${mesActual}-${dia}`) || [];
    const esHoy = hoy.getFullYear() === anioActual && hoy.getMonth() === mesActual && hoy.getDate() === dia;
    celdas += `
      <div class="calendario-dia${esHoy ? " hoy" : ""}">
        <strong>${dia}</strong>
        ${eventos
          .map(
            (e) =>
              `<a class="calendario-evento" href="${e.LinkRegistro ? escapeHTML(e.LinkRegistro) : "#"}" title="${escapeHTML(e.Nombre)}">${escapeHTML(e.Nombre)}</a>`
          )
          .join("")}
      </div>`;
  }

  cont.innerHTML = `
    <div class="calendario">
      <div class="calendario-header">
        <button id="mesAnterior" type="button" aria-label="Mes anterior">‹</button>
        <h3>${NOMBRES_MES[mesActual]} ${anioActual}</h3>
        <button id="mesSiguiente" type="button" aria-label="Mes siguiente">›</button>
      </div>
      <div class="calendario-grid">
        ${DIAS_SEMANA.map((d) => `<div class="calendario-dia-nombre">${d}</div>`).join("")}
        ${celdas}
      </div>
    </div>`;

  document.getElementById("mesAnterior").addEventListener("click", () => {
    mesActual--;
    if (mesActual < 0) {
      mesActual = 11;
      anioActual--;
    }
    renderCalendario();
  });
  document.getElementById("mesSiguiente").addEventListener("click", () => {
    mesActual++;
    if (mesActual > 11) {
      mesActual = 0;
      anioActual++;
    }
    renderCalendario();
  });
}

function mostrarVista(vista) {
  const lista = document.getElementById("actividadesList");
  const calendario = document.getElementById("actividadesCalendario");
  const btnLista = document.getElementById("btnVistaLista");
  const btnCalendario = document.getElementById("btnVistaCalendario");

  if (vista === "calendario") {
    lista.style.display = "none";
    calendario.style.display = "block";
    btnLista.classList.remove("active");
    btnCalendario.classList.add("active");
    renderCalendario();
  } else {
    lista.style.display = "block";
    calendario.style.display = "none";
    btnCalendario.classList.remove("active");
    btnLista.classList.add("active");
  }
}

function filaActividadHTML(a) {
  const { dia, sub } = formatRangoFecha(a.fechaObj, a.fechaFinObj);
  return `
    <div class="activity-row">
      <div class="activity-date">${dia}<span>${sub}</span></div>
      <div>
        <h3 style="margin:0 0 4px">${escapeHTML(a.Nombre)}</h3>
        <p class="card-meta" style="margin:0 0 6px">${escapeHTML(a.Lugar || "")}</p>
        <p style="margin:0 0 10px">${escapeHTML(a.Descripcion || "")}</p>
        ${a.LinkRegistro ? `<a class="btn btn-outline" href="${escapeHTML(a.LinkRegistro)}" target="_blank" rel="noopener">Registrarme</a>` : ""}
      </div>
    </div>`;
}

function filaSinFechaHTML(a) {
  return `
    <div class="activity-row">
      <div class="activity-date">?<span>Fecha</span></div>
      <div>
        <h3 style="margin:0 0 4px">${escapeHTML(a.Nombre)}</h3>
        <p class="card-meta" style="margin:0 0 6px">${escapeHTML(a.Fecha || "Fecha por confirmar")} · ${escapeHTML(a.Lugar || "")}</p>
        <p style="margin:0 0 10px">${escapeHTML(a.Descripcion || "")}</p>
        ${a.LinkRegistro ? `<a class="btn btn-outline" href="${escapeHTML(a.LinkRegistro)}" target="_blank" rel="noopener">Registrarme</a>` : ""}
      </div>
    </div>`;
}

async function renderActividades() {
  const list = document.getElementById("actividadesList");
  try {
    const actividades = await fetchSheet(CONFIG.sheets.actividades);
    if (actividades.length === 0) {
      list.innerHTML = '<p class="state">No hay actividades programadas.</p>';
      return;
    }

    const conFechaObj = actividades.map((a) => ({
      ...a,
      fechaObj: parseFechaLocal(a.Fecha),
      fechaFinObj: a.FechaFin ? parseFechaLocal(a.FechaFin) : null,
    }));
    const conFecha = conFechaObj.filter((a) => a.fechaObj).sort((a, b) => a.fechaObj - b.fechaObj);
    const sinFecha = conFechaObj.filter((a) => !a.fechaObj);

    actividadesConFecha = conFecha;

    list.innerHTML = conFecha.map(filaActividadHTML).join("") + sinFecha.map(filaSinFechaHTML).join("");

    document.getElementById("btnVistaLista").addEventListener("click", () => mostrarVista("lista"));
    document.getElementById("btnVistaCalendario").addEventListener("click", () => mostrarVista("calendario"));
  } catch (err) {
    list.innerHTML = '<p class="state">No se pudo cargar la lista de actividades.</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderActividades);
