/* ESCENA 7 · INTERIOR Y TECNOLOGÍA
   Ritmo: media-lenta, con un "gesto" de entrada: abrir la puerta.
   Criterios:
   - Entrada "abre la puerta": la cabina abierta (interiorytec) se ve COMPLETA y el interior (interiorsiu, SIEMPRE la
     original) es una ventana diminuta al centro (clip-path) que crece hasta llenar la pantalla mientras el auto se acerca
     y se desvanece. Escritorio; scrub lineal.
   - Zoom hacia las pantallas MBUX: solo scale con transform-origin sobre las pantallas (resolución limitada: zoom
     moderado para no pasar de ~2,5× el tamaño nativo).
   - Equipamiento en lista con stagger corto (8 ítems, < 500 ms en total): expresa orden de lectura.
   - Móvil: sin pin ni clip-path; cabina con empuje ligero, zoom ligado al scroll y lista con un batch.
   - Reduced motion: no se crea nada; se ven interior + lista en estado final. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs, qa = G.lib.qsa;

  G.scenes.interior = function (ctx) {
    var desktop = ctx.conditions.desktop;
    var door = q("[data-s7-door]"), cabin = q("[data-s7-cabin]"), zoom = q("[data-s7-zoom]"),
        open = q("[data-s7-open]"), list = q("[data-s7-list]"), items = qa("[data-s7-item]");

    if (desktop) {
      gsap.set(items, { autoAlpha: 0, x: 24 });
      gsap.set(list, { autoAlpha: 0 });
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: "#interior", start: "top top", end: "+=460%", scrub: G.CONFIG.MOV.scrub,
          pin: true, anticipatePin: 1, invalidateOnRefresh: true },
      });
      // Arranca con el auto COMPLETO y el interior como una ventana diminuta al centro; la ventana crece hasta llenar la pantalla
      tl.fromTo(door.querySelector("picture"), { scale: 0.56 }, { scale: 1.7, transformOrigin: "50% 50%", duration: 1.9 }, 0)       // el AUTO (no el fondo) se acerca: el gris de estudio llena toda la pantalla desde el inicio
        .fromTo(cabin, { clipPath: "inset(48.6% 48.9% 48.6% 48.9% round 4px)", autoAlpha: 0 }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.7 }, 0.3)
        .to(cabin, { autoAlpha: 1, duration: 0.7 }, 0.45) // invisible al inicio: se "descubre" sobre el gris del auto
        .fromTo(zoom, { scale: 1.12, transformOrigin: "50% 50%" }, { scale: 1, transformOrigin: "50% 50%", duration: 1.7 }, 0.3) // contra-zoom: profundidad
        .to(open, { autoAlpha: 0, yPercent: -10, duration: 0.4 }, 0.35)
        .to(door, { autoAlpha: 0, duration: 0.4 }, 1.6)
        .set(door, { visibility: "hidden" }, 2.0)
        .fromTo(zoom, { scale: 1, transformOrigin: "45% 51%" }, { scale: G.CONFIG.ZOOM.interior, transformOrigin: "45% 51%", duration: 1.6 }, 2.0)
        .to(list, { autoAlpha: 1, duration: 0.3 }, 3.1)
        .to(items, { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.1 }, 3.2)
        .to({}, { duration: 0.5 });
    } else {
      gsap.fromTo(door.querySelector("picture"), { scale: 1 }, { scale: 1.12, ease: "none",
        scrollTrigger: { trigger: door, start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(zoom, { scale: 1, transformOrigin: "45% 51%" }, { scale: G.CONFIG.ZOOM.interiorMovil, transformOrigin: "45% 51%", ease: "none",
        scrollTrigger: { trigger: cabin, start: "top 80%", end: "bottom 30%", scrub: true } });
      gsap.set(items, { autoAlpha: 0, y: 12 });
      ScrollTrigger.batch(items, {
        start: "top 90%", once: true,
        onEnter: function (els) { gsap.to(els, { autoAlpha: 1, y: 0, duration: G.CONFIG.MOV.medium, ease: G.CONFIG.MOV.out, stagger: 0.05 }); },
      });
    }
  };
})();
