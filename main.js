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

  // Contact form — validate + POST to /api/contact
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const startedAtInput = document.getElementById('startedAt');
  if (startedAtInput) startedAtInput.value = String(Date.now());

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

    const setStatus = (msg, isError) => {
      status.classList.toggle('error', !!isError);
      status.textContent = msg;
    };

    const submitButton = form.querySelector('button[type="submit"]');
    const turnstileWidget = form.querySelector('.cf-turnstile');

    async function getTurnstileToken() {
      if (!window.turnstile || !turnstileWidget) return null;
      // Invisible mode: execute() returns a Promise in newer builds, but for compatibility
      // we resolve via the token from getResponse() after execute().
      return new Promise((resolve) => {
        try {
          window.turnstile.execute(turnstileWidget, {
            action: 'contact',
            callback: (token) => resolve(token),
            'error-callback': () => resolve(null),
          });
          // Fallback timeout
          setTimeout(() => {
            const t = window.turnstile.getResponse(turnstileWidget);
            resolve(t || null);
          }, 5000);
        } catch (_) {
          resolve(null);
        }
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('');

      const name = String(form.name.value || '').trim();
      const email = String(form.email.value || '').trim();
      const organisation = String(form.organisation.value || '').trim();
      const brief = String(form.brief.value || '').trim();

      let valid = true;
      setError('name', name ? '' : 'Required.');
      if (!name) valid = false;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('email', 'Enter a valid email address.');
        valid = false;
      } else {
        setError('email', '');
      }
      setError('brief', brief ? '' : 'A sentence is plenty.');
      if (!brief) valid = false;

      if (!valid) {
        setStatus('Please fix the highlighted fields.', true);
        return;
      }

      submitButton.disabled = true;
      setStatus('Sending…');

      const turnstileToken = await getTurnstileToken();
      if (!turnstileToken) {
        submitButton.disabled = false;
        setStatus('Couldn’t verify. Please try again.', true);
        return;
      }

      const payload = {
        name,
        email,
        organisation,
        brief,
        turnstileToken,
        startedAt: Number(startedAtInput.value) || 0,
        website: String((form.website && form.website.value) || ''),
      };

      try {
        const r = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await r.json().catch(() => ({}));
        if (data && data.ok) {
          form.reset();
          if (startedAtInput) startedAtInput.value = String(Date.now());
          if (window.turnstile && turnstileWidget) window.turnstile.reset(turnstileWidget);
          setStatus('Thanks — message sent. A reply usually comes within two working days.');
        } else {
          setStatus('Couldn’t send. Please try again shortly.', true);
        }
      } catch (_) {
        setStatus('Couldn’t send. Please check your connection and try again.', true);
      } finally {
        submitButton.disabled = false;
      }
    });
  }
})();
