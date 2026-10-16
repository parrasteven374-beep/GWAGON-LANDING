/* ===========================================================================
   CONFIGURACIÓN ÚNICA — Mercedes-Benz G 580 con tecnología EQ
   Todas las rutas de assets, la URL del spin y los datos viven aquí.
   Scripts clásicos (sin import/export): el sitio funciona abriendo index.html
   con doble clic o desde un servidor local.

   ⚠ ASSETS PROVISIONALES ⚠
   Todas las imágenes y el visor 360° son de TERCEROS y son PROVISIONALES hasta
   contar con autorización. Para quitar o reemplazar uno: cambia su entrada en
   ASSETS (o SPIN) y vuelve a correr tools/optimizar-imagenes.py si es imagen.
   Con ASSETS_PROVISIONAL = true se muestra una marca discreta "Imágenes provisionales"
   en el pie. Ponlo en false SOLO cuando todo tenga autorización.
   =========================================================================== */
(function () {
  "use strict";

  var G580 = (window.G580 = window.G580 || {});
  G580.scenes = {};
  G580.lib = {};

  G580.CONFIG = {
    ASSETS_PROVISIONAL: true,

    /* ---- Visor 360° (Sirv de Inchcape). DEPENDE DEL SERVIDOR DE INCHCAPE ----
       Frames: baseUrl + n + ext (1..total). El parámetro ?w= reduce el peso del frame.
       Si el servidor no responde, el hero muestra un respaldo estático (FALLBACK_ASSET). */
    SPIN: {
      PROVISIONAL: true,
      pageUrl: "https://inchcapelatam.sirv.com/Mercedes/Colombia/46560026/149/149.spin",
      baseUrl: "https://inchcapelatam.sirv.com/Mercedes/Colombia/46560026/149/",
      ext: ".png",
      total: 36,
      desktop: { width: 1100, step: 1 }, // 36 frames (≈560 KB servidos como AVIF por Sirv)
      mobile: { width: 1100, step: 2, maxViewport: 767 }, // 18 frames (≈280 KB servidos como AVIF por Sirv); con ahorro de datos, 12
      firstFrameTimeout: 6000, // ms antes de declarar el respaldo
      autoRotateSeconds: 4.2, // < 5 s (WCAG 2.2.2); luego queda libre para arrastrar
      fallbackAsset: "iconoRecorte",
    },

    /* ---- Imágenes (salida de tools/optimizar-imagenes.py en img/opt/) ----
       base: ruta sin ancho ni extensión. widths, w y h son un RESPALDO: js/manifest.js (generado por
       tools/optimizar-imagenes.py) los sobrescribe con los valores reales.
       PARA REEMPLAZAR UNA FOTO: copia el archivo nuevo a img/ con el MISMO nombre (ver "origen"), corre
       `python tools/optimizar-imagenes.py` y listo: se regeneran tamaños y manifest. Luego sube ZOOM si la foto lo permite. origen: archivo original en img/ (para sustituir).
       recorte: true si es PNG sin fondo (baja resolución: no escalar por encima de su ancho). */
    ASSETS: {
      icono: { base: "img/opt/icono", widths: [480, 735], w: 735, h: 497, origen: "gwagon1jpg.jpg",
        alt: "Mercedes-Benz G 580 negra de frente con la parrilla y los faros iluminados" },
      iconoRecorte: { base: "img/opt/icono-recorte", widths: [608], w: 608, h: 411, recorte: true,
        origen: "gwagon1jpg-removebg-preview.png", alt: "Mercedes-Benz G 580 negra recortada, vista frontal tres cuartos" },
      motor: { base: "img/opt/motor-recorte", widths: [612], w: 612, h: 408, recorte: true,
        origen: "motorggawon-removebg-preview.png", alt: "Motor eléctrico" },
      terreno: { base: "img/opt/terreno", widths: [480, 735], w: 735, h: 626, origen: "terrenofal.jpg",
        alt: "Mercedes-Benz G azul sobre terreno rocoso y arena" },
      carga: { base: "img/opt/carga", widths: [640, 1280], w: 1280, h: 683, origen: "charigin.jpg",
        alt: "Mercedes-Benz G azul cargando en una estación de carga rápida" },
      interior: { base: "img/opt/interior", widths: [480, 736], w: 736, h: 483, origen: "interiorsiu.jpg",
        alt: "Tablero de la G 580 con las pantallas MBUX y el paisaje al fondo" },
      cabina: { base: "img/opt/cabina", widths: [640, 1308], w: 1308, h: 736, origen: "interiorytec.jpg",
        alt: "Mercedes-Benz G gris con las puertas abiertas mostrando la cabina" },
      ficha: { base: "img/opt/ficha-recorte", widths: [666], w: 666, h: 374, recorte: true,
        origen: "fichayprecio-removebg-preview.png", alt: "Mercedes-Benz G gris de estudio, vista trasera tres cuartos" },
    },

    /* ---- Zoom máximo por foto de BAJA resolución (tablero 736 px, G azul 735 px) ----
       Con archivos de mayor resolución (≥ 2000 px) sube estos valores: terreno hasta ~1.16, interior hasta ~2.0. */
    ZOOM: { terreno: 1.06, interior: 1.3, interiorMovil: 1.2 },

    /* ---- MODO DESARROLLO: abre el sitio con ?dev=1 para ver avisos internos (p. ej. assets provisionales) ---- */
    DEV_PARAM: "dev",

    /* ---- Movimiento (espejo de css/tokens.css; en segundos para GSAP) ---- */
    MOV: {
      fast: 0.16, medium: 0.28, slow: 0.5,
      out: "power2.out", outQuint: "power4.out", outExpo: "expo.out", inOut: "power2.inOut",
      scrub: 0.6, // suavizado del scrub; el progreso lo marca el scroll
    },

    /* ---- Contenido (solo datos de la ficha de Mercedes-Benz Colombia / brief) ---- */
    FUENTE: "Mercedes-Benz Colombia",
    /* ⚠ PENDIENTE DE DEFINIR: enlace del botón "Cotiza tu G 580" (cotizador, WhatsApp, formulario…).
       Es la ÚNICA variable que lo controla. Mientras esté en "#cotizar" solo lleva al pie de la página. */
    CTA_URL: "#cotizar",
    CTA_LABEL: "Cotiza tu G 580",
    /* Los textos legales viven en index.html (texto real, visible sin JS). */
  };
})();
