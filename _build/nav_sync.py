# -*- coding: utf-8 -*-
"""Aligne la barre de navigation, le menu mobile et le pied de page
sur TOUTES les pages du site.

Trois anomalies existaient avant ce script :
  · chaque page retirait son propre lien de la barre (on ne pouvait plus
    savoir où l'on était, et la barre changeait de largeur d'une page
    à l'autre) ;
  · « Simulateurs » pointait sur index.html#simulateur alors que le
    simulateur a désormais sa page ;
  · Blog n'existait dans aucun menu, et espace-client.html n'avait
    pas de barre du tout.

La page courante garde son lien, marqué aria-current="page" : la DA
souligne déjà ce cas (.tnav-links a[aria-current="page"]).

    python3 _build/nav_sync.py
"""
import io, os, re

WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'

# (libellé, href) — l'ordre fait foi partout
LINKS = [
    (u'Offres',             'offres.html'),
    (u'Comment ça marche',  'comment-ca-marche.html'),
    (u'Tarifs',             'tarifs.html'),
    (u'Simulateur',         'simulateur.html'),
    (u'Pourquoi Talos',     'pourquoi-talos.html'),
    (u'Blog',               'blog.html'),
]

PAGES = ['index.html', 'offres.html', 'fonctionnalites.html', 'comment-ca-marche.html',
         'tarifs.html', 'pourquoi-talos.html', 'reserver.html',
         'espace-client.html', 'simulateur.html', 'blog.html']

LOGO_SVG = ('<svg viewBox="253 302 472 550" width="23" height="27" aria-hidden="true">'
            '<mask id="navsync-marteau" maskUnits="userSpaceOnUse" x="253" y="302" width="472" height="550">'
            '<rect x="253" y="302" width="472" height="550" fill="#fff"/>'
            '<path d="M 310 302 L 725 302 L 688 406 L 558 406 L 502 640 L 372 640 L 400 406 L 362 406 C 338 409 316 430 300 457 C 291 472 265 468 258 447 C 250 420 255 389 263 363 C 276 324 288 302 310 302 Z" fill="#000" stroke="#000" stroke-width="32" stroke-linejoin="round"/></mask>'
            '<g mask="url(#navsync-marteau)"><path d="M 494 536 L 642 536 L 399 852 L 459 684 Z" fill="#C75C24"/></g>'
            '<path d="M 310 302 L 725 302 L 688 406 L 558 406 L 502 640 L 372 640 L 400 406 L 362 406 C 338 409 316 430 300 457 C 291 472 265 468 258 447 C 250 420 255 389 263 363 C 276 324 288 302 310 302 Z" fill="currentColor"/></svg>')


# Bascule de thème du menu mobile : sous 600px la pastille de la barre est
# masquée (plus la place), le réglage n'était atteignable nulle part.
# Pas de <div> ici : sync() découpe le menu jusqu'au premier </div>.
M_THEME = (
    u'<button type="button" class="theme-toggle m-theme" aria-label="Changer de thème">'
    u'<svg class="moon" width="17" height="17" viewBox="0 0 24 24" fill="none" '
    u'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'
    u'<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>'
    u'<svg class="sun" width="17" height="17" viewBox="0 0 24 24" fill="none" '
    u'stroke="currentColor" stroke-width="1.9" stroke-linecap="round">'
    u'<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7'
    u'M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>'
    u'<span class="lbl-dark">Mode clair</span>'
    u'<span class="lbl-light">Mode sombre</span></button>')


# ── Le menu « Offres » ────────────────────────────────────────────────────
# Au survol (ou au focus clavier) il déploie l'équipe : un visage, un nom,
# une mission. Aucun <div> ici — sync() découpe la barre jusqu'au premier
# </div> rencontré, un conteneur de plus casserait le remplacement.
EQUIPE = [
    ('commercial',    u'Assistant commercial',    u'Devis, signature, relances',    'assistant-commercial.html'),
    ('tresorerie',    u'Assistante trésorerie',   u'Impayés et prévision',          'assistant-tresorerie.html'),
    ('client',        u'Assistante client',       u'Réponses et rendez-vous',       'assistant-client.html'),
    ('facturation',   u'Assistant facturation',   u'Factures conformes 2026',       'assistant-facturation.html'),
    ('administratif', u'Assistant administratif', u'Tri des mails et classement',   'assistant-administratif.html'),
]
BIENTOT = set()   # les cinq assistants sont disponibles

CHEV = (u'<svg class="tnav-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" '
        u'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" '
        u'stroke-linejoin="round" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg>')
FLECHE = (u'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
          u'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
          u'<path d="M5 12h14M13 6l6 6-6 6"/></svg>')


