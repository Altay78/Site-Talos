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

/* ═══ PRICING — engagement selector (Mensuel / 3 / 9 / 12 mois) ═══ */
(function(){
  var eng=document.getElementById('eng');
  if(!eng)return;
  var LBL={m:'Mensuel · sans engagement','3':'Engagement 3 mois','9':'Engagement 9 mois','12':'Engagement 12 mois'};
  function fmt(n){return n.toLocaleString('fr-FR');}
  function set(k){
    eng.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.eng===k)});
    document.querySelectorAll('.price-card[data-m]').forEach(function(c){
      var amt=c.querySelector('.num'),note=c.querySelector('.price-note'),
          setup=c.querySelector('.price-setup'),save=c.querySelector('.price-save');
      var monthly=+c.dataset.m,
          target=+c.dataset[k],
          setupVal=+c.dataset[k==='m'?'ms':k+'s'];
      var cur=parseInt((amt.textContent||'').replace(/\D/g,''))||target,t0=performance.now();
      (function tick(t){var p=Math.min((t-t0)/420,1),e=1-Math.pow(1-p,3);amt.textContent=fmt(Math.round(cur+(target-cur)*e));if(p<1)requestAnimationFrame(tick)})(t0);
      if(note)note.textContent=LBL[k];
      if(setup){
        if(setupVal===0){setup.classList.add('free');setup.innerHTML='Setup <b>offert</b>';}
        else{setup.classList.remove('free');setup.innerHTML='+ setup <b>'+fmt(setupVal)+' €</b> HT';}
      }
      if(save){
        if(k==='m'){save.classList.remove('show');}
        else{var perYear=(monthly-target)*12;
          save.classList.add('show');
          save.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg><b>'+fmt(perYear)+' €</b> de remise / an';}
      }
    });
  }
  eng.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.eng)})});
  set('12');
})();

/* ═══ Cal.com / Calendly booking links ═══ */
(function(){
  /* ↓↓↓ REMPLACER par votre vrai lien Cal.com ou Calendly ↓↓↓ */
  var CAL_URL='https://calendly.com/contact-talos-ai/30min';
  document.querySelectorAll('[data-cal]').forEach(function(a){
    a.href=CAL_URL;a.target='_blank';a.rel='noopener';
  });
})();

