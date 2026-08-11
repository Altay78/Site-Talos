/* ══════════════════════════════════════════════════════════════════
   TALOS · PASTILLE DÉPLIANTE
   Transforme la pastille de section (« Comment Talos travaille »,
   « Tarifs », « Une question ? »…) en bouton qui déplie le texte
   d'introduction. Toujours replié au départ, sur téléphone comme sur
   ordinateur : le texte n'apparaît que si on le demande.
   Sans JS, tout reste visible : rien n'est perdu.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CHEV =
    '<svg class="tf-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg>';

  var uid = 0;
  var folds = [];

  /* ── 1. les pastilles de section ─────────────────────────────── */

  function paragraphsAfter(pill) {
    /* on ramasse les paragraphes qui suivent le titre, et on s'arrête
       dès qu'autre chose apparaît (liste de réassurance, grille, form…) */
    var out = [];
    var node = pill.nextElementSibling;
    while (node) {
      var tag = node.tagName;
      if (tag === 'P') {
        out.push(node);
      } else if (!/^H[1-6]$/.test(tag)) {
        break;
      }
      node = node.nextElementSibling;
    }
    return out;
  }

  function setup(pill) {
    /* la page « Pourquoi Talos » a sa propre narration : on n'y touche pas */
    if (pill.closest('.t-why')) return;
    if (pill.hasAttribute('data-tf-skip')) return;
    if (pill.closest('a, button')) return;

    var paras = paragraphsAfter(pill);
    if (!paras.length) return;

    var id = 'tf-panel-' + ++uid;

    /* panneau */
    var panel = document.createElement('div');
    panel.className = 'tf-panel';
    panel.id = id;
    var inner = document.createElement('div');
    inner.className = 'tf-panel-in';
    panel.appendChild(inner);
    paras[0].parentNode.insertBefore(panel, paras[0]);
    paras.forEach(function (p) { inner.appendChild(p); });

    /* la pastille devient un vrai bouton (clavier + lecteur d'écran) */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = pill.className + ' tf-trigger';
    btn.innerHTML = pill.innerHTML + CHEV;
    btn.setAttribute('aria-controls', id);
    var label = (pill.textContent || '').trim();
    if (label) btn.setAttribute('aria-label', label + ' — afficher le détail');
    pill.parentNode.replaceChild(btn, pill);

    var entry = { btn: btn, panel: panel, touched: false };
    folds.push(entry);

    btn.addEventListener('click', function () {
      entry.touched = true;
      open(entry, !panel.classList.contains('tf-open'));
    });

    /* toujours replié au départ, quelle que soit la taille d'écran :
       le texte ne s'affiche que si on le demande */
    open(entry, false);
  }

  function open(entry, on) {
    entry.panel.classList.toggle('tf-open', on);
    entry.btn.setAttribute('aria-expanded', on ? 'true' : 'false');
  }

  /* ── 2. les blocs longs repliés sur téléphone ────────────────── */

  var mobileDetails = [];

  function setDetails(el, on) {
    /* on marque nos propres bascules pour ne pas les confondre
       avec un geste de l'utilisateur */
    /* l'événement `toggle` est asynchrone : on compare l'état réel à
       l'état attendu plutôt que de poser un drapeau éphémère */
    el._tfExpect = on;
    el.open = on;
  }

  function setupDetails(el) {
    mobileDetails.push(el);
    el.addEventListener('toggle', function () {
      if (el.open !== el._tfExpect) el.dataset.tfTouched = '1';
    });
    setDetails(el, false);
  }

  function init() {
    [].forEach.call(
      document.querySelectorAll('.eyebrow, .fx-eyebrow'),
      setup
    );
    [].forEach.call(
      document.querySelectorAll('details[data-fold-mobile]'),
      setupDetails
    );
    /* on n'anime qu'à partir du deuxième état : au chargement,
       la page s'affiche dans sa position finale, sans clignotement */
    requestAnimationFrame(function () {
      document.documentElement.classList.add('tf-ready');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
