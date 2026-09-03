/* FAQ — les deux pastilles basculent entre les listes de questions.
   Pas de framework : deux panneaux, on masque l'autre. Les flèches gauche et
   droite passent d'une pastille à l'autre, comme l'attend un lecteur d'écran
   sur un rôle « tablist ». */
(function () {
  var tabs = [].slice.call(document.querySelectorAll('.b4-tabs .tab'));
  if (!tabs.length) return;

  function montrer(actif) {
    tabs.forEach(function (t) {
      var choisi = t === actif;
      t.setAttribute('aria-selected', choisi ? 'true' : 'false');
      var panneau = document.getElementById(t.getAttribute('aria-controls'));
      if (!panneau) return;
      panneau.hidden = !choisi;
      /* on referme les questions du panneau qu'on quitte : rouvrir sur une
         liste déjà dépliée donnait une hauteur incohérente */
      if (!choisi) {
        [].forEach.call(panneau.querySelectorAll('details[open]'), function (d) {
          d.open = false;
        });
      }
    });
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { montrer(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var suivant = tabs[(i + d + tabs.length) % tabs.length];
      suivant.focus();
      montrer(suivant);
    });
  });
})();
