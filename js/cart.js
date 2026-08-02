const CART_KEY = "lama_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartUI();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((i) => (i.sku || i.nombre) === (item.sku || item.nombre) && i.opcion === item.opcion);
  if (existing) {
    existing.cantidad += item.cantidad;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  openCartDrawer();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateCartQty(index, cantidad) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].cantidad = Math.max(1, cantidad);
  saveCart(cart);
}

function cartTotal() {
  return getCart().reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function formatCOP(value) {
  return "$" + Math.round(value).toLocaleString("es-CO");
}

function renderCartUI() {
  const cart = getCart();
  const countEl = document.getElementById("cartCount");
  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!countEl || !itemsEl || !totalEl) return;

  const totalItems = cart.reduce((sum, i) => sum + i.cantidad, 0);
  countEl.textContent = totalItems;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
  } else {
    itemsEl.innerHTML = cart
      .map(
        (item, idx) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${escapeHTML(item.nombre)}</strong>
          ${item.sku ? `<span class="cart-item-sku">SKU: ${escapeHTML(item.sku)}</span>` : ""}
          ${item.opcion ? `<span class="cart-item-opcion">${escapeHTML(item.opcion)}</span>` : ""}
          <span class="cart-item-price">${formatCOP(item.precio)}</span>
        </div>
        <div class="cart-item-controls">
          <input type="number" min="1" value="${item.cantidad}" data-idx="${idx}" class="cart-qty" />
          <button class="cart-remove" data-idx="${idx}" aria-label="Quitar">🗑</button>
        </div>
      </div>`
      )
      .join("");

    itemsEl.querySelectorAll(".cart-qty").forEach((input) => {
      input.addEventListener("change", (e) => {
        updateCartQty(Number(e.target.dataset.idx), Number(e.target.value));
      });
    });
    itemsEl.querySelectorAll(".cart-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        removeFromCart(Number(e.currentTarget.dataset.idx));
      });
    });
  }

  totalEl.textContent = formatCOP(cartTotal());
}

function openCartDrawer() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
}

function closeCartDrawer() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
}

function checkoutViaWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) return;

  const lineas = cart.map(
    (item) =>
      `• ${item.cantidad}x ${item.nombre}${item.opcion ? " (" + item.opcion + ")" : ""}${item.sku ? " [" + item.sku + "]" : ""} — ${formatCOP(item.precio * item.cantidad)}`
  );
  const mensaje = [
    `Hola, quiero hacer este pedido a LAMA Puerto Colombia:`,
    ...lineas,
    ``,
    `Total: ${formatCOP(cartTotal())}`,
  ].join("\n");

  const url = `https://wa.me/${CONFIG.whatsappTienda}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

function initCartControls() {
  document.getElementById("cartButton")?.addEventListener("click", openCartDrawer);
  document.getElementById("cartClose")?.addEventListener("click", closeCartDrawer);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCartDrawer);
  document.getElementById("cartCheckout")?.addEventListener("click", checkoutViaWhatsApp);
  renderCartUI();
}
