/* ═══ calculateur de coût administratif ═══
   Tout est recalculé à chaque frappe : aucune requête, rien ne sort du
   navigateur. Conventions annoncées dans la mention légale de la section :
   4 semaines par mois, 48 semaines travaillées par an, journée de 8 h. */
(function(){
  'use strict';

  var table = document.getElementById('gTable');
  if (!table) return;

  var WEEKS_M = 4, WEEKS_Y = 48, DAY_H = 8, TALOS = 199;
  /* ordre de grandeur d'un chantier chez les artisans accompagnés : il sert
     uniquement à traduire des heures libérées en opportunités concrètes */
  var JOB_H = 28, JOB_EUR = 5000;

  var eurFmt = new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  /* Intl produit une espace fine insécable (U+202F), avalée par
     l'interlettrage négatif de la DA : on repasse en espace insécable */
  function eur(v){ return eurFmt.format(Math.round(v)).replace(/ /g,' '); }
  function num(v){ return new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(v); }

  /* 7.5 → « 7 h 30 » : les artisans lisent des heures, pas des décimales */
  function hm(h){
    var t = Math.round(h * 60);
    var H = Math.floor(t / 60), M = t % 60;
    if (H >= 100) return num(H) + ' h';
    return H + ' h' + (M ? ' ' + (M < 10 ? '0' : '') + M : '');
  }

  var rate = document.getElementById('gRate');
  var rows = [].slice.call(table.querySelectorAll('tbody tr'));
  var out  = {};
  ['gHw','gHm','gHy','gDy','gCw','gCm','gCy','gCy2','gNoTalos','gSave','gPct',
   'gJobs','gCa','gHours'].forEach(function(id){ out[id] = document.getElementById(id); });

  function val(input, fallback){
    var v = parseFloat(input.value);
    return isNaN(v) || v < 0 ? fallback : v;
  }

  function update(){
    var r = val(rate, 0);
    var hWeek = 0;

    rows.forEach(function(tr){
      var on   = tr.querySelector('[data-role="on"]').checked;
      var qty  = val(tr.querySelector('[data-role="qty"]'), 0);
      var mins = parseFloat(tr.dataset.min);
      /* « 45 min / jour » : la quantité saisie est un nombre de jours */
      var h    = mins * qty / 60;

      tr.classList.toggle('off', !on);
      tr.querySelector('[data-role="time"]').textContent = hm(h);
      tr.querySelector('[data-role="cost"]').textContent = eur(h * r);
      if (on) hWeek += h;
    });

    var hMonth = hWeek * WEEKS_M, hYear = hWeek * WEEKS_Y;
    var cWeek  = hWeek * r, cMonth = hMonth * r, cYear = hYear * r;

    out.gHw.textContent = hm(hWeek);
    out.gHm.textContent = hm(hMonth);
    out.gHy.textContent = hm(hYear);
    out.gDy.textContent = num(Math.round(hYear / DAY_H)) + ' j';

    out.gCw.textContent  = eur(cWeek);
    out.gCm.textContent  = eur(cMonth);
    out.gCy.textContent  = eur(cYear);
    out.gCy2.textContent = eur(cYear);

    out.gNoTalos.innerHTML = eur(cMonth) + ' <span style="font-size:.55em;font-weight:600">/ mois</span>';

    /* si l'administratif coûte moins que l'abonnement, on ne maquille pas :
       on affiche une économie nulle plutôt qu'un nombre négatif */
    var save = Math.max(0, cMonth - TALOS);
    out.gSave.innerHTML = eur(save) + ' <span style="font-size:.5em;font-weight:600">/ mois</span>';
    out.gPct.textContent = (cMonth > 0 ? '-' + Math.round(save / cMonth * 100) : '0') + '%';

    /* on garde la demi-décimale : arrondir « 4,5 chantiers » à 4 efface
       près d'un chantier de marge, et à 5 promet ce qu'on ne tient pas */
    var jobs = Math.round(hMonth / JOB_H * 2) / 2;
    out.gJobs.textContent  = jobs.toLocaleString('fr-FR');
    out.gCa.textContent    = eur(jobs * JOB_EUR);
    out.gHours.textContent = hm(hMonth) + ' / mois';
  }

  table.addEventListener('input',  update);
  table.addEventListener('change', update);
  rate.addEventListener('input',   update);
  update();
})();
