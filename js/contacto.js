function initContacto() {
  const wa = document.getElementById("contactoWhatsapp");
  const email = document.getElementById("contactoEmail");
  const ig = document.getElementById("contactoInstagram");
  const fb = document.getElementById("contactoFacebook");
  const prospecto = document.getElementById("contactoProspecto");
  const ubicacion = document.getElementById("contactoUbicacion");
  const mapa = document.getElementById("contactoMapa");

  if (wa) wa.href = `https://wa.me/${CONFIG.whatsappContacto}`;
  if (email) {
    email.href = `mailto:${CONFIG.email}`;
    email.textContent = CONFIG.email;
  }
  if (ig) ig.href = CONFIG.instagram;
  if (fb) fb.href = CONFIG.facebook;
  if (prospecto) prospecto.href = CONFIG.formularioProspecto;
  if (ubicacion) ubicacion.textContent = CONFIG.ubicacion;
  if (mapa) mapa.src = CONFIG.mapaEmbedUrl;
}

document.addEventListener("DOMContentLoaded", initContacto);
