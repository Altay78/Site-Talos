# -*- coding: utf-8 -*-
"""Compose la page principale Talos  partir du hero de rfrence + 6 sections."""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scoper import scope_css, extract, strip_rules
import da

BASE = "/Users/altaysakalli/Desktop/talos-site/v2-reference/Hero Section.html"
WEB = "/Users/altaysakalli/Sites/talos-intro/web/"
OUT = WEB + "index.html"

base = open(BASE, encoding='utf-8').read()

# ── 1. head de rfrence (Tailwind compil + tokens Braise) ───────────────
head = base[base.find('<head'):base.find('</head>')]
head_end = '</head>'

# CSS mort de l'export : les sections .talos-scroll / .talos-features ne sont
# plus dans la page et traînaient des polices hors DA (Manrope, Inter).
_m = re.search(r'<style>(.*?)</style>', head, re.S)
_clean = strip_rules(_m.group(1), ('.talos-scroll', '.talos-features'))
head = head[:_m.start()] + '<style>' + _clean + '</style>' + head[_m.end():]

# le thème doit être posé avant le premier rendu, sinon l'écran flashe
head = head.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + da.THEME_INIT, 1)

# ── 2. hero : du <section hero> jusqu'avant la section « on se connecte » ──
h0 = base.find('<section class="relative overflow-hidden" data-tsd-source="/src/components/hero.tsx')
h1 = base.find('<section class="section-pad border-t border-border bg-surface" data-tsd-source="/src/components/logo-strip.tsx')
hero = base[h0:h1]
assert h0 > 0 and h1 > h0

# ancrage + navigation recble sur les sections rellement prsentes
hero = hero.replace('<section class="relative overflow-hidden"',
                    '<section id="top" class="relative overflow-hidden"', 1)
# attributs de debug de l'export (data-tsd-source) : inutiles en production
hero = re.sub(r'\sdata-tsd-source="[^"]*"', '', hero)
# l'en-tete de l'export (4 liens figes, logo « T » de gabarit) est remplacee
# par la barre flottante : voir da.nav_html()
hero, n = re.subn(r'<header class="relative z-30">.*?</header>',
                  lambda m: da.nav_html(da.LOGO_MARK, da.TOGGLE_BTN), hero, flags=re.S)
assert n == 1, n
hero = hero.replace('href="#produit"', 'href="#faq"')  # badge Factur-X

# ── 3. sections ────────────────────────────────────────────────────────────
def clean_markup(m):
    m = re.sub(r'<button class="tsw".*?</button>', '', m, flags=re.S)
    m = re.sub(r'<div class="spacer">.*?</div>', '', m, flags=re.S)
    m = re.sub(r'<!--[^>]*?-->', '', m)
    return m.strip()

def clean_script(s):
    s = re.sub(r'/\* preview seulement \*/.*?\}\);', '', s, flags=re.S)
    s = re.sub(r'\n\s*var root\s*=\s*document\.documentElement;', '', s)
    return s.strip()

css_out, body_out, js_out = [], [], []

SECTIONS = [
    # (fichier, classe racine d'origine, classe de scope, prfixe keyframes)
    ('section-story-scroll.html', '.story', '.t-story', 'sy'),
    ('Comment ca marche.html', '.how', '.t-how',  'hw'),
    ('simulateur-roi.html',  None,    '.t-roi',   'ro'),
    ('Fonctionnalit\u00e9s.html', '.cat',  '.t-cat',   'ct'),
    ('section-tarifs.html',  '.price', '.t-price', 'pr'),
    ('section-faq.html',     '.faq',  '.t-faq',   'fq'),
    ('section-footer.html',  '.ft',   '.t-ft',    'ft'),
]

