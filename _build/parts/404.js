/* ═══ 404 ═══ */
(function(){
  var v = document.getElementById('x4-video');
  if (!v) return;

  /* mouvement réduit : on garde le poster, fixe */
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function sync(){
    if (mq.matches) { v.pause(); v.removeAttribute('autoplay'); }
    else { var p = v.play(); if (p && p.catch) p.catch(function(){}); }
  }
  (mq.addEventListener ? mq.addEventListener('change', sync) : mq.addListener(sync));
  sync();

  /* certains navigateurs mobiles refusent la lecture auto malgré `muted` :
     le poster reste alors affiché, ce qui est un repli acceptable */
  v.addEventListener('error', function(){ v.style.display = 'none'; });
})();
