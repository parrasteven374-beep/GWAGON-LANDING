/* ESCENA 6 · AUTONOMÍA Y CARGA
   Ritmo: media, "llenado" progresivo.
   Criterios:
   - La batería se llena con scaleX (transform, origen izquierdo), no con width: sin layout por frame. scrub lineal.
   - Las cifras 434–473 cuentan con el mismo progreso (valor final en HTML + .sr-only).
   - Las dos tarjetas de carga entran en orden (AC, luego 50 kW): jerarquía.
   - Pin también en móvil (escena corta e importante). No se muestra ningún texto sobre el tipo de conector.
   - Reduced motion: batería llena y cifras finales, sin movimiento. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs, qa = G.lib.qsa;

  G.scenes.autonomia = function (ctx) {
    var desktop = ctx.conditions.desktop;
    var fill = q("[data-battery-fill]"), cards = qa("[data-s6-card]"), bg = q("[data-s6-bg] picture"),
        nums = qa("#autonomia-title [data-count]"), restore = [];

    gsap.set(fill, { transformOrigin: "0% 50%" });
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "#autonomia", start: "top top", end: desktop ? "+=240%" : "+=140%",
        scrub: G.CONFIG.MOV.scrub, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
    });
    tl.fromTo(bg, { scale: 1.14 }, { scale: 1, duration: 3 }, 0)
      .fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1.8 }, 0.1);
    nums.forEach(function (n) { restore.push(G.lib.addCounter(tl, n, 0.1, 1.8)); });
    tl.fromTo(cards[0], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.6)
      .fromTo(cards[1], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 2.1)
      .to({}, { duration: 0.5 });

    return function () { restore.forEach(function (fn) { fn(); }); };
  };
})();
