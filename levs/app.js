/* LE VS — interactions */

(function () {
  'use strict';

  // ------- HAPTIC FEEDBACK -------
  const haptic = (ms = 10) => {
    try {
      if (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch (_) {}
  };

  // ------- TOAST -------
  const toast = (msg, icon = '✓') => {
    const el = document.getElementById('vsToast');
    if (!el) return;
    el.innerHTML = `<span class="vs-toast-icon">${icon}</span><span>${msg}</span>`;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2200);
  };

  // ------- TAP TO COPY -------
  const copyText = async (text) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      return true;
    } catch (_) {
      return false;
    }
  };
  document.querySelectorAll('.vs-copyable').forEach((el) => {
    el.addEventListener('click', async (e) => {
      // for <a> with tel:/mailto:, let the native action happen on tap and also copy
      const text = el.dataset.copyText || el.textContent.trim();
      const ok = await copyText(text);
      if (ok) {
        toast('Copié dans le presse-papier', '📋');
        haptic(15);
      }
    });
  });

  // ------- COOKIE BANNER -------
  const cookies = document.getElementById('vsCookies');
  if (cookies) {
    const stored = localStorage.getItem('vs-cookies-v1');
    if (!stored) {
      setTimeout(() => { cookies.hidden = false; cookies.classList.add('show'); }, 1400);
    }
    cookies.querySelectorAll('[data-cookies]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.cookies === 'accept') {
          localStorage.setItem('vs-cookies-v1', 'accepted');
          cookies.classList.remove('show');
          setTimeout(() => { cookies.hidden = true; }, 350);
          haptic(10);
        }
      });
    });
  }

  // ------- PRELOADER -------
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader && preloader.classList.add('done'), 600);
  });

  // ------- NAV scroll state -------
  const nav = document.getElementById('vsNav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ------- MOBILE MENU -------
  const burger = document.getElementById('vsBurger');
  const mobile = document.getElementById('vsMobile');
  const backdrop = document.getElementById('vsMobileBackdrop');
  if (burger && mobile) {
    const closeMenu = () => {
      burger.classList.remove('active');
      mobile.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      mobile.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('vs-menu-open');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      burger.classList.add('active');
      mobile.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      burger.setAttribute('aria-expanded', 'true');
      mobile.setAttribute('aria-hidden', 'false');
      document.body.classList.add('vs-menu-open');
      document.body.style.overflow = 'hidden';
    };
    burger.addEventListener('click', () => {
      if (mobile.classList.contains('active')) closeMenu(); else openMenu();
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobile.classList.contains('active')) closeMenu();
    });
  }

  // ------- SCROLL REVEAL -------
  const revealTargets = document.querySelectorAll(
    '.vs-section-head, .vs-cat, .vs-sig, .vs-story-visual, .vs-story-copy, ' +
    '.vs-info-card, .vs-reserve, .vs-cta-band-inner, .vs-hero-copy, .vs-hero-visual, ' +
    '.vs-menu-section-head, .vs-item'
  );
  revealTargets.forEach(el => el.classList.add('vs-reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const parent = entry.target.parentElement;
          const idx = Array.from(parent.children).indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(idx * 70, 350)}ms`;
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('visible'));
  }

  // ------- COUNTERS -------
  const counters = document.querySelectorAll('.vs-counter');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
      else { el.classList.add('done'); setTimeout(() => el.classList.remove('done'), 600); }
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  // ------- SMOOTH SCROLL with sticky nav offset -------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = (nav ? nav.offsetHeight : 60) + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ------- MENU PAGE: category filter / scroll spy -------
  const cats = document.getElementById('vsMenuCats');
  if (cats) {
    const buttons = cats.querySelectorAll('.vs-menu-cat-btn');
    const sections = document.querySelectorAll('.vs-menu-section');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        buttons.forEach(b => b.classList.toggle('active', b === btn));
        if (cat === 'all') return;
        const target = document.getElementById(cat);
        if (target) {
          const navH = (nav ? nav.offsetHeight : 60) + cats.offsetHeight + 12;
          const top = target.getBoundingClientRect().top + window.pageYOffset - navH;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // mark active category while scrolling
    if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.id;
            buttons.forEach(b => {
              b.classList.toggle('active', b.dataset.cat === id);
            });
          }
        });
      }, { rootMargin: '-40% 0px -50% 0px' });
      sections.forEach(s => sio.observe(s));
    }
  }

  // ------- PARALLAX on hero plate -------
  const plate = document.querySelector('.vs-plate-img');
  const hero = document.querySelector('.vs-hero');
  if (plate && hero && !matchMedia('(max-width: 768px)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            plate.style.transform = `translateY(${y * 0.06}px) rotate(${y * 0.04}deg)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ------- LIVE OPEN/CLOSED STATUS BADGE -------
  // Schedule (Paris time): mar-sam 11h30-13h30 + 18h30-21h00, dim 18h30-21h00, lun fermé
  // Days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const SCHEDULE = {
    0: [[18.5, 21]],
    1: [],
    2: [[11.5, 13.5], [18.5, 21]],
    3: [[11.5, 13.5], [18.5, 21]],
    4: [[11.5, 13.5], [18.5, 21]],
    5: [[11.5, 13.5], [18.5, 21]],
    6: [[11.5, 13.5], [18.5, 21]]
  };
  const fmtHM = (h) => {
    const hh = Math.floor(h);
    const mm = Math.round((h - hh) * 60);
    return `${hh}h${mm.toString().padStart(2, '0')}`;
  };
  const dayName = (d) => ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'][d];
  const nextOpening = (now) => {
    for (let i = 1; i <= 7; i++) {
      const d = (now.getDay() + i) % 7;
      const slots = SCHEDULE[d] || [];
      if (slots.length) {
        const isTomorrow = i === 1;
        return { day: d, from: slots[0][0], isTomorrow };
      }
    }
    return null;
  };
  const computeStatus = () => {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    const slots = SCHEDULE[now.getDay()] || [];
    for (const [from, to] of slots) {
      if (h >= from && h < to) {
        const minsLeft = (to - h) * 60;
        if (minsLeft <= 30) return { state: 'soon', label: 'Ferme bientôt', sub: `dans ${Math.round(minsLeft)} min` };
        return { state: 'open', label: 'Ouvert maintenant', sub: `jusqu'à ${fmtHM(to)}` };
      }
      if (h < from) {
        const minsTo = (from - h) * 60;
        if (minsTo <= 60) return { state: 'soon', label: 'Ouvre bientôt', sub: `à ${fmtHM(from)}` };
        return { state: 'closed', label: 'Fermé', sub: `ouvre à ${fmtHM(from)}` };
      }
    }
    const next = nextOpening(now);
    if (next) {
      const when = next.isTomorrow ? 'demain' : dayName(next.day);
      return { state: 'closed', label: 'Fermé', sub: `ouvre ${when} à ${fmtHM(next.from)}` };
    }
    return { state: 'closed', label: 'Fermé', sub: '' };
  };
  const refreshStatus = () => {
    const wrap = document.getElementById('vsStatus');
    if (!wrap) return;
    const t = document.getElementById('vsStatusText');
    const s = document.getElementById('vsStatusSub');
    const r = computeStatus();
    wrap.dataset.state = r.state;
    if (t) t.textContent = r.label;
    if (s) s.textContent = r.sub;
  };
  refreshStatus();
  setInterval(refreshStatus, 60000); // refresh every minute

  // status badge → open hours modal on click
  const statusBadge = document.getElementById('vsStatus');
  if (statusBadge) {
    statusBadge.style.cursor = 'pointer';
    statusBadge.setAttribute('role', 'button');
    statusBadge.setAttribute('tabindex', '0');
    statusBadge.addEventListener('click', () => openHoursModal());
    statusBadge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHoursModal(); }
    });
  }

  // ------- HOURS MODAL -------
  const hoursModal = document.getElementById('vsHoursModal');
  const openHoursModal = () => {
    if (!hoursModal) return;
    // highlight current day
    const today = new Date().getDay();
    hoursModal.querySelectorAll('.vs-hours-row').forEach(r => {
      r.classList.toggle('today', parseInt(r.dataset.day, 10) === today);
    });
    // status summary at top
    const r = computeStatus();
    const sum = document.getElementById('vsHoursStatus');
    if (sum) {
      sum.dataset.state = r.state;
      sum.querySelector('.vs-status-text').textContent = r.label;
      sum.querySelector('.vs-status-sub').textContent = r.sub;
    }
    hoursModal.classList.add('open');
    hoursModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('vs-legal-open');
  };
  const closeHoursModal = () => {
    if (!hoursModal) return;
    hoursModal.classList.remove('open');
    hoursModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vs-legal-open');
  };
  if (hoursModal) {
    hoursModal.querySelectorAll('[data-hours-close]').forEach(el => el.addEventListener('click', closeHoursModal));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hoursModal && hoursModal.classList.contains('open')) closeHoursModal();
  });

  // ------- CONFETTI (max tier reached) -------
  const fireConfetti = () => {
    const burst = document.createElement('div');
    burst.className = 'vs-confetti';
    const emojis = ['🎉', '✨', '🍔', '🥤', '🍟', '🌟', '🎊'];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('span');
      p.className = 'vs-confetti-piece';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const x = (Math.random() - 0.5) * 260;
      const y = -(120 + Math.random() * 180);
      const r = (Math.random() - 0.5) * 540;
      const d = 1.6 + Math.random() * 1.4;
      p.style.setProperty('--dx', x + 'px');
      p.style.setProperty('--dy', y + 'px');
      p.style.setProperty('--rot', r + 'deg');
      p.style.setProperty('--dur', d + 's');
      p.style.setProperty('--delay', (Math.random() * 0.25) + 's');
      p.style.fontSize = (16 + Math.random() * 14) + 'px';
      burst.appendChild(p);
    }
    // anchor over the cart drawer foot if open, else viewport center
    const anchor = document.querySelector('.vs-cart-drawer.open .vs-cart-foot') || document.body;
    anchor.appendChild(burst);
    setTimeout(() => burst.remove(), 3500);
  };

  // ------- PRODUCT MODAL + CART DRAWER -------
  const modal = document.getElementById('vsModal');
  const drawer = document.getElementById('vsCartDrawer');
  const cartOverlay = document.getElementById('vsCartOverlay');
  const tile = document.getElementById('vsPanierTile');
  const tileBadge = tile ? tile.querySelector('.vs-tile-badge') : null;
  const navCart = document.getElementById('vsCartNav');
  const navCartBadge = document.getElementById('vsCartNavBadge');

  const catLabel = (cat) => ({
    pizza: 'Pizza', kebab: 'Kebab', burger: 'Burger', tacos: 'Tacos',
    americain: 'Américain', enfants: 'Enfants', petitefaim: 'Petite faim',
    boissons: 'Boisson'
  }[cat] || 'Plat');

  const ALLERGENS = [
    { rx: /(mozzarella|fromage|cheddar|fior di latte|parmesan|gorgonzola|chèvre|tartiflette|crème|beurre|lait)/i, name: 'Lait (lactose)' },
    { rx: /(pain|brioché|naan|pita|galette|pâte|calzone|pizza|nuggets|tenders|panier|pané|panées|frites)/i, name: 'Gluten (blé)' },
    { rx: /(œuf|oeuf)/i, name: 'Œuf' },
    { rx: /(thon|anchois|saumon)/i, name: 'Poisson' },
    { rx: /(crevette|fruits de mer)/i, name: 'Crustacés' },
    { rx: /(moutarde)/i, name: 'Moutarde' },
    { rx: /(sésame)/i, name: 'Sésame' },
    { rx: /(soja)/i, name: 'Soja' },
    { rx: /(céleri)/i, name: 'Céleri' },
    { rx: /(arachide|cacahuète)/i, name: 'Arachides' },
    { rx: /(noix|amande|noisette)/i, name: 'Fruits à coque' }
  ];
  const detectAllergens = (text) => {
    const found = new Set();
    ALLERGENS.forEach(a => { if (a.rx.test(text)) found.add(a.name); });
    return [...found];
  };
  const splitIngredients = (text) => text
    .replace(/Servi avec.*$/i, '')
    .replace(/\.$/, '')
    .split(/[,;·•—]| et /i)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 60)
    .slice(0, 16);

  // Cart state — persisted in localStorage
  const CART_KEY = 'vs-cart-v1';
  const cart = new Map();
  const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' €';
  const cartCount = () => [...cart.values()].reduce((s, x) => s + x.qty, 0);
  const cartTotal = () => [...cart.values()].reduce((s, x) => s + x.qty * x.price, 0);

  const saveCart = () => {
    try {
      const arr = [...cart.values()];
      localStorage.setItem(CART_KEY, JSON.stringify(arr));
    } catch (_) {}
  };
  const loadCart = () => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;
      arr.forEach((it) => {
        if (it && it.name && it.price >= 0 && it.qty > 0) {
          cart.set(it.name, { name: it.name, price: it.price, qty: it.qty, cat: it.cat || 'all' });
        }
      });
    } catch (_) {}
  };
  loadCart();

  // Reward tiers
  const TIERS = [
    { min: 17.5, label: '🥤 1 canette offerte', short: 'canette' },
    { min: 30,   label: '🍾 1 bouteille + 🍟 1 petite frite', short: 'bouteille + frites' },
    { min: 50,   label: '🍔 1 cheese burger offert', short: 'cheese burger' }
  ];

  // Hardcoded catalog of suggestions (used everywhere — index + menu)
  const CATALOG = [
    { name: 'Portion frites',     price: 2.50, cat: 'petitefaim', emoji: '🍟' },
    { name: 'Poutine',            price: 3.50, cat: 'petitefaim', emoji: '🍟' },
    { name: 'Coca-Cola 33cl',     price: 1.50, cat: 'boissons',   emoji: '🥤' },
    { name: 'Kebab Assiette',     price: 6.50, cat: 'kebab',      emoji: '🥙' },
    { name: 'Cheese Burger',      price: 7.00, cat: 'burger',     emoji: '🍔' },
    { name: 'Kebab Pita',         price: 7.50, cat: 'kebab',      emoji: '🥙' },
    { name: 'Cheese Bacon',       price: 7.50, cat: 'burger',     emoji: '🍔' },
    { name: 'Américain Steak',    price: 8.00, cat: 'americain',  emoji: '🍗' },
    { name: 'Le Tacos Le VS',     price: 8.00, cat: 'tacos',      emoji: '🌮' },
    { name: 'Double Cheese',      price: 8.50, cat: 'burger',     emoji: '🍔' },
    { name: 'Double Cheese Bacon',price: 9.00, cat: 'burger',     emoji: '🍔' },
    { name: 'Margarita',          price: 10.00, cat: 'pizza',     emoji: '🍕' },
    { name: 'Reine',              price: 11.00, cat: 'pizza',     emoji: '🍕' },
    { name: 'Calzone',            price: 11.00, cat: 'pizza',     emoji: '🍕' },
    { name: 'Boîte 20 nuggets',   price: 19.00, cat: 'petitefaim', emoji: '🍟' }
  ];

  const pickSuggestions = (total, max = 3) => {
    const next = TIERS.find(t => total < t.min);
    if (!next) return [];
    const gap = next.min - total;
    // ideal: items that close the gap. prefer cheap if gap small, else single item that hits or overshoots.
    const candidates = CATALOG.filter(it => it.price <= gap * 1.6 + 0.5);
    // sort: closeness to gap, then price
    candidates.sort((a, b) => Math.abs(a.price - gap) - Math.abs(b.price - gap) || a.price - b.price);
    const picks = [];
    const seen = new Set();
    for (const it of candidates) {
      if (seen.has(it.cat)) continue;
      picks.push(it);
      seen.add(it.cat);
      if (picks.length >= max) break;
    }
    if (picks.length < max) {
      for (const it of candidates) {
        if (!picks.includes(it)) picks.push(it);
        if (picks.length >= max) break;
      }
    }
    return picks;
  };

  const updateRewards = () => {
    const fillEl = document.getElementById('vsRewardsFill');
    const labelEl = document.getElementById('vsRewardsLabel');
    const suggestEl = document.getElementById('vsSuggest');
    if (!fillEl || !labelEl) return;

    const total = cartTotal();
    // Map total to bar position: 0€=0%, 17.50€=35%, 30€=65%, 50€=100%
    const pct = total <= 0 ? 0
      : total >= 50   ? 100
      : total >= 30   ? 65 + ((total - 30) / 20) * 35
      : total >= 17.5 ? 35 + ((total - 17.5) / 12.5) * 30
      : (total / 17.5) * 35;
    fillEl.style.width = pct + '%';

    // mark each stop reached
    document.querySelectorAll('.vs-rewards-stop').forEach((el) => {
      const t = parseInt(el.dataset.tier, 10);
      const milestone = [0, 17.5, 30, 50][t];
      el.classList.toggle('reached', total >= milestone);
    });

    // confetti when MAX tier just reached
    if (total >= 50 && !document.body.classList.contains('vs-tier-maxed')) {
      document.body.classList.add('vs-tier-maxed');
      fireConfetti();
    }
    if (total < 50) document.body.classList.remove('vs-tier-maxed');

    // cumulative unlocked rewards
    const unlocked = TIERS.filter(t => total >= t.min);
    const unlockedEl = document.getElementById('vsRewardsUnlocked');
    if (unlockedEl) {
      if (unlocked.length === 0) {
        unlockedEl.innerHTML = '';
        unlockedEl.classList.remove('show');
      } else {
        unlockedEl.classList.add('show');
        unlockedEl.innerHTML =
          '<div class="vs-unlocked-title">✓ Déjà débloqué</div>' +
          '<div class="vs-unlocked-chips">' +
            unlocked.map((t, i) => `<span class="vs-unlocked-chip" style="--i:${i}">${t.label}</span>`).join('') +
          '</div>';
      }
    }

    const next = TIERS.find(t => total < t.min);
    if (next) {
      const gap = next.min - total;
      const verb = unlocked.length > 0 ? 'pour ajouter' : 'pour';
      labelEl.innerHTML = `Plus que <strong>${fmt(gap)}</strong> ${verb} <span class="vs-rewards-prize">${next.label}</span>`;
    } else {
      labelEl.innerHTML = `<span class="vs-rewards-prize vs-rewards-prize--max">🎉 Tout débloqué — 🥤 canette + 🍾 bouteille + 🍟 frite + 🍔 cheese burger offerts&nbsp;!</span>`;
    }

    if (suggestEl) {
      const picks = pickSuggestions(total);
      if (picks.length === 0) {
        suggestEl.innerHTML = '';
      } else {
        suggestEl.innerHTML = '<div class="vs-suggest-title">Pour atteindre le palier&nbsp;:</div>' +
          picks.map(it => `<button class="vs-suggest-card" data-name="${it.name}" data-price="${it.price}" data-cat="${it.cat}">
            <span class="vs-suggest-emoji">${it.emoji}</span>
            <span class="vs-suggest-name">${it.name}</span>
            <span class="vs-suggest-price">${fmt(it.price)}</span>
            <span class="vs-suggest-plus">+</span>
          </button>`).join('');
      }
    }
  };

  const updateBadge = () => {
    const n = cartCount();
    [tileBadge, navCartBadge].forEach((b) => {
      if (!b) return;
      b.textContent = String(n);
      b.dataset.count = n;
      b.classList.toggle('has-items', n > 0);
      b.classList.remove('bump');
      void b.offsetWidth;
      if (n > 0) b.classList.add('bump');
    });
  };

  const renderCart = () => {
    const list = document.getElementById('vsCartList');
    const total = document.getElementById('vsCartTotal');
    if (!list || !total) return;
    if (cart.size === 0) {
      list.innerHTML = `
        <div class="vs-cart-empty">
          <div class="vs-cart-empty-stove" aria-hidden="true">
            <span class="vs-cart-empty-pan">🍳</span>
            <span class="vs-cart-empty-steam">·</span>
            <span class="vs-cart-empty-steam">·</span>
            <span class="vs-cart-empty-steam">·</span>
          </div>
          <p class="vs-cart-empty-title">Ça mijote chez Le VS&nbsp;!</p>
          <p class="vs-cart-empty-sub">Composez votre commande, on s'occupe du reste.</p>
          <a href="menu.html" class="vs-cta-ghost vs-cart-empty-cta">Voir la carte →</a>
        </div>`;
      total.textContent = '0,00 €';
      return;
    }
    let html = '';
    cart.forEach((it) => {
      html += `<div class="vs-cart-row" data-key="${encodeURIComponent(it.name)}">
        <button class="vs-cart-row-rm" data-action="rm" aria-label="Retirer ${it.name}" title="Retirer">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6l-12 12"/></svg>
        </button>
        <div class="vs-cart-row-info">
          <div class="vs-cart-row-name">${it.name}</div>
          <div class="vs-cart-row-unit">${fmt(it.price)} l'unité</div>
        </div>
        <div class="vs-cart-row-price">${fmt(it.qty * it.price)}</div>
        <div class="vs-cart-row-qty">
          <button data-action="dec" aria-label="Moins">−</button>
          <span class="vs-cart-row-q">${it.qty}</span>
          <button data-action="inc" aria-label="Plus">+</button>
        </div>
      </div>`;
    });
    list.innerHTML = html;
    const newTotal = fmt(cartTotal());
    if (total.textContent !== newTotal) {
      total.textContent = newTotal;
      total.classList.remove('bump');
      void total.offsetWidth;
      total.classList.add('bump');
    }
  };

  const addToCart = (name, price, cat) => {
    const k = name;
    if (cart.has(k)) cart.get(k).qty += 1;
    else cart.set(k, { name, price, qty: 1, cat });
    saveCart();
    updateBadge();
    renderCart();
    updateRewards();
    haptic(20);
  };

  // qty + remove inside cart, AND suggestion add
  if (drawer) {
    drawer.addEventListener('click', (e) => {
      // suggestion card → add that item
      const sug = e.target.closest('.vs-suggest-card');
      if (sug) {
        addToCart(sug.dataset.name, parseFloat(sug.dataset.price), sug.dataset.cat);
        return;
      }
      // qty buttons / remove
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const row = btn.closest('.vs-cart-row');
      if (!row) return;
      const key = decodeURIComponent(row.dataset.key);
      const it = cart.get(key);
      if (!it) return;
      const act = btn.dataset.action;
      if (act === 'inc') it.qty += 1;
      else if (act === 'dec') { it.qty -= 1; if (it.qty <= 0) cart.delete(key); }
      else if (act === 'rm') cart.delete(key);
      saveCart();
      updateBadge();
      renderCart();
      updateRewards();
      haptic(act === 'rm' ? 25 : 10);
    });
  }

  const openCart = () => {
    if (!drawer || !cartOverlay) return;
    drawer.classList.add('open');
    cartOverlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('vs-cart-open');
    renderCart();
    updateRewards();
  };
  const closeCart = () => {
    if (!drawer || !cartOverlay) return;
    drawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vs-cart-open');
  };
  if (tile) tile.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
  if (navCart) navCart.addEventListener('click', openCart);
  document.querySelectorAll('[data-cart-close]').forEach(el => el.addEventListener('click', closeCart));
  if (window.location.hash === '#panier') setTimeout(openCart, 300);

  // Sync UI with any restored cart from localStorage
  // (mark max tier already-reached so no confetti fires at init)
  if (cartTotal() >= 50) document.body.classList.add('vs-tier-maxed');
  updateBadge();
  setTimeout(() => updateRewards(), 0);

  // Modal
  const openModalWith = (data) => {
    if (!modal) return;
    const { name, price, cat, desc, tags } = data;
    document.getElementById('vsModalCat').textContent = catLabel(cat);
    document.getElementById('vsModalTitle').textContent = name;
    document.getElementById('vsModalPrice').textContent = fmt(price);
    document.getElementById('vsModalDesc').textContent = desc;

    const ingredients = splitIngredients(desc);
    const ingrWrap = document.getElementById('vsModalIngrWrap');
    const ingrList = document.getElementById('vsModalIngr');
    if (ingredients.length) {
      ingrList.innerHTML = ingredients.map(s => `<li>${s.charAt(0).toUpperCase() + s.slice(1)}</li>`).join('');
      ingrWrap.style.display = '';
    } else { ingrWrap.style.display = 'none'; }

    const allergens = detectAllergens(desc + ' ' + name);
    const allList = document.getElementById('vsModalAllerg');
    if (allergens.length) {
      allList.innerHTML = allergens.map(a => `<li>${a}</li>`).join('');
    } else {
      allList.innerHTML = '<li style="background:rgba(80,140,60,0.12);color:#3d6e2b;border-color:rgba(80,140,60,0.25)">Aucun allergène majeur détecté</li>';
    }

    const tagsEl = document.getElementById('vsModalTags');
    tagsEl.innerHTML = (tags || []).map(t => `<span class="vs-modal-tag">${t}</span>`).join('');

    // cross-sell: suggest 2-3 complementary items
    const crossEl = document.getElementById('vsModalCrossSell');
    if (crossEl) {
      const PAIRINGS = {
        pizza:      ['boissons', 'petitefaim'],
        kebab:      ['boissons', 'petitefaim'],
        burger:     ['boissons', 'petitefaim'],
        tacos:      ['boissons', 'petitefaim'],
        americain:  ['boissons', 'petitefaim'],
        enfants:    ['boissons'],
        petitefaim: ['boissons'],
        boissons:   ['petitefaim', 'tacos']
      };
      const targets = PAIRINGS[cat] || ['boissons'];
      const sugg = [];
      for (const tgt of targets) {
        const candidates = CATALOG.filter(it => it.cat === tgt && it.name !== name);
        if (candidates.length) sugg.push(candidates[Math.floor(Math.random() * candidates.length)]);
        if (sugg.length >= 2) break;
      }
      if (sugg.length === 0) crossEl.innerHTML = '';
      else {
        crossEl.innerHTML =
          '<div class="vs-crosssell-title">Vous voudrez peut-être aussi…</div>' +
          '<div class="vs-crosssell-list">' +
            sugg.map((it, i) => `<button class="vs-crosssell-item" style="--i:${i}" data-name="${it.name}" data-price="${it.price}" data-cat="${it.cat}">
              <span class="vs-crosssell-emoji">${it.emoji}</span>
              <span class="vs-crosssell-name">${it.name}</span>
              <span class="vs-crosssell-price">${fmt(it.price)}</span>
              <span class="vs-crosssell-plus">+</span>
            </button>`).join('') +
          '</div>';
        crossEl.querySelectorAll('.vs-crosssell-item').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(btn.dataset.name, parseFloat(btn.dataset.price), btn.dataset.cat);
            btn.classList.add('added');
            setTimeout(() => btn.classList.remove('added'), 700);
            toast(`${btn.dataset.name} ajouté`, '🛒');
          });
        });
      }
    }

    const addBtn = document.getElementById('vsModalAdd');
    addBtn.onclick = () => { addToCart(name, price, cat); closeModal(); };

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('vs-modal-open');
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vs-modal-open');
  };
  if (modal) {
    modal.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));
  }
  // Legal modal
  const legal = document.getElementById('vsLegal');
  const openLegal = () => {
    if (!legal) return;
    legal.classList.add('open');
    legal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('vs-legal-open');
  };
  const closeLegal = () => {
    if (!legal) return;
    legal.classList.remove('open');
    legal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vs-legal-open');
  };
  document.querySelectorAll('[data-legal-open]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); openLegal(); });
  });
  document.querySelectorAll('[data-legal-close]').forEach(el => el.addEventListener('click', closeLegal));
  if (window.location.hash === '#legal') setTimeout(openLegal, 300);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (legal && legal.classList.contains('open')) closeLegal();
    else if (modal && modal.classList.contains('open')) closeModal();
    else if (drawer && drawer.classList.contains('open')) closeCart();
  });

  // Tap on .vs-item (menu page) → open modal + inject quick-add button
  document.querySelectorAll('.vs-item').forEach((item) => {
    if (item.classList.contains('vs-tacos-detail')) return;

    // inject quick-add "+ Ajouter" button
    if (!item.querySelector('.vs-quick-add')) {
      const qa = document.createElement('button');
      qa.className = 'vs-quick-add';
      qa.setAttribute('aria-label', 'Ajouter au panier');
      qa.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
      qa.addEventListener('click', (e) => {
        e.stopPropagation();
        const section = item.closest('[data-cat]');
        const name = item.dataset.name || item.querySelector('h3')?.textContent.trim() || 'Plat';
        const price = parseFloat(item.dataset.price || '0');
        const cat = section ? section.dataset.cat : 'all';
        addToCart(name, price, cat);
        // visual feedback on the button
        qa.classList.remove('added'); void qa.offsetWidth; qa.classList.add('added');
        setTimeout(() => qa.classList.remove('added'), 700);
        toast(`${name} ajouté au panier`, '🛒');
      });
      item.appendChild(qa);
    }

    item.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      item.classList.remove('vs-pop'); void item.offsetWidth; item.classList.add('vs-pop');
      setTimeout(() => item.classList.remove('vs-pop'), 320);
      const section = item.closest('[data-cat]');
      openModalWith({
        name: item.dataset.name || item.querySelector('h3')?.textContent.trim() || 'Plat',
        price: parseFloat(item.dataset.price || '0'),
        cat: section ? section.dataset.cat : 'all',
        desc: item.querySelector('.vs-item-desc')?.textContent.trim() || '',
        tags: [...item.querySelectorAll('.vs-item-tag')].map(t => t.textContent.trim())
      });
    });
  });

  // ----- Category preview modal (homepage cat tap) -----
  const catModal = document.getElementById('vsCatModal');
  const CAT_INFO = {
    pizza:      { name: 'Nos pizzas',     emoji: '🍕', img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=1000&auto=format&fit=crop&q=80', fallback: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop&q=80', desc: 'Pâte fraîche, sauce tomate, mozzarella. 14 recettes au choix, à partir de 9 €.' },
    kebab:      { name: 'Nos kebabs',     emoji: '🥙', img: 'https://www.idgastronomic.com/wp-content/uploads/2023/01/Kebab-de-Pollo-Asado-y-Loncheado-slider.jpg', fallback: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=1000&auto=format&fit=crop&q=80', desc: 'Kebab turc, viande halal à la broche. Pain pita, galette ou assiette, sauces au choix.' },
    burger:     { name: 'Nos burgers',    emoji: '🍔', img: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=1000&auto=format&fit=crop&q=80', fallback: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1000&auto=format&fit=crop&q=80', desc: 'Steak haché, pain brioché, cheddar, salade. Frites maison incluses.' },
    tacos:      { name: 'Nos tacos',      emoji: '🌮', img: 'https://img.cuisineaz.com/660x495/2025/05/28/i205118-french-tacos-de-o-tacos.jpg', fallback: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=80', desc: 'French tacos style O\'Tacos : galette grillée, sauce fromagère. 1, 2 ou 3 viandes au choix.' },
    americain:  { name: 'L\'Américain',   emoji: '🍗', img: 'https://www.jeveuxtoutgouter.com/upload/sandwich-americain-1638346953-44017.jpg', fallback: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&auto=format&fit=crop&q=80', desc: 'Sandwich américain garni — steak, merguez ou veggie — frites maison incluses.' }
  };
  const openCatModal = (cat) => {
    if (!catModal) return;
    const info = CAT_INFO[cat] || CAT_INFO.pizza;
    const imgEl = document.getElementById('vsCatModalImg');
    imgEl.onerror = () => { imgEl.onerror = null; if (info.fallback) imgEl.src = info.fallback; };
    imgEl.src = info.img;
    imgEl.alt = info.name;
    document.getElementById('vsCatModalCat').textContent = catLabel(cat);
    document.getElementById('vsCatModalTitle').textContent = info.name;
    document.getElementById('vsCatModalDesc').textContent = info.desc;

    const list = document.getElementById('vsCatModalList');
    const items = CATALOG.filter(it => it.cat === cat).slice(0, 4);
    if (items.length === 0) {
      // fallback: any 4 items
      items.push(...CATALOG.slice(0, 4));
    }
    list.innerHTML = items.map(it => `<div class="vs-catmodal-row">
      <span class="vs-catmodal-emoji">${it.emoji}</span>
      <span class="vs-catmodal-name">${it.name}</span>
      <span class="vs-catmodal-price">${fmt(it.price)}</span>
    </div>`).join('');

    const cta = document.getElementById('vsCatModalCta');
    const ctaText = document.getElementById('vsCatModalCtaText');
    cta.href = 'menu.html#' + cat;
    const labelMap = {
      pizza: 'Voir toutes les pizzas',
      kebab: 'Voir tous les kebabs',
      burger: 'Voir tous les burgers',
      tacos: 'Voir les tacos',
      americain: 'Voir les sandwiches américains'
    };
    if (ctaText) ctaText.textContent = labelMap[cat] || 'Voir toute la carte';

    catModal.classList.add('open');
    catModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('vs-modal-open');
  };
  const closeCatModal = () => {
    if (!catModal) return;
    catModal.classList.remove('open');
    catModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vs-modal-open');
  };
  if (catModal) {
    catModal.querySelectorAll('[data-catmodal-close]').forEach(el => el.addEventListener('click', closeCatModal));
  }

  // Tap on .vs-cat (homepage category card) → open preview modal
  document.querySelectorAll('.vs-cat').forEach((card) => {
    if (card.classList.contains('vs-cat-cta')) {
      // whole "Voir la carte complète" tile → navigate to menu.html
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        card.classList.remove('vs-pop'); void card.offsetWidth; card.classList.add('vs-pop');
        setTimeout(() => { window.location.href = 'menu.html'; }, 160);
      });
      return;
    }
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      const cat = card.dataset.cat || 'pizza';
      card.classList.remove('vs-pop'); void card.offsetWidth; card.classList.add('vs-pop');
      if (catModal) openCatModal(cat);
      else window.location.href = 'menu.html#' + cat;
    });
  });

  // ESC also closes catmodal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && catModal && catModal.classList.contains('open')) closeCatModal();
  });

  // ------- ALLERGENS MODAL -------
  const allergensModal = document.getElementById('vsAllergens');
  const openAllergens = () => {
    if (!allergensModal) return;
    allergensModal.classList.add('open');
    allergensModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('vs-legal-open');
  };
  const closeAllergens = () => {
    if (!allergensModal) return;
    allergensModal.classList.remove('open');
    allergensModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vs-legal-open');
  };
  document.querySelectorAll('[data-allergens-open]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); openAllergens(); });
  });
  document.querySelectorAll('[data-allergens-close]').forEach(el => el.addEventListener('click', closeAllergens));
  if (window.location.hash === '#allergens') setTimeout(openAllergens, 300);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && allergensModal && allergensModal.classList.contains('open')) closeAllergens();
  });

  // ------- MENU FILTERS + SEARCH (menu page only) -------
  const menuItems = document.querySelectorAll('.vs-item:not(.vs-tacos-detail)');
  const filterBtns = document.querySelectorAll('.vs-filter-btn[data-filter]');
  const searchInput = document.getElementById('vsMenuSearch');
  const searchClear = document.getElementById('vsSearchClear');
  const emptyMsg = document.getElementById('vsMenuEmpty');
  const resetBtn = document.getElementById('vsResetTools');

  if (menuItems.length && (filterBtns.length || searchInput)) {
    // Detect tags for each item once
    const detectTags = (item) => {
      const tagText = [...item.querySelectorAll('.vs-item-tag')].map(t => t.textContent.toLowerCase()).join(' ');
      const desc = (item.querySelector('.vs-item-desc')?.textContent || '').toLowerCase();
      const name = (item.querySelector('h3')?.textContent || '').toLowerCase();
      const section = item.closest('[data-cat]');
      const cat = section ? section.dataset.cat : '';
      const blob = name + ' ' + desc;
      const tags = new Set();
      // vege
      if (/(végé|veggie|🌱)/i.test(tagText) ||
          (!/(viande|bacon|poulet|steak|merguez|nuggets?|jambon|thon|kebab|chorizo|tenders?|chair)/i.test(blob)
           && (cat === 'pizza' || cat === 'boissons' || cat === 'petitefaim')
           && /margarita|fromage|quatre|tropical|cassis|tropico|orangina|fanta|sprite|coca|pepsi|7up|schweppes|oasis|pellegrino|lipton|frites/i.test(name + ' ' + desc))) {
        tags.add('vege');
      }
      // halal
      if (/halal/i.test(tagText) || /halal/i.test(blob) || cat === 'kebab' || (cat === 'tacos' && /viande kebab|halal/.test(blob))) {
        tags.add('halal');
      }
      // spicy
      if (/(épicé|épicée|harissa|🌶|piquant|samouraï|samourai|algérienne|algerienne|doux à fort|barbecue|brazil|curry)/i.test(blob + ' ' + tagText)) {
        tags.add('spicy');
      }
      // gluten-free (very limited — boissons, viande seule)
      if (cat === 'boissons' || /barquette viande/i.test(name)) {
        tags.add('gluten-free');
      }
      return [...tags];
    };
    menuItems.forEach(it => { it.dataset.tags = detectTags(it).join(' '); });

    let currentFilter = 'all';
    let currentSearch = '';

    const apply = () => {
      const q = currentSearch.toLowerCase().trim();
      const sections = new Map(); // section element → matches count
      let totalShown = 0;
      menuItems.forEach((it) => {
        const tags = (it.dataset.tags || '').split(' ');
        const name = (it.querySelector('h3')?.textContent || '').toLowerCase();
        const desc = (it.querySelector('.vs-item-desc')?.textContent || '').toLowerCase();
        const matchFilter = currentFilter === 'all' || tags.includes(currentFilter);
        const matchSearch = !q || name.includes(q) || desc.includes(q);
        const show = matchFilter && matchSearch;
        it.hidden = !show;
        if (show) it.classList.add('vs-fade-in');
        else it.classList.remove('vs-fade-in');
        const section = it.closest('.vs-menu-section');
        if (section) sections.set(section, (sections.get(section) || 0) + (show ? 1 : 0));
        if (show) totalShown++;
      });
      // hide sections with 0 visible items
      sections.forEach((count, sec) => sec.classList.toggle('vs-hide-empty', count === 0));
      // tacos detail card visible only when no filter / no search
      const tacosDetail = document.querySelector('.vs-tacos-detail');
      if (tacosDetail) {
        const tacosSec = tacosDetail.closest('.vs-menu-section');
        const tacosVisible = (currentFilter === 'all' || currentFilter === 'halal') && !q;
        if (tacosSec) tacosSec.classList.toggle('vs-hide-empty', !tacosVisible && (sections.get(tacosSec) || 0) === 0);
        if (tacosVisible) totalShown++;
      }
      if (emptyMsg) emptyMsg.hidden = totalShown > 0;
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.toggle('active', b === btn));
        currentFilter = btn.dataset.filter;
        apply();
      });
    });

    if (searchInput) {
      const onInput = () => {
        currentSearch = searchInput.value;
        if (searchClear) searchClear.hidden = !searchInput.value;
        apply();
      };
      searchInput.addEventListener('input', onInput);
      if (searchClear) {
        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          searchInput.focus();
          onInput();
        });
      }
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentSearch = '';
        currentFilter = 'all';
        filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
        if (searchClear) searchClear.hidden = true;
        apply();
      });
    }
  }

})();
