/* ═══════════════════════════════════════════════════════════
   TALOS — SHARED JS · runs feature blocks only if present
   ═══════════════════════════════════════════════════════════ */

/* PRELOADER */
window.addEventListener('load', () => {
  const pl = document.getElementById('preloader');
  if (pl) setTimeout(() => pl.classList.add('done'), 1500);
});

/* CURSOR */
(function() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });
  (function tick() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(tick);
  })();
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [data-cursor]')) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, [data-cursor]')) ring.classList.remove('hover');
  });
})();

/* THUNDER STRIKE — petit coup de tonnerre au clic */
(function() {
  // Skip si pas de curseur (mobile/tactile)
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const BOLT_SVG = '<svg viewBox="0 0 60 90" fill="currentColor"><path d="M 22 0 L 12 38 L 26 38 L 18 90 L 50 36 L 34 36 L 44 0 Z"/></svg>';

  document.addEventListener('click', (e) => {
    const x = e.clientX, y = e.clientY;

    // 1. Éclair central qui flashe
    const bolt = document.createElement('div');
    bolt.className = 'thunder-bolt';
    bolt.style.left = x + 'px';
    bolt.style.top  = y + 'px';
    bolt.innerHTML = BOLT_SVG;
    document.body.appendChild(bolt);

    // 2. Onde de choc bronze
    const ring = document.createElement('div');
    ring.className = 'thunder-ring';
    ring.style.left = x + 'px';
    ring.style.top  = y + 'px';
    document.body.appendChild(ring);

    // 3. Petites étincelles (6) qui partent dans toutes les directions
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.4;
      const dist  = 30 + Math.random() * 30;
      const spark = document.createElement('div');
      spark.className = 'thunder-spark';
      spark.style.left = x + 'px';
      spark.style.top  = y + 'px';
      spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
      spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 700);
    }

    // Cleanup
    setTimeout(() => { bolt.remove(); ring.remove(); }, 700);
  });
})();

/* SCROLL UI */
(function() {
  const progress = document.getElementById('scrollProgress');
  const nav = document.getElementById('mainNav');
  if (!progress && !nav) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (window.scrollY / h) * 100 + '%';
    if (nav) nav.classList.toggle('compact', window.scrollY > 80);
  }, { passive: true });
})();

/* REVEAL */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .pain-list').forEach(el => revealObs.observe(el));

/* COUNTERS */
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target);
    const start = performance.now();
    (function tick(now) {
      const t = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    })(performance.now());
    counterObs.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.counter').forEach(c => counterObs.observe(c));

