# -*- coding: utf-8 -*-
"""Le carrousel « équipe » — un cover-flow maison.

Le composant d'origine (@subhanhq/amicro card-cover-flow) est du React +
Tailwind ; le site est en HTML statique. L'effet est refait ici en vanilla :
perspective, rotation, profondeur, défilement automatique.

Un seul bloc, utilisé à deux endroits — l'accueil (injecté dans index.html,
qui n'est pas régénéré) et la page Offres (via assistants.hub()). Il embarque
sa feuille et son script : il ne dépend d'aucun style de page.
"""

EQUIPE = [
    ('commercial', u'Devis &amp; relances', u'Assistant commercial',
     u'Vos devis partent. Vos clients sont relancés.',
     u'Rédige vos devis, les envoie à la signature avec l’acompte et les relance '
     u'jusqu’à la réponse du client.',
     'assistant-commercial.html'),
    ('administratif', u'Vos emails &amp; demandes', u'Assistant administratif',
     u'Plus besoin de passer votre journée dans vos mails.',
     u'Trie vos emails, extrait les informations importantes et vous alerte uniquement '
     u'lorsque votre attention est nécessaire.',
     'assistant-administratif.html'),
    ('facturation', u'Factures &amp; encaissements', u'Assistant facturation',
     u'Vos factures sont créées et suivies sans y penser.',
     u'Génère vos factures après signature, gère vos acomptes et situations et garde '
     u'votre facturation à jour.',
     'assistant-facturation.html'),
    ('tresorerie', u'Trésorerie', u'Assistant trésorerie',
     u'Vous savez ce qui doit rentrer.',
     u'Suit vos factures non encaissées, anticipe vos entrées d’argent et vous alerte '
     u'sur votre trésorerie.',
     'assistant-tresorerie.html'),
    ('client', u'Clients &amp; rendez-vous', u'Assistant client',
     u'Vos clients ont toujours quelqu’un pour leur répondre.',
     u'Répond aux demandes, prend les rendez-vous et rappelle automatiquement vos '
     u'clients avant leurs interventions.',
     'assistant-client.html'),
]

FLECHE = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
          '<path d="M5 12h14M13 6l6 6-6 6"/></svg>')

cartes = []
for i, (slug, role, nom, accroche, promesse, href) in enumerate(EQUIPE):
    cartes.append(u'''      <li class="crew-c" data-i="%d">
        <a href="%s">
          <span class="crew-vis">
            <img src="perso/assistant-%s.webp" alt="" width="430" height="1400"
                 loading="lazy" decoding="async">
          </span>
          <span class="crew-txt">
            <small>%s</small>
            <b>%s</b>
            <span class="crew-h">%s</span>
            <span class="crew-go">Découvrir %s</span>
          </span>
        </a>
      </li>''' % (i, href, slug, role, nom, accroche, FLECHE))

dots = u''.join(u'<button type="button" role="tab" aria-label="%s"%s></button>'
                % (e[2], u' aria-selected="true"' if i == 0 else u' aria-selected="false"')
                for i, e in enumerate(EQUIPE))

CHEV = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" '
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        '<path d="M15 6l-6 6 6 6"/></svg>')