/* ═══ shared sector data ═══ */
var TALOS_AUTOS={
  devis:{l:'Devis chiffré',d:'Photo du chantier → devis prêt à relire',i:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h5"/>'},
  relances:{l:'Relances',d:'Devis et factures relancés au bon moment',i:'<path d="M20 11a8 8 0 1 0-2.3 5.6"/><path d="M20 5v5h-5"/>'},
  reponse:{l:'Réponses clients',d:'Une réponse même quand vous êtes sur le chantier',i:'<path d="M4 5h12l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M7 11h8M7 15h6"/>'},
  facture:{l:'Facturation',d:'Facture Factur-X émise à la signature',i:'<path d="M6 3h9l3 3v15l-2.2-1.4L13.6 21l-2.3-1.4L9 21l-2.2-1.4L4.5 21V5a2 2 0 0 1 1.5-2z"/><path d="M14 9h-3a2 2 0 0 0 0 4M14 13h-4"/>'},
  inbox:{l:'Tri de l\'inbox',d:'L\'urgent remonte, le reste est classé',i:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'},
  paiements:{l:'Suivi paiements',d:'Qui a payé, qui doit, qui relancer',i:'<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'}
};
var TALOS_SECTORS={
  plombier:{l:'la plomberie',autos:['devis','relances','facture'],plan:'Pro',reason:'Vos devis partent vite, vos factures suivent les chantiers, et plus aucune relance d\'impayé ne passe à la trappe.'},
  electricien:{l:'l\'électricité',autos:['devis','reponse','facture'],plan:'Pro',reason:'Demandes de devis traitées, clients répondus pendant que vous câblez, factures conformes 2026 émises seules.'},
  macon:{l:'la maçonnerie',autos:['devis','relances','paiements'],plan:'Business',reason:'Gros chantiers, gros devis : tout est chiffré, relancé et suivi côté trésorerie, sans y passer vos soirées.'},
  menuisier:{l:'la menuiserie',autos:['devis','facture','paiements'],plan:'Pro',reason:'Devis détaillés à votre charte, factures émises à la pose, et une trésorerie lisible d\'un coup d\'œil.'},
  couvreur:{l:'la couverture',autos:['devis','reponse','relances'],plan:'Pro',reason:'Réponse rapide aux demandes d\'intervention, devis envoyés vite, relances automatiques — vous restez sur les toits.'},
  peintre:{l:'la peinture & finition',autos:['devis','relances','inbox'],plan:'Solo',reason:'Devis prêts à envoyer, relances qui tournent seules et une boîte mail triée chaque matin.'},
  autre:{l:'votre métier du bâtiment',autos:['devis','reponse','facture'],plan:'Pro',reason:'Si vous envoyez des devis, des factures et répondez à des clients, Talos vous fait gagner des heures. On s\'adapte au reste.'}
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
  plombier:[['Mes devis traînent','clock'],['Factures en retard','doc'],['Relances impayés oubliées','bell'],['Demandes clients sans réponse','chat'],['Planning des interventions','cal'],['Commandes fournisseurs','box']],
  electricien:[['Devis à chiffrer','doc'],['Réponses clients pendant le chantier','chat'],['Facturation conforme 2026','clock'],['Relances oubliées','bell'],['Suivi des paiements','money'],['Inbox saturée','mail']],
  macon:[['Gros devis longs à monter','doc'],['Trésorerie à suivre','chart'],['Relances impayés','bell'],['Commandes matériaux','box'],['Réponses clients','chat'],['Facturation','money']],
  menuisier:[['Devis détaillés','doc'],['Facturation à la pose','clock'],['Relances oubliées','bell'],['Suivi des acomptes','money'],['Demandes sans réponse','chat'],['Planning atelier/pose','cal']],
  couvreur:[['Demandes d\'intervention urgentes','chat'],['Devis à envoyer vite','doc'],['Relances devis','bell'],['Facturation','money'],['Inbox saturée','mail'],['Planning chantiers','cal']],
  peintre:[['Devis à préparer','doc'],['Relances oubliées','bell'],['Inbox du matin','mail'],['Facturation fin de chantier','clock'],['Réponses clients','chat'],['Suivi paiements','money']],
  autre:[['Devis qui partent trop tard','clock'],['Relances devis oubliées','bell'],['Factures impayées','money'],['Conformité facturation 2026','doc'],['Réponses clients tardives','chat'],['Prise de RDV & no-show','cal'],['Trésorerie à suivre','chart'],['Tri de l\'inbox','mail']]
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

/* ═══ animated count-up (market stats) ═══ */
(function(){
  var els=document.querySelectorAll('[data-count]');
  if(!els.length)return;
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function fmt(n){return n.toLocaleString('fr-FR');}
  function run(el){
    var target=+el.dataset.count, pre=el.dataset.pre||'', suf=el.dataset.suf||'',
        plain=el.dataset.plain==='1', dur=1500, t0=performance.now();
    if(reduce){el.textContent=pre+(plain?target:fmt(target))+suf;return;}
    (function tick(t){
      var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3),v=Math.round(target*e);
      el.textContent=pre+(plain?v:fmt(v))+suf;
      if(p<1)requestAnimationFrame(tick);
    })(t0);
  }
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){run(e.target);io.unobserve(e.target);}
  })},{threshold:.5});
  els.forEach(function(el){io.observe(el)});
})();

