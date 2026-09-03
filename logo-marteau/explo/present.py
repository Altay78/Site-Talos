#!/usr/bin/env python3
import pathlib, sys
D = pathlib.Path(__file__).parent
sys.path.insert(0, str(D.parent))
from textpath import text_path
from explo import HEAD, HANDLE, roof, VB, GAP, KINDS

CAP = 0.714; TAGLINE = "AU SERVICE DE VOTRE TEMPS"
INK = (164, 64, 841, 884); VBt = (150, 58, 700, 826)
OLD_T = ("M 310 302 L 725 302 L 688 406 L 558 406 L 502 640 L 372 640 L 400 406 L 362 406 "
         "C 338 409 316 430 300 457 C 291 472 265 468 258 447 "
         "C 250 420 255 389 263 363 C 276 324 288 302 310 302 Z")
OLD_BOLT = "M 494 536 L 642 536 L 399 852 L 459 684 Z"

CSS = """<!doctype html><meta charset="utf-8"><title>Talos — pistes</title><style>
body{margin:0;background:#161316;color:#F6EEE7;font:400 14px/1.5 "Helvetica Neue",Helvetica,Arial,sans-serif;padding:34px}
h1{font-size:15px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;margin:0 0 6px}
p.lede{color:#BABABA;margin:0 0 26px;max-width:660px;font-size:13px}
h2{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#BABABA;font-weight:500;margin:0 0 14px}
section{margin-bottom:22px;border-top:1px solid #2A211D;padding-top:20px}
.row{display:flex;gap:13px;flex-wrap:wrap}
.cell{background:#1E1A18;border:1px solid #2A211D;border-radius:12px;padding:16px;display:grid;place-items:center;min-height:186px;min-width:158px}
.cell.wide{min-height:0;min-width:0;padding:18px 22px;margin-bottom:8px;justify-items:start}
.cell.light{background:#FBF6F2;border-color:#e6dcd4}
.cap{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#7a7068;margin-top:8px;text-align:center;max-width:170px}
.cap2{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#E07E45;margin:0 0 10px}
.lk{margin-bottom:24px}
</style>"""

def old_mark(uid, gold, dark):
    return (f'<mask id="o{uid}" maskUnits="userSpaceOnUse" x="150" y="58" width="700" height="826">'
            f'<rect x="150" y="58" width="700" height="826" fill="#fff"/>'
            f'<path d="{OLD_T}" fill="#000" stroke="#000" stroke-width="{2*GAP}" stroke-linejoin="round"/></mask>'
            f'<g mask="url(#o{uid})">'
            f'<path d="M 174 350 L 500 84 L 826 350" fill="none" stroke="{gold}" stroke-width="31"/>'
            f'<path d="M 208 362 L 500 124 L 792 362" fill="none" stroke="{gold}" stroke-width="8"/>'
            f'<path d="{OLD_BOLT}" fill="{gold}"/></g><path d="{OLD_T}" fill="{dark}"/>')

def new_mark(uid, kind, gold, dark, split=True):
    return (f'<mask id="n{uid}" maskUnits="userSpaceOnUse" x="150" y="58" width="700" height="826">'
            f'<rect x="150" y="58" width="700" height="826" fill="#fff"/>'
            f'<path d="{HEAD}" fill="#000" stroke="#000" stroke-width="{2*GAP}" stroke-linejoin="round"/>'
            f'<path d="{HANDLE}" fill="#000" stroke="#000" stroke-width="{2*GAP}" stroke-linejoin="round"/></mask>'
            f'<g mask="url(#n{uid})">{roof(kind, gold)}</g>'
            f'<path d="{HEAD}" fill="{dark}"/><path d="{HANDLE}" fill="{gold if split else dark}"/>')

def wrap(inner, h):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}" style="height:{h}px;width:auto">{inner}</svg>'

