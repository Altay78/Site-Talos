/* ═══ blog ═══
   La recherche et les filtres reviendront quand il y aura assez d'articles
   pour qu'ils servent à quelque chose. Il ne reste que la lettre. */
(function(){
  var box  = document.getElementById('letter');
  var form = document.getElementById('letter-form');
  if (!box || !form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    box.classList.add('sent');
  });
})();