BLOC = u'''
<!-- ═══ ÉQUIPE — carrousel cover-flow ══════════════════════════════════════ -->
<style id="crew-css">
.t-crew{--bronze:#E0631F;--bronze-2:#F4823E;--bronze-rgb:224,99,31;
  --parch:#F6EEE7;--lin:#AB9F95;--ink:#140F0C;--ink-2:#1C1611;--ink-3:#241B15;
  --line:rgba(246,238,231,.08);--line-2:rgba(246,238,231,.15);
  --e:cubic-bezier(.16,1,.3,1);
  position:relative;overflow:hidden;padding:96px 0 104px;
  background:var(--ink);color:var(--parch);
  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
html[data-theme="light"] .t-crew{--bronze:#C5531C;--bronze-2:#E0631F;--bronze-rgb:197,83,28;
  --parch:#1C1310;--lin:#6E6058;--ink:#FBF6F2;--ink-2:#FFFFFF;--ink-3:#F4EBE3;
  --line:rgba(40,25,16,.12);--line-2:rgba(40,25,16,.22)}
.t-crew::before{content:"";position:absolute;inset:auto 0 -30% 0;height:70%;pointer-events:none;
  background:radial-gradient(60% 60% at 50% 40%,rgba(var(--bronze-rgb),.16) 0%,transparent 70%)}

.crew-head{position:relative;max-width:1180px;margin:0 auto 44px;padding:0 24px;text-align:center}
.crew-k{margin:0 0 14px;font-family:ui-monospace,"SF Mono",Menlo,monospace;
  font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--bronze)}
.crew-head h2{margin:0 0 14px;font-size:clamp(30px,3.4vw,46px);line-height:1.06;
  letter-spacing:-1.6px;font-weight:800;color:var(--parch)}
.crew-head h2 em{font-style:normal;color:var(--bronze)}
.crew-head p{margin:0 auto;max-width:52ch;font-size:16.5px;line-height:1.6;color:var(--lin)}

/* la scène : les cartes tournent autour de celle du centre */
.crew-stage{position:relative;height:clamp(470px,46vw,540px);
  perspective:1500px;perspective-origin:50% 45%}
.crew-track{list-style:none;margin:0;padding:0;position:absolute;inset:0;
  transform-style:preserve-3d}
.crew-c{position:absolute;top:0;left:50%;width:clamp(230px,24vw,286px);height:100%;
  margin-left:calc(clamp(230px,24vw,286px) / -2);
  transition:transform .62s var(--e),opacity .62s var(--e),filter .62s var(--e);
  will-change:transform}
.crew-c a{display:flex;flex-direction:column;height:100%;overflow:hidden;
  border-radius:26px;text-decoration:none;color:inherit;
  background:var(--ink-2);border:1px solid var(--line);
  box-shadow:0 30px 70px -30px rgba(0,0,0,.8)}
html[data-theme="light"] .crew-c a{box-shadow:0 30px 70px -34px rgba(40,25,16,.34)}
.crew-c[data-act] a{border-color:rgba(var(--bronze-rgb),.42);
  box-shadow:0 34px 80px -26px rgba(var(--bronze-rgb),.42)}

.crew-vis{position:relative;display:block;height:60%;overflow:hidden;
  background:radial-gradient(120% 84% at 50% 4%,rgba(var(--bronze-rgb),.20) 0%,transparent 70%)}
.crew-vis img{position:absolute;left:50%;top:10px;transform:translateX(-50%);
  height:640px;width:auto;max-width:none}
/* le fondu du bas est un voile, pas un mask-image : dans un contexte 3D
   (la scène est en preserve-3d) le masque n'est pas peint. */
.crew-vis::after{content:"";position:absolute;left:0;right:0;bottom:0;height:38%;
  pointer-events:none;
  background:linear-gradient(180deg,color-mix(in srgb,var(--ink-2),transparent 100%),var(--ink-2))}
.crew-soon{position:absolute;top:12px;right:12px;font-style:normal;
  font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  padding:4px 9px;border-radius:100px;color:var(--bronze);
  background:color-mix(in srgb,var(--ink) 72%,transparent);
  border:1px solid rgba(var(--bronze-rgb),.42)}
.crew-txt{display:flex;flex-direction:column;flex:1;padding:18px 20px 20px}
.crew-txt small{font-family:ui-monospace,"SF Mono",Menlo,monospace;
  font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--bronze)}
.crew-txt b{margin:7px 0 6px;font-size:18.5px;line-height:1.15;letter-spacing:-.6px;
  font-weight:800;color:var(--parch)}
/* l'accroche : la phrase qu'on retient, au-dessus de l'explication */
.crew-h{flex:1;margin:0;font-size:14.5px;line-height:1.4;font-weight:600;
  letter-spacing:-.2px;color:var(--parch)}
.crew-go{display:inline-flex;align-items:center;gap:7px;margin-top:14px;
  font-size:13.5px;font-weight:700;color:var(--bronze)}
.crew-go svg{width:14px;height:14px}

/* flèches et pastilles */
.crew-nav{position:absolute;top:50%;z-index:20;display:grid;place-items:center;
  width:48px;height:48px;margin-top:-24px;padding:0;border-radius:50%;cursor:pointer;
  color:var(--parch);background:color-mix(in srgb,var(--ink-3) 88%,transparent);
  border:1px solid var(--line-2);backdrop-filter:blur(10px);
  transition:transform .25s var(--e),border-color .25s var(--e)}
.crew-nav:hover{transform:scale(1.07);border-color:rgba(var(--bronze-rgb),.55)}
.crew-nav:focus-visible{outline:3px solid var(--bronze);outline-offset:3px}
.crew-nav svg{width:20px;height:20px}
.crew-nav.p{left:max(16px,calc(50% - 640px))}
.crew-nav.n{right:max(16px,calc(50% - 640px))}
.crew-nav.n svg{transform:rotate(180deg)}
.crew-dots{display:flex;justify-content:center;gap:9px;margin-top:34px}
.crew-dots button{width:8px;height:8px;padding:0;border:0;border-radius:50%;cursor:pointer;
  background:var(--line-2);transition:width .3s var(--e),background .3s var(--e)}
.crew-dots button[aria-selected="true"]{width:26px;border-radius:100px;background:var(--bronze)}
.crew-dots button:focus-visible{outline:3px solid var(--bronze);outline-offset:3px}

/* sans son titre (page Offres, où l'en-tête est déjà là) il colle au-dessus */
.t-crew.nu{padding-top:4px}
@media (max-width:760px){
  .t-crew{padding:72px 0 84px}
  .crew-stage{height:clamp(400px,112vw,460px)}
  .crew-nav{width:42px;height:42px;margin-top:-21px}
}
@media (prefers-reduced-motion:reduce){
  .crew-c,.crew-nav,.crew-dots button{transition:none}
}
</style>

<section class="t-crew" aria-labelledby="crew-t">
  <div class="crew-head">
    <p class="crew-k">L'équipe Talos</p>
    <h2 id="crew-t">Cinq assistants, <em>une seule équipe</em></h2>
    <p>Choisissez les assistants dont vous avez besoin. Ils prennent en charge les tâches
      qui vous prennent du temps, pendant que vous vous concentrez sur vos chantiers.</p>
  </div>

  <div class="crew-stage" id="crew">
    <button class="crew-nav p" type="button" aria-label="Assistant précédent">@@CHEV@@</button>
    <ul class="crew-track">
@@CARTES@@
    </ul>
    <button class="crew-nav n" type="button" aria-label="Assistant suivant">@@CHEV@@</button>
  </div>

  <div class="crew-dots" role="tablist" aria-label="Choisir un assistant">@@DOTS@@</div>
</section>

<script>
/* Carrousel « cover-flow » : la carte du centre est droite, les autres
   pivotent et reculent. Tout se joue en transform (aucun reflow). */
(function(){
  var st=document.getElementById('crew'); if(!st) return;
  var cards=[].slice.call(st.querySelectorAll('.crew-c')),
      dots=[].slice.call(document.querySelectorAll('.crew-dots button')),
      n=cards.length, cur=0, timer=null,
      calme=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function place(){
    cards.forEach(function(c,i){
      var d=i-cur;                       /* distance signée la plus courte */
      if(d> n/2) d-=n; if(d< -n/2) d+=n;
      var a=Math.abs(d), vu=a<=2;
      c.style.transform='translateX('+(d*68)+'%) translateZ('+(-a*230)+'px) '
        +'rotateY('+(d*-26)+'deg) scale('+(1-a*0.04)+')';
      c.style.opacity = vu ? (a===0?1:(a===1?.66:.26)) : 0;
      c.style.zIndex  = String(50-a);
      c.style.filter  = a===0 ? 'none' : 'saturate(.72)';
      c.style.pointerEvents = vu ? 'auto' : 'none';
      if(a===0){ c.setAttribute('data-act',''); } else { c.removeAttribute('data-act'); }
    });
    dots.forEach(function(b,i){ b.setAttribute('aria-selected', i===cur?'true':'false'); });
  }
  function go(i){ cur=(i%n+n)%n; place(); }
  function suivant(){ go(cur+1); }

  function lance(){ if(calme||timer) return; timer=setInterval(suivant,4200); }
  function arrete(){ clearInterval(timer); timer=null; }

  st.querySelector('.crew-nav.p').addEventListener('click',function(){go(cur-1);arrete();lance();});
  st.querySelector('.crew-nav.n').addEventListener('click',function(){go(cur+1);arrete();lance();});
  dots.forEach(function(b,i){ b.addEventListener('click',function(){go(i);arrete();lance();}); });
  cards.forEach(function(c,i){ c.addEventListener('click',function(e){
    if(i!==cur){ e.preventDefault(); go(i); arrete(); lance(); }
  }); });
  st.addEventListener('mouseenter',arrete); st.addEventListener('mouseleave',lance);
  st.addEventListener('focusin',arrete);    st.addEventListener('focusout',lance);
  st.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'){ go(cur-1); } else if(e.key==='ArrowRight'){ go(cur+1); }
  });
  /* on n'anime que si la section est à l'écran */
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es[0].isIntersecting ? lance() : arrete();
    },{threshold:.25}).observe(st);
  } else { lance(); }
  place();
})();
</script>
'''
BLOC = (BLOC.replace('@@CARTES@@', u'\n'.join(cartes))
            .replace('@@DOTS@@', dots)
            .replace('@@CHEV@@', CHEV))



