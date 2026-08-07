# -*- coding: utf-8 -*-
"""Couche d'harmonisation DA — source de vérité : talos-site/v2.css + TALOS-BRAND-BOOK.md.

Règles appliquées :
  · Helvetica Neue est la police unique (le mono ne sert qu'aux libellés).
  · Un seul mot par grand titre en dégradé signature (blanc→bronze).
  · Bronze = seul accent. Laiton (olivier) pour le « gain ». Jamais de vert.
  · Chaque token existe en dark et en light.
"""

SCOPES = ('.t-story', '.t-how', '.t-roi', '.t-cat', '.t-price', '.t-faq', '.t-ft')


def _list(suffix=''):
    return ','.join(s + suffix for s in SCOPES)


def _light_list(suffix=''):
    return ','.join('html[data-theme="light"] ' + s + suffix for s in SCOPES)


TOKENS = """
/* ═══════════════════════════════════════════════════════════════
   TOKENS DA — repris de talos-site/v2.css (palette « Braise »)
   ═══════════════════════════════════════════════════════════════ */

/* 1 · alias attendus par l'export Tailwind du hero.
   L'export nomme --ink le TEXTE, v2.css nomme --ink le FOND :
   les deux jeux cohabitent, chacun dans sa portée. */
:root{
  --ink:#F6EEE7; --ink-soft:#AB9F95;
  --background:#140F0C; --foreground:#F6EEE7;
  --surface:#140F0C; --surface-tint:#1C1611; --midnight:#140F0C;
  --border:rgba(246,238,231,.08);
  --indigo:#E0631F; --indigo-light:#F4823E;
}
html[data-theme="light"]{
  --ink:#1C1310; --ink-soft:#6E6058;
  --background:#FBF6F2; --foreground:#1C1310;
  --surface:#FBF6F2; --surface-tint:#F4EBE3; --midnight:#1C1310;
  --border:rgba(40,25,16,.12);
  --indigo:#C5531C; --indigo-light:#E0631F;
}

/* 2 · tokens v2.css pour les sections (mêmes noms qu'en production) */
%(scopes)s{
  --bronze:#E0631F; --bronze-2:#F4823E; --bronze-rgb:224,99,31;
  --antique:#A8451A; --antique-rgb:168,69,26;
  --olivier:#D69A66; --olivier-rgb:214,154,102;
  --rouille:#C0432A;
  --parch:#F6EEE7; --parch-rgb:246,238,231;
  --lin:#AB9F95;
  --ink:#140F0C; --ink-2:#1C1611; --ink-3:#241B15; --graphite:#352A20;
  --line:rgba(246,238,231,.08); --line-2:rgba(246,238,231,.15);
  --sans:"Helvetica Neue",Helvetica,Arial,sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,monospace;
  --r:16px; --maxw:1180px; --e:cubic-bezier(.16,1,.3,1);
  color:var(--parch);
}
%(light)s{
  --bronze:#C5531C; --bronze-2:#E0631F; --bronze-rgb:197,83,28;
  --antique:#9A3F12; --antique-rgb:154,63,18;
  --olivier:#9A6A38; --olivier-rgb:154,106,56;
  --rouille:#B0432A;
  --parch:#1C1310; --parch-rgb:28,19,16;
  --lin:#6E6058;
  --ink:#FBF6F2; --ink-2:#FFFFFF; --ink-3:#F4EBE3; --graphite:#E7DACE;
  --line:rgba(40,25,16,.12); --line-2:rgba(40,25,16,.22);
}

/* 3 · mot d'impact — signature obligatoire du brand book.
   Helvetica, jamais de serif italique (DA v2). */
%(em)s{
  font-family:var(--sans);font-style:normal;font-weight:inherit;
  background:linear-gradient(100deg,#FFE7D4 0%%,var(--bronze-2) 48%%,var(--bronze) 100%%);
  background-size:220%% 100%%;-webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;color:transparent;
  animation:daGradFlow 6s ease-in-out infinite}
%(emlight)s{
  background:linear-gradient(100deg,#B14512 0%%,var(--bronze) 58%%,var(--bronze-2) 100%%);
  background-size:220%% 100%%;-webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent}
@keyframes daGradFlow{0%%,100%%{background-position:0%% 50%%}50%%{background-position:100%% 50%%}}
@media (prefers-reduced-motion:reduce){%(em)s{animation:none}}
""" % {'scopes': _list(), 'light': _light_list(),
       'em': _list(' em'), 'emlight': _light_list(' em')}


