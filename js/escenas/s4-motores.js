/* ESCENA 4 · CUATRO MOTORES
   Ritmo: media, en dos actos.
   Acto A: motor recortado al centro con capas a distinta velocidad (texto gigante DETRÁS, anillos DELANTE).
   Acto B: el motor se reduce al centro del diagrama SVG, el chasis se DIBUJA con el scroll
           (stroke-dashoffset con pathLength=1) y el motor se "multiplica" en uno por rueda.
   Criterios: scrub lineal; solo transform/opacity (+ stroke-dashoffset en SVG, que no dispara layout);
   escritorio con pin; móvil SIN pin (la skill pide menos pinning): el dibujo se liga al scroll sin fijar la pantalla.
   Reduced motion: no se crea nada; el diagrama aparece completo y los 4 motores en su sitio. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs, qa = G.lib.qsa;

  G.scenes.motores = function (ctx) {
    var desktop = ctx.conditions.desktop;
    var sec = q("#motores"), giant = q("[data-s4-giant]"), motor = q("[data-s4-motor]"),
        rings = qa("[data-s4-ring]"), copy = q(".s4__copy"), diagram = q("[data-s4-diagram]"),
        draws = qa("[data-draw]", diagram), clones = qa("[data-mot]", diagram);

    gsap.set(draws, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(clones, { autoAlpha: 0 });

    function toCenter(el) { // desplazamiento desde la rueda hasta el centro del diagrama (en px, recalculado en refresh)
      return {
        x: function () { return (0.5 - parseFloat(el.style.left) / 100) * diagram.offsetWidth; },
        y: function () { return (0.5 - parseFloat(el.style.top) / 100) * diagram.offsetHeight; },
      };
    }

    if (desktop) {
      gsap.set([diagram, q("[data-s4-cap]")], { autoAlpha: 0 });
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: sec, start: "top top", end: "+=450%", scrub: G.CONFIG.MOV.scrub,
          pin: true, anticipatePin: 1, invalidateOnRefresh: true },
      });
      // Acto A (0–1.3): profundidad
      tl.set(motor, { x: Math.round(window.innerWidth * 0.16) }, 0) // acto A: el motor a la derecha, el texto a la izquierda
      tl.fromTo(giant, { xPercent: 8 }, { xPercent: -8, duration: 1.4 }, 0)         // detrás, lento
        .fromTo(motor, { yPercent: 4, scale: 0.96 }, { yPercent: -2, scale: 1, duration: 1.3 }, 0)
        .fromTo(rings[0], { yPercent: 20, scale: 0.9 }, { yPercent: -70, scale: 1.2, duration: 1.4 }, 0) // delante, rápido
        .fromTo(rings[1], { yPercent: 40, scale: 0.8 }, { yPercent: -120, scale: 1.3, duration: 1.4 }, 0);
      // Acto B (1.4–4): el motor baja al diagrama y se multiplica
      tl.to([giant, copy].concat(rings), { autoAlpha: 0, duration: 0.4 }, 1.4)
        .to(motor, { scale: 0.21, yPercent: 0, x: 0, duration: 0.8 }, 1.4)
        .to(diagram, { autoAlpha: 1, duration: 0.2 }, 1.7)
        .to(q("[data-s4-cap]"), { autoAlpha: 1, duration: 0.4 }, 3.0)
        .to(draws, { strokeDashoffset: 0, duration: 1.1, stagger: 0.12 }, 2.0);
      clones.forEach(function (c) {
        var o = toCenter(c);
        tl.fromTo(c, { x: o.x, y: o.y, scale: 1, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.9 }, 3.1);
      });
      tl.to(motor, { autoAlpha: 0, duration: 0.1 }, 3.1)
        .to({}, { duration: 0.5 });
    } else {
      // Móvil: sin pin. Parallax suave de la capa gigante + dibujo ligado al scroll.
      gsap.fromTo(giant, { xPercent: 10 }, { xPercent: -10, ease: "none",
        scrollTrigger: { trigger: q(".s4__stage"), start: "top bottom", end: "bottom top", scrub: true } });
      var t = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: diagram, start: "top 80%", end: "bottom 45%", scrub: true },
      });
      t.to(draws, { strokeDashoffset: 0, duration: 1, stagger: 0.1 }, 0);
      clones.forEach(function (c) {
        var o = toCenter(c);
        t.fromTo(c, { x: o.x, y: o.y, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.8 }, 1.1);
      });
    }
  };
})();
