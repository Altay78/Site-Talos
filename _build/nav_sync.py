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
    (u'Fonctionnalités',    'fonctionnalites.html'),
    (u'Comment ça marche',  'comment-ca-marche.html'),
    (u'Tarifs',             'tarifs.html'),
    (u'Simulateur',         'simulateur.html'),
    (u'Pourquoi Talos',     'pourquoi-talos.html'),
    (u'Blog',               'blog.html'),
]

PAGES = ['index.html', 'fonctionnalites.html', 'comment-ca-marche.html',
         'tarifs.html', 'pourquoi-talos.html', 'reserver.html',
         'espace-client.html', 'simulateur.html', 'blog.html']

LOGO_SVG = ('<svg viewBox="0 16 62 92" width="18" height="27" aria-hidden="true">'
            '<g fill="currentColor"><rect x="0" y="18" width="62" height="14"/>'
            '<path d="M 24 32 L 14 60 L 27 60 L 19 104 L 50 58 L 37 58 L 44 32 Z"/></g></svg>')


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


def cur(href, page):
    return u' aria-current="page"' if href == page else u''


def links_html(page):
    return u''.join(u'<a href="%s"%s>%s</a>' % (h, cur(h, page), t) for t, h in LINKS)


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
