/* =========================================================
   Header: Blur/Farbe beim Scroll
   ========================================================= */
const header = document.querySelector('.site-header');
const onScroll = () => {
  if (!header) return;
  if (window.scrollY > 10) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* =========================================================
   Reveal-Animation (einmaliges Einblenden)
   ========================================================= */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* Jahreszahl im Footer */
const yEl = document.getElementById('y');
if (yEl) yEl.textContent = new Date().getFullYear();

/* =========================================================
   Hamburger-Menü (Mobil)
   ========================================================= */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.getElementById('primary-menu');
  if (!toggle || !menu) return;

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    menu.setAttribute('data-open', 'true');  // für CSS-Animation
    document.body.style.overflow = 'hidden'; // Scroll sperren
  };

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    menu.removeAttribute('data-open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });

  // Klick auf Link schließt das Menü
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) close();
  });

  // ESC schließt
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Beim Resize auf Desktop schließen
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) close();
  });
})();

/* =========================================================
   Hero-Slideshow (Autoplay + Pfeile + Dots + Touch)
   ========================================================= */
(() => {
  const hero = document.querySelector('.hero');
  const slides = hero?.querySelectorAll('.hero-slide');
  if (!hero || !slides || !slides.length) return;

  const dotsWrap = hero.querySelector('.hero-dots');
  let i = 0;
  const DURATION = 6000;              // 6s pro Slide
  let timer = null;

  const setActive = (next) => {
    slides[i].classList.remove('is-active');
    i = (next + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    if (dots.length) dots.forEach((d, idx) => d.setAttribute('aria-current', String(idx === i)));
  };

  const play = () => { stop(); timer = setInterval(() => setActive(i + 1), DURATION); };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };

  // Dots erzeugen
  let dots = [];
  if (dotsWrap) {
    dots = Array.from({ length: slides.length }, (_, idx) => {
      const b = document.createElement('button');
      b.className = 'hero-dot';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Slide ${idx + 1}`);
      b.setAttribute('aria-current', String(idx === 0));
      b.addEventListener('click', () => { stop(); setActive(idx); play(); });
      dotsWrap.appendChild(b);
      return b;
    });
  }

  // Autoplay starten + pausieren bei Hover/Tabwechsel
  play();
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', play);
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : play(); });

  // Touch-Wischen (links/rechts)
  let startX = null, startY = null;
  hero.addEventListener('touchstart', (e) => {
    const t = e.touches[0]; startX = t.clientX; startY = t.clientY; stop();
  }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (startX === null || startY === null) return play();
    const t = e.changedTouches[0];
    const dx = t.clientX - startX; const dy = t.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) setActive(i + (dx < 0 ? 1 : -1));
    startX = startY = null; play();
  });

  // Pfeile (manuelle Navigation)
  const prevBtn = hero.querySelector('.hero-prev');
  const nextBtn = hero.querySelector('.hero-next');
  const goPrev = () => { stop(); setActive(i - 1); play(); };
  const goNext = () => { stop(); setActive(i + 1); play(); };
  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);

  // Tastatur (←/→), solange der Hero den Fokus hat
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  });
  hero.setAttribute('tabindex','-1');  // fokussierbar machen
})();

/* =========================================================
   Galerie: Tile-Slider (ohne Autoplay)
   ========================================================= */
(() => {
  const tiles = document.querySelectorAll('.tile-slider');
  if (!tiles.length) return;

  const initTile = (root) => {
    const slides = Array.from(root.querySelectorAll('.tile-slide'));
    if (slides.length < 2) return; // kein Slider nötig

    let i = 0;
    const setActive = (next) => {
      slides[i].classList.remove('is-active');
      i = (next + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      dots.forEach((d, idx) => d.setAttribute('aria-current', String(idx === i)));
    };

    // Pfeile
    const prevBtn = root.querySelector('.tile-prev');
    const nextBtn = root.querySelector('.tile-next');
    const goPrev  = () => setActive(i - 1);
    const goNext  = () => setActive(i + 1);
    prevBtn?.addEventListener('click', goPrev);
    nextBtn?.addEventListener('click', goNext);

    // Dots erzeugen
    const dotsWrap = root.querySelector('.tile-dots');
    let dots = [];
    if (dotsWrap) {
      dots = slides.map((_, idx) => {
        const b = document.createElement('button');
        b.className = 'tile-dot';
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', `Bild ${idx + 1}`);
        b.setAttribute('aria-current', String(idx === 0));
        b.addEventListener('click', () => setActive(idx));
        dotsWrap.appendChild(b);
        return b;
      });
    }

    // Touch-Wischen
    let startX = null, startY = null;
    root.addEventListener('touchstart', (e) => {
      const t = e.touches[0]; startX = t.clientX; startY = t.clientY;
    }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (startX === null || startY === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX; const dy = t.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? goNext : goPrev)();
      startX = startY = null;
    });
  };

  // Lazy-Initialisierung: erst aktivieren, wenn sichtbar
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        initTile(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  tiles.forEach(t => io.observe(t));
})();

/* =========================================================
   „Nach oben“ (#top) – sanft scrollen + Menü schließen
   ========================================================= */
(() => {
  const tops = document.querySelectorAll('a[href="#top"]');
  if (!tops.length) return;

  const closeMenuIfOpen = () => {
    const toggle = document.querySelector('.nav-toggle');
    const menu   = document.getElementById('primary-menu');
    if (!toggle || !menu) return;
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      toggle.setAttribute('aria-expanded','false');
      menu.hidden = true;
      menu.removeAttribute('data-open');
      document.body.style.overflow = '';
    }
  };

  const scrollTop = (e) => {
    e.preventDefault();
    closeMenuIfOpen();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Hash entfernen (optional, für sauberen Back-Button)
    if (history.replaceState) history.replaceState(null, '', ' ');
  };

  tops.forEach(a => a.addEventListener('click', scrollTop));
})();