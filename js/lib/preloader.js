/* Preloader con porcentaje REAL: fuentes + primer frame del spin + carga de la ventana (con tope).
   Skill: no oculta el LCP (el H1 ya está en el HTML debajo) y se omite con reduced motion.
   La salida es una llegada cinemática: clip-path con expo.out (tokens-y-easing.md). */
(function () {
  "use strict";
  var G = window.G580;

  G.lib.runPreloader = function (tasks, opts) {
    opts = opts || {};
    var el = document.getElementById("preloader");
    return new Promise(function (resolve) {
      if (!el) return resolve();
      if (opts.skip) { el.remove(); return resolve(); }

      var pctEl = el.querySelector("[data-pct]");
      var total = tasks.length, done = 0;
      var shown = { v: 0 };
      var minMs = 1100, maxMs = 4200, t0 = performance.now();
      var finished = false;

      function target() { return Math.round((done / total) * 100); }
      function tick() {
        var elapsed = performance.now() - t0;
        // el porcentaje mostrado nunca supera lo cargado ni va más rápido que el mínimo de tiempo
        var cap = Math.min(target(), Math.round((elapsed / minMs) * 100));
        if (shown.v < cap) { shown.v += Math.max(1, (cap - shown.v) * 0.12); }
        shown.v = Math.min(shown.v, cap);
        pctEl.textContent = Math.floor(shown.v);
        if (shown.v >= 100 || elapsed > maxMs) exit(); // tope: no bloquea si algo tarda
      }

      function exit() {
        if (finished) return; finished = true;
        gsap.ticker.remove(tick);
        pctEl.textContent = 100;
        gsap.to(el, {
          clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: G.CONFIG.MOV.outExpo, delay: 0.15,
          onComplete: function () { el.remove(); },
        });
        resolve();
      }

      tasks.forEach(function (p) { p.then(function () { done++; }, function () { done++; }); });
      gsap.ticker.add(tick);
    });
  };
})();
