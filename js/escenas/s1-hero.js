/* ESCENA 1 · HERO
   Criterios de la skill:
   - Entrada del título: llegada cinemática, expo.out, 1,2 s (tokens-y-easing). El H1 NO se oculta (LCP):
     solo se anima escala; lo secundario (eyebrow, pista) sí entra con opacity.
   - Parallax al salir: scrub lineal (el scroll manda). Solo transform. Ligero en móvil.
   - Reduced motion: no se llama a ninguna de estas funciones; el hero queda estático y el spin sigue
     siendo arrastrable (acción del usuario) pero sin giro automático. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs;

  G.scenes.heroIntro = function () {
    var M = G.CONFIG.MOV;
    gsap.from(q(".hero__g"), { scale: 1.08, duration: 1.2, ease: M.outExpo });
    gsap.from("[data-hero-in]", { autoAlpha: 0, y: 16, duration: M.slow, ease: M.out, stagger: 0.08, delay: 0.35 });
    gsap.from(q(".spin"), { scale: 0.94, duration: 1, ease: M.outExpo, delay: 0.1 });
  };

  G.scenes.hero = function (ctx) {
    var desktop = ctx.conditions.desktop;
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
    });
    // Capas a distinta velocidad: título detrás (lento), auto delante (más rápido)
    tl.to(q(".hero__title"), { yPercent: desktop ? -22 : -10 }, 0)
      .to(q(".spin"), { yPercent: desktop ? -8 : -3, scale: desktop ? 1.1 : 1.03 }, 0)
      .to(q(".hero__hint"), { autoAlpha: 0, duration: 0.3 }, 0);
  };
})();