NAV_CSS = """
/* ═══ BARRE DE NAVIGATION — pilule flottante ═══ */
/* le wrapper garde la hauteur dans le flux : la barre est fixed, sans lui
   le contenu du hero remonterait sous la barre */
.tnav-wrap{position:relative;z-index:60;height:92px}
.tnav{position:fixed;top:14px;left:50%;transform:translateX(-50%);
  width:calc(100% - 32px);max-width:1400px;
  display:flex;align-items:center;justify-content:space-between;gap:20px;
  padding:12px 12px 12px 22px;border-radius:100px;
  /* le conteneur doit se détacher aussi bien de la photo du hero que des
     sections plates : teinte quasi opaque + filet plus marqué que --border */
  background:color-mix(in oklab,var(--surface-tint) 90%,transparent);
  border:1px solid color-mix(in oklab,var(--ink) 13%,transparent);
  box-shadow:0 10px 34px rgba(0,0,0,.34);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  transition:padding .3s cubic-bezier(.16,1,.3,1),box-shadow .3s ease,background .3s ease}
html[data-theme="light"] .tnav{
  background:color-mix(in oklab,#fff 88%,transparent);
  border-color:rgba(40,25,16,.1);
  box-shadow:0 1px 2px rgba(40,25,16,.05),0 14px 38px rgba(40,25,16,.1)}
.tnav.scrolled{padding-top:8px;padding-bottom:8px;
  box-shadow:0 14px 40px rgba(0,0,0,.4)}
html[data-theme="light"] .tnav.scrolled{box-shadow:0 14px 40px rgba(40,25,16,.12)}

.tnav-logo{display:inline-flex;align-items:center;gap:9px;flex:0 0 auto;
  text-decoration:none;color:var(--ink)}
.tnav-logo span{font-size:19px;font-weight:700;letter-spacing:-.5px}

.tnav-links{display:flex;align-items:center;gap:24px;min-width:0}
.tnav-links a{position:relative;color:var(--ink);text-decoration:none;
  font-size:14.5px;font-weight:500;letter-spacing:-.2px;white-space:nowrap;
  transition:color .25s ease}
.tnav-links a::after{content:'';position:absolute;left:0;right:0;bottom:-6px;height:1.5px;
  border-radius:2px;background:var(--indigo);transform:scaleX(0);transform-origin:left;
  transition:transform .3s cubic-bezier(.16,1,.3,1)}
.tnav-links a:hover{color:var(--indigo)}
.tnav-links a:hover::after{transform:scaleX(1)}

.tnav-act{display:flex;align-items:center;gap:10px;flex:0 0 auto}
.tnav-esp{display:inline-flex;align-items:center;gap:7px;color:var(--ink);text-decoration:none;
  font-size:14.5px;font-weight:500;letter-spacing:-.2px;white-space:nowrap;
  transition:opacity .25s ease}
.tnav-esp:hover{opacity:.62}
.tnav-cta{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 24px;
  border-radius:100px;background:var(--indigo);color:#fff;text-decoration:none;
  font-size:14.5px;font-weight:700;letter-spacing:-.2px;white-space:nowrap;
  transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s ease,background .3s ease}
.tnav-cta:hover{background:var(--indigo-light);transform:translateY(-2px);
  box-shadow:0 14px 32px color-mix(in oklab,var(--indigo) 42%,transparent)}
.tnav .theme-toggle{width:40px;height:40px;border-radius:50%;flex:0 0 auto;
  display:grid;place-items:center}

/* ── burger + panneau mobile ── */
.tnav-burger{display:none;width:42px;height:42px;flex:0 0 auto;border-radius:50%;
  align-items:center;justify-content:center;gap:4.5px;flex-direction:column;
  background:none;border:1px solid var(--border);color:var(--ink);cursor:pointer}
.tnav-burger i{display:block;width:16px;height:1.8px;border-radius:2px;background:currentColor;
  transition:transform .35s cubic-bezier(.16,1,.3,1),opacity .2s ease}
.tnav-wrap.open .tnav-burger i:nth-child(1){transform:translateY(6.3px) rotate(45deg)}
.tnav-wrap.open .tnav-burger i:nth-child(2){opacity:0}
.tnav-wrap.open .tnav-burger i:nth-child(3){transform:translateY(-6.3px) rotate(-45deg)}

.tnav-menu{position:fixed;top:84px;left:50%;transform:translateX(-50%) translateY(-10px);
  width:calc(100% - 32px);max-width:1400px;z-index:59;
  display:flex;flex-direction:column;gap:2px;padding:14px;border-radius:26px;
  background:var(--surface-tint);border:1px solid var(--border);
  opacity:0;visibility:hidden;pointer-events:none;
  transition:opacity .3s ease,transform .35s cubic-bezier(.16,1,.3,1),visibility 0s linear .3s}
html[data-theme="light"] .tnav-menu{background:#fff;
  box-shadow:0 18px 50px rgba(40,25,16,.14)}
.tnav-wrap.open .tnav-menu{opacity:1;visibility:visible;pointer-events:auto;
  transform:translateX(-50%) translateY(0);transition-delay:0s}
.tnav-menu a{padding:14px 16px;border-radius:14px;color:var(--ink);text-decoration:none;
  font-size:16px;font-weight:600;letter-spacing:-.2px}
.tnav-menu a:hover{background:color-mix(in oklab,var(--indigo) 8%,transparent)}
.tnav-menu .m-esp{margin-top:8px;border-top:1px solid var(--border);border-radius:0;padding-top:18px}
.tnav-menu .m-cta{margin-top:8px;text-align:center;background:var(--indigo);color:#fff;
  border-radius:100px;padding:15px 16px;font-weight:700}
.tnav-menu .m-cta:hover{background:var(--indigo-light)}
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
html[data-theme="light"] .tnav-menu .m-theme .lbl-dark{display:none}

/* la barre flotte au-dessus : sans marge, un lien d'ancre cadre sous elle */
main > section,main > footer{scroll-margin-top:110px}

@media (max-width:1240px){
  .tnav-links,.tnav-esp{display:none}
  .tnav-burger{display:flex}
}
@media (max-width:600px){
  .tnav-wrap{height:80px}
  .tnav{top:10px;width:calc(100% - 20px);padding:9px 9px 9px 16px}
  .tnav-logo span{font-size:17px}
  .tnav-cta{min-height:40px;padding:0 16px;font-size:13.5px}
  .tnav .theme-toggle{display:none}
  .tnav-menu .m-theme{display:flex}
  .tnav-menu{top:74px;width:calc(100% - 20px)}
}
@media (prefers-reduced-motion:reduce){
  .tnav,.tnav-cta,.tnav-links a::after,.tnav-burger i,.tnav-menu{transition:none}
  .tnav-cta:hover{transform:none}
}
"""

