#!/usr/bin/env python3
"""Genere toutes les declinaisons du logo Talos. Texte vectorise (aucune dependance police)."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from textpath import text_path

D = pathlib.Path(__file__).parent
TAGLINE = "AU SERVICE DE VOTRE TEMPS"
CAP = 0.714  # hauteur de capitale Helvetica Neue / corps

# ---------------------------------------------------------------- symbole
VB = (150, 58, 700, 826)          # cadrage serre du mark
INK = (164, 64, 841, 874)         # encre reelle du mark (xmin,ymin,xmax,ymax)

T_PATH = ("M 310 302 L 725 302 L 688 406 L 558 406 L 502 640 L 372 640 L 400 406 L 362 406 "
          "C 338 409 316 430 300 457 C 291 472 265 468 258 447 "
          "C 250 420 255 389 263 363 C 276 324 288 302 310 302 Z")
ROOF_1 = "M 174 350 L 500 84 L 826 350"
ROOF_2 = "M 208 362 L 500 124 L 792 362"
# eclair : arete haute-gauche parallele au fut du T, arete basse-gauche parallele
# au chanfrein de la traverse, coin haut-droit sur le prolongement de ce meme chanfrein.
BOLT   = "M 494 536 L 642 536 L 399 852 L 459 684 Z"
GAP    = 16   # respiration entre le T et ce qui passe derriere (toit + eclair)

def shapes(gold, dark, uid, indent="  ", simple=False):
    """Toit et eclair passent derriere le T, avec une respiration constante."""
    i = indent
    return (
        f'{i}<mask id="cut-{uid}" maskUnits="userSpaceOnUse" x="{VB[0]}" y="{VB[1]}" '
        f'width="{VB[2]}" height="{VB[3]}">\n'
        f'{i}  <rect x="{VB[0]}" y="{VB[1]}" width="{VB[2]}" height="{VB[3]}" fill="#fff"/>\n'
        f'{i}  <path d="{T_PATH}" fill="#000" stroke="#000" stroke-width="{2*GAP}" '
        f'stroke-linejoin="round"/>\n'
        f'{i}</mask>\n'
        f'{i}<g mask="url(#cut-{uid})">\n'
        f'{i}  <path d="{ROOF_1}" fill="none" stroke="{gold}" stroke-width="31"/>\n'
        + (f'{i}  <path d="{ROOF_2}" fill="none" stroke="{gold}" stroke-width="8"/>\n' if not simple else '') +
        f'{i}  <path d="{BOLT}" fill="{gold}"/>\n'
        f'{i}</g>\n'
        f'{i}<path d="{T_PATH}" fill="{dark}"/>')

def mark_group(gold, dark, scale, ink_left, ink_top, uid, indent="  ", simple=False):
    """Place le mark pour que son encre demarre exactement en (ink_left, ink_top)."""
    tx = ink_left - (INK[0] - VB[0]) * scale
    ty = ink_top  - (INK[1] - VB[1]) * scale
    return (f'{indent}<g transform="translate({tx:.2f},{ty:.2f}) scale({scale:.5f}) '
            f'translate({-VB[0]},{-VB[1]})">\n{shapes(gold, dark, uid, indent + "  ", simple)}\n{indent}</g>')

def mark_ink_size(scale):
    return (INK[2] - INK[0]) * scale, (INK[3] - INK[1]) * scale

# ---------------------------------------------------------------- texte
def line(text, size, ls, weight, fill, ink_left, baseline, indent="  "):
    d, b, _ = text_path(text, size, ls, weight)
    dx = ink_left - b[0]
    return (f'{indent}<g transform="translate({dx:.2f},{baseline:.2f})">'
            f'<path d="{d}" fill="{fill}"/></g>'), (b[2] - b[0])

def ls_for_width(text, size, weight, target):
    _, b, _ = text_path(text, size, 0, weight)
    return (target - (b[2] - b[0])) / (len(text) - 1)

def svg(w, h, body, bg=None):
    head = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
    rect = f'\n  <rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f"{head}{rect}\n{body}\n</svg>\n"

def write(name, content):
    (D / name).write_text(content)

# ================================================================ MARK SEUL
for name, gold, dark in [
    ("mark-original",      "#C68A4E", "#1A1A1A"),
    ("mark-braise-sombre", "#C75C24", "#F6EEE7"),
    ("mark-braise-clair",  "#C75C24", "#161316"),
    ("mark-mono-blanc",    "#F6EEE7", "#F6EEE7"),
    ("mark-mono-noir",     "#161316", "#161316"),
    ("mark-mono-orange",   "#C75C24", "#C75C24"),
]:
    write(f"{name}.svg",
          f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB[0]} {VB[1]} {VB[2]} {VB[3]}" '
          f'width="{VB[2]}" height="{VB[3]}">\n{shapes(gold, dark, name)}\n</svg>\n')

# ================================================================ HORIZONTAL
W, H = 900, 300
MSC = 0.3148
MW, MH = mark_ink_size(MSC)                   # 213 x 255
GAP = 70
TX = 24 + MW + GAP                            # depart du texte
TSIZE, TLS = 150, 18

def horizontal(name, gold, dark, txt, bg=None, grad=None, tagline=False):
    body, defs = [], ""
    if grad:
        defs = ('  <defs><linearGradient id="gr" x1="0" y1="0" x2="0.6" y2="1">'
                '<stop offset="0%" stop-color="#FFFFFF"/><stop offset="46%" stop-color="#EBA376"/>'
                '<stop offset="100%" stop-color="#C75C24"/></linearGradient></defs>\n')
    body.append(mark_group(grad or gold, dark, MSC, 24, (H - MH) / 2, name))
    cap = TSIZE * CAP
    if tagline:
        tsz = 24
        tls = ls_for_width(TAGLINE, tsz, "regular", 563.8)
        tcap, g2 = tsz * CAP, 20
        top = (H - (cap + g2 + tcap)) / 2
        l1, _ = line("TALOS", TSIZE, TLS, "bold", txt, TX, top + cap)
        l2, _ = line(TAGLINE, tsz, tls, "regular", txt, TX, top + cap + g2 + tcap)
        body += [l1, l2]
    else:
        l1, _ = line("TALOS", TSIZE, TLS, "bold", txt, TX, (H + cap) / 2)
        body.append(l1)
    write(f"{name}.svg", svg(W, H, defs + "\n".join(body), bg))

horizontal("lockup-original",      "#C68A4E", "#1A1A1A", "#1A1A1A")
horizontal("lockup-braise-sombre", "#C75C24", "#F6EEE7", "#F6EEE7", bg="#161316")
horizontal("lockup-braise-clair",  "#C75C24", "#161316", "#161316", bg="#FBF6F2")
horizontal("lockup-mono-blanc",    "#F6EEE7", "#F6EEE7", "#F6EEE7")
horizontal("lockup-mono-noir",     "#161316", "#161316", "#161316")
horizontal("lockup-degrade",       None, "#F6EEE7", "#F6EEE7", bg="#161316", grad="url(#gr)")
horizontal("lockup-slogan-original",      "#C68A4E", "#1A1A1A", "#1A1A1A", tagline=True)
horizontal("lockup-slogan-braise-sombre", "#C75C24", "#F6EEE7", "#F6EEE7", bg="#161316", tagline=True)
horizontal("lockup-slogan-braise-clair",  "#C75C24", "#161316", "#161316", bg="#FBF6F2", tagline=True)

# ================================================================ VERTICAL
VW, VH = 640, 616
VSC = 0.3874
VMW, VMH = mark_ink_size(VSC)
V_T, V_TAG = 118, 20
V_TCAP, V_TAGCAP = V_T * CAP, V_TAG * CAP
G1, G2, TOP = 64, 24, 56
TALOS_W = 446.9

def vertical(name, gold, dark, txt, tagcol, bg=None):
    body = [mark_group(gold, dark, VSC, (VW - VMW) / 2, TOP, name)]
    b1 = TOP + VMH + G1 + V_TCAP
    b2 = b1 + G2 + V_TAGCAP
    l1, w1 = line("TALOS", V_T, 15, "bold", txt, (VW - TALOS_W) / 2, b1)
    tls = ls_for_width(TAGLINE, V_TAG, "regular", TALOS_W)
    _, btag, _ = text_path(TAGLINE, V_TAG, tls, "regular")
    l2, _ = line(TAGLINE, V_TAG, tls, "regular", tagcol, (VW - (btag[2] - btag[0])) / 2, b2)
    write(f"{name}.svg", svg(VW, VH, "\n".join(body + [l1, l2]), bg))

vertical("lockup-vertical-original", "#C68A4E", "#1A1A1A", "#1A1A1A", "#7a7068")
vertical("lockup-vertical-sombre",   "#C75C24", "#F6EEE7", "#F6EEE7", "#BABABA", bg="#161316")
vertical("lockup-vertical-clair",    "#C75C24", "#161316", "#161316", "#7a7068", bg="#FBF6F2")

# ================================================================ USAGES
# avatar 1080 avec glow ember
ASC = 0.8
AW, AH = mark_ink_size(ASC)
glow = ('  <defs><radialGradient id="glow" cx="50%" cy="52%" r="46%">'
        '<stop offset="0%" stop-color="#F6C9A6" stop-opacity="0.42"/>'
        '<stop offset="32%" stop-color="#E07E45" stop-opacity="0.26"/>'
        '<stop offset="68%" stop-color="#C75C24" stop-opacity="0.09"/>'
        '<stop offset="100%" stop-color="#161316" stop-opacity="0"/>'
        '</radialGradient></defs>\n  <rect width="1080" height="1080" fill="url(#glow)"/>\n')
write("avatar-1080.svg", svg(1080, 1080,
      glow + mark_group("#C75C24", "#F6EEE7", ASC, (1080 - AW) / 2, (1080 - AH) / 2, "avatar"), bg="#161316"))

# banniere 1600x600 : lockup avec slogan + glow
BW, BH = 1600, 600
bglow = ('  <defs><radialGradient id="glow2" cx="34%" cy="52%" r="42%">'
         '<stop offset="0%" stop-color="#F6C9A6" stop-opacity="0.40"/>'
         '<stop offset="34%" stop-color="#E07E45" stop-opacity="0.22"/>'
         '<stop offset="70%" stop-color="#C75C24" stop-opacity="0.07"/>'
         '<stop offset="100%" stop-color="#161316" stop-opacity="0"/>'
         '</radialGradient></defs>\n  <rect width="1600" height="600" fill="url(#glow2)"/>\n')
inner = (D / "lockup-slogan-braise-sombre.svg").read_text()
inner = inner.split("\n", 1)[1].rsplit("</svg>", 1)[0]
inner = inner.replace('<rect width="900" height="300" fill="#161316"/>', "").strip()
inner = inner.replace("cut-lockup-slogan-braise-sombre", "cut-banniere")
write("banniere-1600x600.svg", svg(BW, BH,
      bglow + f'  <g transform="translate({(BW-900)/2:.0f},{(BH-300)/2:.0f})">\n{inner}\n  </g>', bg="#161316"))

# favicon 64
FSC = 0.058
FW, FH = mark_ink_size(FSC)
write("favicon.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">\n'
      '  <rect width="64" height="64" rx="12" fill="#161316"/>\n'
      + mark_group("#C75C24", "#F6EEE7", FSC, (64 - FW) / 2, (64 - FH) / 2, "fav", simple=True) + "\n</svg>\n")

print("OK —", len(list(D.glob("*.svg"))), "SVG generes")
