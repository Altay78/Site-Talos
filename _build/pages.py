# -*- coding: utf-8 -*-
"""Compose les pages autonomes du site (simulateur, blog, 404).

Chaque page est un fichier HTML autonome : même coquille que les autres pages
du site (tokens Braise + barre flottante + pied de page + bascule de thème),
puis son CSS/markup/JS propre. Les morceaux partagés vivent dans _build/parts/
et ont été extraits une fois d'index.html — la page de référence.

    python3 _build/pages.py
"""
import os, io, sys

WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
P = WEB + '_build/parts/'


def part(name):
    return io.open(P + name, encoding='utf-8').read()


SHELL_CSS = part('shell.css')
NAV = part('nav.html')
FOOTER = part('footer.html')
SHELL_JS = part('shell.js')


def head(title, desc, og_title=None, og_desc=None, css='', noindex=False):
    return u"""<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
<meta charset="utf-8">
<script>(function(){try{var t=localStorage.getItem('talos-theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}})();</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title>
<meta name="author" content="Talos">
<meta name="description" content="%s">
<meta property="og:title" content="%s">
<meta property="og:description" content="%s">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">%s
<link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>
%s
%s
</style>
</head>
""" % (title, desc, og_title or title, og_desc or desc,
       u'\n<meta name="robots" content="noindex">' if noindex else u'',
       SHELL_CSS, css)


def page(fname, title, desc, css, body, js, og_title=None, og_desc=None,
         nav=True, footer=True, noindex=False):
    out = head(title, desc, og_title, og_desc, css, noindex)
    out += u'<body>\n<main>\n\n'
    if nav:
        out += NAV + u'\n\n'
    out += body
    if footer:
        out += u'\n\n' + FOOTER
    out += u'\n</main>\n\n<script>\n' + SHELL_JS + u'\n' + js + u'\n</script>\n</body>\n</html>\n'
    io.open(WEB + fname, 'w', encoding='utf-8').write(out)
    print(u'écrit : %s (%d octets)' % (fname, len(out)))


# ═══════════════════════════════════════════════════════════════════════════
#  1 · SIMULATEUR — page dédiée : coût de l'administratif + simulateur de ROI
# ═══════════════════════════════════════════════════════════════════════════

GAINS_CSS = part('gains.css')
GAINS_HTML = part('gains.html')
GAINS_JS = part('gains.js')

SIM_CSS = part('sim-page.css') + u'\n' + GAINS_CSS + u'\n' + part('roi.css') + u'\n' + part('roi-extra.css')
SIM_BODY = part('sim-hero.html') + u'\n' + GAINS_HTML + u'\n' + part('roi.html') + u'\n' + part('sim-cta.html')
SIM_JS = GAINS_JS + u'\n' + part('roi.js')

# ⚠️  simulateur.html a DIVERGÉ de ses parts : la page en ligne contient un
#     panneau « ROI express » (roiQuick*, gPresets, gTotC/gTotT) et ~16 Ko de
#     CSS/JS qui ne sont dans aucun fichier de _build/parts/. Régénérer la page
#     les efface — c'est arrivé le 02/09/2026. Tant que les parts n'ont pas été
#     remises à niveau, la génération est volontairement désactivée.
#     Pour la réactiver une fois les parts à jour : REBUILD_SIM=1 python3 _build/pages.py
if os.environ.get('REBUILD_SIM'):
    page('simulateur.html',
     u"Simulateur — Talos | Ce que votre administratif vous coûte vraiment",
         u"Calculez en 30 secondes le temps et l'argent que vous perdez chaque mois "
         u"sur vos devis, relances et factures — et ce que Talos vous rend.",
         SIM_CSS, SIM_BODY, SIM_JS,
         og_title=u"Combien vous coûte votre paperasse ? — Simulateur Talos",
         og_desc=u"Vos chiffres, pas les nôtres. Deux simulateurs : le coût réel de "
                 u"votre administratif, et le chiffre d'affaires que vos devis laissent filer.")


# ═══════════════════════════════════════════════════════════════════════════
#  2 · BLOG — index éditorial par rubriques
# ═══════════════════════════════════════════════════════════════════════════

