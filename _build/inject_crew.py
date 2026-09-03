# -*- coding: utf-8 -*-
"""Pose le carrousel « équipe » dans index.html.

index.html n'est pas régénéré par pages.py (il embarque sa propre copie
compilée du style) : on l'édite, mais le contenu vient de crew.py, la même
source que la page Offres. Le script est idempotent.

    python3 _build/inject_crew.py
"""
import io, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import crew

p = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/index.html'
s = io.open(p, encoding='utf-8').read()
s = re.sub(r'\n<!-- ═══ ÉQUIPE.*?</script>\n', '\n', s, flags=re.S)
ancre = u'<section class="t-feat" id="fonctionnalites">'
assert ancre in s, 'ancre introuvable dans index.html'
io.open(p, 'w', encoding='utf-8').write(s.replace(ancre, crew.bloc() + u'\n' + ancre, 1))
print(u'carrousel posé dans index.html')
