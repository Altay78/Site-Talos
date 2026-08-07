
(function(){
  'use strict';

  var eurFmt = new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  var eur = { format: function(v){ return eurFmt.format(v).replace(/\u202f/g,'\u00a0'); } };
  var num  = new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0});
  var dec1 = new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1});
  var dec2 = new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2});
  var pct  = new Intl.NumberFormat('fr-FR',{style:'percent',maximumFractionDigits:0});

  var CAP = 5;   // plafond volontaire, en chantiers/mois
  var MOIS = 12;

  var $ = function(id){ return document.getElementById(id); };
  var elV=$('V'), elS=$('S'), elM=$('M'), segT=$('T'), segD=$('D');
  // défaut : « sous 3 à 5 jours », le délai moyen du marché
  var malus = 0.50;
  // défaut : « plus d'1 h » par devis
  var tps = 1.5;
  // part du temps administratif fait le soir ou le week-end
  var PART_SOIR = 0.5;

  /* remplissage de la piste du curseur */
  function paint(el){
    var p = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.setProperty('--pct', p);
  }

  /* ─────────────────────────────────────────────────────────
     MODÈLE. Chaque ligne est refaisable de tête par l'artisan.
     ───────────────────────────────────────────────────────── */
  function model(){
    var V = +elV.value;
    var T = tps;
    var M = +elM.value;

    // Garde-fou : on ne peut pas signer plus de devis qu'on n'en envoie.
    // Sans ça, S=30 / V=15 afficherait un taux de conversion de 200 %.
    var S = Math.min(+elS.value, V);

    var taux   = S / V;
    var perdus = V - S;                       // devis non signés
    var brut   = perdus * malus;              // part imputable au délai
    var arrondi = Math.round(brut);
    var chantiers = Math.min(CAP, arrondi);   // plafond volontaire
    var plafonne  = arrondi > CAP;

    return {
      V:V, S:S, M:M, T:T, malus:malus,
      taux:taux, perdus:perdus, brut:brut,
      chantiers:chantiers, plafonne:plafonne,
      caMois: chantiers * M,
      caAn:   chantiers * M * MOIS,
      heures: V * T,
      soirees: V * T * PART_SOIR
    };
  }

  /* ── graphe : cumul 12 mois, sans hypothèse de croissance ──
     grille de fond, axe des montants en k€, total flotté sur le dernier mois */
  function kEur(v){
    if (v >= 1000) return num.format(Math.round(v / 1000)) + ' k€';
    return num.format(Math.round(v)) + ' €';
  }

  function chart(r){
    var plot=$('plot'), xax=$('xax'), yax=$('yax'), h='', x='', y='';
    var maxTotal = (r.S + r.chantiers) * r.M * MOIS || 1;
    for (var m=1; m<=MOIS; m++){
      var base = r.S * r.M * m;
      var add  = r.chantiers * r.M * m;
      var lo = base / maxTotal * 100;
      var up = add  / maxTotal * 100;
      var last = (m === MOIS && add > 0);
      h += '<div class="bar' + (last ? ' last' : '') + '"'
         + ' title="Mois ' + m + ' — ' + eur.format(base + add) + ' cumulés">'
         + (last ? '<span class="badge">+' + kEur(add) + '</span>' : '')
         + (up > 0 ? '<div class="up" style="height:'+up.toFixed(2)+'%"></div>' : '')
         + '<div class="lo" style="height:'+lo.toFixed(2)+'%"></div></div>';
      x += '<span>M'+m+'</span>';
    }
    // 5 graduations, du haut vers le bas : elles s'alignent sur les lignes de grille
    for (var g=4; g>=0; g--){ y += '<span>' + kEur(maxTotal * g / 4) + '</span>'; }
    plot.innerHTML = h; xax.innerHTML = x; yax.innerHTML = y;

    var sans = r.S * r.M * MOIS;
    var avec = sans + r.caAn;
    $('sumSans').textContent  = eur.format(sans);
    $('sumAvec').textContent  = eur.format(avec);
    $('sumDelta').textContent = (r.caAn > 0 ? '+' : '') + eur.format(r.caAn) + ' sur l\'année';
  }

  /* ── phrase de synthèse : deux cas, deux discours ── */
  function phrase(r){
    var hs = dec1.format(r.heures);
    var jours = dec1.format(r.heures / 8);

    if (r.chantiers === 0){
      // Cas honnête : le calcul ne donne pas un chantier entier. On ne l'invente pas.
      return 'À ce volume et avec ce délai, le calcul ne donne pas un chantier entier par mois — '
           + 'on ne va pas vous vendre l\'inverse. Ce que Talos vous rend, c\'est <i>' + hs + ' h</i> '
           + 'par mois, soit ' + jours + ' journées que vous ne passez plus sur l\'ordinateur.';
    }
    var plur = r.brut >= 2;
    return 'Avec votre activité actuelle, Talos pourrait vous permettre de récupérer jusqu\'à '
         + '<b>' + dec1.format(r.brut) + ' chantier' + (plur ? 's' : '') + ' par mois</b>, '
         + 'soit environ <b>' + eur.format(r.caMois) + '</b> de chiffre d\'affaires potentiel '
         + 'tout en vous faisant économiser <i>' + hs + ' heures</i> d\'administratif.';
  }

  function labelDelai(){
    var b = segD.querySelector('.on');
    return b ? b.dataset.lab : '';
  }

  /* ── rendu ── */
  function render(){
    var r = model();

    // le curseur S ne doit jamais dépasser V : on borne le max dynamiquement
    elS.max = Math.min(30, r.V);
    $('sMax').textContent = elS.max;
    if (+elS.value > +elS.max) { elS.value = elS.max; }
    [elV, elS, elM].forEach(paint);

    $('vV').textContent = r.V + ' devis';
    $('vS').textContent = r.S + ' signé' + (r.S > 1 ? 's' : '');
    $('vM').textContent = eur.format(r.M);

    var sum = $('sheetSum');
    if (sum) sum.textContent = r.V + ' devis · ' + r.S + ' signé' + (r.S > 1 ? 's' : '')
                             + ' · ' + eur.format(r.M);

    // 1. ce qu'on gagne : des chantiers. 2. ce que ça pèse : des euros.
    $('chantiers').textContent = r.chantiers > 0
      ? '+' + r.chantiers + ' chantier' + (r.chantiers > 1 ? 's' : '') + ' / mois'
      : 'Pas de chantier en plus';
    $('caMois').textContent = (r.caMois > 0 ? '+' : '') + eur.format(r.caMois);
    $('caAn').textContent   = eur.format(r.caAn);

    // 3. les heures rendues. 4. la part qui vous mange vos soirées.
    $('heures').textContent = dec1.format(r.heures) + ' h / mois';
    $('heuresSub').textContent = 'Soit ' + dec1.format(r.heures / 8)
      + ' journées de chantier rendues chaque mois.';
    $('soirees').textContent = dec1.format(r.soirees) + ' h / mois';
    $('soireesSub').textContent = 'La moitié de cette paperasse se fait le soir ou le week-end. Vous la récupérez.';

    // audit
    $('a1').textContent  = r.V + ' devis';
    $('a2').textContent  = r.S + ' devis';
    $('a2f').textContent = 'taux de ' + pct.format(r.taux);
    $('a3').textContent  = r.perdus + ' devis';
    $('a3f').textContent = r.V + ' − ' + r.S;
    $('a4').textContent  = dec2.format(r.brut);
    $('a4f').textContent = r.perdus + ' × ' + pct.format(r.malus);
    $('a5').textContent  = (r.caMois > 0 ? '+' : '') + eur.format(r.caMois);
    $('a5f').textContent = r.chantiers + ' chantier' + (r.chantiers > 1 ? 's' : '') + ' × ' + eur.format(r.M);

    $('noteTxt').textContent = r.plafonne
      ? 'Votre calcul brut donne ' + Math.round(r.brut) + ' chantiers : nous l\'avons volontairement ramené à ' + CAP + ', notre plafond. Nous préférons vous sous-promettre.'
      : 'Estimation volontairement plafonnée à +' + CAP + ' chantiers par mois. Le gain ne peut jamais dépasser le nombre de devis que vous perdez déjà — un simulateur qui promet plus que ça vous ment.';

    $('synth').innerHTML = phrase(r);

    // un seul libellé pour les deux CTA (bas de page + duplicata mobile)
    var ctaLabel = r.caMois > 0
      ? 'Récupérer ces ' + eur.format(r.caMois) + ' — Réserver une démo'
      : 'Récupérer ces ' + dec1.format(r.heures) + ' h — Réserver une démo';
    $('ctaTxt').textContent  = ctaLabel;
    $('ctaMTxt').textContent = ctaLabel;

    chart(r);
    syncStp();
  }

  [elV, elS, elM].forEach(function(el){
    el.addEventListener('input', render);
  });

  /* boutons − / + : un appui = un pas de l'input, bornes comprises.
     on repasse par render() pour que tout le reste suive (max de S, CTA, courbe) */
  function syncStp(){
    [].forEach.call(document.querySelectorAll('.t-roi .stp'), function(b){
      var el = $(b.dataset.for);
      if (!el) return;
      b.disabled = +b.dataset.dir < 0
        ? +el.value <= +el.min
        : +el.value >= +el.max;
    });
  }
  [].forEach.call(document.querySelectorAll('.t-roi .stp'), function(b){
    b.addEventListener('click', function(){
      var el = $(b.dataset.for);
      if (!el) return;
      var step = +el.step || 1;
      var v = Math.min(+el.max, Math.max(+el.min, +el.value + step * +b.dataset.dir));
      /* les pas décimaux (0,25 h) traînent des flottants : on recale sur le pas */
      el.value = Math.round(v / step) * step;
      render();
    });
  });

  /* les deux groupes de puces se cochent de la même façon : une seule réponse
     active, la couleur de la pastille dit si elle vous coûte cher ou non */
  function puces(group, apply){
    group.addEventListener('click', function(e){
      var b = e.target.closest('button');
      if (!b) return;
      group.querySelectorAll('button').forEach(function(x){
        x.classList.remove('on');
        x.setAttribute('aria-checked','false');
      });
      b.classList.add('on');
      b.setAttribute('aria-checked','true');
      apply(b);
      render();
    });
  }
  puces(segD, function(b){ malus = +b.dataset.d; });
  puces(segT, function(b){ tps   = +b.dataset.t; });

  render();
})();

