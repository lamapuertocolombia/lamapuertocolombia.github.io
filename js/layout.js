async function loadPartial(url, mountId) {
  const res = await fetch(url, { cache: "no-store" });
  const html = await res.text();
  document.getElementById(mountId).innerHTML = html;
}

function markActiveNavLink() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a").forEach((a) => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
}

function wireFooterLinks() {
  const ig = document.getElementById("footerInstagram");
  const fb = document.getElementById("footerFacebook");
  const mail = document.getElementById("footerEmail");
  const wa = document.getElementById("footerWhatsapp");
  const year = document.getElementById("footerYear");
  if (ig) ig.href = CONFIG.instagram;
  if (fb) fb.href = CONFIG.facebook;
  if (mail) mail.href = `mailto:${CONFIG.email}`;
  if (wa) wa.href = `https://wa.me/${CONFIG.whatsappContacto}`;
  if (year) year.textContent = "2026";
}

function wireMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

async function initLayout() {
  await Promise.all([
    loadPartial("partials/nav.html", "navPlaceholder"),
    loadPartial("partials/footer.html", "footerPlaceholder"),
  ]);
  markActiveNavLink();
  wireFooterLinks();
  wireMobileNav();
  initCartControls();
}

document.addEventListener("DOMContentLoaded", initLayout);
