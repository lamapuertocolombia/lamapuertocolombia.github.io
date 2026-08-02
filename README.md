# Sitio web LAMA Puerto Colombia

Sitio estático (HTML/CSS/JS puro, sin frameworks ni instalación de Node).
Los datos de Pilotos, Tienda, Actividades y Galería se cargan desde archivos
CSV, que luego reemplazarás por tus hojas de Google Sheets publicadas.

## Ver el sitio en tu computador

Necesitas un servidor local simple (abrir los archivos directo con doble clic
no funciona bien porque el navegador bloquea el `fetch` de los CSV). Con
Python instalado:

```
cd lama-puerto-colombia
python -m http.server 8765
```

Y abre `http://localhost:8765` en el navegador.

## Conectar tus Google Sheets reales

Para cada sección (Pilotos, Tienda, Actividades, Galería, Fundadores):

1. Crea una hoja de Google Sheets con exactamente estas columnas en la primera fila:
   - **Pilotos**: `Apodo, Nombre, Moto, Foto, Estado, FechaIngreso, Cargo`
   - **Tienda**: `SKU, Nombre, Precio, Opciones, Stock, Descripcion, Imagen`
   - **Actividades**: `Nombre, Fecha, FechaFin, Lugar, Descripcion, LinkRegistro`
   - **Galería**: `Evento, Fecha, Tipo, URL, Miniatura`
   - **Fundadores**: `Nombre, Apodo, Rol, Foto, Mensaje`
2. Ve a **Archivo > Compartir > Publicar en la web**.
3. Elige la pestaña correspondiente y el formato **Valores separados por comas (.csv)**.
4. Copia el enlace que te da Google.
5. Pégalo en `js/config.js`, dentro de `sheets`, reemplazando el archivo `.csv` de ejemplo.

Notas sobre columnas:
- `Fecha` y `FechaIngreso` deben ir en formato `AAAA-MM-DD` (ej. `2026-08-15`), o también funciona `M/D/AAAA` (ej. `8/15/2026`). Si escribes texto libre (ej. "15 y 16 de noviembre"), la actividad igual aparece en la lista pero no se puede ordenar ni se muestra en el calendario — mejor usa una fecha exacta y pon el detalle en la Descripción.
- **Actividades** tiene dos vistas (Lista y Calendario, con un botón para cambiar entre ellas). El calendario se arma automáticamente a partir de las fechas que sí se pudieron interpretar.
- `FechaFin` es opcional, solo para eventos de varios días (ej. el aniversario). Déjala vacía si el evento es de un solo día. Con `Fecha=11/15/2026` y `FechaFin=11/16/2026`, el evento se muestra como "15-16 nov." en la lista y aparece marcado en ambos días en el calendario.
- `SKU` es el código único de cada producto (ej. `CAM-001`). Aparece en la tarjeta del producto, en el carrito y en el mensaje de WhatsApp del pedido, para identificarlo fácil. Usa el mismo código que manejes en tu inventario.
- `Opciones` en Tienda se separa con `|` (ej. `S|M|L|XL`). Déjalo vacío si el producto no tiene variantes.
- Si una variante cuesta distinto del resto (ej. las tallas grandes valen más, o "Pequeña" y "Grande" son precios totalmente distintos), agrega el precio de esa variante así: `S:80000|M:80000|L:80000|XL:80000|2XL:90000`. El precio mostrado cambia automáticamente al elegir la variante.
- `Stock` es la cantidad disponible del producto (si no tiene variantes/tallas). Si el producto sí tiene tallas, el stock de cada una va dentro de `Opciones` como tercer valor: `S:80000:3|M:80000:4` (talla:precio:stock). Cuando el stock de una variante llega al umbral definido en `js/config.js` (`stockBajoUmbral`, por defecto 5) o menos, se muestra "¡Últimas unidades!"; en 0 se muestra "Agotado" y se bloquea el botón de compra.
- `Estado` en Pilotos debe ser exactamente: `Full Color`, `Prospecto`, `En Licencia` o `Retirado`.
- `Cargo` en Pilotos es opcional. Si un piloto tiene cargo (ej. `Presidente`, `Vicepresidente`, `Tesorero`), aparece en la sección "Junta Directiva" en vez de en la lista general de pilotos.
- `Tipo` en Galería debe ser `foto` o `video`. La hoja de Galería es solo para **videos** (pega el link de YouTube/Facebook) y fotos que quieras describir con evento/fecha. Para fotos simples, mejor usa la carpeta automática de abajo.
- **Fotos automáticas de Galería**: sube el archivo directo a la carpeta `assets/galeria/` del repositorio (por la web de GitHub: entra a esa carpeta → "Add file" → "Upload files"). Aparece solo en la página de Galería, usando el nombre del archivo como título (ej. `rodada-santa-veronica.jpg` se muestra como "Rodada Santa Veronica"). Si nombras los archivos empezando con la fecha (ej. `2026-08-15-aniversario.jpg`), se ordenan de más reciente a más antiguo automáticamente.
- `Foto` e `Imagen` tienen dos formas de funcionar:
  1. **Pegando un link** (Imgur, o cualquier link directo de imagen; Google Drive suele fallar, mejor evitarlo).
  2. **Sin pegar ningún link**: solo sube el archivo de foto a la carpeta correspondiente del proyecto, con el nombre exacto que le corresponde, y aparece automático sin tocar la hoja:
     - Pilotos → carpeta `assets/pilotos/`, nombre del archivo = el Apodo (o Nombre si no tiene apodo), en minúsculas, sin tildes ni comillas, espacios reemplazados por guiones. Ej. Apodo `"Milito"` → `assets/pilotos/milito.jpg`.
     - Tienda → carpeta `assets/tienda/`, nombre del archivo = el SKU en minúsculas. Ej. SKU `JMN-001` → `assets/tienda/jmn-001.jpg`.
     - Fundadores → carpeta `assets/fundadores/`, mismo criterio que Pilotos.
  Si pones un link en la hoja, ese link manda (tiene prioridad). Si el archivo no existe todavía, simplemente se muestra el ícono normal, sin error.
