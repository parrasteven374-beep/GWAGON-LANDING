"""
Optimiza UNA SOLA VEZ los assets de img/ -> img/opt/ (WebP + AVIF).
No forma parte del sitio: el sitio no depende de ningún build.

Uso (desde la carpeta del proyecto):
    python tools/optimizar-imagenes.py

Requiere Python 3 + Pillow (pip install pillow). Si no hay Pillow, convierte a mano:
cada archivo de la lista ORIGENES a WebP (calidad ~80) y AVIF (~55), y aplica los
difuminados descritos en BLUR (placas alemanas y marca del cargador).

ASSETS PROVISIONALES: todas las imágenes son de terceros hasta tener autorización.
"""
import os
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(RAIZ, "img")
OUT = os.path.join(IMG, "opt")
os.makedirs(OUT, exist_ok=True)

# nombre origen -> (nombre salida, anchos máximos, recortada con alfa)
ORIGENES = {
    "gwagon1jpg.jpg": ("icono", False),
    "gwagon1jpg-removebg-preview.png": ("icono-recorte", True),
    "motorggawon-removebg-preview.png": ("motor-recorte", True),
    "terrenofal.jpg": ("terreno", False),
    "charigin.jpg": ("carga", False),
    "interiorsiu.jpg": ("interior", False),
    "interiorytec.jpg": ("cabina", False),
    "fichayprecio-removebg-preview.png": ("ficha-recorte", True),
}


def anchos_para(w):
    """Anchos automáticos: nunca se amplía por encima del original (cuando llegue un archivo de mayor resolución
    se generan solos tamaños mayores, hasta 2400 px)."""
    w = min(w, 2400)
    return sorted({a for a in (480, 960, 1600) if a < w} | {w})

# Difuminados (px sobre la imagen ORIGINAL de cada archivo, tras auto-orientar): (x0, y0, x1, y1)
BLUR = {
    # placa alemana
    "gwagon1jpg.jpg": [(158, 296, 288, 332)],
    "gwagon1jpg-removebg-preview.png": [(130, 244, 236, 275)],
    "terrenofal.jpg": [(100, 427, 184, 456)],
    "terrenofal-removebg-preview.png": [(74, 313, 136, 337)],
    # marca "CHARGE", pegatinas/QR del cargador y rótulo del generador
    "charigin.jpg": [(1225, 0, 1415, 82), (1250, 200, 1400, 245), (1330, 255, 1395, 330),
                     (1262, 340, 1418, 388), (1018, 418, 1058, 458)],
    # placa trasera y rótulo del concesionario
    "interiorytec.jpg": [(1090, 484, 1158, 552)],
}


# Placas: el difuminado se oscurece para que no quede un parche claro sobre el parachoques
OSCURECER = {"gwagon1jpg.jpg", "gwagon1jpg-removebg-preview.png", "terrenofal.jpg", "terrenofal-removebg-preview.png"}


def difuminar(im, cajas, oscurecer=False):
    for (x0, y0, x1, y1) in cajas:
        caja = (max(0, x0), max(0, y0), min(im.width, x1), min(im.height, y1))
        region = im.crop(caja).filter(ImageFilter.GaussianBlur(9))
        if oscurecer:
            rgb = ImageEnhance.Brightness(region.convert("RGB")).enhance(0.38)
            if region.mode == "RGBA":
                rgb.putalpha(region.getchannel("A"))
            region = rgb
        im.paste(region, caja)
    return im


# Gradación de color común (velo): se hornea en las fotos de fondo para no filtrar en runtime.
# nombre -> brillo extra (las escenas 6 y 7 llevan texto encima y se oscurecen más)
BRILLO_EXTRA = {"carga": 0.62, "cabina": 0.78}


def gradar(im, base):
    im = ImageEnhance.Color(im).enhance(0.78)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    return ImageEnhance.Brightness(im).enhance(0.9 * BRILLO_EXTRA.get(base, 1.0))


def limpiar_halo(im):
    """Recortes sobre fondo oscuro: erosiona 1-2 px el alfa y suaviza el borde para quitar el halo claro."""
    im = im.convert("RGBA")
    r, g, b, a = im.split()
    a = a.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(0.8))
    # oscurece ligeramente el borde (donde el alfa no es total) para que no brille sobre negro
    borde = a.point(lambda v: 255 if v > 250 else int(v))
    oscuro = Image.merge("RGB", (r, g, b)).point(lambda v: v)
    fondo = Image.new("RGB", im.size, (12, 12, 14))
    mezcla = Image.composite(oscuro, fondo, borde)
    out = mezcla.convert("RGBA")
    out.putalpha(a)
    return out


def guardar(im, base, ancho):
    if im.width > ancho:
        alto = round(im.height * ancho / im.width)
        im = im.resize((ancho, alto), Image.LANCZOS)
    for ext, kw in (("webp", dict(quality=80, method=6)), ("avif", dict(quality=55))):
        ruta = os.path.join(OUT, f"{base}-{im.width}.{ext}")
        im.save(ruta, **kw)
        print(f"  {os.path.relpath(ruta, RAIZ)}  {im.width}x{im.height}  {os.path.getsize(ruta)//1024} KB")


MANIFEST = {}
for archivo, (base, alfa) in ORIGENES.items():
    ruta = os.path.join(IMG, archivo)
    if not os.path.exists(ruta):
        print(f"FALTA {archivo}: deja placeholder marcado en config.js")
        continue
    print(archivo)
    im = ImageOps.exif_transpose(Image.open(ruta))  # auto-orienta (interiorytec.jpg trae EXIF)
    im = im.convert("RGBA" if alfa else "RGB")
    if archivo in BLUR:
        im = difuminar(im, BLUR[archivo], archivo in OSCURECER)
    if alfa:
        im = limpiar_halo(im)
    else:
        im = gradar(im, base)
    anchos = anchos_para(im.width)
    for w in anchos:
        guardar(im.copy(), base, w)
    MANIFEST["img/opt/" + base] = {"widths": anchos, "w": anchos[-1], "h": round(im.height * anchos[-1] / im.width)}

# Grano estático (teselable) para el velo de color común: una sola textura, no animada
import random
random.seed(580)
g = Image.new("L", (160, 160))
g.putdata([random.randint(0, 255) for _ in range(160 * 160)])
g.save(os.path.join(OUT, "grano.png"), optimize=True)
print("grano.png", os.path.getsize(os.path.join(OUT, "grano.png")) // 1024, "KB")

# Manifest para el sitio (script clásico: funciona con file://)
import json
cab = "/* Generado por tools/optimizar-imagenes.py: no editar a mano. */"
with open(os.path.join(RAIZ, "js", "manifest.js"), "w", encoding="utf-8") as f:
    f.write(cab + chr(10) + "(window.G580 = window.G580 || {}).MANIFEST = " + json.dumps(MANIFEST, indent=2) + ";" + chr(10))
print("js/manifest.js escrito")
