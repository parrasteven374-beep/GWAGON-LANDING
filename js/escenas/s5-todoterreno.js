/* ESCENA 5 · TODOTERRENO
   Ritmo: LENTA (zoom lento), datos en capas con jerarquía.
   Criterios:
   - Zoom lento (LIMITADO por config.ZOOM.terreno: la foto es de baja resolución) y parallax: solo scale/translate de UN wrapper (la foto, la línea de 251 mm viaja juntos, así no se desalinean).
   - La línea 251 mm se dibuja con scaleY (transform) entre el suelo y el bajo del auto; la cifra "251 mm" aparece al terminar de dibujarse.
   - Los datos entran en orden de importancia (modos → reductora → altura libre → rines): jerarquía, no fade-up genérico.
   - Móvil: sin pin; zoom ligado al scroll y datos con un único batch.
   - Reduced motion: nada animado; datos y línea visibles en estado final. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs, qa = G.lib.qsa;

  G.scenes.todoterreno = function (ctx) {
    var desktop = ctx.conditions.desktop;
    var sec = q("#todoterreno"), img = q("[data-s5-img]"), facts = qa("[data-s5-fact]"),
        line = q("[data-s5-line]"), caps = qa(".s5__cap"), mm = q(".s5__mm"),
        title = q(".s5__title");

    gsap.set(line, { scaleY: 0, transformOrigin: "50% 100%" });
    gsap.set(caps.concat(mm), { autoAlpha: 0 });

    var lineIn = function (tl, at) {
      tl.to(caps, { autoAlpha: 1, duration: 0.15 }, at)
        .to(line, { scaleY: 1, duration: 0.6 }, at)
        .to(mm, { autoAlpha: 1, duration: 0.25 }, at + 0.45); // la cifra aparece cuando la línea ya está dibujada
    };

    if (desktop) {
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: sec, start: "top top", end: "+=320%", scrub: G.CONFIG.MOV.scrub,
          pin: true, anticipatePin: 1, invalidateOnRefresh: true },
      });
      tl.fromTo(img, { scale: 1, yPercent: 0 }, { scale: G.CONFIG.ZOOM.terreno, yPercent: -2, duration: 3.4 }, 0) // zoom lento en toda la escena
        .fromTo(title, { yPercent: 10, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5 }, 0)
        .fromTo(facts[0], { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.4 }, 0.5)
        .fromTo(facts[1], { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.4 }, 1.0)
        .fromTo(facts[2], { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.4 }, 1.5);
      lineIn(tl, 1.6);
      tl.fromTo(facts[3], { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.4 }, 2.3)
        .to({}, { duration: 0.5 });
    } else {
      gsap.fromTo(img, { scale: 1 }, { scale: Math.min(G.CONFIG.ZOOM.terreno, 1.05), ease: "none",
        scrollTrigger: { trigger: q("[data-s5-stage]"), start: "top bottom", end: "bottom top", scrub: true } });
      gsap.set(facts, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(facts, {
        start: "top 88%", once: true,
        onEnter: function (els) { gsap.to(els, { autoAlpha: 1, y: 0, duration: G.CONFIG.MOV.medium, ease: G.CONFIG.MOV.out, stagger: 0.07 }); },
      });
      var t = gsap.timeline({ defaults: { ease: "none" },
        scrollTrigger: { trigger: q("[data-s5-stage]"), start: "top 55%", end: "bottom 45%", scrub: true } });
      lineIn(t, 0);
    }
  };
})();