page('blog.html',
     u"Blog — Talos | Devis, relances et facturation pour les artisans du BTP",
     u"Guides concrets, cas de chantier et méthodes d'automatisation pour les "
     u"entreprises du bâtiment : devis, relances, facturation électronique 2026, trésorerie.",
     part('blog.css'), part('blog.html.part'), part('blog.js'),
     og_title=u"Le carnet de chantier — le blog Talos",
     og_desc=u"Devis, relances, facturation 2026, trésorerie : des méthodes "
             u"applicables dès demain sur vos chantiers.")


# ═══════════════════════════════════════════════════════════════════════════
#  3 · 404 — « notre chantier n'est pas encore là »
# ═══════════════════════════════════════════════════════════════════════════

# ── bouton « Parler à quelqu'un » ─────────────────────────────────────────
# Numéro WhatsApp au format international, sans « + » ni espaces
# (ex. '33612345678'). Laissé vide, le bouton renvoie sur la prise de
# rendez-vous : mieux vaut ça qu'un lien wa.me qui ne mène nulle part.
WHATSAPP = ''
WA_MSG = u"Bonjour, je cherchais une page du site Talos qui n'existe plus."

WA_ICON = (
    u'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
    u'<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1'
    u'l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1'
    u'-.6.8-.7 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2a.4.4 0 0 0 0-.4c0-.1-.5-1.3'
    u'-.7-1.7s-.4-.4-.5-.4h-.4a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.8 2 4.6 4.6 0 0 0 1 2.5 10.7 10.7'
    u' 0 0 0 4.1 3.6c1.5.6 2.1.7 2.9.6a2.4 2.4 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1z"/></svg>')

if WHATSAPP:
    from urllib.parse import quote
    CONTACT = {
        'HREF': u'https://wa.me/%s?text=%s' % (WHATSAPP, quote(WA_MSG.encode('utf-8'))),
        'ATTR': u' target="_blank" rel="noopener"',
        'ICON': WA_ICON,
    }
else:
    CONTACT = {'HREF': u'reserver.html', 'ATTR': u'', 'ICON': u''}

_c404 = part('404.html.part')
for _k, _v in CONTACT.items():
    # concaténation, pas de %-format : « %% » y serait réduit à un seul « % »
    _c404 = _c404.replace(u'%%CONTACT_' + _k + u'%%', _v)

page('404.html',
     u"Page introuvable — Talos",
     u"Cette page n'existe pas (encore). Retour à l'accueil Talos.",
     part('404.css'), _c404, part('404.js'),
     nav=False, footer=False, noindex=True)


# ═══════════════════════════════════════════════════════════════════════════
#  4 · LES PAGES ASSISTANT — une par « collègue », toutes sur le même gabarit.
#      Les contenus vivent dans _build/assistants.py ; la mise en forme est
#      commune (asst.css = bloc 1, b2/b3/b4.css = les suivants).
# ═══════════════════════════════════════════════════════════════════════════

import assistants

ASSIST_CSS = (part('asst.css') + u'\n' + part('b2.css') + u'\n'
              + part('b3.css') + u'\n' + part('b4.css'))
ASSIST_JS = part('b2.js') + u'\n' + part('b4.js')

page('offres.html',
     u"Offres — Talos | Votre équipe de cinq assistants IA",
     u"Cinq assistants spécialisés qui gèrent devis, facturation, trésorerie, relation client "
     u"et administratif pendant que vous êtes sur le chantier. Mise en place incluse.",
     part('asst.css') + u'\n' + part('offres.css'), assistants.hub(), u'',
     og_title=u"Votre équipe Talos — cinq assistants qui travaillent pour vous",
     og_desc=u"Devis, facturation, trésorerie, relation client, administratif : chaque assistant "
             u"a ses missions. Vous prenez ceux dont vous avez besoin.")


for _a in assistants.ASSISTANTS:
    page('assistant-%s.html' % _a['slug'], _a['titre'], _a['desc'],
         ASSIST_CSS, assistants.corps(_a), ASSIST_JS)


# ═══════════════════════════════════════════════════════════════════════════
#  4 · les menus de tout le site sont réalignés dans la foulée : sans ça les
#      pages qu'on vient d'écrire n'auraient pas leur aria-current="page"
# ═══════════════════════════════════════════════════════════════════════════
import nav_sync
for _p in nav_sync.PAGES + ['assistant-%s.html' % a['slug'] for a in assistants.ASSISTANTS]:
    print(u'%-24s %s' % nav_sync.sync(_p))