def offres_html(page):
    items = []
    for slug, nom, mission, href in EQUIPE:
        soon = (u'<i class="tnav-soon">Bientôt</i>' if slug in BIENTOT else u'')
        items.append(
            u'<a class="tnav-ag" href="%s">'
            u'<img src="perso/avatar-%s.webp" alt="" width="36" height="36" loading="lazy" decoding="async">'
            u'<b>%s%s</b><small>%s</small></a>' % (href, slug, nom, soon, mission))
    return (u'<span class="tnav-drop">'
            u'<a class="tnav-drop-t" href="offres.html"%s>Offres%s</a>'
            u'<span class="tnav-pan">%s'
            u'<a class="tnav-pan-all" href="offres.html">Voir toutes les offres%s</a>'
            u'</span></span>' % (cur('offres.html', page), CHEV, u''.join(items), FLECHE))


# La feuille du menu est injectée dans chaque page : index.html embarque sa
# propre copie compilée du style, elle ne lit pas parts/shell.css.
PANEL_CSS = u"""<style id="tnav-drop-css">
.tnav-drop{position:relative;display:inline-flex}
.tnav-drop-t{display:inline-flex;align-items:center;gap:5px}
.tnav-chev{transition:transform .25s cubic-bezier(.16,1,.3,1)}
.tnav-drop:hover .tnav-chev,.tnav-drop:focus-within .tnav-chev{transform:rotate(180deg)}
.tnav-pan{position:absolute;top:100%;left:-18px;z-index:60;
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px;
  width:min(560px,86vw);margin-top:16px;padding:10px;border-radius:20px;
  background:color-mix(in oklab,var(--surface-tint) 96%,transparent);
  border:1px solid var(--border);box-shadow:0 24px 60px rgba(0,0,0,.42);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  opacity:0;visibility:hidden;transform:translateY(-6px);
  transition:opacity .22s ease,transform .22s cubic-bezier(.16,1,.3,1),visibility .22s}
html[data-theme="light"] .tnav-pan{box-shadow:0 24px 60px rgba(40,25,16,.16)}
/* la zone de survol court jusqu'au panneau : sans ça le curseur le perd */
.tnav-drop::after{content:"";position:absolute;top:100%;left:0;right:0;height:18px}
.tnav-drop:hover .tnav-pan,.tnav-drop:focus-within .tnav-pan{
  opacity:1;visibility:visible;transform:translateY(0)}
.tnav-ag{display:grid;grid-template-columns:36px 1fr;column-gap:11px;
  align-items:center;padding:9px 11px;border-radius:14px;
  transition:background .2s ease}
.tnav-ag:hover{background:color-mix(in oklab,var(--ink) 7%,transparent)}
.tnav-ag::after{display:none}
.tnav-ag img{grid-row:1/3;width:36px;height:36px;border-radius:50%;object-fit:cover;
  background:color-mix(in oklab,var(--ink) 8%,transparent)}
.tnav-ag b{display:flex;align-items:center;gap:7px;
  font-size:14px;font-weight:600;letter-spacing:-.2px;color:var(--ink)}
.tnav-ag small{font-size:12.5px;color:var(--ink-soft);letter-spacing:-.1px}
.tnav-soon{font-style:normal;font-size:10px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;padding:2px 7px;border-radius:100px;
  color:var(--indigo);border:1px solid color-mix(in oklab,var(--indigo) 40%,transparent)}
.tnav-pan-all{grid-column:1/-1;display:inline-flex;align-items:center;justify-content:center;
  gap:8px;margin-top:4px;padding:11px;border-radius:14px;
  background:color-mix(in oklab,var(--ink) 5%,transparent);
  font-size:13.5px;font-weight:600;color:var(--ink)}
.tnav-pan-all::after{display:none}
.tnav-pan-all:hover{background:color-mix(in oklab,var(--indigo) 14%,transparent);color:var(--indigo)}
@media (max-width:1060px){.tnav-pan{display:none}}
@media (prefers-reduced-motion:reduce){.tnav-pan,.tnav-chev{transition:none}}
</style>"""

LEGAL_LINKS = (u'<a href="mentions-legales.html">Mentions légales</a>'
               u'<span class="dot">·</span>'
               u'<a href="cgu.html">CGU</a>'
               u'<span class="dot">·</span>'
               u'<a href="cgv.html">CGV</a>'
               u'<span class="dot">·</span>'
               u'<a href="confidentialite.html">Politique de confidentialité</a>')
RGPD_NOTE = (u'<p class="nform-rgpd">Votre adresse sert uniquement à vous envoyer nos '
             u'actualités. Désinscription en un clic — '
             u'<a href="confidentialite.html">politique de confidentialité</a>.</p>')
