/* ESCENA 8 · FICHA TÉCNICA Y PRECIO + CIERRE
   Ritmo: asentarse. Todo "aterriza" y se queda quieto: cierre con peso.
   Criterios:
   - Capas: texto gigante DETRÁS (lento), auto recortado en medio, sombra dibujada en CSS que crece cuando el auto "aterriza"
     (sombra estática; solo se anima scale/opacity de ese elemento).
   - El precio cuenta con scrub lineal y termina fijo en $839.900.000 (el valor final está en el HTML).
   - Se fija solo el escenario (auto + precio); la ficha completa va en flujo normal para poder leerse.
   - Cierre: el "G 580 EQ" del pie entra con scale + opacity ligadas al scroll y se queda fijo.
   - Móvil: sin pin; el auto aterriza al entrar en pantalla.
   - Reduced motion: no se crea nada; todo en su estado final. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs, qa = G.lib.qsa;

  G.scenes.ficha = function (ctx) {
    var desktop = ctx.conditions.desktop;
    var stage = q("[data-s8-stage]"), giant = q("[data-s8-giant]"), car = q("[data-s8-car] picture"),
        shadow = q("[data-s8-shadow]"), panel = q("[data-s8-panel]"), price = q("[data-price]"),
        rows = qa("[data-s8-spec] > div"), restore = [];

    gsap.set(shadow, { transformOrigin: "50% 50%" });
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: desktop
        ? { trigger: stage, start: "top top", end: "+=200%", scrub: G.CONFIG.MOV.scrub, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
        : { trigger: stage, start: "top 70%", end: "bottom 60%", scrub: true },
    });
    tl.fromTo(giant, { xPercent: 10 }, { xPercent: desktop ? -8 : -4, duration: 2 }, 0)
      .fromTo(car, { yPercent: 18, scale: 0.84, autoAlpha: 0 }, { yPercent: 0, scale: 1, autoAlpha: 1, duration: 1 }, 0)
      .fromTo(shadow, { scaleX: 0.4, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 1 }, 0.35)
      .fromTo(panel, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.9);
    restore.push(G.lib.addCounter(tl, price, 1.0, 1.0, "$"));
    tl.to({}, { duration: 0.4 });

    // Ficha completa: un solo batch (no un trigger por fila)
    gsap.set(rows, { autoAlpha: 0, y: 12 });
    ScrollTrigger.batch(rows, {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.to(els, { autoAlpha: 1, y: 0, duration: G.CONFIG.MOV.medium, ease: G.CONFIG.MOV.out, stagger: 0.04 }); },
    });

    // Cierre con peso
    var big = q("[data-foot-big]");
    gsap.fromTo(big, { scale: 0.9, autoAlpha: 0, yPercent: 8 }, { scale: 1, autoAlpha: 1, yPercent: 0, ease: "none",
      scrollTrigger: { trigger: big, start: "top 95%", end: "top 55%", scrub: true } });

    return function () { restore.forEach(function (fn) { fn(); }); };
  };
})();