NAV_LINKS = [
    ('#fonctionnalites', 'Fonctionnalités & Automatisations'),
    ('#comment-ca-marche', 'Comment ça marche'),
    ('#simulateur', 'Simulateur'),
    ('#tarifs', 'Tarifs'),
    ('#story', 'Pourquoi Talos'),
]

ESPACE_URL = 'https://talos-app-pearl.vercel.app'

ICON_USER = ('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
             'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'
             '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="10" r="3.2"/>'
             '<path d="M5.6 19a7 7 0 0 1 12.8 0"/></svg>')


def nav_html(logo_mark, toggle_btn):
    links = ''.join('<a href="%s">%s</a>' % (h, t) for h, t in NAV_LINKS)
    mlinks = ''.join('<a href="%s">%s</a>' % (h, t) for h, t in NAV_LINKS)
    return (
        '<header class="tnav-wrap" id="tnav-wrap">'
        '<nav class="tnav" id="tnav" aria-label="Navigation principale">'
        '<a class="tnav-logo" href="#top" aria-label="Talos — accueil">'
        + logo_mark + '<span>Talos</span></a>'
        '<div class="tnav-links">' + links + '</div>'
        '<div class="tnav-act">'
        + toggle_btn +
        '<a class="tnav-esp" href="' + ESPACE_URL + '" target="_blank" rel="noopener">'
        + ICON_USER + 'Espace client</a>'
        '<a class="tnav-cta" href="#reserver">Réserver une démo</a>'
        '<button class="tnav-burger" id="tnav-burger" type="button" aria-label="Menu" '
        'aria-expanded="false" aria-controls="tnav-menu"><i></i><i></i><i></i></button>'
        '</div></nav>'
        '<div class="tnav-menu" id="tnav-menu">' + mlinks +
        '<a class="m-esp" href="' + ESPACE_URL + '" target="_blank" rel="noopener">Espace client</a>'
        + MOBILE_THEME_BTN +
        '<a class="m-cta" href="#reserver">Réserver une démo</a>'
        '</div></header>')


