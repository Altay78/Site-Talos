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
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ------- MOBILE MENU -------
  const burger = document.getElementById('vsBurger');
  const mobile = document.getElementById('vsMobile');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('active');
      mobile.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('active');
        mobile.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ------- SCROLL REVEAL -------
  const revealTargets = document.querySelectorAll(
    '.vs-section-head, .vs-cat, .vs-sig, .vs-story-visual, .vs-story-copy, ' +
    '.vs-info-card, .vs-reserve, .vs-cta-band-inner, .vs-hero-copy, .vs-hero-visual'
  );
  revealTargets.forEach(el => el.classList.add('vs-reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // staggered reveal for siblings in same grid
          const parent = entry.target.parentElement;
          const idx = Array.from(parent.children).indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
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
      const navH = nav.offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ------- MENU PAGE: filter & cart -------
  const cats = document.getElementById('vsMenuCats');
  if (cats) {
    const buttons = cats.querySelectorAll('.vs-menu-cat-btn');
    const sections = document.querySelectorAll('.vs-menu-section');

    // category filter
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        buttons.forEach(b => b.classList.toggle('active', b === btn));
        if (cat === 'all') {
          sections.forEach(s => s.style.display = '');
          return;
        }
        // jump to the section anchor smoothly
        const target = document.getElementById(cat);
        if (target) {
          sections.forEach(s => s.style.display = '');
          const navH = (nav.offsetHeight || 60) + cats.offsetHeight + 12;
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

  // ------- CART -------
  const CART_KEY = 'levs_cart_v1';
  const cartFab = document.getElementById('vsCartFab');
  const cartCount = document.getElementById('vsCartCount');
  const cartTotal = document.getElementById('vsCartTotal');
  const cartTotalBig = document.getElementById('vsCartTotalBig');
  const cartDrawer = document.getElementById('vsCartDrawer');
  const cartOverlay = document.getElementById('vsCartOverlay');
  const cartClose = document.getElementById('vsCartClose');
  const cartList = document.getElementById('vsCartList');
  const cartFoot = document.getElementById('vsCartFoot');
  const toast = document.getElementById('vsToast');

  const loadCart = () => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (_) { return []; }
  };
  const saveCart = (c) => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (_) {}
  };
  const formatPrice = (n) => n.toFixed(2).replace('.', ',') + ' €';

  let cart = loadCart();

  const renderCart = () => {
    if (!cartFab) return;
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalAmt = cart.reduce((s, i) => s + i.qty * i.price, 0);

    if (cartCount) cartCount.textContent = totalQty;
    if (cartTotal) cartTotal.textContent = formatPrice(totalAmt);
    if (cartTotalBig) cartTotalBig.textContent = formatPrice(totalAmt);
    cartFab.classList.toggle('empty', totalQty === 0);

    if (cartList) {
      if (cart.length === 0) {
        cartList.innerHTML = `
          <div class="vs-cart-empty">
            <div class="vs-cart-empty-icon">🛒</div>
            <p>Votre panier est vide.<br>Sélectionnez vos plats favoris.</p>
          </div>`;
        if (cartFoot) cartFoot.style.display = 'none';
      } else {
        cartList.innerHTML = cart.map((item, idx) => `
          <div class="vs-cart-item">
            <div>
              <div class="vs-cart-item-name">${item.name}</div>
              <div class="vs-cart-item-unit">${formatPrice(item.price)} l'unité</div>
              <div class="vs-cart-item-controls">
                <button class="vs-qty-btn" data-act="dec" data-i="${idx}" aria-label="Retirer un">−</button>
                <span class="vs-qty-val">${item.qty}</span>
                <button class="vs-qty-btn" data-act="inc" data-i="${idx}" aria-label="Ajouter un">+</button>
              </div>
            </div>
            <div>
              <div class="vs-cart-item-price">${formatPrice(item.price * item.qty)}</div>
              <button class="vs-cart-item-remove" data-act="rm" data-i="${idx}">Retirer</button>
            </div>
          </div>
        `).join('');
        if (cartFoot) cartFoot.style.display = 'block';
      }
    }
  };

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
  };

  // add buttons
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.vs-item');
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      const existing = cart.find(i => i.name === name);
      if (existing) existing.qty += 1;
      else cart.push({ name, price, qty: 1 });
      saveCart(cart);
      renderCart();
      btn.classList.add('adding');
      setTimeout(() => btn.classList.remove('adding'), 350);
      cartFab.classList.add('bump');
      setTimeout(() => cartFab.classList.remove('bump'), 400);
      showToast(`${name} · ajouté ✓`);
    });
  });

  // qty controls (delegated)
  if (cartList) {
    cartList.addEventListener('click', (e) => {
      const t = e.target.closest('[data-act]');
      if (!t) return;
      const i = parseInt(t.dataset.i, 10);
      const act = t.dataset.act;
      if (act === 'inc') cart[i].qty += 1;
      else if (act === 'dec') {
        cart[i].qty -= 1;
        if (cart[i].qty <= 0) cart.splice(i, 1);
      } else if (act === 'rm') {
        cart.splice(i, 1);
      }
      saveCart(cart);
      renderCart();
    });
  }

  // open / close drawer
  const openCart = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  if (cartFab) cartFab.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  // collect / delivery toggle
  document.querySelectorAll('.vs-cart-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.vs-cart-opt').forEach(o => o.classList.toggle('active', o === opt));
    });
  });

  renderCart();

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

})();
