/* ═══ TALOS V2 — shared scripts ═══ */
(function(){
  /* nav shrink */
  var nav=document.querySelector('nav.v2');
  if(nav) addEventListener('scroll',function(){nav.classList.toggle('shrunk',scrollY>40)},{passive:true});

  /* mobile menu */
  var burger=document.getElementById('v2burger'), menu=document.getElementById('v2menu');
  if(burger&&menu){
    function close(){burger.classList.remove('x');menu.classList.remove('open');document.body.style.overflow='';}
    burger.addEventListener('click',function(){
      var open=menu.classList.toggle('open');burger.classList.toggle('x',open);
      document.body.style.overflow=open?'hidden':'';
    });
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',close)});
    addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  }

  /* theme toggle */
  document.addEventListener('click',function(e){
    var t=e.target.closest('.theme-toggle');if(!t)return;
    var next=document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';
    document.documentElement.setAttribute('data-theme',next);
    try{localStorage.setItem('talos-theme',next)}catch(err){}
  });

  /* reveal on scroll */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.14});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});

  /* steps progress */
  var steps=document.getElementById('steps');
  if(steps){
    var sf=document.getElementById('stepsFill');
    var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
      if(sf) sf.style.width='76%';
      steps.querySelectorAll('.step').forEach(function(s,i){setTimeout(function(){s.classList.add('on')},300+i*450)});
      so.disconnect();
    }})},{threshold:.4});
    so.observe(steps);
  }

  /* FAQ accordion */
  document.querySelectorAll('.qa-q').forEach(function(q){
    q.addEventListener('click',function(){
      var qa=q.parentElement,a=qa.querySelector('.qa-a'),open=qa.classList.contains('open');
      document.querySelectorAll('.qa.open').forEach(function(o){o.classList.remove('open');o.querySelector('.qa-a').style.maxHeight=null});
      if(!open){qa.classList.add('open');a.style.maxHeight=a.scrollHeight+'px'}
    });
  });

  /* booking slot picker */
  var days=document.getElementById('days');
  if(days){
    var DOW=['DIM','LUN','MAR','MER','JEU','VEN','SAM'];
    var state={day:null,slot:null};
    var d=new Date(),added=0;
    while(added<5){
      d.setDate(d.getDate()+1);
      if(d.getDay()===0||d.getDay()===6)continue;
      var b=document.createElement('button');
      b.className='day';b.type='button';
      b.innerHTML='<span class="dow">'+DOW[d.getDay()]+'</span><span class="dnum">'+d.getDate()+'</span>';
      b.dataset.label=DOW[d.getDay()]+' '+d.getDate();
      b.addEventListener('click',function(){
        days.querySelectorAll('.day').forEach(function(x){x.classList.remove('sel')});
        this.classList.add('sel');state.day=this.dataset.label;sync();
      });
      days.appendChild(b);added++;
    }
    document.querySelectorAll('.slot').forEach(function(s){
      s.addEventListener('click',function(){
        document.querySelectorAll('.slot').forEach(function(x){x.classList.remove('sel')});
        this.classList.add('sel');state.slot=this.textContent;sync();
      });
    });
    var pick=document.getElementById('bookPick'),btn=document.getElementById('bookConfirm');
    function sync(){
      if(state.day&&state.slot){
        if(pick)pick.innerHTML='Créneau choisi : <b>'+state.day+' · '+state.slot+'</b>';
        if(btn){btn.classList.add('ready');
          var base=btn.getAttribute('data-href')||'reserver.html';
          btn.href=base+'?jour='+encodeURIComponent(state.day)+'&heure='+encodeURIComponent(state.slot);}
        // hidden form fields if present
        var fj=document.getElementById('fJour'),fh=document.getElementById('fHeure');
        if(fj)fj.value=state.day; if(fh)fh.value=state.slot;
      }else{
        if(pick)pick.innerHTML='Sélectionnez un jour et une heure';
        if(btn)btn.classList.remove('ready');
      }
    }
    // prefill from query (?jour=&heure=)
    var qs=new URLSearchParams(location.search);
    if(qs.get('heure')){
      document.querySelectorAll('.slot').forEach(function(s){if(s.textContent===qs.get('heure'))s.click()});
    }
  }
})();

