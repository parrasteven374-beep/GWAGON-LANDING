# Mercedes-Benz G 580 con tecnología EQ — experiencia "scroll to discover"

HTML, CSS y JavaScript puros. **Sin build, sin npm, sin frameworks.** Funciona abriendo `index.html` con doble clic
y también desde un servidor local (`python -m http.server 8000`). El visor 360° necesita internet (ver abajo).


| Asset | Origen | Dónde se usa |
|---|---|---|
| Visor 360° (36 frames) | Sirv de Inchcape (`SPIN.baseUrl`) | Hero. **Depende del servidor de Inchcape** |
| `gwagon1jpg.jpg` | tercero | Escena 2 (placa difuminada) |
| `gwagon1jpg-removebg-preview.png` | tercero | Respaldo del hero si el spin no carga |
| `motorggawon-removebg-preview.png` | tercero | Escena 4 (ilustrativo, no es necesariamente el motor del modelo) |
| `terrenofal.jpg` | tercero | Escena 5 (placa difuminada) |
| `charigin.jpg` | tercero | Escena 6 (marca del cargador difuminada) |
| `interiorsiu.jpg`, `interiorytec.jpg` | tercero | Escena 7 |
| `fichayprecio-removebg-preview.png` | tercero | Escena 8 |
| `terrenofal-removebg-preview.png`, `charigin-removebg-preview.png`, `interiorsiu-removebg-preview.png` | tercero | **No usadas** (decisión de diseño; sin optimizar). Pueden borrarse de `img/` |


## Estructura
```
index.html           contenido real (texto en HTML), 8 escenas + pie
css/                 tokens.css (movimiento y marca), base.css, escenas.css
js/config.js         ÚNICA configuración: assets, URL del spin, movimiento
js/lib/              assets, spin (visor 360°), preloader, cursor, util
js/escenas/          s1…s8 (cada archivo documenta el criterio de la skill aplicado)
js/main.js           orquestación: Lenis + ScrollTrigger dentro de gsap.matchMedia
vendor/              GSAP 3.12.5, ScrollTrigger 3.12.5, Lenis 1.1.20 (locales, versión fija)
fonts/               Barlow Condensed + Inter (OFL), locales
img/ , img/opt/      originales y versiones optimizadas
tools/               scripts de desarrollo (NO forman parte del sitio)
```

## Tecnologías usadas

| Capa | Tecnología | Para qué |
|---|---|---|
| Marcado | HTML5 semántico (`main`, `section`, `figure`, `dl`, `nav`) | Todo el texto es real; funciona sin JS |
| Estilos | CSS3 puro: variables (tokens), grid/flex, `clamp()`, `svh`, `aspect-ratio`, `clip-path`, `mask-image`, `backdrop-filter`, media queries (`prefers-reduced-motion`, `hover`, `pointer`) | Diseño responsive móvil primero |
| Lógica | JavaScript clásico (ES5/ES6 sin módulos ni bundler) | Escenas, visor 360°, preloader, cursor |
| Animación | **GSAP 3.12.5** + **ScrollTrigger 3.12.5** | Timelines, scrub, pin, batch, `matchMedia`, `quickTo` |
| Scroll suave | **Lenis 1.1.20** | Integrado con ScrollTrigger; desactivado con reduced motion |
| Visor 360° | Canvas 2D + Pointer Events + frames PNG de Sirv | Giro propio, arrastre horizontal sin bloquear el scroll |
| Gráficos | SVG inline (chasis, línea de altura) y CSS (batería, sombras) | Dibujo con `stroke-dashoffset` y `transform` |
| Imágenes | WebP + AVIF vía `<picture>`, `width`/`height` definidos, lazy loading | Rendimiento y sin saltos de layout |
| Tipografía | Barlow Condensed e Inter (OFL), `woff2` locales | Ver `fonts/LICENCIAS.txt` |
| Herramientas (fuera del sitio) | Python 3 + Pillow (`tools/optimizar-imagenes.py`), Node + Chrome headless por CDP (`tools/probar.mjs`) | Optimizar imágenes y probar |

## Uso de la skill `web-animation-design`

Se aplicó la skill en todo el proyecto (SKILL.md y las referencias `gsap.md`, `rendimiento.md`, `accesibilidad.md` y `tokens-y-easing.md`).

- **Herramienta elegida:** GSAP + ScrollTrigger, porque hay timelines coordinadas, scrub, pinning y un sitio sin framework; CSS puro para hover, foco y fades simples.
- **Tokens de movimiento:** una sola escala (160 / 280 / 500 ms) y curvas en `css/tokens.css`, espejadas en `js/config.js` (`MOV`). Entradas con `ease-out`, llegadas cinemáticas con `expo.out`, `linear` solo en scrub y contadores ligados al scroll.
- **Rendimiento:** solo `transform` y `opacity` (más `clip-path` en revelados puntuales y `stroke-dashoffset` en SVG); un único bucle (`gsap.ticker`) compartido con Lenis; la gradación de color va horneada en las imágenes, sin filtros CSS sobre capas en movimiento; el visor dibuja solo cuando cambia el frame; `batch` en lugar de un trigger por elemento.
- **Móvil:** menos pinning (solo Potencia, Autonomía en móvil), sin `clip-path` ni parallax pesado, menos frames del spin y menor ancho.
- **Accesibilidad:** con `prefers-reduced-motion` no hay Lenis, parallax, pin, cursor ni preloader y el contenido queda en su estado final; foco visible, navegación por teclado, textos alternativos y valores finales también en texto para lectores de pantalla; el giro automático dura menos de 5 s y se puede detener (WCAG 2.2.2).
- **Core Web Vitals:** el título del hero no se oculta (LCP), el preloader tiene tope de tiempo, las imágenes reservan su espacio (CLS) y las librerías cargan con `defer`.
- **Criterio por escena:** cada archivo de `js/escenas/` documenta en su cabecera el criterio aplicado (easing, duración, scrub, reduced motion).
- **Auditoría:** se hizo con el modo de revisión de la skill (diseño, interacción, rendimiento, accesibilidad, arquitectura) y se simplificó lo innecesario.