/* ═══ mouse-reactive hub (parallax depth) ═══ */
(function(){
  var hub=document.querySelector('.hub');
  if(!hub||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  if(matchMedia('(pointer:coarse)').matches)return; /* skip touch */
  var nodes=[].slice.call(hub.querySelectorAll('.hub-node')),
      chip=hub.querySelector('.hub-chip'),
      svg=hub.querySelector('.hub-svg'),
      grid=hub.querySelector('.hub-grid');
  var tx=0,ty=0,cx=0,cy=0,raf=null;
  function onMove(e){
    var r=hub.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-.5);
    ty=((e.clientY-r.top)/r.height-.5);
    if(!raf)raf=requestAnimationFrame(loop);
  }
  function onLeave(){tx=0;ty=0;if(!raf)raf=requestAnimationFrame(loop);}
  function loop(){
    cx+=(tx-cx)*.08; cy+=(ty-cy)*.08;
    nodes.forEach(function(n,i){
      var d=20+(i%3)*5;
      n.style.transform='translate(calc(-50% + '+(cx*d).toFixed(2)+'px), calc(-50% + '+(cy*d).toFixed(2)+'px))';
    });
    if(chip) chip.style.transform='translate(calc(-50% + '+(cx*9).toFixed(2)+'px), calc(-50% + '+(cy*9).toFixed(2)+'px))';
    if(svg)  svg.style.transform='translate('+(cx*6).toFixed(2)+'px,'+(cy*6).toFixed(2)+'px)';
    if(grid) grid.style.transform='translate('+(cx*-10).toFixed(2)+'px,'+(cy*-10).toFixed(2)+'px)';
    if(Math.abs(tx-cx)>.0005||Math.abs(ty-cy)>.0005){raf=requestAnimationFrame(loop);}else{raf=null;}
  }
  hub.addEventListener('mousemove',onMove,{passive:true});
  hub.addEventListener('mouseleave',onLeave,{passive:true});
})();

/* ═══ MODULES À LA CARTE — sélection + barre flottante ═══ */
(function(){
  var grid=document.getElementById('modulesGrid');
  if(!grid)return;
  var modules=grid.querySelectorAll('.module[id]');
  var bar=document.getElementById('selbar'), nEl=document.getElementById('selN'),
      lbl=document.getElementById('selLabel'), btn=document.getElementById('selBtn');
  var sel=[];
  function update(){
    if(nEl)nEl.textContent=sel.length;
    if(lbl)lbl.textContent=sel.length>1?'automatisations choisies':'automatisation choisie';
    if(bar)bar.classList.toggle('show',sel.length>0);
    if(btn)btn.href='reserver.html'+(sel.length?'?autos='+encodeURIComponent(sel.join(',')):'');
  }
  function toggle(m){
    var on=m.classList.toggle('on');
    m.setAttribute('aria-pressed',on?'true':'false');
    var i=sel.indexOf(m.id);
    if(on){if(i<0)sel.push(m.id);}else{if(i>=0)sel.splice(i,1);}
    update();
  }
  modules.forEach(function(m){
    m.addEventListener('click',function(e){
      if(e.target.closest('.mod-more'))return; /* le bouton "En savoir plus" ouvre le popup, ne sélectionne pas */
      toggle(m);
    });
    m.addEventListener('keydown',function(e){
      if(e.target!==m)return;
      if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle(m);}
    });
  });
})();

