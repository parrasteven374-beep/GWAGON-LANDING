/* Orquestación: assets → spin → preloader → (Lenis + ScrollTrigger) dentro de gsap.matchMedia.
   - desktop / mobile: movimiento permitido (prefers-reduced-motion: no-preference).
   - reduce: sin Lenis, sin parallax, sin pin, sin cursor, sin preloader; contenido en estado final.
   Lenis se integra con ScrollTrigger según references/gsap.md (lenis.on('scroll', ScrollTrigger.update) +
   gsap.ticker + lagSmoothing(0)). El tacto NO se suaviza (syncTouch desactivado) para no chocar con el arrastre del spin. */
(function () {
  "use strict";
  var G = window.G580, q = G.lib.qs, qa = G.lib.qsa;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true }); // la barra del navegador móvil no debe disparar refresh

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lenis = null;

  /* 1 · Imágenes desde la configuración única */
  G.lib.buildAssets();

  /* 2 · Visor 360° (también en reduced motion: es una acción del usuario; sin giro automático) */
  var spin = (G.spin = G.lib.createSpin(q("[data-spin]"), { autoRotate: !reduce }));

  /* 3 · Preloader con progreso real (omitido con reduced motion) */
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var winLoad = new Promise(function (r) { if (document.readyState === "complete") r(); else window.addEventListener("load", r, { once: true }); });
  if (!reduce) document.documentElement.classList.add("is-loading");

  G.lib.runPreloader([fontsReady, spin.ready, winLoad], { skip: reduce }).then(function () {
    document.documentElement.classList.remove("is-loading");
    if (lenis) lenis.start();
    if (!reduce) G.scenes.heroIntro();
    spin.ready.then(function (ok) { if (ok) spin.startAuto(); });
    ScrollTrigger.refresh();
  });

  /* 4 · Movimiento: todo lo creado dentro se revierte solo al cambiar la condición */
  var mm = gsap.matchMedia();
  mm.add({
    desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  }, function (ctx) {
    var cleanups = [];

    lenis = new Lenis({ smoothWheel: true, lerp: 0.1, wheelMultiplier: 1 });
    if (document.documentElement.classList.contains("is-loading")) lenis.stop(); // sin scroll durante el preloader
    lenis.on("scroll", ScrollTrigger.update);
    var tick = function (t) { lenis.raf(t * 1000); };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    cleanups.push(G.lib.initCursor());

    // Barra de progreso global: un solo trigger, transform
    gsap.to("[data-progress]", { scaleX: 1, ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: true } });

    ["hero", "icono", "potencia", "motores", "todoterreno", "autonomia", "interior", "ficha"].forEach(function (k) {
      var fn = G.scenes[k](ctx);
      if (typeof fn === "function") cleanups.push(fn);
    });

    return function () {
      cleanups.forEach(function (fn) { fn(); });
      gsap.ticker.remove(tick);
      lenis.destroy(); lenis = null;
    };
  });

  /* 5 · Enlaces ancla (con Lenis si está activo; nativo si no). Foco al destino para teclado. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    var target = id.length > 1 ? q(id) : null;
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
    else target.scrollIntoView({ behavior: "auto" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* 6 · Escena activa en la navegación (todos los modos) */
  var dots = qa("[data-dot]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        dots.forEach(function (d) {
          var on = d.getAttribute("href") === "#" + en.target.id;
          d.classList.toggle("is-active", on);
          if (on) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    qa("main > section").forEach(function (s) { io.observe(s); });
  }

  /* 7 · Re-medir tras fuentes y carga (las imágenes tienen width/height: no hay saltos de layout) */
  fontsReady.then(function () { ScrollTrigger.refresh(); });
  winLoad.then(function () { ScrollTrigger.refresh(); });
})();
