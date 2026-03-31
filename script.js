/* ============================================================
   KAUFFEN STUDIOS — script.js
   Lenis · GSAP + ScrollTrigger · Hero Slideshow
   Custom Cursor · Scramble · Stats Counter · Reveals
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const SLIDES = [
  { num: '01', name: 'Anna Capocchi',   url: 'https://annacapocchi.com'   },
  { num: '02', name: 'Augustin Agapii', url: 'https://augustinagapii.com' },
  { num: '03', name: 'iStarTec',        url: 'https://istartec.co'        },
  { num: '04', name: 'JetWash 24',      url: 'https://jetwash24.com'      },
  { num: '05', name: 'Motto',           url: 'https://wearemotto.com'     },
  { num: '06', name: 'TwoCreate',       url: 'https://twocreate.com'      },
  { num: '07', name: 'Clou Architects', url: 'https://clouarchitects.com' },
];

const SLIDE_DUR  = 7500; // ms between slide changes

/* ════════════════════════════════════════
   CURSOR — init immediately so it works
   even during the loader animation
═════════════════════════════════════════ */
function initCursor() {
  const dot  = $('#cDot');
  const ring = $('#cRing');
  const lbl  = $('#cLbl');
  if (!dot || !ring) return;

  // Touch devices: restore native cursor
  if (window.matchMedia('(pointer: coarse)').matches) {
    dot.style.display = ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    $$('a, button').forEach(el => (el.style.cursor = 'auto'));
    return;
  }

  // Start offscreen
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -300, y: -300 });

  let mx = -300, my = -300;
  let rx = -300, ry = -300;
  let pmx = -300, pmy = -300;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => ring.classList.add('press'));
  document.addEventListener('mouseup',   () => ring.classList.remove('press'));

  // Expand ring on interactive elements
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a, button, [data-cursor], .svc-item, .wc, .h-dot');
    if (!el) return;
    if (lbl) lbl.textContent = el.dataset.cursor || '';
    ring.classList.add('big');
    dot.classList.add('hidden');
  });
  document.addEventListener('mouseout', e => {
    const el = e.target.closest('a, button, [data-cursor], .svc-item, .wc, .h-dot');
    if (!el) return;
    if (lbl) lbl.textContent = '';
    ring.classList.remove('big');
    dot.classList.remove('hidden');
  });

  gsap.ticker.add(() => {
    gsap.set(dot, { x: mx, y: my });

    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;

    const vx  = mx - pmx;
    const vy  = my - pmy;
    pmx = mx; pmy = my;

    const spd     = Math.sqrt(vx * vx + vy * vy);
    const angle   = Math.atan2(vy, vx) * (180 / Math.PI);
    const stretch = Math.min(spd * 0.042, 0.5);

    if (!ring.classList.contains('big') && !ring.classList.contains('press')) {
      gsap.set(ring, {
        x: rx, y: ry,
        rotation: angle,
        scaleX: 1 + stretch,
        scaleY: 1 - stretch * 0.5,
      });
    } else {
      gsap.set(ring, { x: rx, y: ry, rotation: 0, scaleX: 1, scaleY: 1 });
    }
  });
}

/* ════════════════════════════════════════
   LOADER
═════════════════════════════════════════ */
function runLoader(onDone) {
  const loader   = $('#loader');
  const box      = $('#ldrBox');
  const wipe     = $('#ldrWipe');
  const wordEl   = $('#ldrWord');
  const wordWrap = $('#ldrWordWrap');
  const final_   = $('#ldrFinal');
  if (!loader) { onDone?.(); return; }

  const words = ['designers.', 'developers.', 'Kauffen.'];
  const EASE  = 'power3.inOut';

  // Measure each word's width for smooth container resize
  function measureWord(text) {
    const tmp = wordEl.cloneNode();
    tmp.textContent = text;
    tmp.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    box.appendChild(tmp);
    const w = tmp.offsetWidth;
    tmp.remove();
    return w;
  }

  // Set wordwrap dimensions from the actual rendered word
  const wordH = wordEl.offsetHeight;
  const wordW = wordEl.offsetWidth;
  wordWrap.style.height = wordH + 'px';
  wordWrap.style.width  = wordW + 'px';

  // Initial state: wipe covers the black box
  gsap.set(wipe, { xPercent: 0 });
  gsap.set(wordEl, { y: 0 });

  const tl = gsap.timeline();

  // Reveal: wipe slides right to show "We are designers."
  tl.to(wipe, { xPercent: 100, duration: 0.8, ease: EASE, delay: 0.4 });

  // Hold "designers."
  tl.to({}, { duration: 2 });

  // Cycle through remaining words
  for (let i = 1; i < words.length; i++) {
    const nextWord  = words[i];
    const nextWidth = measureWord(nextWord);
    const isFinal   = (i === words.length - 1);

    // Current word slides up and out
    tl.to(wordEl, { y: -wordH, duration: 0.5, ease: EASE });

    // Swap text, position below, resize container
    tl.call(() => {
      wordEl.textContent = nextWord;
      if (isFinal) wordEl.style.fontStyle = 'italic';
    });
    tl.set(wordEl, { y: wordH });
    tl.to(wordWrap, { width: nextWidth, duration: 0.45, ease: EASE }, '<');

    // New word slides up into view
    tl.to(wordEl, { y: 0, duration: 0.5, ease: EASE });

    // Hold
    tl.to({}, { duration: isFinal ? 2.5 : 2 });
  }

  // Final transition: wipe covers black box, show "We are Kauffen." in dark on cream
  tl.to(wipe, { xPercent: 0, duration: 0.5, ease: EASE });
  tl.set(box, { opacity: 0 });
  tl.set(final_, { opacity: 1 });

  // Hold final
  tl.to({}, { duration: 1 });

  // Loader exits
  tl.to(loader, {
    opacity: 0, duration: 0.7, ease: 'power2.inOut',
    onComplete: () => { loader.remove(); onDone?.(); }
  });
}