def lockup(uid, kind, gold, dark, txt, bg, h=110):
    W, H, MSC = 900, 300, 0.3148
    MW = (INK[2]-INK[0])*MSC; MH = (INK[3]-INK[1])*MSC
    tx = 24 - (INK[0]-VBt[0])*MSC; ty = (H-MH)/2 - (INK[1]-VBt[1])*MSC
    TX = 24 + MW + 62; cap = 150*CAP; tsz = 24
    _, b0, _ = text_path(TAGLINE, tsz, 0, "regular")
    tls = (563.8-(b0[2]-b0[0]))/(len(TAGLINE)-1)
    tcap, g2 = tsz*CAP, 20
    top = (H-(cap+g2+tcap))/2
    d1, bb1, _ = text_path("TALOS", 150, 18, "bold")
    d2, bb2, _ = text_path(TAGLINE, tsz, tls, "regular")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" style="height:{h}px;width:auto">'
            f'<rect width="{W}" height="{H}" fill="{bg}"/>'
            f'<g transform="translate({tx:.2f},{ty:.2f}) scale({MSC}) translate({-VBt[0]},{-VBt[1]})">'
            f'{new_mark(uid,kind,gold,dark)}</g>'
            f'<g transform="translate({TX-bb1[0]:.2f},{top+cap:.2f})"><path d="{d1}" fill="{txt}"/></g>'
            f'<g transform="translate({TX-bb2[0]:.2f},{top+cap+g2+tcap:.2f})"><path d="{d2}" fill="{txt}"/></g></svg>')

BRAISE = ("#C75C24", "#F6EEE7"); OR = ("#C68A4E", "#1A1A1A"); L = dict(KINDS)

for k,_ in KINDS:
    for tag,(g,dk) in [("sombre",BRAISE),("clair",OR)]:
        (D/f"mark-{k}-{tag}.svg").write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}" width="700" height="826">\n'
            f'{new_mark(f"x{k}{tag}",k,g,dk)}\n</svg>\n')

fusion = "".join([
 f'<div><div class="cell">{wrap(old_mark("1",*BRAISE),190)}</div><div class="cap">avant — deux formes</div></div>',
 f'<div><div class="cell">{wrap(new_mark("1","agent",*BRAISE),190)}</div><div class="cap">après — le manche EST l\'éclair</div></div>',
 f'<div><div class="cell">{wrap(old_mark("2","#F6EEE7","#F6EEE7"),190)}</div><div class="cap">avant, mono</div></div>',
 f'<div><div class="cell">{wrap(new_mark("2","agent","#F6EEE7","#F6EEE7",split=False),190)}</div><div class="cap">après, mono</div></div>'])

grid = "".join(f'<div><div class="cell">{wrap(new_mark(f"g{i}",k,*BRAISE),160)}</div>'
               f'<div class="cap">{chr(65+i)} · {L[k]}</div></div>' for i,(k,_) in enumerate(KINDS))

TOP = ["segments","agent","dissolution","circuit"]
locks = "".join(f'<div class="lk"><div class="cap2">{chr(65+TOP.index(k))} · {L[k]}</div>'
                f'<div class="cell wide">{lockup(f"l{i}",k,*BRAISE,"#F6EEE7","#161316",104)}</div>'
                f'<div class="cell wide light">{lockup(f"m{i}",k,*OR,"#1A1A1A","#FBF6F2",104)}</div>'
                f'<div class="cell wide">{lockup(f"s{i}",k,*BRAISE,"#F6EEE7","#161316",46)}</div></div>'
                for i,k in enumerate(TOP))

(D/"index.html").write_text(CSS + f"""
<h1>Marteau + éclair fusionnés — pistes de toit</h1>
<p class="lede">Le manche du marteau <em>est</em> l'éclair : une seule silhouette au lieu de deux formes posées l'une sur l'autre. Le toit est retravaillé pour faire entrer la tech.</p>
<section><h2>1 · La fusion, isolée</h2><div class="row">{fusion}</div></section>
<section><h2>2 · Les six pistes de toit</h2><div class="row">{grid}</div></section>""")

(D/"lockups.html").write_text(CSS + f"""
<h1>En contexte — logo complet</h1>
<p class="lede">Les quatre pistes les plus solides : en grand sur fond sombre, sur fond clair, puis en petit.</p>
{locks}""")
print("ok")
