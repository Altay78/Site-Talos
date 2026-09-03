#!/usr/bin/env python3
"""Talos — logo. Marteau-T + eclair, sans toit.
Texte vectorise : aucune dependance a une police installee."""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from textpath import text_path

D = pathlib.Path(__file__).parent
TAGLINE = "AU SERVICE DE VOTRE TEMPS"
CAP = 0.714          # hauteur de capitale Helvetica Neue / corps
GAP = 16             # respiration entre le T et l'eclair qui passe derriere

# ============================================================ SYMBOLE
VB  = (253, 302, 472, 550)      # cadrage serre sur l'encre
INK = (253, 302, 725, 852)

T_PATH = ("M 310 302 L 725 302 L 688 406 L 558 406 L 502 640 L 372 640 L 400 406 L 362 406 "
          "C 338 409 316 430 300 457 C 291 472 265 468 258 447 "
          "C 250 420 255 389 263 363 C 276 324 288 302 310 302 Z")
BOLT   = "M 494 536 L 642 536 L 399 852 L 459 684 Z"

def shapes(gold, dark, uid, indent="  ", split=True):
    """L'eclair passe derriere le T, avec une respiration constante."""
    i = indent
    return (
        f'{i}<mask id="cut-{uid}" maskUnits="userSpaceOnUse" x="{VB[0]}" y="{VB[1]}" '
        f'width="{VB[2]}" height="{VB[3]}">\n'
        f'{i}  <rect x="{VB[0]}" y="{VB[1]}" width="{VB[2]}" height="{VB[3]}" fill="#fff"/>\n'
        f'{i}  <path d="{T_PATH}" fill="#000" stroke="#000" stroke-width="{2*GAP}" '
        f'stroke-linejoin="round"/>\n'
        f'{i}</mask>\n'
        f'{i}<g mask="url(#cut-{uid})"><path d="{BOLT}" fill="{gold if split else dark}"/></g>\n'
        f'{i}<path d="{T_PATH}" fill="{dark}"/>')

def mark_group(gold, dark, scale, ink_left, ink_top, uid, indent="  ", split=True):
    tx = ink_left - (INK[0]-VB[0])*scale
    ty = ink_top  - (INK[1]-VB[1])*scale
    return (f'{indent}<g transform="translate({tx:.2f},{ty:.2f}) scale({scale:.5f}) '
            f'translate({-VB[0]},{-VB[1]})">\n{shapes(gold, dark, uid, indent+"  ", split)}\n{indent}</g>')

def ink_size(scale):
    return (INK[2]-INK[0])*scale, (INK[3]-INK[1])*scale

# ============================================================ TEXTE
def line(text, size, ls, weight, fill, ink_left, baseline, indent="  "):
    d, b, _ = text_path(text, size, ls, weight)
    return (f'{indent}<g transform="translate({ink_left-b[0]:.2f},{baseline:.2f})">'
            f'<path d="{d}" fill="{fill}"/></g>')

def ls_for_width(text, size, weight, target):
    _, b, _ = text_path(text, size, 0, weight)
    return (target - (b[2]-b[0])) / (len(text)-1)

def svg(w, h, body, bg=None):
    rect = f'\n  <rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}">{rect}\n{body}\n</svg>\n')

def write(name, content):
    (D/name).write_text(content)

# ============================================================ MARK SEUL
for name, gold, dark, split in [
        ("mark-braise-clair",  "#C75C24", "#161316", True),
        ("mark-braise-sombre", "#C75C24", "#F6EEE7", True),
        ("mark-original",      "#C68A4E", "#1A1A1A", True),
        ("mark-mono-noir",     "#161316", "#161316", False),
        ("mark-mono-blanc",    "#F6EEE7", "#F6EEE7", False),
        ("mark-mono-orange",   "#C75C24", "#C75C24", False)]:
    write(f"{name}.svg",
          f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB[0]} {VB[1]} {VB[2]} {VB[3]}" '
          f'width="{VB[2]}" height="{VB[3]}">\n{shapes(gold, dark, name, split=split)}\n</svg>\n')

# ============================================================ LOCKUP HORIZONTAL
H, MSC = 300, 0.4400
# La queue de l'eclair est fine : on centre sur la boite OPTIQUE (bas a 770),
# pas sur l'encre reelle (852), sinon le mark pend trop bas.
OPT_BOTTOM = 770
MW, MH = ink_size(MSC)
MH_OPT = (OPT_BOTTOM - INK[1]) * MSC
TX = 24 + MW + 58
TSIZE, TLS, TALOS_W = 150, 18, 563.8
W = round(TX + TALOS_W + 24)

def horizontal(name, gold, dark, txt, bg=None, tagline=False, split=True):
    body = [mark_group(gold, dark, MSC, 24, (H-MH_OPT)/2, name, split=split)]
    cap = TSIZE*CAP
    if tagline:
        tsz = 24
        tls = ls_for_width(TAGLINE, tsz, "regular", TALOS_W)
        tcap, g2 = tsz*CAP, 20
        top = (H - (cap+g2+tcap))/2
        body.append(line("TALOS", TSIZE, TLS, "bold", txt, TX, top+cap))
        body.append(line(TAGLINE, tsz, tls, "regular", txt, TX, top+cap+g2+tcap))
    else:
        body.append(line("TALOS", TSIZE, TLS, "bold", txt, TX, (H+cap)/2))
    write(f"{name}.svg", svg(W, H, "\n".join(body), bg))

