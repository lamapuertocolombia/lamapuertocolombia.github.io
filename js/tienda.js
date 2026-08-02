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

async function renderTienda() {
  const grid = document.getElementById("tiendaGrid");
  try {
    const productos = await fetchSheet(CONFIG.sheets.tienda);
    if (productos.length === 0) {
      grid.innerHTML = '<p class="state">Aún no hay productos en la tienda.</p>';
      return;
    }

    grid.innerHTML = productos
      .map((p, idx) => {
        const precioBase = Number(p.Precio) || 0;
        const opciones = parseOpciones(p.Opciones, precioBase);
        const stockSimple = p.Stock !== undefined && p.Stock !== "" ? Number(p.Stock) : null;
        const precioInicial = opciones.length > 0 ? opciones[0].precio : precioBase;
        const stockInicial = opciones.length > 0 ? opciones[0].stock : stockSimple;
        return `
        <div class="card">
          <div class="card-media">${p.Imagen ? `<img src="${escapeHTML(p.Imagen)}" alt="${escapeHTML(p.Nombre)}">` : "🛍️"}</div>
          <div class="card-body">
            ${p.SKU ? `<p class="sku-tag">SKU: ${escapeHTML(p.SKU)}</p>` : ""}
            <h3>${escapeHTML(p.Nombre)}</h3>
            <p class="card-meta">${escapeHTML(p.Descripcion || "")}</p>
            <p class="price" id="precio-${idx}">${formatCOP(precioInicial)}</p>
            <div id="stock-${idx}">${stockBadgeHTML(stockInicial)}</div>
            ${
              opciones.length > 0
                ? `<select class="product-select" id="opcion-${idx}">
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
              <input type="number" min="1" value="1" id="cantidad-${idx}" />
              <button class="btn btn-primary" data-idx="${idx}" data-sku="${escapeHTML(p.SKU || "")}" data-nombre="${escapeHTML(p.Nombre)}" data-precio="${precioBase}" ${stockInicial === 0 ? "disabled" : ""}>
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>`;
      })
      .join("");

    grid.querySelectorAll("select[id^='opcion-']").forEach((select) => {
      select.addEventListener("change", (e) => {
        const idx = e.target.id.replace("opcion-", "");
        const selectedOption = e.target.selectedOptions[0];
        const precioEl = document.getElementById(`precio-${idx}`);
        const stockEl = document.getElementById(`stock-${idx}`);
        const btn = grid.querySelector(`button[data-idx="${idx}"]`);
        if (!selectedOption) return;
        if (precioEl) precioEl.textContent = formatCOP(Number(selectedOption.dataset.precio));
        const stockValue = selectedOption.dataset.stock === "" ? null : Number(selectedOption.dataset.stock);
        if (stockEl) stockEl.innerHTML = stockBadgeHTML(stockValue);
        if (btn) btn.disabled = stockValue === 0;
      });
    });

    grid.querySelectorAll("button[data-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.idx;
        const opcionEl = document.getElementById(`opcion-${idx}`);
        const cantidadEl = document.getElementById(`cantidad-${idx}`);
        const selectedOption = opcionEl ? opcionEl.selectedOptions[0] : null;
        const precio = selectedOption ? Number(selectedOption.dataset.precio) : Number(btn.dataset.precio);
        addToCart({
          sku: btn.dataset.sku,
          nombre: btn.dataset.nombre,
          precio,
          opcion: opcionEl ? opcionEl.value : "",
          cantidad: Math.max(1, Number(cantidadEl.value) || 1),
        });
      });
    });
  } catch (err) {
    grid.innerHTML = '<p class="state">No se pudo cargar la tienda.</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderTienda);