/* ════════════════════════════════════════
   LENIS
═════════════════════════════════════════ */
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ════════════════════════════════════════
   SCROLL PROGRESS
═════════════════════════════════════════ */
function initScrollProg() {
  const bar = $('#scrollProg');
  if (!bar || !lenis) return;
  lenis.on('scroll', ({ progress }) => {
    bar.style.width = (progress * 100) + '%';
  });
}

/* ════════════════════════════════════════
   NAV
═════════════════════════════════════════ */
function initNav() {
  const nav = $('#nav');
  if (!nav) return;

  const lightSections = ['.work', '.about'];

  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: self => {
      let inLight = false;
      lightSections.forEach(sel => {
        const el = $(sel);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < 80 && rect.bottom > 0) inLight = true;
      });
      nav.classList.toggle('scrolled',   self.progress > 0 && !inLight);
      nav.classList.toggle('light-nav',  self.progress > 0 && inLight);
    },
  });
}

/* ════════════════════════════════════════
   MOBILE MENU
═════════════════════════════════════════ */
function initMobileMenu() {
  const burger = $('#burger');
  const menu   = $('#mobMenu');
  if (!burger || !menu) return;
  let open = false;

  const openMenu = () => {
    open = true;
    menu.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lenis?.stop();
  };
  const closeMenu = () => {
    open = false;
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lenis?.start();
  };

  burger.addEventListener('click', () => open ? closeMenu() : openMenu());
  $$('.mob-lnk').forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeMenu(); });
}

/* ════════════════════════════════════════
   SMOOTH ANCHORS
═════════════════════════════════════════ */
function initAnchors() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      lenis?.scrollTo(target, { offset: -80, duration: 1.4 });
    });
  });
}