/* ═══ AUTOMATISATIONS — popup détail (problème mis en avant + fonctionnement) ═══ */
(function(){
  var modal=document.getElementById('autoModal'), grid=document.getElementById('modulesGrid');
  if(!modal||!grid)return;
  var INFO={
    devis:{
      p:'Une demande de devis arrive… et reste 3 jours dans votre boîte mail. Le temps que vous chiffriez le soir, le client a souvent déjà signé ailleurs.',
      s:['Le client envoie sa demande (mail, WhatsApp ou formulaire).','Talos lit la demande, les photos et les dimensions.','Le chiffrage se fait depuis VOS tarifs et vos marges.','Le devis est rédigé à votre charte — vous validez d\'un clic.'],
      r:'Devis complet envoyé en moins de 10 minutes, même quand vous êtes sur le chantier.'},
    relances:{
      p:'Vous envoyez un devis… puis plus rien. Sans relance, un devis sur deux tombe à l\'eau — pas parce qu\'il était trop cher, juste oublié.',
      s:['Dès qu\'un devis reste sans réponse, Talos prend le relais.','Relance polie à J+3, J+7 puis J+14, à votre nom.','Chaque message reprend le devis et invite à répondre.','Tout s\'arrête net dès que le client signe.'],
      r:'Plus aucun devis oublié : vous signez davantage, sans courir après personne.'},
    facturation:{
      p:'À partir de 2026, la facture électronique au format Factur-X devient obligatoire. Format technique, plateformes agréées… de quoi y passer des heures.',
      s:['À la signature du devis, la facture est générée automatiquement.','Format Factur-X conforme 2026, avec toutes les mentions légales.','Envoi via une plateforme agréée.','Une copie est archivée et reliée au client.'],
      r:'Conforme 2026 sans rien apprendre — vos factures partent seules.'},
    impayes:{
      p:'Les factures impayées plombent votre trésorerie. Relancer prend du temps — et c\'est gênant face à un client qu\'on veut garder.',
      s:['Talos surveille chaque facture émise.','Relance à J+7, puis J+15, puis J+30, d\'un ton de plus en plus ferme.','Si rien ne bouge : une mise en demeure prête à envoyer est générée.','La cascade s\'arrête dès réception du paiement.'],
      r:'Vous êtes payé plus vite, sans jamais avoir la conversation gênante.'},
    tresorerie:{
      p:'Vous découvrez un découvert… une fois qu\'il est là. Difficile d\'anticiper quand l\'argent rentre et sort en désordre.',
      s:['Talos se connecte à votre compte pro (en lecture seule).','Il suit les entrées (paiements) et les sorties à venir.','Dès que le solde approche de votre seuil, vous recevez une alerte.','Vous voyez la trésorerie des prochaines semaines d\'un coup d\'œil.'],
      r:'Fini les mauvaises surprises : vous pilotez au lieu de subir.'},
    inbox:{
      p:'Cent mails par jour, l\'urgent noyé sous les pubs et les relances fournisseurs. Vous passez à côté de demandes qui valent de l\'argent.',
      s:['Chaque mail entrant est lu et catégorisé (devis, urgence, fournisseur, admin).','L\'important remonte en haut, le reste est classé.','Un résumé en 3 lignes vous évite d\'ouvrir chaque message.','Vous traitez l\'essentiel en quelques minutes le matin.'],
      r:'Une boîte mail claire chaque matin — vous ne ratez plus rien.'},
    reponses:{
      p:'Un client écrit le soir ou le week-end. Sans réponse rapide, il appelle le concurrent suivant sur sa liste.',
      s:['Talos répond instantanément, 24h/24 et 7j/7, à votre nom.','Il qualifie la demande (devis, RDV, question).','Il propose un créneau ou collecte les infos utiles.','Vous reprenez la main quand vous êtes dispo — le client est déjà rassuré.'],
      r:'Plus aucun client laissé sans réponse, même hors chantier.'},
    rdv:{
      p:'Caler un rendez-vous, c\'est cinq allers-retours de messages pour trouver un créneau. Du temps perdu des deux côtés.',
      s:['Le client ouvre votre agenda et choisit un créneau libre.','Le RDV se cale automatiquement, sans échange interminable.','Confirmation envoyée immédiatement.','Le créneau est bloqué dans votre planning.'],
      r:'Votre agenda se remplit tout seul, sans le ping-pong de messages.'},
    rappels:{
      p:'Un client qui oublie un rendez-vous, c\'est une demi-journée perdue et un déplacement pour rien.',
      s:['Dès qu\'un RDV est calé, Talos programme les rappels.','SMS et mail à J-1, puis un rappel à H-2.','Le client peut confirmer ou reprogrammer en un tap.','Vous partez sur le chantier en sachant qu\'il sera là.'],
      r:'Fini les no-shows et les déplacements pour rien.'}
  };
  var elIc=document.getElementById('amIc'), elTitle=document.getElementById('amTitle'),
      elProb=document.getElementById('amProblem'), elSteps=document.getElementById('amSteps'),
      elRes=document.getElementById('amResult'), elAdd=document.getElementById('amAdd');
  var cur=null, lastFocus=null;
  function syncAdd(){
    if(!cur)return;
    var on=cur.classList.contains('on');
    elAdd.innerHTML=(on?'Retiré de ma sélection ✓':'Ajouter à ma sélection')+'<svg viewBox="0 0 24 24">'+(on?'<polyline points="20 6 9 17 4 12"/>':'<path d="M12 5v14M5 12h14"/>')+'</svg>';
  }
  function open(mod){
    var info=INFO[mod.id]; if(!info)return;
    cur=mod; lastFocus=document.activeElement;
    var pill=mod.querySelector('.acard-pill');
    elTitle.textContent=pill.querySelector('.lbl').textContent;
    elIc.innerHTML='<svg viewBox="0 0 24 24">'+pill.querySelector('.ico svg').innerHTML+'</svg>';
    elProb.textContent=info.p;
    elSteps.innerHTML=info.s.map(function(x){return '<li>'+x+'</li>';}).join('');
    elRes.innerHTML='<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg><span>'+info.r+'</span>';
    elAdd.innerHTML='Ajouter à ma sélection<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>';
    if(cur.classList.contains('on'))syncAdd();
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    var x=modal.querySelector('.amodal-x'); if(x)x.focus();
  }
  function close(){
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
    cur=null;
  }
  grid.addEventListener('click',function(e){
    var b=e.target.closest('.mod-more'); if(!b)return;
    e.preventDefault(); e.stopPropagation();
    open(b.closest('.module'));
  });
  if(elAdd)elAdd.addEventListener('click',function(){ if(cur){cur.click(); syncAdd();} });
  modal.addEventListener('click',function(e){ if(e.target.closest('[data-close]'))close(); });
  addEventListener('keydown',function(e){ if(e.key==='Escape'&&modal.classList.contains('open'))close(); });
})();