COPYRIGHT = (u'\u00a9 <span id="yr">2026</span> \u00b7 Talos \u2014 Altay Sakalli, '
             u'entrepreneur individuel \u00b7 SIREN 920 171 774')


def cur(href, page):
    return u' aria-current="page"' if href == page else u''


def links_html(page):
    out = []
    for t, h in LINKS:
        if h == 'offres.html':
            out.append(offres_html(page))
        else:
            out.append(u'<a href="%s"%s>%s</a>' % (h, cur(h, page), t))
    return u''.join(out)


def menu_html(page):
    esp = u' aria-current="page"' if page == 'espace-client.html' else u''
    res = u' aria-current="page"' if page == 'reserver.html' else u''
    return (links_html(page)
            + u'<a class="m-esp" href="espace-client.html"%s>Espace client</a>' % esp
            + M_THEME
            + u'<a class="m-cta" href="reserver.html"%s>Réserver une démo</a>' % res)


def footer_html(page):
    items = [(u'Accueil', 'index.html#top' if page != 'index.html' else '#top')] + LINKS
    return u'\n'.join(u'          <li><a href="%s"%s>%s</a></li>'
                      % (h, cur(h, page), t) for t, h in items)


def nav_block(page):
    """Barre complète — pour les pages qui n'en avaient aucune."""
    return (
u'''<header class="tnav-wrap" id="tnav-wrap"><nav class="tnav" id="tnav" aria-label="Navigation principale"><a class="tnav-logo" href="index.html" aria-label="Talos — accueil">%s<span>Talos</span></a><div class="tnav-links">%s</div><div class="tnav-act"><button type="button" class="theme-toggle grid h-10 w-10 shrink-0 place-items-center rounded-lg" aria-label="Changer de thème"><svg class="moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg><svg class="sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg></button><a class="tnav-esp" href="espace-client.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="10" r="3.2"/><path d="M5.6 19a7 7 0 0 1 12.8 0"/></svg>Espace client</a><a class="tnav-cta" href="reserver.html">Réserver une démo</a><button class="tnav-burger" id="tnav-burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="tnav-menu"><i></i><i></i><i></i></button></div></nav><div class="tnav-menu" id="tnav-menu">%s</div></header>'''
        % (LOGO_SVG, links_html(page), menu_html(page)))


def sync(page):
    path = WEB + page
    s = io.open(path, encoding='utf-8').read()
    before = s
    notes = []

    # 1 · liens de la barre
    s, n = re.subn(r'(<div class="tnav-links">).*?(</div>)',
                   lambda m: m.group(1) + links_html(page) + m.group(2), s, flags=re.S)
    if n:
        notes.append('barre')

    # 2 · menu mobile
    s, n = re.subn(r'(<div class="tnav-menu" id="tnav-menu">).*?(</div>)',
                   lambda m: m.group(1) + menu_html(page) + m.group(2), s, flags=re.S)
    if n:
        notes.append('menu')

    # 3 · colonne « Navigation » du pied de page
    s, n = re.subn(r'(<h4>Navigation</h4>\s*<ul>).*?(</ul>)',
                   lambda m: m.group(1) + '\n' + footer_html(page) + '\n        ' + m.group(2),
                   s, flags=re.S)
    if n:
        notes.append('pied')

    # 4 · les liens juridiques du pied de page — obligation légale, ils
    #     doivent figurer sur chaque page, pas seulement sur l'accueil
    s, n = re.subn(r'(<div class="legal">).*?(</div>)',
                   lambda m: m.group(1) + LEGAL_LINKS + m.group(2), s, flags=re.S)
    if n:
        notes.append('juridique')
    s = re.sub(r'© <span id="yr">2026</span>[^<]*', COPYRIGHT, s)

    # la finalité du formulaire d'inscription doit être annoncée sur place
    if 'nform-rgpd' not in s and '</form>' in s:
        s = s.replace('</form>', '</form>\n      ' + RGPD_NOTE, 1)

    # 5 · la feuille du menu déroulant, une fois par page
    if '<div class="tnav-links">' in before:
        s = re.sub(r'<style id="tnav-drop-css">.*?</style>', '', s, flags=re.S)
        s = s.replace('</head>', PANEL_CSS + '</head>', 1)
        notes.append('menu offres')

    if not notes:
        return page, 'AUCUN REPÈRE — à traiter à la main'
    if s == before:
        return page, 'déjà à jour (%s)' % '+'.join(notes)
    io.open(path, 'w', encoding='utf-8').write(s)
    return page, 'mis à jour : %s' % '+'.join(notes)


if __name__ == '__main__':
    for p in PAGES:
        name, msg = sync(p)
        print(u'%-24s %s' % (name, msg))
