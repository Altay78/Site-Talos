# -*- coding: utf-8 -*-
u"""Rend la bascule de thème atteignable sur téléphone.

Sous 600px la pastille de la barre est masquée (« .tnav .theme-toggle
{display:none} ») et rien ne la remplaçait : impossible de passer en mode
clair depuis un mobile. On ajoute une ligne « Mode clair / Mode sombre »
dans le menu burger, et on câble TOUTES les bascules (la barre en garde une).

Les sources (_build/parts/, da.py, nav_sync.py) sont déjà corrigées ; ce
script applique le même correctif aux pages HTML déjà générées, dont le
CSS et le JS sont inlinés page par page.

    python3 _build/fix_mobile_theme.py
"""
import io, os, sys

WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import nav_sync

PAGES = ['index.html', 'fonctionnalites.html', 'comment-ca-marche.html',
         'tarifs.html', 'pourquoi-talos.html', 'reserver.html',
         'simulateur.html', 'blog.html', '404.html']

CSS_ANCHOR = u'.tnav-menu .m-cta:hover{background:var(--indigo-light)}'
CSS_ADD = u"""
/* bascule de thème du menu mobile : sous 600px la pastille de la barre n'a
   plus la place de s'afficher, le réglage ne vivait alors nulle part */
.tnav-menu .m-theme{display:none;align-items:center;gap:10px;width:100%;
  padding:14px 16px;border:0;border-radius:14px;background:none;color:var(--ink);
  font-family:inherit;font-size:16px;font-weight:600;letter-spacing:-.2px;
  text-align:left;cursor:pointer}
.tnav-menu .m-theme:hover{background:color-mix(in oklab,var(--indigo) 8%,transparent)}
/* l'icône et le libellé annoncent le thème vers lequel on bascule */
.tnav-menu .m-theme .moon,.tnav-menu .m-theme .lbl-light{display:none}
.tnav-menu .m-theme .sun{display:block}
html[data-theme="light"] .tnav-menu .m-theme .moon{display:block}
html[data-theme="light"] .tnav-menu .m-theme .sun{display:none}
html[data-theme="light"] .tnav-menu .m-theme .lbl-light{display:inline}
html[data-theme="light"] .tnav-menu .m-theme .lbl-dark{display:none}"""

MQ_ANCHOR = u'.tnav .theme-toggle{display:none}'
MQ_ADD = u'\n  .tnav-menu .m-theme{display:flex}'

JS_OLD = u"""  var btn  = document.querySelector('.theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('talos-theme', next); } catch(e){}
  });"""
JS_NEW = u"""  /* la barre et le menu mobile en portent chacun une : les deux doivent agir */
  var btns = document.querySelectorAll('.theme-toggle');
  if (!btns.length) return;
  function flip(){
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('talos-theme', next); } catch(e){}
  }
  for (var i = 0; i < btns.length; i++) btns[i].addEventListener('click', flip);"""


def patch(page):
    path = WEB + page
    s = io.open(path, encoding='utf-8').read()
    before, notes = s, []

    if '.tnav-menu .m-theme{' not in s:
        assert s.count(CSS_ANCHOR) == 1, (page, 'CSS_ANCHOR')
        s = s.replace(CSS_ANCHOR, CSS_ANCHOR + CSS_ADD)
        assert s.count(MQ_ANCHOR) == 1, (page, 'MQ_ANCHOR')
        s = s.replace(MQ_ANCHOR, MQ_ANCHOR + MQ_ADD)
        notes.append('css')

    if JS_OLD in s:
        s = s.replace(JS_OLD, JS_NEW)
        notes.append('js')

    if s == before:
        return page, u'déjà à jour'
    io.open(path, 'w', encoding='utf-8').write(s)
    return page, u'corrigé : %s' % '+'.join(notes)


if __name__ == '__main__':
    for p in PAGES:
        print(u'%-24s %s' % patch(p))
    print(u'\n— menus resynchronisés (le bouton entre dans .tnav-menu) —')
    for p in nav_sync.PAGES:
        print(u'%-24s %s' % nav_sync.sync(p))
