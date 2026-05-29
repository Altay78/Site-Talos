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
  if (burger && mobile) {
    const closeMenu = () => {
      burger.classList.remove('active');
      mobile.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('vs-menu-open');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('active');
      mobile.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('vs-menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
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

  // ------- MENU ITEMS: tap → product modal + real cart -------
  const items = document.querySelectorAll('.vs-item');
  if (items.length) {
    const emojiFor = (cat) => ({
      pizza: '🍕', kebab: '🥙', burger: '🍔', tacos: '🌮',
      americain: '🍗', enfants: '🍟', petitefaim: '🍟', boissons: '🥤'
    }[cat] || '⭐');

    const catLabel = (cat) => ({
      pizza: 'Pizza', kebab: 'Kebab', burger: 'Burger', tacos: 'Tacos',
      americain: 'Américain', enfants: 'Enfants', petitefaim: 'Petite faim',
      boissons: 'Boisson'
    }[cat] || 'Plat');

    // ===== Ingredient + allergen knowledge base =====
    // Map common French phrases in descriptions to allergens
    const ALLERGENS = [
      { rx: /(mozzarella|fromage|cheddar|fior di latte|parmesan|gorgonzola|chèvre|tartiflette)/i, name: 'Lait (lactose)' },
      { rx: /(pain|brioché|naan|pita|galette|pâte|calzone|pizza)/i, name: 'Gluten (blé)' },
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
    const splitIngredients = (text) => {
      // remove punctuation-ish, split on commas/semicolons; cap at ~14
      return text
        .replace(/Servi avec.*$/i, '')
        .replace(/\.$/, '')
        .split(/[,;·•—]| et /i)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 60)
        .slice(0, 16);
    };

    // ===== Modal element refs (menu page only) =====
    const modal = document.getElementById('vsModal');
    const drawer = document.getElementById('vsCartDrawer');
    const overlay = document.getElementById('vsCartOverlay');
    const tile = document.getElementById('vsPanierTile');
    const tileBadge = tile ? tile.querySelector('.vs-tile-badge') : null;

    // ===== Cart state (persists during session) =====
    const cart = new Map(); // key=name, val={name,price,qty,cat}
    const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' €';
    const cartCount = () => [...cart.values()].reduce((s, x) => s + x.qty, 0);
    const cartTotal = () => [...cart.values()].reduce((s, x) => s + x.qty * x.price, 0);

    const updateBadge = () => {
      if (!tileBadge) return;
      const n = cartCount();
      tileBadge.textContent = String(n);
      tileBadge.dataset.count = n;
      tileBadge.classList.toggle('has-items', n > 0);
      // bump
      tileBadge.classList.remove('bump');
      void tileBadge.offsetWidth;
      if (n > 0) tileBadge.classList.add('bump');
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
      total.textContent = fmt(cartTotal());
    };

    const addToCart = (name, price, cat) => {
      const k = name;
      if (cart.has(k)) cart.get(k).qty += 1;
      else cart.set(k, { name, price, qty: 1, cat });
      updateBadge();
      renderCart();
    };

    // qty + remove inside cart
    if (drawer) {
      drawer.addEventListener('click', (e) => {
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
      });
    }

    // Open / close cart drawer
    const openCart = () => {
      if (!drawer || !overlay) return;
      drawer.classList.add('open');
      overlay.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('vs-cart-open');
    };
    const closeCart = () => {
      if (!drawer || !overlay) return;
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('vs-cart-open');
    };
    if (tile) tile.addEventListener('click', (e) => { e.preventDefault(); openCart(); });
    document.querySelectorAll('[data-cart-close]').forEach(el => el.addEventListener('click', closeCart));
    if (window.location.hash === '#panier') setTimeout(openCart, 300);

    // ===== Modal logic =====
    const openModal = (item) => {
      if (!modal) return;
      const name = item.dataset.name || item.querySelector('h3')?.textContent.trim() || 'Plat';
      const price = parseFloat(item.dataset.price || '0');
      const section = item.closest('[data-cat]');
      const cat = section ? section.dataset.cat : 'all';
      const desc = item.querySelector('.vs-item-desc')?.textContent.trim() || '';
      const tags = [...item.querySelectorAll('.vs-item-tag')].map(t => t.textContent.trim());

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
      const allWrap = document.getElementById('vsModalAllergWrap');
      const allList = document.getElementById('vsModalAllerg');
      if (allergens.length) {
        allList.innerHTML = allergens.map(a => `<li>${a}</li>`).join('');
        allWrap.style.display = '';
      } else {
        allList.innerHTML = '<li style="background:rgba(80,140,60,0.12);color:#3d6e2b;border-color:rgba(80,140,60,0.25)">Aucun allergène majeur détecté</li>';
        allWrap.style.display = '';
      }

      const tagsEl = document.getElementById('vsModalTags');
      tagsEl.innerHTML = tags.map(t => `<span class="vs-modal-tag">${t}</span>`).join('');

      const addBtn = document.getElementById('vsModalAdd');
      addBtn.onclick = () => {
        addToCart(name, price, cat);
        closeModal();
      };

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
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (modal && modal.classList.contains('open')) closeModal();
      else if (drawer && drawer.classList.contains('open')) closeCart();
    });

    // ===== Click on item: open modal (or just tacos detail) =====
    items.forEach((item) => {
      if (item.classList.contains('vs-tacos-detail')) return;
      item.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        // tiny pop
        item.classList.remove('vs-pop');
        void item.offsetWidth;
        item.classList.add('vs-pop');
        setTimeout(() => item.classList.remove('vs-pop'), 320);
        openModal(item);
      });
    });
  }

})();
