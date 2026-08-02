// Configuración central del sitio. Edita solo este archivo para personalizar
// el capítulo: número de WhatsApp, redes sociales y de dónde salen los datos.
const CONFIG = {
  clubName: "LAMA Puerto Colombia",
  tagline: "Hermanos para hacer hermanos",
  whatsappTienda: "573000000000", // reemplaza por el número real para pedidos de la tienda
  stockBajoUmbral: 5, // si el stock de una variante/producto es igual o menor a este número, se muestra "¡Últimas unidades!"
  whatsappContacto: "573000000000", // reemplaza por el número real de contacto general
  instagram: "https://instagram.com/lamapuertocolombia",
  facebook: "https://facebook.com/lamapuertocolombia",
  email: "contacto@lamapuertocolombia.com",
  ubicacion: "Puerto Colombia, Atlántico, Colombia",
  mapaEmbedUrl: "https://www.google.com/maps?q=Puerto+Colombia,+Atl%C3%A1ntico&output=embed",
  formularioProspecto: "#", // reemplaza por el link del Google Form de "Hazte prospecto"

  // Cuando tengas tus hojas de Google Sheets publicadas (Archivo > Compartir >
  // Publicar en la web > formato CSV), reemplaza cada URL de abajo por la que
  // te dé Google. Mientras tanto, el sitio usa los archivos CSV de ejemplo en /data.
  sheets: {
    pilotos: "data/pilotos.csv",
    tienda: "data/tienda.csv",
    actividades: "data/actividades.csv",
    galeria: "data/galeria.csv",
    fundadores: "data/fundadores.csv",
  },

  // Repositorio de GitHub donde vive este sitio. Se usa para leer automáticamente
  // los archivos que subas a assets/galeria/, sin necesidad de una hoja de datos.
  githubOwner: "lamapuertocolombia",
  githubRepo: "lamapuertocolombia.github.io",
  galeriaCarpeta: "assets/galeria",
  pilotosCarpeta: "assets/pilotos",
  tiendaCarpeta: "assets/tienda",
  fundadoresCarpeta: "assets/fundadores",
};
