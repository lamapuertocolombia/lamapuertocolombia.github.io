function parseOpciones(raw, precioBase) {
  return (raw || "")
    .split("|")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const [label, precio, stock] = token.split(":").map((s) => (s !== undefined ? s.trim() : s));
      return {
        label,
        precio: precio ? Number(precio) : precioBase,
        stock: stock !== undefined && stock !== "" ? Number(stock) : null,
      };
    });
}

function stockBadgeHTML(stock) {
  if (stock === null || stock === undefined || Number.isNaN(stock)) return "";
  if (stock <= 0) return `<p class="stock-badge stock-agotado">Agotado</p>`;
  if (stock <= CONFIG.stockBajoUmbral) return `<p class="stock-badge stock-bajo">¡Últimas unidades! (${stock} disponibles)</p>`;
  return `<p class="stock-badge" style="visibility:hidden">.</p>`;
}

let productosData = [];
let fotosProductos = [];
let fotosModalActual = [];
let indiceModalActual = 0;

function productoMediaHTML(p, idx) {
  const fotos = fotosProductos[idx] || [];
  const fotoUrl = fotos[0] || "";
  return fotoUrl ? imgWithFallback(fotoUrl, "", p.Nombre, "tienda") : ICONS.tienda;
}

function renderModalMedia(fotos) {
  fotosModalActual = fotos;
  indiceModalActual = 0;
  const media = document.getElementById("productModalMedia");
  if (fotos.length === 0) {
    media.innerHTML = ICONS.tienda;
    return;
  }
  media.innerHTML = `
    <img id="modalMediaImg" src="${escapeHTML(fotos[0])}" alt="">
    ${
      fotos.length > 1
        ? `<button class="modal-media-nav modal-media-prev" id="modalMediaPrev" aria-label="Foto anterior">‹</button>
           <button class="modal-media-nav modal-media-next" id="modalMediaNext" aria-label="Foto siguiente">›</button>
           <div class="modal-media-dots">${fotos.map((_, i) => `<span class="modal-dot${i === 0 ? " active" : ""}" data-dot-idx="${i}"></span>`).join("")}</div>`
        : ""
    }
  `;
  if (fotos.length > 1) {
    document.getElementById("modalMediaPrev").addEventListener("click", () => cambiarFotoModal(-1));
    document.getElementById("modalMediaNext").addEventListener("click", () => cambiarFotoModal(1));
    media.querySelectorAll(".modal-dot").forEach((dot) => {
      dot.addEventListener("click", () => irAFotoModal(Number(dot.dataset.dotIdx)));
    });
  }
}

function irAFotoModal(idx) {
  indiceModalActual = (idx + fotosModalActual.length) % fotosModalActual.length;
  const img = document.getElementById("modalMediaImg");
  if (img) img.src = fotosModalActual[indiceModalActual];
  document.querySelectorAll(".modal-dot").forEach((dot, i) => dot.classList.toggle("active", i === indiceModalActual));
}

function cambiarFotoModal(delta) {
  irAFotoModal(indiceModalActual + delta);
}

function controlesCompraHTML(p, uid) {
  const precioBase = Number(p.Precio) || 0;
  const opciones = parseOpciones(p.Opciones, precioBase);
  const stockSimple = p.Stock !== undefined && p.Stock !== "" ? Number(p.Stock) : null;
  const precioInicial = opciones.length > 0 ? opciones[0].precio : precioBase;
  const stockInicial = opciones.length > 0 ? opciones[0].stock : stockSimple;

  return `
    <p class="price" id="${uid}-precio">${formatCOP(precioInicial)}</p>
    <div id="${uid}-stock">${stockBadgeHTML(stockInicial)}</div>
    ${
      opciones.length > 0
        ? `<select class="product-select" id="${uid}-opcion">
            ${opciones
              .map(
                (o) =>
                  `<option value="${escapeHTML(o.label)}" data-precio="${o.precio}" data-stock="${o.stock ?? ""}">${escapeHTML(o.label)}${o.stock === 0 ? " (Agotado)" : ""}</option>`
              )
              .join("")}
          </select>`
        : ""
    }
    <div class="product-actions">
      <input type="number" min="1" value="1" id="${uid}-cantidad" />
      <button class="btn btn-primary" data-uid="${uid}" data-sku="${escapeHTML(p.SKU || "")}" data-nombre="${escapeHTML(p.Nombre)}" data-precio="${precioBase}" ${stockInicial === 0 ? "disabled" : ""}>
        Agregar al carrito
      </button>
    </div>`;
}

