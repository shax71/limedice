(function () {
  'use strict';

  // Lucide icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      mobileNav.hidden = open;
    });
    mobileNav.addEventListener('click', (e) => {
      if (e.target instanceof HTMLAnchorElement) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        mobileNav.hidden = true;
      }
    });
  }

  // Active section highlighting in top nav
  const navLinks = document.querySelectorAll('.topnav-links a[href^="#"]');
  const sections = Array.from(navLinks)
    .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const byId = new Map(Array.from(navLinks).map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove('active'));
          const link = byId.get(e.target.id);
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => io.observe(s));
  }

  // Contact form — validate + mailto fallback
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    const fields = {
      name: { el: form.name, errEl: document.getElementById('err-name') },
      email: { el: form.email, errEl: document.getElementById('err-email') },
      brief: { el: form.brief, errEl: document.getElementById('err-brief') },
    };

    const setError = (key, msg) => {
      const f = fields[key];
      if (!f) return;
      if (msg) {
        f.errEl.textContent = msg;
        f.errEl.hidden = false;
        f.el.closest('.field').classList.add('invalid');
      } else {
        f.errEl.textContent = '';
        f.errEl.hidden = true;
        f.el.closest('.field').classList.remove('invalid');
      }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.classList.remove('error');
      status.textContent = '';

      const name = String(form.name.value || '').trim();
      const email = String(form.email.value || '').trim();
      const organisation = String(form.organisation.value || '').trim();
      const brief = String(form.brief.value || '').trim();

      let ok = true;
      setError('name', name ? '' : 'Required.');
      if (!name) ok = false;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('email', 'Enter a valid email address.');
        ok = false;
      } else {
        setError('email', '');
      }
      setError('brief', brief ? '' : 'A sentence is plenty.');
      if (!brief) ok = false;

      if (!ok) {
        status.classList.add('error');
        status.textContent = 'Please fix the highlighted fields.';
        return;
      }

      const subject = `Website enquiry from ${name}`;
      const bodyLines = [
        `Name: ${name}`,
        `Email: ${email}`,
        organisation ? `Organisation: ${organisation}` : null,
        '',
        brief,
      ].filter((l) => l !== null);
      const href = `mailto:scott@limedice.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
      window.location.href = href;
      status.textContent = 'Opening your email client…';
    });
  }
})();