/* ═══ PRICING toggle ═══ */
(function(){
  var bm=document.getElementById('billMonthly'), ba=document.getElementById('billAnnual');
  if(!bm||!ba)return;
  function set(mode){
    bm.classList.toggle('on',mode==='m');ba.classList.toggle('on',mode==='a');
    document.querySelectorAll('.price-card[data-monthly]').forEach(function(c){
      var amt=c.querySelector('.num'),note=c.querySelector('.price-note'),save=c.querySelector('.price-save');
      var target=mode==='a'?+c.dataset.annual:+c.dataset.monthly;
      var cur=parseInt(amt.textContent.replace(/\D/g,''))||target,t0=performance.now();
      (function tick(t){var p=Math.min((t-t0)/420,1),e=1-Math.pow(1-p,3);amt.textContent=Math.round(cur+(target-cur)*e);if(p<1)requestAnimationFrame(tick)})(t0);
      if(note)note.textContent=mode==='a'?'Facturé annuellement':'Facturé mensuellement';
      if(save)save.classList.toggle('show',mode==='a');
    });
  }
  bm.addEventListener('click',function(){set('m')});
  ba.addEventListener('click',function(){set('a')});
})();

/* ═══ shared sector data ═══ */
var TALOS_AUTOS={
  devis:{l:'Devis express',d:'Photo + voix → devis en 12 min',i:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'},
  relances:{l:'Relances auto',d:'J+3, J+7, J+14 — jamais d\'oubli',i:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>'},
  reponse:{l:'Réponse 24/7',d:'Réponse en 8 s, jour et nuit',i:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'},
  facture:{l:'Facturation auto',d:'Facture émise dès la signature',i:'<path d="M14 4H4v16h16V10"/><path d="M16 4l4 4-7 7h-4v-4z"/>'},
  inbox:{l:'Tri inbox',d:'L\'urgent en haut, le bruit en bas',i:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'},
  paiements:{l:'Suivi paiements',d:'Qui a payé, qui doit — en direct',i:'<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'}
};
var TALOS_SECTORS={
  btp:{l:'le BTP & l\'artisanat',autos:['devis','relances','facture'],plan:'Starter',reason:'Vos devis partent en 12 min au lieu de 4 jours, et plus aucune facture n\'est oubliée le dimanche soir.'},
  resto:{l:'la restauration',autos:['reponse','inbox','paiements'],plan:'Team',reason:'Vos demandes de réservation reçoivent une réponse instantanée, même à 23h — et vous suivez vos encaissements sans y penser.'},
  services:{l:'les services à la personne',autos:['reponse','relances','facture'],plan:'Starter',reason:'Réponse immédiate, rendez-vous confirmés seuls, et facturation qui se déclenche toute seule.'},
  digital:{l:'le digital & le créatif',autos:['devis','facture','paiements'],plan:'Starter',reason:'Devis et factures à votre charte, et un coup d\'œil suffit pour savoir qui vous doit encore de l\'argent.'},
  sante:{l:'le bien-être & la santé',autos:['reponse','relances','inbox'],plan:'Solo',reason:'Prises de rendez-vous confirmées seules et boîte mail triée chaque matin — vous restez concentré sur vos patients.'},
  conseil:{l:'le conseil & le freelance',autos:['devis','relances','facture'],plan:'Starter',reason:'Plus de relances oubliées à 22h, plus de compta du dimanche : devis, relances et factures tournent seuls.'},
  commerce:{l:'le commerce & le retail',autos:['reponse','inbox','paiements'],plan:'Team',reason:'Vous répondez à chaque client en quelques secondes et gardez l\'œil sur vos encaissements sans effort.'},
  autre:{l:'votre activité',autos:['devis','reponse','facture'],plan:'Team',reason:'Si vous envoyez des devis, des factures ou des réponses clients, Talos vous fait gagner des heures. On s\'adapte au reste.'}
};
/* icon paths for needs */
var NI={
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  box:'<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>',
  star:'<polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5"/>',
  chart:'<path d="M12 20V10M18 20V4M6 20v-6"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 5L2 7"/>',
  money:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>'
};
var TALOS_NEEDS={
  btp:[['Mes devis traînent','clock'],['Factures en retard','doc'],['Relances impayés oubliées','bell'],['Réponses clients à 23h','chat'],['Planning des chantiers','cal'],['Commandes fournisseurs','box']],
  resto:[['Réservations à gérer','cal'],['Réponses tardives aux clients','chat'],['Relances impayés (événements)','bell'],['Commandes fournisseurs','box'],['Avis & visibilité en ligne','star'],['Factures à émettre','doc']],
  services:[['Plannings clients à la main','cal'],['Confirmations de RDV','chat'],['Facturation de fin de mois','doc'],['Relances oubliées','bell'],['Demandes sans réponse','mail'],['Compta du dimanche','chart']],
  digital:[['Devis & propositions longs','doc'],['Relances devis tardives','bell'],['Facturation qui coupe le flux','clock'],['Suivi de projet','chart'],['Onboarding client','user'],['Réponses prospects','chat']],
  sante:[['Confirmations de RDV','cal'],['Inbox saturée','mail'],['Relances clients','bell'],['Facturation','doc'],['Rappels no-show','clock'],['Plus de soirées libres','moon']],
  conseil:[['Devis chronophages','clock'],['Relances à 22h','bell'],['Compta du dimanche','chart'],['Suivi de mission','doc'],['Réponses prospects','chat'],['Facturation','money']],
  commerce:[['Réponse client lente','chat'],['Tri de l\'inbox','mail'],['Suivi des paiements','money'],['Relances impayés','bell'],['Gestion des commandes','box'],['Avis clients','star']],
  autre:[['Devis qui traînent','clock'],['Relances oubliées','bell'],['Facturation lente','doc'],['Inbox saturée','mail'],['Réponses tardives','chat'],['Suivi paiements','money']]
};
function fiIco(p){return '<span class="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">'+p+'</svg></span>';}

/* ═══ SECTOR RECO (automatisations) ═══ */
(function(){
  var chips=document.getElementById('recoChips'),res=document.getElementById('recoResult');
  if(!chips||!res)return;
  function chk(){return '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';}
  function render(k){
    var s=TALOS_SECTORS[k];if(!s)return;
    var cards=s.autos.map(function(id){var a=TALOS_AUTOS[id];return '<div class="reco-auto">'+fiIco(a.i)+'<div><b>'+a.l+'</b><span>'+a.d+'</span></div><span class="chk">'+chk()+'</span></div>';}).join('');
    res.innerHTML='<div class="reco-card"><div class="reco-eyebrow">NOTRE RECO POUR '+s.l.toUpperCase()+'</div><h3>Ces 3 automatisations vont vous libérer.</h3><div class="reco-autos">'+cards+'</div><p class="reco-reason">'+s.reason+'</p><div class="reco-line"><span class="pl">PLAN CONSEILLÉ</span><span class="pn">'+s.plan+'</span><a href="tarifs.html" class="btn btn-primary" style="min-height:46px;font-size:14px">Voir ce plan<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 5l7 7-7 7"/></svg></a></div></div>';
    res.classList.add('show');
  }
  chips.querySelectorAll('.reco-chip').forEach(function(c){c.addEventListener('click',function(){
    chips.querySelectorAll('.reco-chip').forEach(function(x){x.classList.remove('on')});c.classList.add('on');render(c.dataset.sector);
  })});
})();

/* ═══ PREQUAL (reserver) ═══ */
(function(){
  var sel=document.getElementById('pqSector'),box=document.getElementById('pqNeeds');
  if(!sel||!box)return;
  function render(){
    var k=sel.value, needs=TALOS_NEEDS[k]||TALOS_NEEDS.autre;
    box.innerHTML=needs.map(function(n){return '<button type="button" class="pq-need" data-n="'+n[0]+'">'+fiIco(NI[n[1]]||NI.clock)+n[0]+'</button>';}).join('');
    box.querySelectorAll('.pq-need').forEach(function(b){b.addEventListener('click',function(){this.classList.toggle('on');this.classList.toggle('pop');var t=this;setTimeout(function(){t.classList.remove('pop')},300);})});
  }
  sel.addEventListener('change',render);render();
  window.__pqGet=function(){return Array.prototype.map.call(box.querySelectorAll('.pq-need.on'),function(b){return b.dataset.n}).join(', ');};
})();

/* ═══ PRICING promo countdown (1 mois offert · 10 prochains) ═══ */
(function(){
  var timer=document.getElementById('promoTimer');
  if(!timer)return;
  // rolling 48h deadline, persisted so it counts down across visits
  var KEY='talos-promo-end', end;
  try{end=parseInt(localStorage.getItem(KEY));}catch(e){}
  var now=Date.now();
  if(!end||end<now){ end=now+48*3600*1000; try{localStorage.setItem(KEY,end);}catch(e){} }
  function pad(n){return n<10?'0'+n:''+n;}
  function tick(){
    var diff=Math.max(0,end-Date.now());
    var h=Math.floor(diff/3600000), m=Math.floor(diff%3600000/60000), s=Math.floor(diff%60000/1000);
    timer.innerHTML='<span class="cd">'+pad(h)+'</span><i>:</i><span class="cd">'+pad(m)+'</span><i>:</i><span class="cd">'+pad(s)+'</span>';
    if(diff<=0){ try{localStorage.removeItem(KEY);}catch(e){} }
  }
  tick(); setInterval(tick,1000);
})();

/* ═══ inject progress bar into mock panels ═══ */
(function(){
  document.querySelectorAll('.mock').forEach(function(m){
    if(m.querySelector('.mock-prog'))return;
    var p=document.createElement('div');p.className='mock-prog';m.appendChild(p);
  });
})();