/* LIVE LOG (live board) */
(function() {
  const logEl = document.getElementById('liveLog');
  if (!logEl) return;
  const logEvents = [
    { time: '08:42', type: 'DEVIS', msg: 'Devis <span class="accent">#4221</span> envoyé · Maxime, Bagnolet' },
    { time: '08:51', type: 'RELANCE', msg: 'Relance auto J+3 · Chantier <span class="accent">Mme Roux</span>' },
    { time: '09:03', type: 'FACTURE', msg: 'Facture <span class="accent">#3098</span> émise · Plomberie Dupont' },
    { time: '09:14', type: 'SIGNATURE', msg: 'Bon de commande signé · <span class="ok">+ 4 380 €</span>', cls: 'olivier' },
    { time: '09:22', type: 'INBOX', msg: 'Résumé matinal · <span class="accent">3 urgences</span> détectées' },
    { time: '09:35', type: 'DEVIS', msg: 'Devis <span class="accent">#4222</span> envoyé · Karim, Aubervilliers' },
    { time: '09:48', type: 'RÉPONSE', msg: 'Question client traitée auto · <span class="accent">dispo juin</span>' },
    { time: '10:01', type: 'RELANCE', msg: 'Relance auto J+7 · Devis <span class="accent">#4198</span>' },
    { time: '10:12', type: 'PAIEMENT', msg: 'Acompte reçu · <span class="ok">2 100 €</span> · rapproché', cls: 'olivier' },
    { time: '10:27', type: 'DEVIS', msg: 'Devis <span class="accent">#4223</span> envoyé · Sandrine, Pantin' }
  ];
  let idx = 0;
  function push() {
    const ev = logEvents[idx % logEvents.length];
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class="log-time">${ev.time}</span><span class="log-type ${ev.cls||''}">${ev.type}</span><span class="log-msg">${ev.msg}</span>`;
    logEl.appendChild(line);
    requestAnimationFrame(() => line.classList.add('show'));
    while (logEl.children.length > 5) logEl.removeChild(logEl.firstChild);
    idx++;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      push();
      setInterval(push, 2300);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  obs.observe(logEl);
})();

/* MINI STATS */
function animateMini(id, target, dur) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  (function tick(now) {
    const t = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(tick);
  })(performance.now());
}
(function() {
  const liveSection = document.querySelector('.live');
  if (!liveSection) return;
  const miniObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateMini('weekCount', 248, 1400);
      animateMini('rateCount', 84, 1600);
      miniObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  miniObs.observe(liveSection);
})();

/* CONSOLE (hero) */
(function() {
  const time = document.getElementById('cnTime');
  const c = document.getElementById('console');
  if (!c) return;
  function updateTime() {
    if (!time) return;
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    time.textContent = `${h}:${m}:${s} CET`;
  }
  updateTime();
  setInterval(updateTime, 1000);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateMini('cnTimeVal', 26, 1800);
      const cnCa = document.getElementById('cnCaVal');
      if (cnCa) {
        const start = performance.now();
        (function tick(now) {
          const t = Math.min(1, (now - start) / 2000);
          const val = Math.round(12480 * (1 - Math.pow(1 - t, 3)));
          cnCa.textContent = val.toLocaleString('fr-FR');
          if (t < 1) requestAnimationFrame(tick);
        })(performance.now());
      }
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  obs.observe(c);

  const flashes = [
    'Devis #4221 envoyé à Maxime · Bagnolet',
    'Facture #3098 émise · Plomberie Dupont',
    'Acompte 2 100 € rapproché auto',
    'Relance J+7 envoyée · Devis #4198',
    'Résumé matinal généré · 3 urgences',
    'Devis #4222 envoyé · Karim · Aubervilliers'
  ];
  const flash = document.getElementById('cnFlash');
  if (flash) {
    flash.style.transition = 'opacity 0.3s';
    let fi = 0;
    setInterval(() => {
      fi = (fi + 1) % flashes.length;
      flash.style.opacity = '0';
      setTimeout(() => {
        flash.textContent = flashes[fi];
        flash.style.opacity = '1';
      }, 300);
    }, 3400);
  }
})();

/* MOTION SHOWCASE · live counter that ticks up */
(function() {
  const el = document.getElementById('msCounter');
  if (!el) return;
  let n = 1247;
  setInterval(() => {
    n += Math.floor(Math.random() * 3) + 1;
    el.textContent = n.toLocaleString('fr-FR');
  }, 1800);
})();

/* MAGNETIC CTA — buttons drift slightly toward cursor */
(function() {
  const targets = document.querySelectorAll('.cta-bronze, .cta');
  if (!targets.length) return;
  targets.forEach(el => {
    el.classList.add('magnetic');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

/* AUTO-CARD radial spotlight follows cursor + 3D tilt */
(function() {
  const cards = document.querySelectorAll('.auto-card, .step');
  if (!cards.length) return;
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
})();

/* STAGGER REVEAL — children of .stagger get progressive delays */
(function() {
  const sets = document.querySelectorAll('.auto-grid, .kpi-grid, .stats');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      Array.from(e.target.children).forEach((child, i) => {
        child.style.transitionDelay = (i * 90) + 'ms';
        child.style.opacity = '';
        child.style.transform = '';
        // re-trigger reveal if child has class
        child.classList.add('stagger-in');
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.18 });
  sets.forEach(s => obs.observe(s));
})();

/* FAQ */
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const a = item.querySelector('.faq-a');
    const isOpen = item.classList.toggle('open');
    if (isOpen) a.style.maxHeight = a.querySelector('.faq-a-content').scrollHeight + 'px';
    else a.style.maxHeight = '0';
  });
});

/* ═══════════════════════════════════════════════════════════
   SECTOR DATA & PAIN ICONS
   ═══════════════════════════════════════════════════════════ */
const PAIN_ICONS = {
  clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bell:      '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  doc:       '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  chat:      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  money:     '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  mail:      '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  chart:     '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  moon:      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
  people:    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar:  '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  box:       '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
  web:       '<circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
};

const SECTOR_DATA = {
  btp: {
    label: 'BTP & Artisanat',
    trades: [
      { trade: 'Plomberie',    icon: '<path d="M7 3v6a3 3 0 003 3h4a3 3 0 003-3V3"/><path d="M5 21h14"/><path d="M10 21v-9"/><path d="M14 21v-9"/>' },
      { trade: 'Électricité',  icon: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>' },
      { trade: 'Peinture',     icon: '<path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/><path d="M2 22l5.5-5.5"/>' },
      { trade: 'Maçonnerie',   icon: '<rect x="3" y="4" width="18" height="4"/><rect x="3" y="10" width="11" height="4"/><rect x="16" y="10" width="5" height="4"/><rect x="3" y="16" width="18" height="4"/>' },
      { trade: 'Menuiserie',   icon: '<path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18"/><path d="M9 21V11h6v10"/>' },
      { trade: 'Carrelage',    icon: '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>' },
      { trade: 'Couverture',   icon: '<path d="M3 12l9-9 9 9"/><path d="M5 10v11h14V10"/>' },
      { trade: 'Multi-métier', icon: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' }
    ],
    pains: [
      { pain: 'Devis qui traînent',  label: 'Mes devis traînent plusieurs jours',          icon: 'clock' },
      { pain: 'Relances oubliées',   label: "J'oublie de relancer mes clients",              icon: 'bell'  },
      { pain: 'Factures en retard',  label: 'Mes factures partent en retard',               icon: 'doc'   },
      { pain: 'Réponses tardives',   label: 'Je réponds aux clients à 23h',                 icon: 'chat'  },
      { pain: 'Impayés',            label: "J'ai trop d'impayés en cours",                  icon: 'money' },
      { pain: 'Inbox saturée',       label: 'Mon inbox est saturée chaque matin',            icon: 'mail'  },
      { pain: 'Compta repoussée',    label: 'La compta finit toujours le dimanche',          icon: 'chart' },
      { pain: 'Plus de soirées',     label: "Je n'ai plus de soirées libres",                icon: 'moon'  }
    ]
  },
  cuisine: {
    label: 'Cuisine & Restauration',
    trades: [
      { trade: 'Restaurant',      icon: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>' },
      { trade: 'Traiteur',        icon: '<path d="M3 11l19-9-9 19-2-8-8-2z"/>' },
      { trade: 'Food-truck',      icon: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>' },
      { trade: 'Boulangerie',     icon: '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/>' },
      { trade: 'Chef à domicile', icon: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>' },
      { trade: 'Café / Bar',      icon: '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>' }
    ],
    pains: [
      { pain: 'Commandes fournisseurs', label: 'Mes commandes fournisseurs sont encore manuelles',       icon: 'clipboard' },
      { pain: 'Planning personnel',     label: 'Le planning du personnel me prend des heures',           icon: 'people'    },
      { pain: 'Factures événements',    label: "Les factures événements s'accumulent sans être envoyées", icon: 'doc'       },
      { pain: 'Réservations tardives',  label: 'Je réponds aux réservations à 23h du soir',              icon: 'calendar'  },
      { pain: 'Suivi stock',            label: 'Mon stock est impossible à suivre en temps réel',        icon: 'box'       },
      { pain: 'Compta TVA',             label: 'La TVA et la compta me prennent tout le week-end',       icon: 'chart'     },
      { pain: 'Relances impayés',       label: "Les relances sur impayés, je n'ai pas le temps",         icon: 'money'     },
      { pain: 'Visibilité en ligne',    label: 'Mon site ne reflète pas ce que je vaux vraiment',        icon: 'web'       }
    ]
  },
  services: {
    label: 'Services à la personne',
    trades: [
      { trade: 'Ménage',           icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
      { trade: 'Aide à domicile',  icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' },
      { trade: 'Soins / Bien-être',icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
      { trade: "Garde d'enfants",  icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
      { trade: 'Jardinage',        icon: '<path d="M12 22V12"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><path d="M12 12C8 12 4 10 4 6c0-1.5 1-3 3-4 1 2 2.5 3 5 3s4-1 5-3c2 1 3 2.5 3 4 0 4-4 6-8 6z"/>' },
      { trade: 'Coach / Formateur',icon: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/>' }
    ],
    pains: [
      { pain: 'Facturation lente',   label: 'La facturation me prend des heures chaque fin de mois',    icon: 'clock'    },
      { pain: 'Plannings manuels',   label: 'Je gère les plannings clients entièrement à la main',      icon: 'calendar' },
      { pain: 'Relances oubliées',   label: "Les relances clients, j'y pense toujours trop tard",       icon: 'bell'     },
      { pain: 'Agenda débordant',    label: 'Mon agenda déborde et je perds des réservations',          icon: 'people'   },
      { pain: 'Nouvelles demandes',  label: 'Les nouvelles demandes restent sans réponse pendant des heures', icon: 'chat' },
      { pain: 'Compta',              label: 'Ma compta part toujours le dimanche soir en urgence',      icon: 'chart'    },
      { pain: 'Plus de soirées',     label: "Je n'ai plus de soirées libres",                           icon: 'moon'     },
      { pain: 'Présence en ligne',   label: 'Mon site ne reflète pas mon professionnalisme',            icon: 'web'      }
    ]
  },
  digital: {
    label: 'Digital & Créatif',
    trades: [
      { trade: 'Développeur',    icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>' },
      { trade: 'Designer',       icon: '<circle cx="13.5" cy="6.5" r="0.5"/><circle cx="17.5" cy="10.5" r="0.5"/><circle cx="8.5" cy="7.5" r="0.5"/><circle cx="6.5" cy="12.5" r="0.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>' },
      { trade: 'Agence',         icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
      { trade: 'Freelance',      icon: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>' },
      { trade: 'Marketing',      icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
      { trade: 'Vidéo / Motion', icon: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>' }
    ],
    pains: [
      { pain: 'Devis complexes',      label: 'Mes propositions clients prennent trop de temps à préparer', icon: 'clock'     },
      { pain: 'Relances tardives',    label: "Les relances devis, j'y pense toujours trop tard",           icon: 'bell'      },
      { pain: 'Facturation distraction', label: 'La facturation me sort de mon flux de travail',           icon: 'doc'       },
      { pain: 'Rapports clients',     label: 'Les rapports de suivi clients me prennent des heures',       icon: 'chart'     },
      { pain: 'Suivi projets',        label: 'Les mails de suivi de projet, je les oublie trop souvent',  icon: 'mail'      },
      { pain: 'Onboarding chaotique', label: 'Mon onboarding client est chaotique et chronophage',         icon: 'clipboard' },
      { pain: 'Site peu performant',  label: 'Mon site ne convertit pas mes prospects en clients',         icon: 'web'       },
      { pain: 'Plus de soirées',      label: "Je n'ai plus de soirées libres",                             icon: 'moon'      }
    ]
  },
  autre: {
    label: 'Autre secteur',
    trades: [
      { trade: 'Commerce',      icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>' },
      { trade: 'Immobilier',    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
      { trade: 'Santé',         icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
      { trade: 'Éducation',     icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>' },
      { trade: 'Sport / Loisirs', icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
      { trade: 'Autre',         icon: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>' }
    ],
    pains: [
      { pain: 'Devis qui traînent', label: 'Mes devis ou propositions traînent plusieurs jours', icon: 'clock' },
      { pain: 'Relances oubliées',  label: "J'oublie de relancer mes prospects et clients",       icon: 'bell'  },
      { pain: 'Facturation lente',  label: 'La facturation me prend trop de temps chaque mois',  icon: 'doc'   },
      { pain: 'Réponses tardives',  label: 'Je réponds aux clients avec des heures de retard',    icon: 'chat'  },
      { pain: 'Impayés',           label: "J'ai trop d'impayés et pas le temps de les relancer",  icon: 'money' },
      { pain: 'Inbox saturée',      label: 'Mon inbox est saturée chaque matin',                  icon: 'mail'  },
      { pain: 'Compta repoussée',   label: 'La compta finit toujours au dernier moment',          icon: 'chart' },
      { pain: 'Plus de soirées',    label: "Je n'ai plus de soirées libres",                      icon: 'moon'  }
    ]
  }
};

/* ═══════════════════════════════════════════════════════════
   BOOKING FLOW (reserver.html only)
   ═══════════════════════════════════════════════════════════ */
(function() {
  const bookingCard = document.getElementById('bookingCard');
  if (!bookingCard) return;

  const state = {
    step: 1,
    sector: 'btp',
    trade: null,
    pains: [],
    date: null,
    slot: null,
    contact: { first: '', last: '', company: '', email: '', phone: '', format: 'Visio Google Meet', note: '' }
  };

  const stepDots = document.querySelectorAll('.step-dot');
  const panels = document.querySelectorAll('.step-panel');

  function goToStep(n) {
    state.step = n;
    panels.forEach(p => p.classList.toggle('active', +p.dataset.panel === n));
    stepDots.forEach(d => {
      const s = +d.dataset.step;
      d.classList.toggle('active', s === n);
      d.classList.toggle('done', s < n);
    });
    if (n === 2) renderPains(state.sector || 'btp');
    refreshSummaries();
    if (n !== 1) bookingCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── RENDER TRADES ── */
  function renderTrades(sectorKey) {
    const grid = document.getElementById('tradeGrid');
    if (!grid) return;
    const sector = SECTOR_DATA[sectorKey];
    if (!sector) return;
    grid.innerHTML = '';
    sector.trades.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'trade-tile';
      btn.dataset.trade = t.trade;
      btn.dataset.sector = sectorKey;
      btn.setAttribute('data-cursor', '');
      btn.innerHTML = `<svg class="trade-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg><div class="trade-label">${t.trade}</div>`;
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.trade-tile').forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');
        state.trade = t.trade;
        state.sector = sectorKey;
        document.getElementById('next1').disabled = false;
      });
      grid.appendChild(btn);
    });
    // Restore selection if still in same sector
    if (state.trade && state.sector === sectorKey) {
      grid.querySelectorAll('.trade-tile').forEach(tile => {
        if (tile.dataset.trade === state.trade) tile.classList.add('selected');
      });
    }
  }

  /* ── RENDER PAINS ── */
  function renderPains(sectorKey) {
    const painTiles = document.getElementById('painTiles');
    if (!painTiles) return;
    const sector = SECTOR_DATA[sectorKey] || SECTOR_DATA.autre;
    painTiles.innerHTML = '';
    sector.pains.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'pain-tile';
      btn.dataset.pain = p.pain;
      btn.setAttribute('data-cursor', '');
      const iconPath = PAIN_ICONS[p.icon] || PAIN_ICONS.clock;
      btn.innerHTML = `${p.label}<svg class="pain-tile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>`;
      btn.addEventListener('click', () => {
        const pain = p.pain;
        if (btn.classList.toggle('selected')) {
          if (!state.pains.includes(pain)) state.pains.push(pain);
        } else {
          state.pains = state.pains.filter(x => x !== pain);
        }
        document.getElementById('next2').disabled = state.pains.length === 0;
        refreshSummaries();
      });
      painTiles.appendChild(btn);
    });
    // Reset pains that are no longer valid for this sector
    state.pains = state.pains.filter(pain =>
      sector.pains.some(p => p.pain === pain)
    );
    document.getElementById('next2').disabled = state.pains.length === 0;
  }

  /* STEP 1 — SECTOR TABS + TRADE */
  document.querySelectorAll('#sectorTabs .sector-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#sectorTabs .sector-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const sectorKey = tab.dataset.sector;
      if (state.sector !== sectorKey) {
        state.trade = null;
        state.sector = sectorKey;
        document.getElementById('next1').disabled = true;
      }
      renderTrades(sectorKey);
    });
  });
  renderTrades('btp'); // initial render

  document.getElementById('next1').addEventListener('click', () => { if (state.trade) goToStep(2); });

  /* STEP 2 — PAINS (rendered dynamically, next2 always present) */
  document.getElementById('next2').addEventListener('click', () => { if (state.pains.length) goToStep(3); });

  /* STEP 3 — CALENDAR */
  const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const DOW = ['L','M','M','J','V','S','D'];
  let viewYear, viewMonth;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 1);
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();

  function renderCalendar() {
    const monthEl = document.getElementById('calMonth');
    const grid = document.getElementById('calGrid');
    if (!monthEl || !grid) return;
    monthEl.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    grid.innerHTML = '';
    DOW.forEach(d => {
      const c = document.createElement('div');
      c.className = 'cal-dow'; c.textContent = d;
      grid.appendChild(c);
    });
    const first = new Date(viewYear, viewMonth, 1);
    const firstDow = (first.getDay() + 6) % 7;
    for (let i = 0; i < firstDow; i++) {
      const c = document.createElement('div');
      c.className = 'cal-day empty';
      grid.appendChild(c);
    }
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('button');
      cell.className = 'cal-day';
      cell.textContent = d;
      cell.setAttribute('data-cursor', '');
      const dt = new Date(viewYear, viewMonth, d);
      const dow = (dt.getDay() + 6) % 7;
      const isPast = dt < minDate;
      const isWeekend = dow === 5 || dow === 6;
      const isToday = dt.getTime() === today.getTime();
      if (isToday) cell.classList.add('today');
      if (isPast || isWeekend) {
        cell.classList.add('disabled');
      } else {
        cell.classList.add('has-slots');
        cell.addEventListener('click', () => selectDate(dt, cell));
      }
      if (state.date && state.date.getTime() === dt.getTime()) cell.classList.add('selected');
      grid.appendChild(cell);
    }
    const prevBtn = document.getElementById('calPrev');
    if (prevBtn) prevBtn.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  }

  function selectDate(dt, cell) {
    state.date = dt;
    state.slot = null;
    document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected');
    renderSlots();
    document.getElementById('next3').disabled = true;
    refreshSummaries();
  }

  function renderSlots() {
    const wrap = document.getElementById('slotsWrap');
    const list = document.getElementById('slotList');
    const header = document.getElementById('slotsHeader');
    if (!state.date) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    const dayLabel = state.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    header.textContent = `CRÉNEAUX · ${dayLabel.toUpperCase()}`;
    list.innerHTML = '';
    const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','17:00'];
    const seed = state.date.getDate() + state.date.getMonth() * 31;
    const takenCount = (seed % 3) + 2;
    const taken = new Set();
    for (let i = 0; i < takenCount; i++) taken.add(slots[(seed * (i + 3)) % slots.length]);
    slots.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'slot';
      btn.textContent = s;
      btn.setAttribute('data-cursor', '');
      if (taken.has(s)) {
        btn.classList.add('taken');
      } else {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.slot').forEach(x => x.classList.remove('selected'));
          btn.classList.add('selected');
          state.slot = s;
          document.getElementById('next3').disabled = false;
          refreshSummaries();
        });
      }
      list.appendChild(btn);
    });
  }

  document.getElementById('calPrev').addEventListener('click', () => {
    if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) return;
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });
  renderCalendar();

  document.getElementById('next3').addEventListener('click', () => {
    if (state.date && state.slot) goToStep(4);
  });

  /* STEP 4 — FORM */
  const fEls = ['fFirst','fLast','fEmail','fPhone','fConsent'].map(id => document.getElementById(id));
  function validateForm() {
    const [first, last, email, phone, consent] = fEls.map(e => e.type === 'checkbox' ? e.checked : e.value.trim());
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const phoneOk = phone.replace(/\D/g, '').length >= 9;
    document.getElementById('next4').disabled = !(first && last && emailOk && phoneOk && consent);
  }
  ['fFirst','fLast','fCompany','fEmail','fPhone','fNote'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', validateForm);
  });
  document.getElementById('fConsent').addEventListener('change', validateForm);
  document.getElementById('fFormat').addEventListener('change', refreshSummaries);

  document.getElementById('next4').addEventListener('click', () => {
    state.contact.first = document.getElementById('fFirst').value.trim();
    state.contact.last = document.getElementById('fLast').value.trim();
    state.contact.company = document.getElementById('fCompany').value.trim();
    state.contact.email = document.getElementById('fEmail').value.trim();
    state.contact.phone = document.getElementById('fPhone').value.trim();
    state.contact.format = document.getElementById('fFormat').value;
    state.contact.note = document.getElementById('fNote').value.trim();
    fillConfirmation();
    goToStep(5);
  });

  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => { if (state.step > 1) goToStep(state.step - 1); });
  });

  function refreshSummaries() {
    const s2 = document.getElementById('summary2');
    if (s2) {
      if (state.trade) {
        s2.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>Métier : <span class="pill">${state.trade}</span>`;
        s2.style.display = 'flex';
      } else s2.style.display = 'none';
    }
    const s3 = document.getElementById('summary3');
    if (s3) {
      const parts = [];
      if (state.trade) parts.push(`<span class="pill">${state.trade}</span>`);
      if (state.pains.length) parts.push(`<span class="pill">${state.pains.length} besoin${state.pains.length>1?'s':''}</span>`);
      if (parts.length) {
        s3.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>${parts.join(' ')}`;
        s3.style.display = 'flex';
      } else s3.style.display = 'none';
    }
    const s4 = document.getElementById('summary4');
    if (s4 && state.date && state.slot) {
      const d = state.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      s4.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Démo le <span class="pill">${d} · ${state.slot}</span>`;
      s4.style.display = 'flex';
    } else if (s4) s4.style.display = 'none';
  }

  function fillConfirmation() {
    document.getElementById('confirmFirstName').textContent = state.contact.first;
    document.getElementById('confirmEmail').textContent = state.contact.email;
    const d = state.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('confirmWhen').textContent = `${d} · ${state.slot}`;
    document.getElementById('confirmFormat').textContent = state.contact.format;
    const sectorLabel = (SECTOR_DATA[state.sector] || {}).label || state.sector || '—';
    document.getElementById('confirmTrade').textContent = `${sectorLabel} · ${state.trade}`;

    const start = new Date(state.date);
    const [h, m] = state.slot.split(':').map(Number);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + 15 * 60 * 1000);
    const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const text = encodeURIComponent('Démo Talos · 15 min');
    const details = encodeURIComponent(`Démo Talos pour ${state.contact.first} ${state.contact.last}\nMétier : ${state.trade}\nBesoins : ${state.pains.join(', ')}\nFormat : ${state.contact.format}\n\nNote : ${state.contact.note || '—'}`);
    const loc = encodeURIComponent(state.contact.format);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${loc}`;
    const link = document.getElementById('addCal');
    if (link) {
      link.setAttribute('href', url);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    }
  }
})();
