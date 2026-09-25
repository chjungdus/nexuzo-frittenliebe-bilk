// Frittenliebe Bilk — Probewebsite (Nexuzo)
// Inhalt: Mobile-Nav, Scroll-Reveal, Sticky-Nav-Shadow, Scrollspy,
//         Live-Öffnungsstatus, Öffnungszeiten-Tabelle, FAQ-Akkordeon,
//         Galerie-Lightbox, Back-to-top

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile navigation toggle ---------- */

  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */

  const revealEls = document.querySelectorAll('.reveal-item, .reveal-left, .reveal-right, .reveal-scale');

  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el, i) => {
      el.style.setProperty('--stagger-index', i % 4);
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Sticky-Nav: Schatten beim Scrollen ---------- */

  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Scrollspy: aktiven Nav-Link markieren ---------- */

  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinkMap = new Map();
  document.querySelectorAll('.nav__links a[href^="#"]').forEach((a) => {
    navLinkMap.set(a.getAttribute('href').slice(1), a);
  });

  if ('IntersectionObserver' in window && sections.length && navLinkMap.size) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = navLinkMap.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinkMap.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Live-Öffnungsstatus ---------- */

  // Reale Öffnungszeiten: Mo-Fr 10:30-18:00, Sa/So geschlossen.
  const OPENING_HOURS = {
    0: null,               // Sonntag
    1: [10.5, 18],          // Montag
    2: [10.5, 18],
    3: [10.5, 18],
    4: [10.5, 18],
    5: [10.5, 18],          // Freitag
    6: null,                // Samstag
  };
  const WEEKDAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  function updateOpenStatus() {
    const badge = document.querySelector('[data-status-badge]');
    const text = document.querySelector('[data-status-text]');
    if (!badge || !text) return;

    const now = new Date();
    const day = now.getDay();
    const hoursFloat = now.getHours() + now.getMinutes() / 60;
    const today = OPENING_HOURS[day];

    const isOpenNow = today && hoursFloat >= today[0] && hoursFloat < today[1];
    badge.setAttribute('data-open', String(Boolean(isOpenNow)));

    if (isOpenNow) {
      const closeHour = Math.floor(today[1]);
      const closeMin = Math.round((today[1] % 1) * 60);
      text.textContent = `Jetzt geöffnet · schließt um ${String(closeHour).padStart(2, '0')}:${String(closeMin).padStart(2, '0')} Uhr`;
      return;
    }

    // Nächsten Öffnungstag suchen (max. 7 Tage voraus)
    for (let i = 1; i <= 7; i++) {
      const nextDay = (day + i) % 7;
      const nextHours = OPENING_HOURS[nextDay];
      if (nextHours) {
        const openHour = Math.floor(nextHours[0]);
        const openMin = Math.round((nextHours[0] % 1) * 60);
        const label = i === 1 ? 'morgen' : `am ${WEEKDAY_NAMES[nextDay]}`;
        text.textContent = `Gerade geschlossen · öffnet ${label} um ${String(openHour).padStart(2, '0')}:${String(openMin).padStart(2, '0')} Uhr`;
        return;
      }
    }
    text.textContent = 'Gerade geschlossen';
  }

  updateOpenStatus();
  window.setInterval(updateOpenStatus, 60 * 1000);

  /* ---------- Öffnungszeiten-Tabelle: heutigen Tag markieren ---------- */

  const todayIndex = new Date().getDay();
  const todayRow = document.querySelector(`.hours-table tr[data-day="${todayIndex}"]`);
  if (todayRow) {
    todayRow.setAttribute('data-today', 'true');
  }

  /* ---------- FAQ-Akkordeon ---------- */

  document.querySelectorAll('.faq__question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Speisekarte ein-/ausklappen ---------- */

  const menuCollapse = document.getElementById('menu-collapse');
  const menuToggle = document.getElementById('menu-toggle');

  function setMenuOpen(open) {
    if (!menuCollapse || !menuToggle) return;
    menuCollapse.classList.toggle('is-collapsed', !open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.querySelector('[data-label]').textContent = open ? 'Weniger anzeigen' : 'Ganze Speisekarte anzeigen';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      setMenuOpen(open);
      if (!open) {
        const top = menuCollapse.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top });
      }
    });
  }

  // Sprungmarken klappen die Karte automatisch auf
  document.querySelectorAll('.menu__jump a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(true));
  });

  /* ---------- Galerie-Lightbox ---------- */

  const lightbox = document.getElementById('lightbox');
  const lightboxMedia = document.getElementById('lightbox-media');
  const lightboxCaption = document.getElementById('lightbox-caption');
  let lastFocusedTile = null;

  function openLightbox(tile) {
    if (!lightbox || !lightboxMedia || !lightboxCaption) return;
    lastFocusedTile = tile;
    const img = tile.querySelector('img');
    if (img) {
      lightboxMedia.src = img.currentSrc || img.src;
      lightboxMedia.alt = img.alt;
    }
    lightboxCaption.textContent = tile.dataset.caption || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox__close').focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedTile) lastFocusedTile.focus();
  }

  document.querySelectorAll('.gallery__tile').forEach((tile) => {
    tile.addEventListener('click', () => openLightbox(tile));
  });

  document.querySelectorAll('[data-lightbox-close]').forEach((el) => {
    el.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });

  /* ---------- Back-to-top ---------- */

  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.hidden = window.scrollY < 600;
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