horizontal("lockup-slogan-braise-clair",  "#C75C24", "#161316", "#161316", bg="#FBF6F2", tagline=True)
horizontal("lockup-slogan-braise-sombre", "#C75C24", "#F6EEE7", "#F6EEE7", bg="#161316", tagline=True)
horizontal("lockup-slogan-original",      "#C68A4E", "#1A1A1A", "#1A1A1A", tagline=True)
horizontal("lockup-braise-clair",  "#C75C24", "#161316", "#161316", bg="#FBF6F2")
horizontal("lockup-braise-sombre", "#C75C24", "#F6EEE7", "#F6EEE7", bg="#161316")
horizontal("lockup-original",      "#C68A4E", "#1A1A1A", "#1A1A1A")
horizontal("lockup-mono-noir",  "#161316", "#161316", "#161316", split=False)
horizontal("lockup-mono-blanc", "#F6EEE7", "#F6EEE7", "#F6EEE7", split=False)

# ============================================================ LOCKUP VERTICAL
VW, VSC = 620, 0.5200
VMW, VMH = ink_size(VSC)
V_T, V_TAG = 118, 20
V_TCAP, V_TAGCAP = V_T*CAP, V_TAG*CAP
G1, G2, TOP = 54, 22, 50
VH = round(TOP + VMH + G1 + V_TCAP + G2 + V_TAGCAP + TOP)
TALOS_W_V = 446.9

def vertical(name, gold, dark, txt, tagcol, bg=None):
    body = [mark_group(gold, dark, VSC, (VW-VMW)/2, TOP, name)]
    b1 = TOP + VMH + G1 + V_TCAP
    b2 = b1 + G2 + V_TAGCAP
    body.append(line("TALOS", V_T, 15, "bold", txt, (VW-TALOS_W_V)/2, b1))
    tls = ls_for_width(TAGLINE, V_TAG, "regular", TALOS_W_V)
    _, bt, _ = text_path(TAGLINE, V_TAG, tls, "regular")
    body.append(line(TAGLINE, V_TAG, tls, "regular", tagcol, (VW-(bt[2]-bt[0]))/2, b2))
    write(f"{name}.svg", svg(VW, VH, "\n".join(body), bg))

vertical("lockup-vertical-clair",    "#C75C24", "#161316", "#161316", "#7a7068", bg="#FBF6F2")
vertical("lockup-vertical-sombre",   "#C75C24", "#F6EEE7", "#F6EEE7", "#BABABA", bg="#161316")
vertical("lockup-vertical-original", "#C68A4E", "#1A1A1A", "#1A1A1A", "#7a7068")

# ============================================================ USAGES
ASC = 1.28                                   # mark ~700 de haut dans 1080
AW, AH = ink_size(ASC)
glow = ('  <defs><radialGradient id="glow" cx="50%" cy="52%" r="46%">'
        '<stop offset="0%" stop-color="#F6C9A6" stop-opacity="0.42"/>'
        '<stop offset="32%" stop-color="#E07E45" stop-opacity="0.26"/>'
        '<stop offset="68%" stop-color="#C75C24" stop-opacity="0.09"/>'
        '<stop offset="100%" stop-color="#161316" stop-opacity="0"/></radialGradient></defs>\n'
        '  <rect width="1080" height="1080" fill="url(#glow)"/>\n')
write("avatar-1080.svg", svg(1080, 1080,
      glow + mark_group("#C75C24", "#F6EEE7", ASC, (1080-AW)/2, (1080-AH)/2, "avatar"), bg="#161316"))

BW, BH = 1600, 600
bglow = ('  <defs><radialGradient id="glow2" cx="34%" cy="52%" r="42%">'
         '<stop offset="0%" stop-color="#F6C9A6" stop-opacity="0.40"/>'
         '<stop offset="34%" stop-color="#E07E45" stop-opacity="0.22"/>'
         '<stop offset="70%" stop-color="#C75C24" stop-opacity="0.07"/>'
         '<stop offset="100%" stop-color="#161316" stop-opacity="0"/></radialGradient></defs>\n'
         '  <rect width="1600" height="600" fill="url(#glow2)"/>\n')
inner = (D/"lockup-slogan-braise-sombre.svg").read_text()
inner = inner.split("\n", 1)[1].rsplit("</svg>", 1)[0]
inner = inner.replace(f'<rect width="{W}" height="{H}" fill="#161316"/>', "").strip()
inner = inner.replace("cut-lockup-slogan-braise-sombre", "cut-banniere")
write("banniere-1600x600.svg", svg(BW, BH,
      bglow + f'  <g transform="translate({(BW-W)/2:.0f},{(BH-H)/2:.0f})">\n{inner}\n  </g>', bg="#161316"))

FSC = 0.082
FW, FH = ink_size(FSC)
write("favicon.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">\n'
      '  <rect width="64" height="64" rx="12" fill="#161316"/>\n'
      + mark_group("#C75C24", "#F6EEE7", FSC, (64-FW)/2, (64-FH)/2, "fav") + "\n</svg>\n")

print(f"OK — {len(list(D.glob('*.svg')))} SVG   lockup {W}x{H}   vertical {VW}x{VH}")