/* ═══ CARROUSELS — nudge "glissez" quand le rail entre à l'écran ═══ */
(function(){
  var rails=document.querySelectorAll('.cards,.vals,.modules');
  if(!rails.length||!('IntersectionObserver' in window))return;
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;
    var el=e.target; io.unobserve(el);
    if(reduce)return;
    if(el.scrollWidth>el.clientWidth+24){
      var d=Math.min(72,el.scrollWidth-el.clientWidth);
      try{
        el.scrollTo({left:d,behavior:'smooth'});
        setTimeout(function(){el.scrollTo({left:0,behavior:'smooth'});},700);
      }catch(err){}
    }
  })},{threshold:.45});
  rails.forEach(function(r){io.observe(r)});
})();

/* ═══ Reveal de chaque section au scroll ═══ */
(function(){
  if(!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('sv-in');io.unobserve(e.target);}})},{threshold:.1,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('section').forEach(function(s){s.classList.add('sv');io.observe(s);});
})();

/* ═══ Prefetch au survol — navigation quasi instantanée ═══ */
(function(){
  var seen={};
  document.addEventListener('pointerover',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank')return;
    var href=a.getAttribute('href');
    if(!href||href.charAt(0)==='#'||/^(https?:|mailto:|tel:)/i.test(href))return;
    if(seen[href])return;seen[href]=1;
    var l=document.createElement('link');l.rel='prefetch';l.href=a.href;document.head.appendChild(l);
  },{passive:true});
})();