BLOC = u'''
<!-- ═══ ÉQUIPE — carrousel cover-flow ══════════════════════════════════════ -->
<style id="crew-css">
.t-crew{--bronze:#E0631F;--bronze-2:#F4823E;--bronze-rgb:224,99,31;
  --parch:#F6EEE7;--lin:#AB9F95;--ink:#140F0C;--ink-2:#1C1611;--ink-3:#241B15;
  --line:rgba(246,238,231,.08);--line-2:rgba(246,238,231,.15);
  --e:cubic-bezier(.16,1,.3,1);
  position:relative;overflow:hidden;padding:96px 0 104px;
  background:var(--ink);color:var(--parch);
  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
html[data-theme="light"] .t-crew{--bronze:#C5531C;--bronze-2:#E0631F;--bronze-rgb:197,83,28;
  --parch:#1C1310;--lin:#6E6058;--ink:#FBF6F2;--ink-2:#FFFFFF;--ink-3:#F4EBE3;
  --line:rgba(40,25,16,.12);--line-2:rgba(40,25,16,.22)}
.t-crew::before{content:"";position:absolute;inset:auto 0 -30% 0;height:70%;pointer-events:none;
  background:radial-gradient(60% 60% at 50% 40%,rgba(var(--bronze-rgb),.16) 0%,transparent 70%)}

.crew-head{position:relative;max-width:1180px;margin:0 auto 44px;padding:0 24px;text-align:center}
.crew-k{margin:0 0 14px;font-family:ui-monospace,"SF Mono",Menlo,monospace;
  font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--bronze)}
.crew-head h2{margin:0 0 14px;font-size:clamp(30px,3.4vw,46px);line-height:1.06;
  letter-spacing:-1.6px;font-weight:800;color:var(--parch)}
.crew-head h2 em{font-style:normal;
  background:linear-gradient(100deg,#FFE7D4 0%,var(--bronze-2) 48%,var(--bronze) 100%);
  background-size:220% 100%;-webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;color:transparent;
  animation:crewGrad 6s ease-in-out infinite}
html[data-theme="light"] .crew-head h2 em{
  background:linear-gradient(100deg,#8E3208 0%,var(--bronze) 50%,#F0873F 100%);
  background-size:220% 100%;-webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent}
@keyframes crewGrad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.crew-head p{margin:0 auto;max-width:52ch;font-size:16.5px;line-height:1.6;color:var(--lin)}

/* la scène : les cartes tournent autour de celle du centre */
.crew-stage{position:relative;height:clamp(470px,46vw,540px);
  perspective:1500px;perspective-origin:50% 45%}
.crew-track{list-style:none;margin:0;padding:0;position:absolute;inset:0;
  transform-style:preserve-3d}
.crew-c{position:absolute;top:0;left:50%;width:clamp(230px,24vw,286px);height:100%;
  margin-left:calc(clamp(230px,24vw,286px) / -2);
  transition:transform .62s var(--e),opacity .62s var(--e),filter .62s var(--e);
  will-change:transform}
.crew-c a{display:flex;flex-direction:column;height:100%;overflow:hidden;
  border-radius:26px;text-decoration:none;color:inherit;
  background:var(--ink-2);border:1px solid var(--line);
  box-shadow:0 30px 70px -30px rgba(0,0,0,.8)}
html[data-theme="light"] .crew-c a{box-shadow:0 30px 70px -34px rgba(40,25,16,.34)}
.crew-c[data-act] a{border-color:rgba(var(--bronze-rgb),.42);
  box-shadow:0 34px 80px -26px rgba(var(--bronze-rgb),.42)}

.crew-vis{position:relative;display:block;height:60%;overflow:hidden;
  background:radial-gradient(120% 84% at 50% 4%,rgba(var(--bronze-rgb),.20) 0%,transparent 70%)}
.crew-vis img{position:absolute;left:50%;top:10px;transform:translateX(-50%);
  height:640px;width:auto;max-width:none}
/* le fondu du bas est un voile, pas un mask-image : dans un contexte 3D
   (la scène est en preserve-3d) le masque n'est pas peint. */
.crew-vis::after{content:"";position:absolute;left:0;right:0;bottom:0;height:38%;
  pointer-events:none;
  background:linear-gradient(180deg,color-mix(in srgb,var(--ink-2),transparent 100%),var(--ink-2))}
.crew-soon{position:absolute;top:12px;right:12px;font-style:normal;
  font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  padding:4px 9px;border-radius:100px;color:var(--bronze);
  background:color-mix(in srgb,var(--ink) 72%,transparent);
  border:1px solid rgba(var(--bronze-rgb),.42)}
.crew-txt{display:flex;flex-direction:column;flex:1;padding:18px 20px 20px}
.crew-txt small{font-family:ui-monospace,"SF Mono",Menlo,monospace;
  font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--bronze)}
.crew-txt b{margin:7px 0 6px;font-size:18.5px;line-height:1.15;letter-spacing:-.6px;
  font-weight:800;color:var(--parch)}
/* l'accroche : la phrase qu'on retient, au-dessus de l'explication */
.crew-h{flex:1;margin:0;font-size:14.5px;line-height:1.4;font-weight:600;
  letter-spacing:-.2px;color:var(--parch)}
.crew-go{display:inline-flex;align-items:center;gap:7px;margin-top:14px;
  font-size:13.5px;font-weight:700;color:var(--bronze)}
.crew-go svg{width:14px;height:14px}

/* flèches et pastilles */
.crew-nav{position:absolute;top:50%;z-index:20;display:grid;place-items:center;
  width:48px;height:48px;margin-top:-24px;padding:0;border-radius:50%;cursor:pointer;
  color:var(--parch);background:color-mix(in srgb,var(--ink-3) 88%,transparent);
  border:1px solid var(--line-2);backdrop-filter:blur(10px);
  transition:transform .25s var(--e),border-color .25s var(--e)}
.crew-nav:hover{transform:scale(1.07);border-color:rgba(var(--bronze-rgb),.55)}
.crew-nav:focus-visible{outline:3px solid var(--bronze);outline-offset:3px}
.crew-nav svg{width:20px;height:20px}
.crew-nav.p{left:max(16px,calc(50% - 640px))}
.crew-nav.n{right:max(16px,calc(50% - 640px))}
.crew-nav.n svg{transform:rotate(180deg)}
.crew-dots{display:flex;justify-content:center;gap:9px;margin-top:34px}
.crew-dots button{width:8px;height:8px;padding:0;border:0;border-radius:50%;cursor:pointer;
  background:var(--line-2);transition:width .3s var(--e),background .3s var(--e)}
.crew-dots button[aria-selected="true"]{width:26px;border-radius:100px;background:var(--bronze)}
.crew-dots button:focus-visible{outline:3px solid var(--bronze);outline-offset:3px}

/* sans son titre (page Offres, où l'en-tête est déjà là) il colle au-dessus */
.t-crew.nu{padding-top:4px}
@media (max-width:760px){
  .t-crew{padding:72px 0 84px}
  .crew-stage{height:clamp(400px,112vw,460px)}
  .crew-nav{width:42px;height:42px;margin-top:-21px}
}
@media (prefers-reduced-motion:reduce){
  .crew-c,.crew-nav,.crew-dots button{transition:none}
}
</style>

<section class="t-crew" aria-labelledby="crew-t">
  <div class="crew-head">
    <p class="crew-k">L'équipe Talos</p>
    <h2 id="crew-t">Une équipe <em>sur mesure</em></h2>
    <p>Choisissez les assistants dont vous avez besoin. Ils prennent en charge les tâches
      qui vous prennent du temps, pendant que vous vous concentrez sur vos chantiers.</p>
  </div>

  <div class="crew-stage" id="crew">
    <button class="crew-nav p" type="button" aria-label="Assistant précédent">@@CHEV@@</button>
    <ul class="crew-track">
@@CARTES@@
    </ul>
    <button class="crew-nav n" type="button" aria-label="Assistant suivant">@@CHEV@@</button>
  </div>

  <div class="crew-dots" role="tablist" aria-label="Choisir un assistant">@@DOTS@@</div>
</section>

<script>
/* Carrousel « cover-flow » : la carte du centre est droite, les autres
   pivotent et reculent. Tout se joue en transform (aucun reflow). */
(function(){
  var st=document.getElementById('crew'); if(!st) return;
  var cards=[].slice.call(st.querySelectorAll('.crew-c')),
      dots=[].slice.call(document.querySelectorAll('.crew-dots button')),
      n=cards.length, cur=0, timer=null,
      calme=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function place(){
    cards.forEach(function(c,i){
      var d=i-cur;                       /* distance signée la plus courte */
      if(d> n/2) d-=n; if(d< -n/2) d+=n;
      var a=Math.abs(d), vu=a<=2;
      c.style.transform='translateX('+(d*68)+'%) translateZ('+(-a*230)+'px) '
        +'rotateY('+(d*-26)+'deg) scale('+(1-a*0.04)+')';
      c.style.opacity = vu ? (a===0?1:(a===1?.66:.26)) : 0;
      c.style.zIndex  = String(50-a);
      c.style.filter  = a===0 ? 'none' : 'saturate(.72)';
      c.style.pointerEvents = vu ? 'auto' : 'none';
      if(a===0){ c.setAttribute('data-act',''); } else { c.removeAttribute('data-act'); }
    });
    dots.forEach(function(b,i){ b.setAttribute('aria-selected', i===cur?'true':'false'); });
  }
  function go(i){ cur=(i%n+n)%n; place(); }
  function suivant(){ go(cur+1); }

  function lance(){ if(calme||timer) return; timer=setInterval(suivant,4200); }
  function arrete(){ clearInterval(timer); timer=null; }

  st.querySelector('.crew-nav.p').addEventListener('click',function(){go(cur-1);arrete();lance();});
  st.querySelector('.crew-nav.n').addEventListener('click',function(){go(cur+1);arrete();lance();});
  dots.forEach(function(b,i){ b.addEventListener('click',function(){go(i);arrete();lance();}); });
  cards.forEach(function(c,i){ c.addEventListener('click',function(e){
    if(i!==cur){ e.preventDefault(); go(i); arrete(); lance(); }
  }); });
  st.addEventListener('mouseenter',arrete); st.addEventListener('mouseleave',lance);
  st.addEventListener('focusin',arrete);    st.addEventListener('focusout',lance);
  st.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'){ go(cur-1); } else if(e.key==='ArrowRight'){ go(cur+1); }
  });
  /* on n'anime que si la section est à l'écran */
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es[0].isIntersecting ? lance() : arrete();
    },{threshold:.25}).observe(st);
  } else { lance(); }
  place();
})();
</script>
'''
BLOC = (BLOC.replace('@@CARTES@@', u'\n'.join(cartes))
            .replace('@@DOTS@@', dots)
            .replace('@@CHEV@@', CHEV))


def bloc(avec_titre=True):
    b = BLOC
    if not avec_titre:
        i = b.index('<div class="crew-head">')
        j = b.index('</div>', b.index('vous concentrez sur vos chantiers')) + 6
        b = (b[:i] + b[j:]).replace('<section class="t-crew"', '<section class="t-crew nu"')
    return b
