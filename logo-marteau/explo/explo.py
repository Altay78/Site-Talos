#!/usr/bin/env python3
"""Planche d'exploration v2 — marteau+eclair fusionnes, toits orientes tech."""
import pathlib, math
D = pathlib.Path(__file__).parent
VB = "150 58 700 826"; GAP = 16

HEAD = ("M 310 302 L 725 302 L 688 406 L 362 406 "
        "C 338 409 316 430 300 457 C 291 472 265 468 258 447 "
        "C 250 420 255 389 263 363 C 276 324 288 302 310 302 Z")
HANDLE = "M 400 406 L 558 406 L 500 650 L 560 650 L 356 872 L 430 650 L 342 650 Z"

APEX = (500, 84); LEFT = (174, 350); RIGHT = (826, 350)
ARM = math.hypot(APEX[0]-LEFT[0], APEX[1]-LEFT[1])   # 420.8

def along(end, d):
    """Point a distance d de l'apex, vers `end`."""
    ux = (end[0]-APEX[0])/ARM; uy = (end[1]-APEX[1])/ARM
    return APEX[0]+ux*d, APEX[1]+uy*d

def seg(end, d0, d1, w, c):
    x0,y0 = along(end,d0); x1,y1 = along(end,d1)
    return (f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" '
            f'stroke="{c}" stroke-width="{w}" stroke-linecap="butt"/>')

def roof(kind, c):
    if kind == "segments":          # rythme regulier = donnees
        out = []
        for end in (LEFT, RIGHT):
            d = 0
            while d < ARM - 8:
                out.append(seg(end, d, min(d+76, ARM), 31, c)); d += 76 + 29
        return "".join(out)
    if kind == "dissolution":       # plein au centre -> se disperse aux extremites
        L = [95,74,55,38,23,12]; G = [16,21,26,29,31]; W = [31,27,23,19,15,12]
        out = []
        for end in (LEFT, RIGHT):
            d = 0
            for i,(l,w) in enumerate(zip(L,W)):
                out.append(seg(end, d, min(d+l, ARM), w, c))
                d += l + (G[i] if i < len(G) else 0)
        return "".join(out)
    if kind == "circuit":           # trace + pastilles de circuit
        return (f'<path d="M 174 350 L 500 84 L 826 350" fill="none" stroke="{c}" stroke-width="26"/>'
                f'<circle cx="500" cy="84" r="34" fill="{c}"/>'
                f'<circle cx="174" cy="350" r="27" fill="{c}"/>'
                f'<circle cx="826" cy="350" r="27" fill="{c}"/>')
    if kind == "signal":            # deux chevrons = diffusion
        return (f'<path d="M 174 350 L 500 84 L 826 350" fill="none" stroke="{c}" stroke-width="31"/>'
                f'<path d="M 306 352 L 500 194 L 694 352" fill="none" stroke="{c}" stroke-width="14"/>')
    if kind == "module":            # demi-hexagone = puce
        return (f'<path d="M 186 350 L 330 132 L 670 132 L 814 350" fill="none" stroke="{c}" stroke-width="31"/>'
                f'<path d="M 236 356 L 358 172 L 642 172 L 764 356" fill="none" stroke="{c}" stroke-width="8"/>')
    if kind == "agent":             # toit plein + point d'agent au-dessus
        return (f'<path d="M 174 372 L 500 106 L 826 372" fill="none" stroke="{c}" stroke-width="31"/>'
                f'<path d="M 208 384 L 500 146 L 792 384" fill="none" stroke="{c}" stroke-width="8"/>'
                f'<circle cx="500" cy="76" r="26" fill="{c}"/>')
    raise ValueError(kind)

def mark(uid, kind, gold, dark, split=True):
    r = roof(kind, gold)
    mask = (f'<mask id="k{uid}" maskUnits="userSpaceOnUse" x="150" y="58" width="700" height="826">'
            f'<rect x="150" y="58" width="700" height="826" fill="#fff"/>'
            f'<path d="{HEAD}" fill="#000" stroke="#000" stroke-width="{2*GAP}" stroke-linejoin="round"/>'
            f'<path d="{HANDLE}" fill="#000" stroke="#000" stroke-width="{2*GAP}" stroke-linejoin="round"/></mask>')
    return (f'{mask}<g mask="url(#k{uid})">{r}</g>'
            f'<path d="{HEAD}" fill="{dark}"/><path d="{HANDLE}" fill="{gold if split else dark}"/>')

KINDS = [("dissolution","le toit se dissout en données"),
         ("segments","toit en segments réguliers"),
         ("circuit","tracé de circuit + pastilles"),
         ("signal","chevrons de diffusion"),
         ("agent","toit plein + point d'agent"),
         ("module","demi-hexagone / puce")]

def svg(uid, kind, gold, dark, split=True, h=150):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}" style="height:{h}px;width:auto">'
            f'{mark(uid, kind, gold, dark, split)}</svg>')

blocks = []
for i,(k,lab) in enumerate(KINDS):
    cells = [f'<div class="c"><div class="cell">{svg(f"a{i}",k,"#C75C24","#F6EEE7")}</div><div class="cap">braise</div></div>',
             f'<div class="c"><div class="cell light">{svg(f"b{i}",k,"#C68A4E","#1A1A1A")}</div><div class="cap">or / noir</div></div>',
             f'<div class="c"><div class="cell">{svg(f"c{i}",k,"#F6EEE7","#F6EEE7",split=False)}</div><div class="cap">mono</div></div>',
             f'<div class="c"><div class="cell">{svg(f"d{i}",k,"#C75C24","#F6EEE7",h=54)}</div><div class="cap">petit</div></div>']
    blocks.append(f'<section><h2>{chr(65+i)} · {lab}</h2><div class="row">{"".join(cells)}</div></section>')

(D/"index.html").write_text(f"""<!doctype html><meta charset="utf-8"><title>Talos — pistes</title>
<style>
body{{margin:0;background:#161316;color:#F6EEE7;font:400 14px/1.5 "Helvetica Neue",Helvetica,Arial,sans-serif;padding:34px}}
h1{{font-size:15px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;margin:0 0 6px}}
p.lede{{color:#BABABA;margin:0 0 28px;max-width:640px;font-size:13px}}
h2{{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#BABABA;font-weight:500;margin:0 0 12px}}
section{{margin-bottom:20px;border-top:1px solid #2A211D;padding-top:20px}}
.row{{display:flex;gap:13px;flex-wrap:wrap}}
.cell{{background:#1E1A18;border:1px solid #2A211D;border-radius:12px;padding:16px;display:grid;place-items:center;min-height:180px;min-width:158px}}
.cell.light{{background:#FBF6F2;border-color:#e6dcd4}}
.cap{{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#7a7068;margin-top:8px;text-align:center}}
</style>
<h1>Marteau + éclair fusionnés — variantes de toit</h1>
<p class="lede">Le manche du marteau <em>est</em> l'éclair : une seule silhouette au lieu de deux formes posées l'une sur l'autre. Le toit est retravaillé pour faire entrer la tech.</p>
{"".join(blocks)}""")
print("ok")
