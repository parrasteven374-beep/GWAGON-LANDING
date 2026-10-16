/* Construye los <picture> a partir de G580.CONFIG.ASSETS.
   Cada <picture data-asset="clave" data-sizes="..." [data-eager]> recibe AVIF + WebP,
   width/height definidos (sin saltos de layout) y lazy loading salvo data-eager.
   ASSETS PROVISIONALES: ver js/config.js. */
(function () {
  "use strict";
  var G = window.G580;

  function build(pic) {
    var key = pic.getAttribute("data-asset");
    var a = G.CONFIG.ASSETS[key];
    var m = a && G.MANIFEST && G.MANIFEST[a.base]; // valores reales generados por el script de imágenes
    if (m) a = Object.assign({}, a, m);
    if (!a) {
      // Placeholder claramente marcado si falta el asset
      pic.outerHTML = '<span class="asset-placeholder" role="img" aria-label="Imagen pendiente: ' + key + '">PLACEHOLDER · ' + key + "</span>";
      return;
    }
    var sizes = pic.getAttribute("data-sizes") || "100vw";
    var eager = pic.hasAttribute("data-eager");
    function srcset(ext) {
      return a.widths.map(function (w) { return a.base + "-" + w + "." + ext + " " + w + "w"; }).join(", ");
    }
    var largest = a.widths[a.widths.length - 1];
    var avif = document.createElement("source");
    avif.type = "image/avif"; avif.srcset = srcset("avif"); avif.sizes = sizes;
    var webp = document.createElement("source");
    webp.type = "image/webp"; webp.srcset = srcset("webp"); webp.sizes = sizes;
    var img = document.createElement("img");
    img.src = a.base + "-" + largest + ".webp";
    img.srcset = srcset("webp"); img.sizes = sizes;
    img.alt = pic.closest("[aria-hidden='true']") || pic.hasAttribute("data-decorative") ? "" : a.alt;
    img.width = a.w; img.height = a.h;
    img.decoding = "async";
    img.loading = eager ? "eager" : "lazy";
    if (a.recorte) img.className = "is-cutout";
    pic.appendChild(avif); pic.appendChild(webp); pic.appendChild(img);
  }

  G.lib.buildAssets = function () {
    Array.prototype.forEach.call(document.querySelectorAll("picture[data-asset]"), build);
    Array.prototype.forEach.call(document.querySelectorAll("[data-cta]"), function (a) {
      a.href = G.CONFIG.CTA_URL; a.textContent = G.CONFIG.CTA_LABEL;
    });
    // Avisos internos: SOLO con ?dev=1 (el cliente no los ve)
    var dev = new URLSearchParams(location.search).get(G.CONFIG.DEV_PARAM) === "1";
    if (dev) document.documentElement.classList.add("is-dev");
    if (dev && G.CONFIG.ASSETS_PROVISIONAL) { // el texto solo existe en el DOM en modo desarrollo
      var n = document.createElement("p");
      n.className = "fine foot__assets";
      n.textContent = "[DEV] Imágenes y visor 360° de terceros, provisionales hasta contar con autorización.";
      document.querySelector(".foot__legal").appendChild(n);
    }
  };
})();
