/*
  Portfolio interactions
  - Theme toggle with persistence + prefers-color-scheme
  - Mobile menu toggle (accessible)
  - Smooth scroll for anchors (respects reduced motion)
  - IntersectionObserver reveal animations
  - Card tilt + hero parallax badges
  - Contact form validation + success toast
  - Header measurement to keep anchor offsets correct
*/

// Helper: prefers-reduced-motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Theme management
const storageKey = 'theme';
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  // Update browser UI theme color
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0b0d12' : '#ffffff');
  localStorage.setItem(storageKey, theme);
}

(function initTheme() {
  const saved = localStorage.getItem(storageKey);
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Header height measurement for scroll offsets
function measureHeader() {
  const header = document.querySelector('header.header');
  const h = header ? header.getBoundingClientRect().height : 72;
  document.documentElement.style.setProperty('--header-height', `${Math.round(h)}px`);
}
window.addEventListener('load', measureHeader);
window.addEventListener('resize', measureHeader);

// Mobile menu
const menuBtn = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
function closeMenu() {
  mobileNav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  mobileNav.setAttribute('aria-modal', 'false');
}
function openMenu() {
  mobileNav.classList.add('open');
  menuBtn.setAttribute('aria-expanded', 'true');
  mobileNav.setAttribute('aria-modal', 'true');
}
menuBtn.addEventListener('click', () => {
  const open = mobileNav.classList.contains('open');
  if (open) closeMenu();
  else openMenu();
});
mobileNav.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-close-menu="true"]');
  if (link) closeMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
});

// Smooth scroll for in-page anchors (scroll-margin handled by CSS)
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const targetId = a.getAttribute('href');
  if (targetId && targetId.length > 1) {
    const el = document.querySelector(targetId);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      el.focus?.({ preventScroll: true });
    }
  }
});

// IntersectionObserver reveal
const revealEls = Array.from(document.querySelectorAll('.reveal'));
if (revealEls.length) {
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.2 }
  );
  revealEls.forEach((el) => io.observe(el));
}

// Tilt effect for cards and skills
function attachTilt(selector) {
  const els = document.querySelectorAll(selector);
  els.forEach((el) => {
    if (prefersReduced) return; // honor reduced motion
    let raf = null;
    const maxTilt = 6; // degrees

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rx = (-dy * maxTilt).toFixed(2);
      const ry = (dx * maxTilt).toFixed(2);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
    }
    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    }
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  });
}
attachTilt('.card');
attachTilt('.skill');

// Parallax for hero badges
const visual = document.getElementById('visual-card');
const badges = visual ? Array.from(visual.querySelectorAll('.badge')) : [];
if (visual && badges.length && !prefersReduced) {
  let raf = null;
  function onPointer(e) {
    const rect = visual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      badges.forEach((b) => {
        const depth = parseFloat(b.dataset.parallax || 1);
        const tx = x * 16 * depth;
        const ty = y * 16 * depth;
        b.style.transform = `translate3d(${tx}px, ${ty}px, 40px)`;
      });
    });
  }
  function onLeave() {
    if (raf) cancelAnimationFrame(raf);
    badges.forEach((b) => {
      b.style.transform = 'translate3d(0,0,40px)';
    });
  }
  visual.addEventListener('pointermove', onPointer);
  visual.addEventListener('pointerleave', onLeave);
}

// Contact form validation + toast
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit');
const toast = document.getElementById('toast');

function validateForm() {
  const valid = form.checkValidity();
  submitBtn.disabled = !valid;
}
form.addEventListener('input', validateForm);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Simulate success
  showToast('Message sent! I will get back to you shortly.');
  form.reset();
  validateForm();
});

function showToast(msg) {
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
  }, 2200);
}

// Improve initial focus for skip-link scenarios
document
  .getElementById('content')
  .addEventListener(
    'focus',
    () => {
      window.scrollBy({
        top: -8,
        left: 0,
        behavior: prefersReduced ? 'auto' : 'smooth',
      });
    },
    true
  );

// Initial call(s)
validateForm();