for fname, root_cls, scope, kf in SECTIONS:
    css, markup, scripts = extract(WEB + fname)
    scoped = scope_css(css, scope, root_cls, kf + '_')
    markup = clean_markup(markup)

    if fname == 'section-story-scroll.html':
        markup = markup.replace('<section class="story" id="story">',
                                '<section class="t-story" id="story">')
        # signature du brand book : un mot par grand titre en dgrad
        markup = markup.replace('<h2>Passez aux choses simples avec Talos</h2>',
                                '<h2>Passez aux choses <em>simples</em> avec Talos</h2>')
        # --t était posé sur <html> : nom trop générique pour une page
        # partagée par sept sections. On le porte sur la section elle-même,
        # dont .lede et .steps héritent.
        old = "root.style.setProperty('--t',"
        new = "story.style.setProperty('--t',"
        assert old in scripts[0]
        scripts = [s.replace(old, new) for s in scripts]
        # `.st` existe aussi dans l'audit du simulateur : la requête globale
        # ramassait 8 items au lieu de 3 et update() plantait sur un rail
        # inexistant. On requête dans la section.
        for old in ("document.querySelectorAll('.ph')", "document.querySelectorAll('.st')"):
            assert old in scripts[0], old
            scripts = [s.replace(old, old.replace('document.', 'story.')) for s in scripts]
    elif fname == 'Comment ca marche.html':
        markup = markup.replace('<section class="how" id="how">',
                                '<section class="t-how" id="comment-ca-marche">')
        markup = markup.replace('<h2>Comment ça marche.</h2>',
                                '<h2>Comment ça <em>marche</em>.</h2>')
        # le gabarit rayé restait visible autour de la capture (visible sur
        # mobile, où la carte est plus large que l'image) : on le retire
        # dès qu'un visuel est fourni.
        old = "if (src) { img.src = src; } else { img.remove(); }"
        new = ("if (src) {\n"
               "      img.src = src;\n"
               "      var ph = img.parentNode.querySelector('.empty');\n"
               "      if (ph) { ph.remove(); }\n"
               "    } else { img.remove(); }")
        assert old in scripts[0]
        scripts = [s.replace(old, new) for s in scripts]
    elif fname == 'simulateur-roi.html':
        # pas de conteneur dans le fichier source : on en cre un
        markup = '<section class="t-roi" id="simulateur">\n' + markup + '\n</section>'
        # un seul <h1> par page : le titre du simulateur devient un h2
        markup = markup.replace('<h1>Simulez votre <em>croissance</em></h1>',
                                '<h2 class="roi-title">Simulez votre <em>croissance</em></h2>')
        scoped = scoped.replace('.t-roi h1', '.t-roi .roi-title')
        scoped = da.patch_roi_css(scoped)
        # chelle de risque : rampe laiton  bronze  rouille (jamais de vert)
        for old_c, new_c in da.RISK_COLORS:
            assert old_c in markup, old_c
            markup = markup.replace(old_c, new_c)
        # Intl produit une espace fine insécable (U+202F) : avalée par
        # l'interlettrage négatif de la DA (« 15000 € »). On repasse en
        # espace insécable normale.
        old = ("  var eur  = new Intl.NumberFormat('fr-FR',"
               "{style:'currency',currency:'EUR',maximumFractionDigits:0});")
        new = ("  var eurFmt = new Intl.NumberFormat('fr-FR',"
               "{style:'currency',currency:'EUR',maximumFractionDigits:0});\n"
               "  var eur = { format: function(v){"
               " return eurFmt.format(v).replace(/\\u202f/g,'\\u00a0'); } };")
        assert old in scripts[0]
        scripts = [s.replace(old, new) for s in scripts]
    elif fname == 'Fonctionnalit\u00e9s.html':
        markup = markup.replace('<section class="cat" id="fonctionnalites">',
                                '<section class="t-cat" id="fonctionnalites">')
        # dernier littral hors palette : le contour de la pastille \u00ab impay \u00bb
        scoped = scoped.replace('rgba(209,75,75,.45)',
                                'color-mix(in oklab,var(--rouille) 45%,transparent)')
    elif fname == 'section-tarifs.html':
        markup = markup.replace('<section class="price" id="tarifs">',
                                '<section class="t-price" id="tarifs">')
    elif fname == 'section-faq.html':
        markup = markup.replace('<section class="faq" id="faq">',
                                '<section class="t-faq" id="faq">')
        markup = markup.replace('demande le plus.</h2>', 'demande le <em>plus</em>.</h2>')
        # Helvetica est la police unique du brand book : le titre en Georgia
        # italique repasse dans le traitement des autres titres de section.
        old = ("font-family:var(--serif);font-weight:400;font-style:italic;\n"
               "  font-size:clamp(32px,3.6vw,48px);letter-spacing:-.5px")
        assert old in scoped
        scoped = scoped.replace(old, "font-family:var(--sans);font-weight:800;font-style:normal;\n"
                                     "  font-size:clamp(30px,3.6vw,46px);letter-spacing:-1.5px")
    elif fname == 'section-footer.html':
        markup = markup.replace('<footer class="ft">', '<footer class="t-ft" id="reserver">')
        # logo fig en #F6EEE7 : il doit suivre le thme
        markup = markup.replace('<g fill="#F6EEE7">', '<g fill="currentColor">')
        markup = markup.replace('fill="#F6EEE7" font-weight="600"', 'fill="currentColor" font-weight="600"')
        for lbl, href in [('Accueil', '#top'), ('Automatisations', '#fonctionnalites'),
                          ('Tarifs', '#tarifs'), ('Comment \u00e7a marche', '#comment-ca-marche')]:
            markup = markup.replace('<a href="#">%s</a>' % lbl, '<a href="%s">%s</a>' % (href, lbl))

    css_out.append('/*  %s  */\n%s' % (fname, scoped))
    body_out.append(markup)
    js_out += [clean_script(s) for s in scripts if clean_script(s)]

# ── 4. correctifs d'intgration ────────────────────────────────────────────
FIXES = """
/*  correctifs d'intgration  */
/* le simulateur n'avait pas de conteneur : il vivait directement dans la page */
.t-roi{position:relative;overflow:hidden;line-height:1.6;font-family:var(--sans)}
/* halos : `fixed` dans le fichier source  ils suivaient tout le scroll */
.t-roi .orb{position:absolute}
/* mme largeur de contenu que .section-shell (1180 px) */
.t-roi .wrap{max-width:1228px;padding-left:24px;padding-right:24px}
/* raccords verticaux entre sections */
.t-story,.t-how,.t-roi,.t-cat{border-top:1px solid var(--line)}
"""

out = (base[:base.find('<head')] + head
       + '\n<style>\n' + da.TOKENS + da.NAV_CSS + '\n'
       + '\n\n'.join(css_out) + '\n' + FIXES + da.HERO + da.ROI + da.FOOTER
       + '\n</style>\n'
       + head_end + '\n<body>\n<main>\n'
       + hero + '\n'
       + '\n'.join(body_out)
       + '\n</main>\n<script>\n' + '\n</script>\n<script>\n'.join(js_out)
       + '\n</script>\n<script>' + da.THEME_JS + da.NAV_JS + '</script>\n</body>\n</html>\n')

open(OUT, 'w', encoding='utf-8').write(out)
print('crit :', OUT, len(out), 'octets')
