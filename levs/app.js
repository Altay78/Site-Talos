/* LE VS — interactions */

(function () {
  'use strict';

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

  // Cart state (in-memory; resets on page reload)
  const cart = new Map();
  const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' €';
  const cartCount = () => [...cart.values()].reduce((s, x) => s + x.qty, 0);
  const cartTotal = () => [...cart.values()].reduce((s, x) => s + x.qty * x.price, 0);

  // Reward tiers
  const TIERS = [
    { min: 20, label: '🥤 1 canette offerte', short: 'canette' },
    { min: 30, label: '🍾 1 bouteille 1,5 L offerte', short: 'bouteille' },
    { min: 50, label: '🍾🍾 2 bouteilles + 🍟 1 Petite faim offerte', short: '2 bouteilles + Petite faim' }
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
    // Map total to bar position: 0€=0%, 20€=40%, 30€=60%, 50€=100%
    const pct = total <= 0 ? 0
      : total >= 50 ? 100
      : total >= 30 ? 60 + ((total - 30) / 20) * 40
      : total >= 20 ? 40 + ((total - 20) / 10) * 20
      : (total / 20) * 40;
    fillEl.style.width = pct + '%';

    // mark each stop reached
    document.querySelectorAll('.vs-rewards-stop').forEach((el) => {
      const t = parseInt(el.dataset.tier, 10);
      const milestone = [0, 20, 30, 50][t];
      el.classList.toggle('reached', total >= milestone);
    });

    const next = TIERS.find(t => total < t.min);
    if (next) {
      const gap = next.min - total;
      labelEl.innerHTML = `Plus que <strong>${fmt(gap)}</strong> pour <span class="vs-rewards-prize">${next.label}</span>`;
    } else {
      labelEl.innerHTML = `<span class="vs-rewards-prize vs-rewards-prize--max">🎉 Vous avez tout débloqué — 2 bouteilles + 1 Petite faim offertes&nbsp;!</span>`;
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
      list.innerHTML = '<div class="vs-cart-empty"><div class="vs-cart-empty-icon">🛒</div><p>Votre panier est vide.<br>Tapotez un plat pour l\'ajouter.</p></div>';
      total.textContent = '0,00 €';
      return;
    }
    let html = '';
    cart.forEach((it) => {
      html += `<div class="vs-cart-row" data-key="${encodeURIComponent(it.name)}">
        <div>
          <div class="vs-cart-row-name">${it.name}</div>
          <div class="vs-cart-row-unit">${fmt(it.price)} l'unité</div>
        </div>
        <div class="vs-cart-row-price">${fmt(it.qty * it.price)}</div>
        <div class="vs-cart-row-qty">
          <button data-action="dec" aria-label="Moins">−</button>
          <span class="vs-cart-row-q">${it.qty}</span>
          <button data-action="inc" aria-label="Plus">+</button>
          <button class="vs-cart-row-rm" data-action="rm">Retirer</button>
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
    updateBadge();
    renderCart();
    updateRewards();
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
      updateBadge();
      renderCart();
      updateRewards();
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

  // Tap on .vs-item (menu page) → open modal
  document.querySelectorAll('.vs-item').forEach((item) => {
    if (item.classList.contains('vs-tacos-detail')) return;
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
    pizza:      { name: 'Nos pizzas',     emoji: '🍕', img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=1000&auto=format&fit=crop&q=80', fallback: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop&q=80', desc: 'Pâte affinée 48 h, cuisson au feu de bois. 14 recettes au choix, à partir de 9 €.' },
    kebab:      { name: 'Nos kebabs',     emoji: '🥙', img: 'https://images.unsplash.com/photo-1581352974628-23f97b568f04?w=1000&auto=format&fit=crop&q=80', fallback: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=1000&auto=format&fit=crop&q=80', desc: 'Kebab turc — viande halal marinée 24 h, broche tournée à la main. Pain au choix, sauces maison.' },
    burger:     { name: 'Nos burgers',    emoji: '🍔', img: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=1000&auto=format&fit=crop&q=80', fallback: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1000&auto=format&fit=crop&q=80', desc: 'Steak haché frais, smashé à la commande, pain brioché, cheddar affiné. Frites maison incluses.' },
    tacos:      { name: 'Nos tacos',      emoji: '🌮', img: 'https://images.unsplash.com/photo-1547928576-b822bc410bdf?w=1000&auto=format&fit=crop&q=80', fallback: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=80', desc: 'French tacos façon O\'Tacos : galette grillée à la plancha, sauce fromagère onctueuse. 1, 2 ou 3 viandes au choix.' },
    americain:  { name: 'L\'Américain',   emoji: '🍗', img: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=1000&auto=format&fit=crop&q=80', fallback: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1000&auto=format&fit=crop&q=80', desc: 'Sandwich américain garni — steak, merguez ou veggie — frites maison à la graisse de bœuf incluses.' }
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

})();
