/* Visor 360° propio sobre los frames del spin de Sirv/Inchcape (VISOR PROVISIONAL, de terceros).
   - Carga primero UN frame y luego el resto en segundo plano (móvil: menos frames y menor ancho).
   - Rotación automática de una vuelta (< 5 s, WCAG 2.2.2) que se detiene al tocar; luego queda libre.
   - Arrastre con Pointer Events + touch-action: pan-y (CSS): el scroll vertical sigue siendo nativo
     y Lenis no intercepta el tacto (syncTouch desactivado), así no chocan.
   - Si los frames remotos no cargan: respaldo estático + mensaje (nunca un hueco vacío).
   - Solo dibuja cuando algo cambia (sin bucle continuo). */
(function () {
  "use strict";
  var G = window.G580;

  G.lib.createSpin = function (root, options) {
    options = options || {};
    var cfg = G.CONFIG.SPIN;
    var canvas = root.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var msg = root.querySelector("[data-spin-msg]");
    var toggle = document.querySelector("[data-spin-toggle]");

    var isMobile = window.matchMedia("(max-width: " + cfg.mobile.maxViewport + "px)").matches;
    var profile = isMobile ? cfg.mobile : cfg.desktop;
    var dprCap = isMobile ? 1.5 : 2;

    var saveData = navigator.connection && navigator.connection.saveData; // ahorro de datos: menos frames
    var step = saveData ? Math.max(profile.step, 3) : profile.step;
    var frames = [];
    for (var f = 1; f <= cfg.total; f += step) frames.push(f);
    var n = frames.length;
    var imgs = new Array(n);
    var loadedCount = 0;
    var state = { pos: 0 };
    var auto = null;
    var vel = 0;
    var dragging = false, lastX = 0, lastT = 0;
    var raf = 0, ready = false, failed = false;

    function url(i) { return cfg.baseUrl + frames[i] + cfg.ext + "?w=" + profile.width; }

    function load(i) {
      return new Promise(function (resolve) {
        var im = new Image();
        im.decoding = "async";
        im.onload = function () { imgs[i] = im; loadedCount++; resolve(im); };
        im.onerror = function () { resolve(null); };
        im.src = url(i);
      });
    }

    function nearest(idx) {
      if (imgs[idx]) return imgs[idx];
      for (var k = 1; k <= n / 2; k++) {
        var a = imgs[(idx + k) % n], b = imgs[(idx - k + n * 2) % n];
        if (a) return a;
        if (b) return b;
      }
      return null;
    }

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      var w = Math.round(root.clientWidth * dpr), h = Math.round(root.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    }

    function draw() {
      raf = 0;
      if (!ready) return;
      var idx = ((Math.round(state.pos) % n) + n) % n;
      var im = nearest(idx);
      if (!im) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Gradación común: el spin es blanco y el resto de escenas oscuras. Se aplica al dibujar (solo cuando cambia el frame),
      // no como filtro CSS sobre una capa que se mueve. Safari sin ctx.filter lo ignora sin romperse.
      if ("filter" in ctx) ctx.filter = "brightness(0.86) contrast(1.06) saturate(0.82)";
      var s = Math.min(canvas.width / im.naturalWidth, canvas.height / im.naturalHeight);
      var w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.drawImage(im, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }
    function request() { if (!raf) raf = requestAnimationFrame(draw); }

    function stopAuto() {
      if (auto) { auto.kill(); auto = null; }
      if (toggle) toggle.hidden = true;
    }

    function startAuto() {
      if (options.autoRotate === false || failed) return;
      stopAuto();
      if (toggle) { toggle.hidden = false; toggle.textContent = "Detener giro"; }
      auto = gsap.to(state, {
        pos: state.pos + n, duration: cfg.autoRotateSeconds, ease: G.CONFIG.MOV.outQuint, // arranca rápido, termina suave
        onUpdate: request,
        onComplete: function () { auto = null; if (toggle) toggle.hidden = true; },
      });
    }

    /* --- Entrada del usuario --- */
    var perFrame = function () { return (root.clientWidth * 0.8) / n; };

    root.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || !ready) return;
      stopAuto(); vel = 0; dragging = true; lastX = e.clientX; lastT = performance.now();
      try { root.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      root.classList.add("is-dragging");
    });
    root.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, now = performance.now(), dt = Math.max(now - lastT, 1);
      lastX = e.clientX; lastT = now;
      var df = -dx / perFrame();
      state.pos += df;
      vel = vel * 0.6 + (df / dt) * 16 * 0.4; // frames por tick (~16 ms)
      request();
    });
    function release() {
      if (!dragging) return;
      dragging = false; root.classList.remove("is-dragging");
      if (Math.abs(vel) > 0.05 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        var v = { v: vel };
        gsap.to(v, { v: 0, duration: 0.9, ease: G.CONFIG.MOV.out, onUpdate: function () { state.pos += v.v; request(); } });
      }
    }
    root.addEventListener("pointerup", release);
    root.addEventListener("pointercancel", release); // p. ej. cuando el navegador toma un gesto vertical de scroll

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault(); stopAuto();
        state.pos += e.key === "ArrowRight" ? 1 : -1; request();
      }
    });
    if (toggle) toggle.addEventListener("click", stopAuto);

    if (window.ResizeObserver) new ResizeObserver(function () { size(); request(); }).observe(root);

    /* --- Carga: un frame, luego el resto en segundo plano --- */
    function fail() {
      failed = true;
      root.classList.add("is-fallback");
      if (msg) msg.hidden = false;
    }

    var firstDone = new Promise(function (resolve) {
      var settled = false;
      function finish(ok) { if (settled) return; settled = true; resolve(ok); }
      setTimeout(function () { finish(false); }, cfg.firstFrameTimeout);
      load(0).then(function (im) { finish(!!im); });
    }).then(function (ok) {
      if (!ok) { fail(); return false; }
      ready = true; size(); draw();
      root.classList.add("is-ready");
      var rest = []; for (var i = 1; i < n; i++) rest.push(i);
      var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 400); };
      idle(function () {
        var next = 0, workers = 3;
        function work() {
          if (next >= rest.length) return;
          load(rest[next++]).then(function () { request(); work(); });
        }
        for (var w = 0; w < workers; w++) work();
      });
      return true;
    });

    return {
      ready: firstDone,
      startAuto: startAuto,
      stopAuto: stopAuto,
      isFailed: function () { return failed; },
      position: function () { return state.pos; },
      frameCount: n,
      profile: profile,
    };
  };
})();
