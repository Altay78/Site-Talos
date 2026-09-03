# -*- coding: utf-8 -*-
"""Les quatre pages juridiques du site vitrine.

La source unique est le Markdown de `talos-app/legal/` — le même que celui
qui alimente les pages de l'espace client et les PDF. On ne recopie donc rien :
on convertit à la compilation. Un `[[À COMPLÉTER]]` oublié ressort en rouge,
comme dans l'application.

Le convertisseur ne gère que ce que ces documents utilisent : titres, listes,
tableaux, gras, italique, code, liens. Pas de moteur Markdown complet.
"""
import io, os, re

SRC = os.path.expanduser('~/Sites/talos-app/legal/')

DOCS = [
    ('mentions-legales.html', '01-mentions-legales.md',
     u"Mentions légales — Talos",
     u"Éditeur, hébergeur, propriété intellectuelle et contact du site Talos."),
    ('cgu.html', '02-conditions-generales-d-utilisation.md',
     u"Conditions générales d'utilisation — Talos",
     u"Les règles d'utilisation du site et de l'espace client Talos."),
    ('cgv.html', '03-conditions-generales-de-vente.md',
     u"Conditions générales de vente — Talos",
     u"Abonnements, prix, durée, résiliation et garanties des offres Talos."),
    ('confidentialite.html', '04-politique-de-confidentialite.md',
     u"Politique de confidentialité — Talos",
     u"Quelles données Talos traite, pourquoi, combien de temps, et vos droits (RGPD)."),
]

# le lien affiché dans le pied de page et dans le sommaire d'une page à l'autre
LIENS = [(u"Mentions légales", 'mentions-legales.html'),
         (u"CGU", 'cgu.html'),
         (u"CGV", 'cgv.html'),
         (u"Politique de confidentialité", 'confidentialite.html')]


def _esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def _inline(t):
    t = _esc(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\*\w])\*([^*]+)\*(?!\*)', r'<em>\1</em>', t)
    # les liens internes du Markdown pointent vers les autres .md du dossier
    def lien(m):
        txt, url = m.group(1), m.group(2)
        for f, md, _, _ in DOCS:
            if md in url:
                url = f
        return u'<a href="%s">%s</a>' % (url, txt)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lien, t)
    t = t.replace('[[À COMPLÉTER]]', u'<mark class="lg-todo">À COMPLÉTER</mark>')
    return t


def _md(src):
    """Le sous-ensemble de Markdown utilisé par les quatre documents."""
    html, liste, tableau = [], False, False

    def ferme():
        nonlocal_liste = None  # py2-safe : on passe par les listes ci-dessous
    i, lignes = 0, src.split('\n')
    while i < len(lignes):
        l = lignes[i].rstrip()

        # tableau : | a | b |  puis  | --- | --- |
        if l.startswith('|') and i + 1 < len(lignes) and re.match(r'^\|[\s:|-]+\|$', lignes[i + 1].strip()):
            if liste:
                html.append('</ul>'); liste = False
            cols = [c.strip() for c in l.strip('|').split('|')]
            html.append('<div class="lg-tw"><table><thead><tr>'
                        + ''.join('<th>%s</th>' % _inline(c) for c in cols)
                        + '</tr></thead><tbody>')
            i += 2
            while i < len(lignes) and lignes[i].strip().startswith('|'):
                cs = [c.strip() for c in lignes[i].strip().strip('|').split('|')]
                html.append('<tr>' + ''.join('<td>%s</td>' % _inline(c) for c in cs) + '</tr>')
                i += 1
            html.append('</tbody></table></div>')
            continue

        if not l.strip():
            if liste:
                html.append('</ul>'); liste = False
            i += 1
            continue

        m = re.match(r'^(#{1,4})\s+(.*)$', l)
        if m:
            if liste:
                html.append('</ul>'); liste = False
            n = len(m.group(1))
            if n == 1:
                i += 1
                continue          # le titre est déjà posé par l'en-tête de page
            html.append('<h%d>%s</h%d>' % (n, _inline(m.group(2)), n))
            i += 1
            continue

        if l.startswith('---'):
            if liste:
                html.append('</ul>'); liste = False
            html.append('<hr>')
            i += 1
            continue

        m = re.match(r'^\s*[-*]\s+(.*)$', l)
        if m:
            if not liste:
                html.append('<ul>'); liste = True
            txt = m.group(1)
            # une puce peut courir sur plusieurs lignes
            while i + 1 < len(lignes) and re.match(r'^\s{2,}\S', lignes[i + 1]) \
                    and not re.match(r'^\s*[-*]\s', lignes[i + 1]):
                i += 1
                txt += ' ' + lignes[i].strip()
            html.append('<li>%s</li>' % _inline(txt))
            i += 1
            continue

        if liste:
            html.append('</ul>'); liste = False
        # paragraphe : on recolle les lignes jusqu'au prochain blanc
        buf = [l]
        while i + 1 < len(lignes) and lignes[i + 1].strip() \
                and not re.match(r'^(#{1,4}\s|\s*[-*]\s|\||---)', lignes[i + 1]):
            i += 1
            buf.append(lignes[i].strip())
        txt = ' '.join(buf)
        cls = ' class="lg-maj"' if txt.startswith('*Dernière mise à jour') else ''
        html.append('<p%s>%s</p>' % (cls, _inline(txt)))
        i += 1

    if liste:
        html.append('</ul>')
    return '\n'.join(html)


FLECHE = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
          '<path d="M5 12h14M13 6l6 6-6 6"/></svg>')


def corps(fichier, md, titre):
    src = io.open(SRC + md, encoding='utf-8').read()
    h1 = re.match(r'^#\s+(.*)$', src.split('\n')[0]).group(1)
    onglets = u''.join(
        u'<a href="%s"%s>%s</a>' % (h, u' aria-current="page"' if h == fichier else u'', t)
        for t, h in LIENS)
    return u'''<section class="t-legal">
  <div class="lg-shell">

    <nav class="lg-tabs" aria-label="Documents juridiques">%s</nav>

    <h1>%s</h1>

    <article class="lg-doc">
%s
    </article>

    <aside class="lg-aide">
      <b>Une question sur vos données ?</b>
      <span>Écrivez à <a href="mailto:contact@talos-ai.tech">contact@talos-ai.tech</a> :
        on répond sous 30 jours, et bien plus vite en pratique.</span>
      <a class="lg-cta" href="reserver.html">Parler à quelqu'un %s</a>
    </aside>

  </div>
</section>
''' % (onglets, _esc(h1), _md(src), FLECHE)