NAV_JS = """
/* barre flottante : compacte au scroll + menu mobile */
(function(){
  var wrap = document.getElementById('tnav-wrap');
  var bar  = document.getElementById('tnav');
  var btn  = document.getElementById('tnav-burger');
  if (!wrap || !bar) return;

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      bar.classList.toggle('scrolled', window.scrollY > 20);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  function close(){
    wrap.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }
  btn.addEventListener('click', function(){
    var open = !wrap.classList.contains('open');
    wrap.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // un lien cliqué doit refermer le panneau, sinon il masque la cible
  document.getElementById('tnav-menu').addEventListener('click', function(e){
    if (e.target.closest('a')) close();
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  document.addEventListener('click', function(e){
    if (wrap.classList.contains('open') && !wrap.contains(e.target)) close();
  });
})();
"""


HERO = """
/* ═══ HERO — l'export était figé en sombre ═══ */
/* le voile sur la photo était compilé en dur sur #140F0C */
#top .from-white\\/94{--tw-gradient-from:color-mix(in oklab,var(--background) 94%,transparent)}
#top .via-white\\/82{--tw-gradient-via:color-mix(in oklab,var(--background) 82%,transparent)}
#top .to-white\\/45{--tw-gradient-to:color-mix(in oklab,var(--background) 45%,transparent)}
#top .from-white\\/60{--tw-gradient-from:color-mix(in oklab,var(--background) 60%,transparent)}
/* la photo était assombrie pour un fond sombre ; en clair on la remonte */
html[data-theme="light"] .hero-diagonal img{
  filter:grayscale(.2) sepia(.14) saturate(1.12) brightness(1.02) contrast(.96) hue-rotate(-6deg)}
/* badge et filets : tokens plutôt que valeurs en dur */
#top .bg-\\[\\#1C1611\\]\\/80{background-color:color-mix(in oklab,var(--surface-tint) 82%,transparent)}
#top .hover\\:bg-\\[\\#241B15\\]:hover{background-color:var(--ink-3,#241B15)}
#top .border-white\\/10{border-color:var(--border)}
/* en clair, la pilule blanche du formulaire a besoin d'un contour */
@media (min-width:640px){
  html[data-theme="light"] #top form{
    box-shadow:0 2px 24px -6px rgba(40,25,16,.16),inset 0 0 0 1px var(--border)}
}
html[data-theme="light"] #top .ring-black\\/5{--tw-ring-color:rgba(40,25,16,.08)}

/* bascule de thème (même comportement qu'en production) */
.theme-toggle{border:1px solid var(--border);color:var(--ink);background:none;cursor:pointer;
  transition:border-color .25s ease,background .25s ease}
.theme-toggle:hover{border-color:var(--indigo);background:color-mix(in oklab,var(--indigo) 8%,transparent)}
.theme-toggle .sun{display:none}
html[data-theme="light"] .theme-toggle .sun{display:block}
html[data-theme="light"] .theme-toggle .moon{display:none}
"""


