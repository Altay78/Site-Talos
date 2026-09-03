/* ══════════════════════════════════════════════════════════════════════════
   PAGE RÉSERVER

   Trois briques : les menus déroulants (panneau arrondi qui glisse vers le
   bas), le choix des assistants (grisés tant qu'ils ne sont pas pris), et
   l'envoi — le formulaire ouvre l'agenda Calendly déjà pré-rempli, comme
   avant : nom, e-mail, et tout le contexte dans la première question.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var form = document.getElementById('bookForm');
  if (!form) return;

  var CAL = 'https://calendly.com/contact-talos-ai/30min';

  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" '
            + 'stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg>';
  var CHEV = '<svg class="dd-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
           + 'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
           + '<path d="M6 9.5l6 6 6-6"/></svg>';

  var LISTES = {
    pays: ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada', 'Autre pays'],
    taille: ['Je travaille seul', '2 à 5 personnes', '6 à 10 personnes',
             '11 à 25 personnes', 'Plus de 25 personnes'],
    spec: ['Plomberie / chauffage', 'Électricité', 'Maçonnerie / gros œuvre', 'Menuiserie',
           'Couverture / charpente', 'Peinture / finition', 'Carrelage / sols',
           'Terrassement / VRD', 'Multi-services', 'Autre métier']
  };
  var LABELS = {pays: 'Pays', taille: 'Taille de la société', spec: 'Spécialisation'};

  var AGENTS = [
    {id: 'commercial',    n: 'Commercial'},
    {id: 'administratif', n: 'Administratif'},
    {id: 'facturation',   n: 'Facturation'},
    {id: 'tresorerie',    n: 'Trésorerie'},
    {id: 'client',        n: 'Client'}
  ];

  var etat = {pays: 'France', taille: '', spec: '', agents: []};

  /* ── 1 · les menus déroulants ──────────────────────────────────────────── */
  function menu(box) {
    var cle = box.dataset.dd, opts = LISTES[cle], sel = box.dataset.default || '';
    var id = 'dd-' + cle;

    box.innerHTML =
      '<button class="dd-btn" type="button" id="' + id + '-b" aria-haspopup="listbox" '
      + 'aria-expanded="false" aria-labelledby="bk' + cle.charAt(0).toUpperCase()
      + cle.slice(1) + 'Lb ' + id + '-b" data-empty="' + (sel ? '0' : '1') + '">'
      + '<span class="dd-val">' + (sel || 'Sélectionner') + '</span>' + CHEV + '</button>'
      + '<div class="dd-pan" role="listbox" id="' + id + '-p" tabindex="-1" '
      + 'aria-label="' + LABELS[cle] + '">'
      + opts.map(function (o, i) {
          return '<button class="dd-opt" type="button" role="option" data-i="' + i + '" '
               + 'aria-selected="' + (o === sel) + '"><span>' + o + '</span>' + CHECK + '</button>';
        }).join('')
      + '</div>';

    var btn = box.querySelector('.dd-btn'),
        pan = box.querySelector('.dd-pan'),
        val = box.querySelector('.dd-val'),
        items = [].slice.call(box.querySelectorAll('.dd-opt')),
        cur = Math.max(0, opts.indexOf(sel));

    etat[cle] = sel;

    function souligne() {
      items.forEach(function (b, i) { b.classList.toggle('cur', i === cur); });
      if (items[cur]) items[cur].scrollIntoView({block: 'nearest'});
    }
    function ouvre() {
      fermeTout(box);
      box.classList.add('on');
      btn.setAttribute('aria-expanded', 'true');
      souligne();
    }
    function ferme(rendreFocus) {
      box.classList.remove('on');
      btn.setAttribute('aria-expanded', 'false');
      if (rendreFocus) btn.focus();
    }
    function choisit(i) {
      cur = i;
      etat[cle] = opts[i];
      val.textContent = opts[i];
      btn.dataset.empty = '0';
      items.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      ferme(true);
      verrou();
    }

    btn.addEventListener('click', function () {
      box.classList.contains('on') ? ferme(false) : ouvre();
    });
    items.forEach(function (b, i) {
      b.addEventListener('click', function () { choisit(i); });
    });
    box.addEventListener('keydown', function (e) {
      var ouvert = box.classList.contains('on');
      if (e.key === 'Escape' && ouvert) { e.preventDefault(); ferme(true); return; }
      if (!ouvert && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
        e.preventDefault(); ouvre(); return;
      }
      if (!ouvert) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); cur = (cur + 1) % opts.length; souligne(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); cur = (cur - 1 + opts.length) % opts.length; souligne(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisit(cur); }
      else if (e.key === 'Home') { e.preventDefault(); cur = 0; souligne(); }
      else if (e.key === 'End') { e.preventDefault(); cur = opts.length - 1; souligne(); }
    });

    box._ferme = function () { ferme(false); };
  }

  var boites = [].slice.call(form.querySelectorAll('.dd'));
  function fermeTout(sauf) {
    boites.forEach(function (b) { if (b !== sauf && b._ferme) b._ferme(); });
  }
  boites.forEach(menu);
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dd')) fermeTout(null);
  });

  /* ── 2 · les assistants ────────────────────────────────────────────────── */
  var zone = document.getElementById('bkAgents'),
      hint = document.getElementById('bkAgentsHint');

  zone.innerHTML = AGENTS.map(function (a) {
    return '<button class="ag" type="button" aria-pressed="false" data-id="' + a.id + '">'
         + '<img src="perso/avatar-' + a.id + '.webp" alt="" width="44" height="44" '
         + 'loading="lazy" decoding="async">'
         + '<span>' + a.n + '</span></button>';
  }).join('');

  zone.addEventListener('click', function (e) {
    var b = e.target.closest('.ag');
    if (!b) return;
    var pris = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', pris ? 'true' : 'false');
    var i = etat.agents.indexOf(b.dataset.id);
    if (pris && i < 0) etat.agents.push(b.dataset.id);
    if (!pris && i >= 0) etat.agents.splice(i, 1);

    var n = etat.agents.length;
    hint.textContent = n === 0
      ? 'Aucun sélectionné — on en parlera ensemble.'
      : n + (n > 1 ? ' assistants retenus' : ' assistant retenu')
        + ' — on prépare la démo là-dessus.';
  });

  /* ── 3 · l'envoi ───────────────────────────────────────────────────────── */
  var go   = document.getElementById('bkGo'),
      lb   = document.getElementById('bkGoLb'),
      note = document.getElementById('bkNote'),
      ok   = document.getElementById('bkOk'),
      NOTE = note.textContent;

  var champs = ['bkCompany', 'bkName', 'bkTel', 'bkEmail'].map(function (id) {
    return document.getElementById(id);
  });

  function valide() {
    return champs.every(function (c) { return c.value.trim().length > 1; })
        && /\S+@\S+\.\S+/.test(document.getElementById('bkEmail').value)
        && ok.checked;
  }
  function verrou() { go.disabled = !valide(); }

  form.addEventListener('input', verrou);
  ok.addEventListener('change', verrou);
  verrou();

  /* le libellé change, la pastille s'allonge : on anime la largeur mesurée
     plutôt que de laisser le bouton sauter d'une taille à l'autre */
  function libelle(texte) {
    var av = go.getBoundingClientRect().width;
    go.style.width = '';
    lb.style.opacity = '0';
    lb.textContent = texte;
    var ap = go.getBoundingClientRect().width;
    go.style.width = av + 'px';
    void go.offsetWidth;
    go.style.transition = 'width .38s cubic-bezier(.16,1,.3,1), transform .25s var(--e),'
                        + ' box-shadow .25s var(--e), opacity .2s var(--e)';
    go.style.width = ap + 'px';
    requestAnimationFrame(function () { lb.style.opacity = '1'; });
    setTimeout(function () { go.style.width = ''; go.style.transition = ''; }, 420);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valide()) {
      note.textContent = 'Il manque l\'entreprise, le nom, le téléphone, l\'e-mail ou votre accord.';
      note.classList.add('err');
      champs.concat([ok]).forEach(function (c) {
        var vide = c.type === 'checkbox' ? !c.checked : c.value.trim().length < 2;
        c.setAttribute('aria-invalid', vide ? 'true' : 'false');
      });
      return;
    }
    note.textContent = NOTE;
    note.classList.remove('err');

    var noms = etat.agents.map(function (id) {
      return (AGENTS.filter(function (a) { return a.id === id; })[0] || {}).n;
    });
    var resume = [
      'Entreprise : ' + document.getElementById('bkCompany').value.trim(),
      'Téléphone : ' + document.getElementById('bkTel').value.trim(),
      'Pays : ' + etat.pays,
      etat.taille ? 'Taille : ' + etat.taille : '',
      etat.spec ? 'Spécialisation : ' + etat.spec : '',
      document.getElementById('bkSite').value.trim()
        ? 'Site : ' + document.getElementById('bkSite').value.trim() : '',
      noms.length ? 'Assistants souhaités : ' + noms.join(', ') : '',
      document.getElementById('bkPain').value.trim()
        ? 'Problème : ' + document.getElementById('bkPain').value.trim() : ''
    ].filter(Boolean).join(' · ');

    var url = CAL
      + '?name=' + encodeURIComponent(document.getElementById('bkName').value.trim())
      + '&email=' + encodeURIComponent(document.getElementById('bkEmail').value.trim())
      + '&a1=' + encodeURIComponent(resume);

    go.classList.add('busy');
    libelle('Ouverture de l\'agenda…');
    setTimeout(function () { window.location.href = url; }, 420);
  });
})();
