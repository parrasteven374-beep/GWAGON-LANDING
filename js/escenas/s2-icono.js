/* ESCENA 2 · ICONO ELÉCTRICO
   Ritmo: LENTA y contemplativa (pin 180 %).
   Criterios:
   - Revelado por clip-path (permitido por la skill para revelados puntuales; solo escritorio).
     scrub lineal. La imagen interna hace contra-zoom (transform) para dar profundidad.
   - El resplandor de la parrilla es una capa con opacity (la sombra/gradiente es estático, solo se anima opacity).
   - Móvil: sin pin ni clip-path (menos pinning); entrada con scale + opacity ligadas al scroll.
   - Reduced motion: no se crea nada; contenido final visible. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs;

  G.scenes.icono = function (ctx) {
    var sec = q("#icono"), frame = q("[data-s2-frame]"), img = q("[data-s2-img]"),
        glow = q("[data-s2-glow]"), title = q(".s2__title");

    if (ctx.conditions.desktop) {
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: sec, start: "top top", end: "+=180%", scrub: G.CONFIG.MOV.scrub,
          pin: true, anticipatePin: 1, invalidateOnRefresh: true },
      });
      tl.fromTo(frame, { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, 0)
        .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8 }, 0)
        .fromTo(title, { yPercent: 14 }, { yPercent: 0, duration: 1 }, 0)
        .fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 0.9)
        .to(frame, { scale: 1.06, duration: 0.8 }, 1.2);
    } else {
      var t = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: sec, start: "top 75%", end: "bottom 60%", scrub: true },
      });
      t.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1 }, 0)
       .fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.5);
    }
  };
})();