- `Miniatura` en Galería sí requiere pegar un link (no tiene carpeta automática, porque cada foto/video es distinto).
- La página de **Pilotos** es pública: no incluyas ahí datos sensibles (RH, cédula, placa, licencia). Esos se quedan solo en tu base de datos interna.

## Configurar WhatsApp, redes y el formulario de prospecto

Todo esto se edita en `js/config.js`:

- `whatsappTienda`: número de WhatsApp (con indicativo, sin `+` ni espacios, ej. `573001234567`) donde llegan los pedidos de la tienda.
- `whatsappContacto`: número de WhatsApp para contacto general.
- `instagram`, `facebook`, `email`: enlaces y correo del capítulo.
- `formularioProspecto`: enlace a tu Google Form de "Hazte prospecto".
- `mapaEmbedUrl`: puedes generar uno nuevo desde Google Maps (botón Compartir > Insertar un mapa > copiar la URL que está dentro de `src="..."` del iframe).

## Publicar el sitio (gratis)

Como es un sitio estático, puedes publicarlo gratis en varios lugares sin necesidad de Node ni servidores propios:

- **Netlify** o **Vercel**: arrastras la carpeta del proyecto en su panel y listo.
- **GitHub Pages**: subes la carpeta a un repositorio de GitHub y activas Pages.

Cuando quieras, te ayudo con el paso a paso de cualquiera de las tres opciones.

## Estructura del proyecto

```
index.html         Inicio
pilotos.html        Pilotos
tienda.html          Tienda (con carrito -> WhatsApp)
actividades.html     Próximas actividades
galeria.html         Fotos y videos
contacto.html        Contacto y mapa
css/style.css        Estilos
js/config.js         Configuración editable (WhatsApp, redes, hojas de datos)
js/csv.js            Lectura y parseo de los CSV
js/cart.js           Lógica del carrito de la tienda
js/layout.js          Carga del menú y pie de página compartidos
partials/            Menú y pie de página compartidos entre páginas
data/                CSV de ejemplo (reemplázalos por tus Google Sheets publicados)
```