FOOTER = """
/* ═══ FOOTER — il n'existait qu'en sombre ═══ */
.t-ft{background:var(--ink);color:var(--parch)}
html[data-theme="light"] .t-ft::before{
  background-image:radial-gradient(rgba(40,25,16,.16) 1px,transparent 1px)}
html[data-theme="light"] .t-ft::after{
  background:radial-gradient(ellipse 70% 60% at 22% 118%,rgba(197,83,28,.5) 0%,
    rgba(197,83,28,.2) 30%,rgba(231,218,206,.35) 55%,transparent 76%)}
html[data-theme="light"] .t-ft .col a,
html[data-theme="light"] .t-ft .col.tagline p,
html[data-theme="light"] .t-ft .brand .word{color:var(--parch)}
html[data-theme="light"] .t-ft .col h4,
html[data-theme="light"] .t-ft .updates h4{color:rgba(var(--parch-rgb),.55)}
html[data-theme="light"] .t-ft .socials a{border-color:rgba(var(--parch-rgb),.28);color:var(--parch)}
html[data-theme="light"] .t-ft .nform{border-color:rgba(var(--parch-rgb),.28);background:rgba(255,255,255,.55)}
html[data-theme="light"] .t-ft .nform input{color:var(--parch)}
html[data-theme="light"] .t-ft .nform input::placeholder{color:rgba(var(--parch-rgb),.45)}
html[data-theme="light"] .t-ft .nform button{background:var(--parch);color:var(--ink)}
html[data-theme="light"] .t-ft .nform button:hover{background:var(--bronze);color:#fff}
html[data-theme="light"] .t-ft .ft-bottom{border-top-color:rgba(var(--parch-rgb),.14);
  color:rgba(var(--parch-rgb),.55)}
html[data-theme="light"] .t-ft .ft-bottom a{color:rgba(var(--parch-rgb),.7)}
html[data-theme="light"] .t-ft .ft-bottom a:hover{color:var(--parch)}
"""


ROI = """
/* ═══ SIMULATEUR — palette privée (flame/violet/void) remappée sur la DA ═══ */
.t-roi{
  --flame:var(--bronze); --primary:var(--bronze-2); --violet:var(--olivier);
  --glass:rgba(var(--parch-rgb),.03); --glass-2:rgba(var(--parch-rgb),.055);
  --hair:var(--line); --hair-2:var(--line-2);
  --ink-dim:rgba(var(--parch-rgb),.62); --ink-mute:rgba(var(--parch-rgb),.42);
  --slate:var(--graphite);
  --display:var(--sans); --body:var(--sans); --label:var(--mono);
  --r-md:12px; --r-lg:16px; --r-xl:24px;
  background:var(--ink)}
html[data-theme="light"] .t-roi .glass{box-shadow:0 12px 30px rgba(40,25,16,.05)}
html[data-theme="light"] .t-roi .cta{box-shadow:0 12px 30px rgba(40,25,16,.22)}
html[data-theme="light"] .t-roi .cta:hover{box-shadow:0 18px 40px rgba(40,25,16,.28)}
html[data-theme="light"] .t-roi .orb{opacity:.09}
"""


