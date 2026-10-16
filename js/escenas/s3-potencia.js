/* ESCENA 3 · POTENCIA (sin imagen)
   Ritmo: RÁPIDA y percusiva tras la lentitud de la escena 2.
   Criterios:
   - AUTOPLAY al llegar: al entrar la escena a pantalla, los contadores corren solos (sin pin ni scrub): la persona no
     tiene que seguir haciendo scroll para ver las cifras. Una sola vez (once).
   - Contadores con ease-out (llegada: arrancan rápido y asientan): expo/quint, 2,2 s en total. Orden de lectura
     hp -> Nm -> 0-100 con 0,35 s de desfase (jerarquía, no stagger decorativo).
   - Texto real en HTML: el valor final está en el HTML y en .sr-only; las cifras animadas son aria-hidden.
   - Reduced motion / sin JS: no se crea nada; se ven los valores finales. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs, qa = G.lib.qsa;

  G.scenes.potencia = function () {
    var M = G.CONFIG.MOV;
    var stats = qa("[data-stat]"), more = q("[data-s3-more]");
    var restore = [];

    // Estado inicial (solo bajo JS + movimiento permitido): todo oculto hasta que la escena entre
    gsap.set(stats, { autoAlpha: 0, y: 24 });
    gsap.set(more, { autoAlpha: 0, y: 16 });

    var tl = gsap.timeline({
      paused: true,
      scrollTrigger: { trigger: "#potencia", start: "top 55%", once: true, onEnter: function () { tl.play(); } },
    });
    stats.forEach(function (stat, i) {
      var at = i * 0.35;
      var num = q("[data-count]", stat);
      tl.to(stat, { autoAlpha: 1, y: 0, duration: M.slow, ease: M.outQuint }, at);
      restore.push(G.lib.addCounter(tl, num, at, 2.0, "", M.outExpo));
    });
    tl.to(more, { autoAlpha: 1, y: 0, duration: M.slow, ease: M.out }, 1.8);

    return function () { restore.forEach(function (fn) { fn(); }); };
  };
})();
