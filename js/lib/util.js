/* Utilidades compartidas por las escenas. */
(function () {
  "use strict";
  var G = window.G580;

  G.lib.qs = function (sel, root) { return (root || document).querySelector(sel); };
  G.lib.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* Formato es-CO manual (miles con punto, decimales con coma): Intl omite el separador en 4 cifras. */
  G.lib.fmt = function (value, decimals) {
    var fixed = Math.abs(value).toFixed(decimals || 0).split(".");
    var int = fixed[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (value < 0 ? "-" : "") + int + (fixed[1] ? "," + fixed[1] : "");
  };

  /* Añade a la timeline un contador que cuenta de 0 al valor final según el progreso del scroll.
     Devuelve una función que restaura el texto final (para el revert de matchMedia). */
  G.lib.addCounter = function (tl, el, at, dur, prefix, ease) {
    var target = parseFloat(el.getAttribute("data-count") || el.getAttribute("data-price"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var pre = prefix || "";
    var finalText = el.textContent;
    var o = { v: 0 };
    el.textContent = pre + G.lib.fmt(0, dec);
    tl.to(o, {
      v: target, duration: dur, ease: ease || "none", // sin ease = scrub lineal; con ease = autoplay
      onUpdate: function () { el.textContent = pre + G.lib.fmt(o.v, dec); },
    }, at);
    return function () { el.textContent = finalText; };
  };
})();
