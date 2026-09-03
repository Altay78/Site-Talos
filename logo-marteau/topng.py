#!/usr/bin/env python3
"""Rasterise les SVG en PNG avec Chrome headless (rendu fidele, pas de letterbox)."""
import subprocess, pathlib, re, tempfile
D = pathlib.Path(__file__).parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def export(name, width, transparent=False):
    src = D/f"{name}.svg"
    x, y, w, h = (float(v) for v in re.search(r'viewBox="([\d.\- ]+)"', src.read_text()).group(1).split())
    height = round(width * h / w)
    html = (f'<!doctype html><meta charset="utf-8"><style>'
            f'html,body{{margin:0;padding:0;background:{"transparent" if transparent else "#fff"}}}'
            f'img{{display:block;width:{width}px;height:{height}px}}</style>'
            f'<img src="{src.name}">')
    tmp = D/f"_{name}.html"; tmp.write_text(html)
    out = D/f"{name}.png"
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
                    f"--screenshot={out}", f"--window-size={width},{height}",
                    "--default-background-color=00000000" if transparent else "--default-background-color=ffffffff",
                    f"file://{tmp}"], capture_output=True, timeout=90)
    tmp.unlink()
    from PIL import Image
    im = Image.open(out)
    print(f"{name}.png  {im.size[0]}x{im.size[1]}  (attendu {width}x{height})")

for n, wpx, tr in [("avatar-1080",1080,False), ("banniere-1600x600",1600,False),
                   ("lockup-slogan-braise-clair",1880,False), ("lockup-slogan-braise-sombre",1880,False),
                   ("lockup-vertical-clair",1320,False), ("lockup-vertical-sombre",1320,False),
                   ("lockup-slogan-original",1880,True), ("mark-original",900,True),
                   ("mark-braise-sombre",900,True)]:
    export(n, wpx, tr)
