"""Convertit du texte Helvetica Neue en tracés SVG (plus de dependance a la police)."""
from fontTools.ttLib import TTCollection
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.misc.transform import Transform

TTC = "/System/Library/Fonts/HelveticaNeue.ttc"
_IDX = {"regular": 0, "bold": 1, "medium": 10}
_cache = {}

def _font(weight):
    if weight not in _cache:
        _cache[weight] = TTCollection(TTC).fonts[_IDX[weight]]
    return _cache[weight]

def _kern_pairs(f):
    """Recupere le crenage GPOS paire-a-paire (ce que fait le navigateur par defaut)."""
    pairs = {}
    if "GPOS" not in f:
        return pairs
    from fontTools.ttLib.tables.otTables import LookupType
    for lookup in f["GPOS"].table.LookupList.Lookup:
        subs = list(lookup.SubTable)
        if lookup.LookupType == 9:  # extension
            subs = [s.ExtSubTable for s in subs]
        for st in subs:
            if getattr(st, "LookupType", None) == 2 or st.__class__.__name__ == "PairPos":
                if getattr(st, "Format", None) == 1 and getattr(st, "PairSet", None):
                    cov = st.Coverage.glyphs
                    for g1, ps in zip(cov, st.PairSet):
                        for rec in ps.PairValueRecord:
                            v = rec.Value1
                            if v is not None and getattr(v, "XAdvance", 0):
                                pairs[(g1, rec.SecondGlyph)] = v.XAdvance
                elif getattr(st, "Format", None) == 2:
                    c1 = st.ClassDef1.classDefs; c2 = st.ClassDef2.classDefs
                    cov = set(st.Coverage.glyphs)
                    byc1 = {}
                    for g, c in c1.items():
                        byc1.setdefault(c, []).append(g)
                    byc2 = {}
                    for g, c in c2.items():
                        byc2.setdefault(c, []).append(g)
                    for i, rec1 in enumerate(st.Class1Record):
                        for j, rec2 in enumerate(rec1.Class2Record):
                            v = rec2.Value1
                            xa = getattr(v, "XAdvance", 0) if v is not None else 0
                            if not xa:
                                continue
                            for g1 in byc1.get(i, []):
                                if g1 not in cov:
                                    continue
                                for g2 in byc2.get(j, []):
                                    pairs[(g1, g2)] = xa
    return pairs

def text_path(text, size, letter_spacing=0.0, weight="bold", kerning=True):
    """Renvoie (d, bbox, advance) — ligne de base en y=0, depart en x=0."""
    f = _font(weight)
    upem = f["head"].unitsPerEm
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    hmtx = f["hmtx"]
    kern = _kern_pairs(f) if kerning else {}
    s = size / upem
    sp = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    bp = BoundsPen(gs)
    x = 0.0
    names = [cmap[ord(c)] for c in text]
    for i, gn in enumerate(names):
        if i:
            k = kern.get((names[i - 1], gn), 0)
            x += k * s
        t = Transform(s, 0, 0, -s, x, 0)
        gs[gn].draw(TransformPen(sp, t))
        gs[gn].draw(TransformPen(bp, t))
        x += hmtx[gn][0] * s + letter_spacing
    x -= letter_spacing  # pas d'espacement apres la derniere lettre
    return sp.getCommands(), bp.bounds, x