function productoInfoHTML(p, uid) {
  return `
    ${p.SKU ? `<p class="sku-tag">SKU: ${escapeHTML(p.SKU)}</p>` : ""}
    <h3>${escapeHTML(p.Nombre)}</h3>
    <p class="card-meta">${escapeHTML(p.Descripcion || "")}</p>
    ${controlesCompraHTML(p, uid)}`;
}

function wireControlesCompra(root) {
  root.querySelectorAll("select.product-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const uid = e.target.id.replace(/-opcion$/, "");
      const selectedOption = e.target.selectedOptions[0];
      const precioEl = document.getElementById(`${uid}-precio`);
      const stockEl = document.getElementById(`${uid}-stock`);
      const btn = root.querySelector(`button[data-uid="${uid}"]`);
      if (!selectedOption) return;
      if (precioEl) precioEl.textContent = formatCOP(Number(selectedOption.dataset.precio));
      const stockValue = selectedOption.dataset.stock === "" ? null : Number(selectedOption.dataset.stock);
      if (stockEl) stockEl.innerHTML = stockBadgeHTML(stockValue);
      if (btn) btn.disabled = stockValue === 0;
    });
  });

  root.querySelectorAll("button[data-uid]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const uid = btn.dataset.uid;
      const opcionEl = document.getElementById(`${uid}-opcion`);
      const cantidadEl = document.getElementById(`${uid}-cantidad`);
      const selectedOption = opcionEl ? opcionEl.selectedOptions[0] : null;
      const precio = selectedOption ? Number(selectedOption.dataset.precio) : Number(btn.dataset.precio);
      addToCart({
        sku: btn.dataset.sku,
        nombre: btn.dataset.nombre,
        precio,
        opcion: opcionEl ? opcionEl.value : "",
        cantidad: Math.max(1, Number(cantidadEl.value) || 1),
      });
      if (uid === "modal") cerrarProductoModal();
    });
  });
}

function abrirProductoModal(idx) {
  const p = productosData[idx];
  if (!p) return;
  renderModalMedia(fotosProductos[idx] || []);
  const info = document.getElementById("productModalInfo");
  info.innerHTML = productoInfoHTML(p, "modal");
  wireControlesCompra(info);
  document.getElementById("productModalOverlay").classList.add("open");
}

function cerrarProductoModal() {
  document.getElementById("productModalOverlay")?.classList.remove("open");
}

function initProductoModal() {
  document.getElementById("productModalClose")?.addEventListener("click", cerrarProductoModal);
  document.getElementById("productModalOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "productModalOverlay") cerrarProductoModal();
  });
  document.addEventListener("keydown", (e) => {
    const overlay = document.getElementById("productModalOverlay");
    if (!overlay || !overlay.classList.contains("open")) return;
    if (e.key === "Escape") cerrarProductoModal();
    if (e.key === "ArrowLeft") cambiarFotoModal(-1);
    if (e.key === "ArrowRight") cambiarFotoModal(1);
  });
}

async function renderTienda() {
  const grid = document.getElementById("tiendaGrid");
  try {
    const [productos, archivosTienda] = await Promise.all([
      fetchSheet(CONFIG.sheets.tienda),
      fetchArchivosCarpeta(CONFIG.tiendaCarpeta, EXTENSIONES_IMAGEN).catch(() => []),
    ]);

    if (productos.length === 0) {
      grid.innerHTML = '<p class="state">Aún no hay productos en la tienda.</p>';
      return;
    }

    productosData = productos;
    fotosProductos = productos.map((p) =>
      p.Imagen ? [p.Imagen] : buscarArchivosPorNombre(archivosTienda, p.SKU).map((a) => a.download_url)
    );

    grid.innerHTML = productos
      .map(
        (p, idx) => `
        <div class="card">
          <div class="card-media clicable" role="button" tabindex="0" data-producto-idx="${idx}">${productoMediaHTML(p, idx)}</div>
          <div class="card-body">${productoInfoHTML(p, `card${idx}`)}</div>
        </div>`
      )
      .join("");

    wireControlesCompra(grid);

    grid.querySelectorAll("[data-producto-idx]").forEach((el) => {
      const abrir = () => abrirProductoModal(Number(el.dataset.productoIdx));
      el.addEventListener("click", abrir);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir();
        }
      });
    });
  } catch (err) {
    grid.innerHTML = '<p class="state">No se pudo cargar la tienda.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initProductoModal();
  renderTienda();
});
