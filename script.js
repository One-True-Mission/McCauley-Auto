/* ==========================================================================
   McCauley Automotive  |  OTM Web Design
   Vanilla JS. Each feature isolated in its own IIFE so one failure
   cannot break the others.
   ========================================================================== */

/* ---------- Active nav state ---------- */
(function () {
  var page = document.body.getAttribute('data-page');
  if (!page) return;
  var links = document.querySelectorAll('.nav-link[data-nav]');
  links.forEach(function (link) {
    if (link.getAttribute('data-nav') === page) link.classList.add('is-active');
  });
})();

/* ---------- Mobile hamburger menu ---------- */
(function () {
  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  var backdrop = document.getElementById('navBackdrop');
  if (!burger || !menu || !backdrop) return;

  function open() {
    document.body.classList.add('nav-open');
    burger.setAttribute('aria-expanded', 'true');
  }
  function close() {
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  function toggle() {
    if (document.body.classList.contains('nav-open')) close();
    else open();
  }

  burger.addEventListener('click', toggle);
  backdrop.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) close();
  });
})();

/* ---------- Nav background solidify on scroll ---------- */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  function onScroll() {
    if (window.scrollY > 20) nav.style.background = 'rgba(12, 21, 41, 0.97)';
    else nav.style.background = 'rgba(16, 27, 51, 0.92)';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- Gallery carousel (peek / featured, 5-state) ---------- */
(function () {
  var track = document.querySelector('.car-track');
  if (!track) return;
  var slides = Array.prototype.slice.call(track.querySelectorAll('.car-slide'));
  var total = slides.length;
  if (total === 0) return;

  var dotsWrap = document.querySelector('.car-dots');
  var prevBtn = document.querySelector('.car-prev');
  var nextBtn = document.querySelector('.car-next');
  var current = 0;
  var timer = null;
  var DELAY = 2000;

  var dots = [];
  if (dotsWrap) {
    for (var i = 0; i < total; i++) {
      var d = document.createElement('button');
      d.className = 'car-dot';
      d.setAttribute('aria-label', 'Go to image ' + (i + 1));
      (function (idx) {
        d.addEventListener('click', function () { goTo(idx); restart(); });
      })(i);
      dotsWrap.appendChild(d);
      dots.push(d);
    }
  }

  function render() {
    slides.forEach(function (slide, idx) {
      var rel = (idx - current + total) % total;
      slide.classList.remove('is-active', 'is-prev', 'is-next', 'is-far-left', 'is-far-right');
      if (rel === 0) slide.classList.add('is-active');
      else if (rel === 1) slide.classList.add('is-next');
      else if (rel === total - 1) slide.classList.add('is-prev');
      else if (rel <= Math.floor(total / 2)) slide.classList.add('is-far-right');
      else slide.classList.add('is-far-left');
    });
    dots.forEach(function (dot, idx) {
      dot.classList.toggle('is-active', idx === current);
    });
  }

  function goTo(idx) { current = (idx + total) % total; render(); }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function start() { timer = setInterval(next, DELAY); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { stop(); start(); }

  if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });

  slides.forEach(function (slide, idx) {
    slide.addEventListener('click', function () {
      if (slide.classList.contains('is-prev') || slide.classList.contains('is-next')) {
        goTo(idx); restart();
      }
    });
  });

  var vp = document.querySelector('.car-viewport');
  if (vp) {
    vp.addEventListener('mouseenter', stop);
    vp.addEventListener('mouseleave', start);
    vp.addEventListener('touchstart', stop, { passive: true });
    vp.addEventListener('touchend', start, { passive: true });

    var startX = 0;
    vp.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    vp.addEventListener('touchend', function (e) {
      var diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 45) { if (diff < 0) next(); else prev(); restart(); }
    }, { passive: true });
  }

  document.addEventListener('keydown', function (e) {
    var tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowRight') { next(); restart(); }
    else if (e.key === 'ArrowLeft') { prev(); restart(); }
  });

  render();
  start();
})();

/* ---------- Booking form validation ---------- */
(function () {
  var form = document.getElementById('bookForm');
  if (!form) return;

  function showError(field) { field.classList.add('invalid'); }
  function clearError(field) { field.classList.remove('invalid'); }

  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('input', function () {
      var field = el.closest('.field');
      if (field) clearError(field);
    });
  });

  form.addEventListener('submit', function (e) {
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (el) {
      var field = el.closest('.field');
      if (!field) return;
      if (!el.value.trim()) { showError(field); valid = false; }
      else if (el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value)) {
        showError(field); valid = false;
      } else { clearError(field); }
    });
    if (!valid) {
      e.preventDefault();
      var firstBad = form.querySelector('.field.invalid');
      if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();