/* Feuilles mobiles du simulateur. Les panneaux existent déjà dans la page :
   on ne fait que les basculer en overlay, donc aucun état n'est dupliqué. */
(function(){
  var veil = document.getElementById('roiVeil');
  if (!veil) return;

  var open = null;

  // le voile porte l'attribut `hidden` au repos : son display ne dit rien du
  // point de bascule. On interroge donc la media query directement.
  var mq = window.matchMedia('(max-width:1080px)');
  function sheetMode(){ return mq.matches; }

  var sec = document.getElementById('simulateur');

  function show(el){
    open = el;
    sec.classList.add('sheets-open');
    veil.hidden = false;
    // le voile doit être peint avant qu'on lance sa transition d'opacité
    requestAnimationFrame(function(){ veil.classList.add('on'); });
    el.classList.add('open');
    el.scrollTop = 0;              // une feuille rouverte doit repartir du haut
    document.body.style.overflow = 'hidden';
    var ok = el.querySelector('.sheet-ok');
    if (ok) ok.focus();
  }

  function hide(){
    if (!open) return;
    open.classList.remove('open');
    open = null;
    veil.classList.remove('on');
    document.body.style.overflow = '';
    var done = function(){
      if (open) return;
      veil.hidden = true;
      sec.classList.remove('sheets-open');
    };
    veil.addEventListener('transitionend', done, {once:true});
    setTimeout(done, 450); // filet si la transition ne se déclenche pas
  }

  document.addEventListener('click', function(e){
    var btn = e.target.closest('.sheet-btn');
    if (btn){
      var el = document.getElementById(btn.dataset.sheet);
      if (el) show(el);
      return;
    }
    if (e.target.closest('[data-close]')) hide();
  });

  veil.addEventListener('click', hide);
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') hide(); });

  // repassage en desktop pendant qu'une feuille est ouverte : elle redevient
  // un bloc normal, il faut rendre le scroll à la page
  window.addEventListener('resize', function(){
    if (open && !sheetMode()) hide();
  }, {passive:true});
})();
