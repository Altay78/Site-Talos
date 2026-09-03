/* section fonctionnalités — carrousel swipé : pastilles + flèches (souris) */
(function(){
  var rail = document.getElementById('fxRail');
  var dots = document.getElementById('fxDots');
  var prev = document.getElementById('fxPrev');
  var next = document.getElementById('fxNext');
  if (!rail || !dots) return;

  var cards = Array.prototype.slice.call(rail.children);
  var stops = [], buttons = [];

  function maxScroll(){ return Math.max(0, rail.scrollWidth - rail.clientWidth); }

  /* Les cartes sont calées en scroll-snap-align:start : le repère est leur bord
     gauche, décalé du padding du rail. En fin de rail plusieurs cartes tombent
     sur la même position (le rail ne peut plus avancer) : on dédoublonne, sinon
     on afficherait des pastilles qu'aucun swipe ne peut atteindre. */
  function buildStops(){
    var max = Math.round(maxScroll());
    var pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
    var out = [];
    cards.forEach(function(card){
      var x = Math.min(Math.round(card.offsetLeft - rail.offsetLeft - pad), max);
      if (!out.length || x - out[out.length - 1] > 8) out.push(x);
    });
    return out.length ? out : [0];
  }

  function buildDots(){
    stops = buildStops();
    dots.textContent = '';
    buttons = stops.map(function(x, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Vue ' + (i + 1) + ' sur ' + stops.length);
      // scrollIntoView recadrerait aussi la page en vertical : on ne bouge que le rail
      b.addEventListener('click', function(){ rail.scrollTo({left: x, behavior: 'smooth'}); });
      dots.appendChild(b);
      return b;
    });
    sync();
  }

  /* recalculé à la demande depuis scrollLeft : ne dépend pas d'un état mis à jour
     par requestAnimationFrame, qui peut être gelé dans un onglet en arrière-plan */
  function currentIndex(){
    var x = rail.scrollLeft, best = 0, bestD = Infinity;
    stops.forEach(function(s, i){
      var d = Math.abs(s - x);
      if (d < bestD){ bestD = d; best = i; }
    });
    return best;
  }

  var ticking = false;
  function sync(){
    ticking = false;
    var i = currentIndex(), x = rail.scrollLeft, max = maxScroll();
    buttons.forEach(function(b, k){ b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    if (prev) prev.disabled = x <= 2;
    if (next) next.disabled = x >= max - 2;
  }
  rail.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sync);
  }, {passive:true});

  function go(step){
    var i = Math.min(stops.length - 1, Math.max(0, currentIndex() + step));
    rail.scrollTo({left: stops[i], behavior: 'smooth'});
  }
  if (prev) prev.addEventListener('click', function(){ go(-1); });
  if (next) next.addEventListener('click', function(){ go(1); });

  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(buildDots, 150);
  }, {passive:true});

  buildDots();
})();

/* section fonctionnalités — visionneuse : la capture est rognée dans la carte,
   on l'ouvre en entier dans un <dialog> natif (focus, Échap et top layer offerts) */
(function(){
  var dlg = document.getElementById('fxZoom');
  var img = document.getElementById('fxZoomImg');
  var ttl = document.getElementById('fxZoomTitle');
  var lead = document.getElementById('fxZoomLead');
  var closeBtn = document.getElementById('fxZoomClose');
  if (!dlg || !img || !dlg.showModal) return;

  var opener = null;

  function open(card){
    var shot = card.querySelector('.fx-screen img');
    if (!shot || !shot.getAttribute('src')) return;
    img.src = shot.getAttribute('src');
    img.alt = shot.alt || '';
    var h3 = card.querySelector('h3');
    var win = card.querySelector('.fx-win');
    ttl.textContent = h3 ? h3.textContent.trim() : '';
    lead.textContent = win ? win.textContent.trim() : '';
    dlg.showModal();
    document.documentElement.classList.add('fx-locked');
  }

  function close(){ if (dlg.open) dlg.close(); }

  document.querySelectorAll('.t-feat .fx-open').forEach(function(btn){
    btn.addEventListener('click', function(){
      opener = btn;
      open(btn.closest('.fx-card'));
    });
  });

  closeBtn.addEventListener('click', close);
  // clic hors de la figure : la cible est le <dialog> lui-même, pas son contenu
  dlg.addEventListener('click', function(e){ if (e.target === dlg) close(); });
  dlg.addEventListener('close', function(){
    // l'événement close est asynchrone : si on a déjà rouvert sur une autre carte
    // entre-temps, ce nettoyage effacerait l'image qui vient d'être posée
    if (dlg.open) return;
    document.documentElement.classList.remove('fx-locked');
    img.removeAttribute('src');
    if (opener) { opener.focus(); opener = null; }
  });
})();