def patch_roi_css(css):
    """Remappe les littéraux du simulateur sur les tokens de la DA."""
    # --ink y désigne le texte ; dans v2.css c'est le fond. On bascule sur --parch.
    css = css.replace('var(--ink)', 'var(--parch)')
    css = css.replace('rgba(255,255,255,', 'rgba(var(--parch-rgb),')
    css = css.replace('rgba(255,107,0,', 'rgba(var(--bronze-rgb),')
    css = css.replace('rgba(224,99,31,', 'rgba(var(--bronze-rgb),')
    css = css.replace('#FF8A34', 'var(--bronze-2)')
    css = css.replace('color:#fff', 'color:var(--parch)')
    css = css.replace('background:#fff;color:#160E08', 'background:var(--parch);color:var(--ink)')
    # dégradés maison → dégradé signature du brand book
    css = css.replace(
        'linear-gradient(96deg,#FFD9C2 0%,var(--flame) 46%,var(--violet) 100%)',
        'linear-gradient(100deg,#FFE7D4 0%,var(--bronze-2) 48%,var(--bronze) 100%)')
    css = css.replace(
        'linear-gradient(100deg,#FFD9C2,var(--flame) 62%,#D64F0A)',
        'linear-gradient(100deg,#FFE7D4 0%,var(--bronze-2) 48%,var(--bronze) 100%)')
    return css


# échelle de risque : le fichier source montait un vert→rouge « sémantique ».
# Le brand book l'interdit (« jamais de vert ») : on garde une rampe lisible
# laiton → bronze → rouille, qui monte en intensité sans sortir de la palette.
RISK_COLORS = [
    ('--c:#5FB871', '--c:var(--olivier)'),
    ('--c:#D9A93E', '--c:var(--bronze-2)'),
    ('--c:#E0631F', '--c:var(--bronze)'),
    ('--c:#D14B4B', '--c:var(--rouille)'),
]

# logo : monochrome, jamais orange (brand book). Il suit la couleur du texte.
# viewBox recadrée sur la marque : le logo complet fait 380 de large,
# la marque seule 62 — sinon elle occupe 16 % de la boîte et devient un point.
LOGO_MARK = ('<svg viewBox="0 16 62 92" width="18" height="27" aria-hidden="true">'
             '<g fill="currentColor">'
             '<rect x="0" y="18" width="62" height="14"/>'
             '<path d="M 24 32 L 14 60 L 27 60 L 19 104 L 50 58 L 37 58 L 44 32 Z"/></g></svg>')

THEME_INIT = ("<script>(function(){try{var t=localStorage.getItem('talos-theme')||'dark';"
              "document.documentElement.setAttribute('data-theme',t)}catch(e){}})();</script>")

THEME_JS = """
/* bascule de thème — même clé de stockage que talos-site */
(function(){
  var root = document.documentElement;
  /* la barre et le menu mobile en portent chacun une : les deux doivent agir */
  var btns = document.querySelectorAll('.theme-toggle');
  if (!btns.length) return;
  function flip(){
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('talos-theme', next); } catch(e){}
  }
  for (var i = 0; i < btns.length; i++) btns[i].addEventListener('click', flip);
})();
"""

TOGGLE_BTN = (
    '<button type="button" class="theme-toggle grid h-10 w-10 shrink-0 place-items-center '
    'rounded-lg" aria-label="Changer de thème">'
    '<svg class="moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>'
    '<svg class="sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    'stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/>'
    '<path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22'
    'M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg></button>')

# Bascule de thème du menu mobile : sous 600px TOGGLE_BTN est masqué (plus la
# place dans la barre), le réglage n'était atteignable nulle part.
MOBILE_THEME_BTN = (
    '<button type="button" class="theme-toggle m-theme" aria-label="Changer de thème">'
    '<svg class="moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>'
    '<svg class="sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    'stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/>'
    '<path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22'
    'M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>'
    '<span class="lbl-dark">Mode clair</span>'
    '<span class="lbl-light">Mode sombre</span></button>')