/* ════════════════════════════════════════
   HERO SLIDESHOW
   Fallback is the default visual. Iframes
   start hidden (opacity:0) and only reveal
   via .iframe-ok if they load cross-origin.
   Slide-down pan uses GSAP for both scale
   and translateY so they don't fight.
═════════════════════════════════════════ */
function initHeroSlideshow() {
  const hsEls    = $$('.hs');
  const dots     = $$('.h-dot');
  const numEl    = $('#hpiNum');
  const nameEl   = $('#hpiName');
  const timerFill = $('#hTimerFill');
  if (!hsEls.length) return;

  let current = 0;
  let timer   = null;
  let paused  = false;

  /* Timer progress bar */
  let timerRAF   = null;
  let timerStart = null;

  function startTimer() {
    cancelAnimationFrame(timerRAF);
    if (timerFill) { timerFill.style.transition = 'none'; timerFill.style.width = '0%'; }
    timerStart = performance.now();
    const tick = now => {
      const p = Math.min((now - timerStart) / SLIDE_DUR, 1);
      if (timerFill) timerFill.style.width = (p * 100) + '%';
      if (p < 1) timerRAF = requestAnimationFrame(tick);
    };
    timerRAF = requestAnimationFrame(tick);
  }

  /* Activate a slide */
  function goTo(idx) {
    const next = ((idx % SLIDES.length) + SLIDES.length) % SLIDES.length;
    if (next === current && timer !== null) return;

    clearTimeout(timer);

    hsEls[current].classList.remove('active');
    current = next;
    hsEls[current].classList.add('active');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Update labels with a quick fade
    const s = SLIDES[current];
    if (numEl) {
      gsap.to(numEl,  { opacity: 0, y: -6, duration: .18, onComplete: () => {
        numEl.textContent = s.num + ' / 07';
        gsap.to(numEl, { opacity: 1, y: 0, duration: .3 });
      }});
    }
    if (nameEl) {
      gsap.to(nameEl, { opacity: 0, y: -6, duration: .18, onComplete: () => {
        nameEl.textContent = s.name;
        gsap.to(nameEl, { opacity: 1, y: 0, duration: .3 });
      }});
    }

    startTimer();
    if (!paused) timer = setTimeout(() => goTo(current + 1), SLIDE_DUR);
  }

  /* Dot clicks */
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.goto);
      clearTimeout(timer);
      current = -1;
      goTo(idx);
    });
  });

  /* Pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      paused = true;
      clearTimeout(timer);
      cancelAnimationFrame(timerRAF);
    } else {
      paused = false;
      startTimer();
      timer = setTimeout(() => goTo(current + 1), SLIDE_DUR);
    }
  });

  // Kick off
  goTo(0);
}

/* ════════════════════════════════════════
   HERO REVEAL ANIMATIONS
═════════════════════════════════════════ */
function initHeroReveal() {
  gsap.set('.hero-title .hi',  { y: '110%' });
  gsap.set('.hero-eyebrow',    { opacity: 0, y: 8 });
  gsap.set('.hero-sub',        { opacity: 0, y: 12 });
  gsap.set('.hero-btns',       { opacity: 0, y: 12 });
  gsap.set('.h-proj-info',     { opacity: 0 });
  gsap.set('.h-scroll',        { opacity: 0 });
  gsap.set('.h-dots',          { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.hero-eyebrow',       { opacity: 1, y: 0, duration: .7 }, .1);
  tl.to('.hero-title .hi',     { y: '0%', duration: 1.1, stagger: .14 }, .22);
  tl.to('.hero-sub',           { opacity: 1, y: 0, duration: .8 }, .88);
  tl.to('.hero-btns',          { opacity: 1, y: 0, duration: .7 }, 1.0);
  tl.to('.h-proj-info',        { opacity: 1, duration: .6 }, 1.1);
  tl.to(['.h-scroll', '.h-dots'], { opacity: 1, duration: .6 }, 1.2);
}

/* ════════════════════════════════════════
   SCROLL REVEALS
═════════════════════════════════════════ */
function initReveals() {
  // Work heading
  gsap.set('.work-h .ri', { y: '110%' });
  gsap.to('.work-h .ri', {
    y: 0, duration: 1, ease: 'power4.out',
    scrollTrigger: { trigger: '.work-hdr', start: 'top 82%' }
  });
  gsap.fromTo('.work-hdr .eyebrow', { opacity: 0, y: 8 }, {
    opacity: 1, y: 0, duration: .7,
    scrollTrigger: { trigger: '.work-hdr', start: 'top 85%' }
  });
  gsap.fromTo('.wh-note', { opacity: 0 }, {
    opacity: 1, duration: .7,
    scrollTrigger: { trigger: '.work-hdr', start: 'top 80%' }
  });

  // Work cards
  gsap.fromTo('.wc', { opacity: 0, y: 36 }, {
    opacity: 1, y: 0, duration: .85, stagger: .1, ease: 'power3.out',
    scrollTrigger: { trigger: '.work-grid', start: 'top 80%' }
  });

  // Services heading
  gsap.set('.svc-h .ri', { y: '110%' });
  gsap.to('.svc-h .ri', {
    y: 0, duration: 1, ease: 'power4.out',
    scrollTrigger: { trigger: '.svc-hdr', start: 'top 82%' }
  });
  gsap.fromTo('.svc-item', { opacity: 0, x: -18 }, {
    opacity: 1, x: 0, duration: .6, stagger: .09, ease: 'power3.out',
    scrollTrigger: { trigger: '.svc-list', start: 'top 80%' }
  });

  // About
  gsap.set('.abt-stmt .ri', { y: '110%' });
  gsap.fromTo('.abt-inner .eyebrow', { opacity: 0, y: 8 }, {
    opacity: 1, y: 0, duration: .7,
    scrollTrigger: { trigger: '.about', start: 'top 80%' }
  });
  gsap.to('.abt-stmt .ri', {
    y: 0, duration: 1, stagger: .12, ease: 'power4.out',
    scrollTrigger: { trigger: '.abt-stmt', start: 'top 82%' }
  });
  gsap.fromTo('.abt-body', { opacity: 0, y: 14 }, {
    opacity: 1, y: 0, duration: .8,
    scrollTrigger: { trigger: '.abt-body', start: 'top 85%' }
  });
  gsap.fromTo('.btn-outline', { opacity: 0 }, {
    opacity: 1, duration: .7,
    scrollTrigger: { trigger: '.btn-outline', start: 'top 88%' }
  });
  gsap.fromTo('.stat', { opacity: 0, y: 22 }, {
    opacity: 1, y: 0, duration: .8, stagger: .1, ease: 'power3.out',
    scrollTrigger: { trigger: '.abt-right', start: 'top 80%' }
  });

  // Contact
  gsap.set('.ct-h .ri', { y: '110%' });
  gsap.to('.ct-h .ri', {
    y: 0, duration: 1.1, stagger: .14, ease: 'power4.out',
    scrollTrigger: { trigger: '.ct-h', start: 'top 82%' }
  });
  gsap.fromTo('.ct-ch', { opacity: 0, y: 20 }, {
    opacity: 1, y: 0, duration: .7, stagger: .1,
    scrollTrigger: { trigger: '.ct-channels', start: 'top 85%' }
  });
}

/* ════════════════════════════════════════
   STATS COUNTER
═════════════════════════════════════════ */
function initStats() {
  $$('.sv[data-count]').forEach(el => {
    const target  = parseInt(el.dataset.count, 10);
    const prefix  = el.dataset.prefix  || '';
    const suffix  = el.dataset.suffix  || '';
    const obj     = { val: 0 };
    el.textContent = prefix + '0' + suffix;
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target, duration: 2, ease: 'power2.out',
          onUpdate: () => {
            el.textContent = prefix + Math.round(obj.val) + suffix;
          }
        });
      }
    });
  });
}

