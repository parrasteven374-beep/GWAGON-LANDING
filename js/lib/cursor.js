/* Cursor personalizado: SOLO escritorio (puntero fino con hover) y sin reduced motion.
   Es CONTEXTUAL: el anillo aparece únicamente sobre elementos con data-cursor="Texto" (visor 360°, CTA) y se oculta
   en cualquier otro lugar, al salir de la ventana o cuando el ratón aún no se ha movido (nunca queda un círculo suelto).
   Sigue al puntero con gsap.quickTo (nivel 5: física/cursor). No reemplaza el cursor nativo. */
(function () {
  "use strict";
  var G = window.G580;

  G.lib.initCursor = function () {
    var ok = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
    var el = document.querySelector(".cursor");
    if (!ok || !el) return function () {};

    var M = G.CONFIG.MOV;
    var label = el.querySelector("[data-cursor-label]");
    var moved = false, shown = false;
    document.documentElement.classList.add("has-cursor");
    gsap.set(el, { x: -100, y: -100, scale: 0.5, opacity: 0 });
    var xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    var yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    function show(text) {
      label.textContent = text; el.classList.add("is-label");
      if (!shown) { shown = true; gsap.to(el, { opacity: 1, scale: 1.2, duration: M.fast, ease: M.out, overwrite: "auto" }); }
    }
    function hide() {
      el.classList.remove("is-label");
      if (shown) { shown = false; gsap.to(el, { opacity: 0, scale: 0.5, duration: M.fast, ease: M.out, overwrite: "auto" }); }
    }
    function move(e) {
      if (!moved) { moved = true; gsap.set(el, { x: e.clientX, y: e.clientY }); }
      xTo(e.clientX); yTo(e.clientY);
      var t = e.target.closest && e.target.closest("[data-cursor]");
      if (t) show(t.getAttribute("data-cursor")); else hide();
    }
    function leave() { hide(); }

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);

    return function destroy() {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      document.documentElement.classList.remove("has-cursor");
      gsap.set(el, { clearProps: "all" });
    };
  };
})();
