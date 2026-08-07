
/* bascule de thème — même clé de stockage que le reste du site */
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
  document.getElementById('tnav-menu').addEventListener('click', function(e){
    if (e.target.closest('a')) close();
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  document.addEventListener('click', function(e){
    if (wrap.classList.contains('open') && !wrap.contains(e.target)) close();
  });
})();


/* année du pied de page */
(function(){
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