/* ════════════════════════════════════════
   SERVICE NAME SCRAMBLE ON HOVER
═════════════════════════════════════════ */
function initScramble() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  $$('.si-nm').forEach(el => {
    const orig = el.textContent;
    let raf;
    el.closest('.svc-item')?.addEventListener('mouseenter', () => {
      const start = performance.now();
      const dur   = 400;
      cancelAnimationFrame(raf);
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = [...orig].map((ch, i) => {
          if (ch === ' ' || ch === '&') return ch;
          if (i < p * orig.length * 1.3) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (p < 1) raf = requestAnimationFrame(tick);
        else el.textContent = orig;
      };
      raf = requestAnimationFrame(tick);
    });
  });
}

/* ════════════════════════════════════════
   MARQUEE VELOCITY
═════════════════════════════════════════ */
function initMarqueeVelocity() {
  const tracks = $$('.mq-track');
  const base   = [28, 22];
  let rafId    = null;
  let lastV    = 0;
  lenis?.on('scroll', ({ velocity }) => {
    lastV = Math.abs(velocity || 0);
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      tracks.forEach((t, i) => {
        t.style.animationDuration = Math.max(base[i] - lastV * 2, 6) + 's';
      });
      rafId = null;
    });
  });
}

/* ════════════════════════════════════════
   WORK CARDS — no init needed (images)
═════════════════════════════════════════ */
function initWorkCards() {}

/* ════════════════════════════════════════
   WORK CARD SCROLL PAN — scroll-linked
   image pan as card enters/exits viewport
═════════════════════════════════════════ */
function initWorkScrollPan() {
  $$('.wc').forEach(card => {
    const vp  = $('.wc-vp', card);
    const img = $('img', vp);
    if (!img || !vp) return;

    function getPanDistance() {
      const imgH = img.offsetHeight || img.naturalHeight;
      const vpH  = vp.offsetHeight;
      return Math.max(0, imgH - vpH);
    }

    gsap.fromTo(img,
      { y: 0 },
      {
        y: () => -getPanDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'bottom 15%',
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
      }
    );
  });
}

/* ════════════════════════════════════════
   CARD TILT
═════════════════════════════════════════ */
function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  $$('.wc').forEach(card => {
    const screen = card.querySelector('.wc-screen');
    if (!screen) return;
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      gsap.to(screen, {
        rotateY: dx * 4, rotateX: -dy * 3,
        duration: .55, ease: 'power2.out',
        transformPerspective: 900,
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(screen, {
        rotateY: 0, rotateX: 0, duration: .9,
        ease: 'elastic.out(1, 0.55)',
      });
    });
  });
}

/* ════════════════════════════════════════
   PARALLAX — hero background
═════════════════════════════════════════ */
function initParallax() {
  gsap.to('.hero-bg', {
    yPercent: 10, ease: 'none',
    scrollTrigger: {
      trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5,
    }
  });
}

/* ════════════════════════════════════════
   BOOT
═════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // Cursor starts immediately — before loader
  initCursor();

  // Loader plays first, everything else starts after it exits
  runLoader(() => {
    initLenis();
    initScrollProg();
    initNav();
    initMobileMenu();
    initAnchors();
    initHeroReveal();
    initHeroSlideshow();
    initReveals();
    initStats();
    initScramble();
    initMarqueeVelocity();
    initWorkCards();
    initWorkScrollPan();
    initTilt();
    initParallax();
  });

});
