(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Menú móvil ---------- */
  const menuToggle = $('.menu-toggle');
  const mobileNav = $('.mobile-nav');

  const setMenu = (open) => {
    if (!menuToggle || !mobileNav) return;
    mobileNav.classList.toggle('is-active', open);
    menuToggle.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      setMenu(!mobileNav.classList.contains('is-active'));
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) setMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-active')) {
        setMenu(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 720) setMenu(false);
    });
  }

  /* ---------- Horario / badge de estado ---------- */
  const OPENING = [
    { day: 1, opens: [9, 0], closes: [13, 30] },
    { day: 1, opens: [17, 0], closes: [20, 0] },
    { day: 2, opens: [9, 0], closes: [13, 30] },
    { day: 2, opens: [17, 0], closes: [20, 0] },
    { day: 3, opens: [9, 0], closes: [13, 30] },
    { day: 3, opens: [17, 0], closes: [20, 0] },
    { day: 4, opens: [9, 0], closes: [13, 30] },
    { day: 4, opens: [17, 0], closes: [20, 0] },
    { day: 5, opens: [9, 0], closes: [13, 30] },
    { day: 5, opens: [17, 0], closes: [20, 0] },
  ];

  function isOpenNow() {
    const now = new Date();
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return OPENING.some(
      (slot) =>
        slot.day === day &&
        minutes >= slot.opens[0] * 60 + slot.opens[1] &&
        minutes < slot.closes[0] * 60 + slot.closes[1]
    );
  }

  function updateStatus() {
    const open = isOpenNow();
    $$('.status-badge').forEach((badge) => {
      badge.classList.remove('open', 'closed');
      badge.classList.add(open ? 'open' : 'closed');
      badge.innerHTML = `<span class="status-dot" aria-hidden="true"></span>${
        open ? 'Abierto ahora' : 'Cerrado'
      }`;
    });
  }

  updateStatus();

  /* ---------- FAQ acordeón ---------- */
  $$('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const expanded = q.getAttribute('aria-expanded') === 'true';
      $$('.faq-q').forEach((other) => {
        other.setAttribute('aria-expanded', 'false');
        const a = other.closest('.faq-card')?.querySelector('.faq-a');
        if (a) a.style.maxHeight = null;
      });
      if (!expanded) {
        q.setAttribute('aria-expanded', 'true');
        const answer = q.closest('.faq-card')?.querySelector('.faq-a');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Revelar al hacer scroll ---------- */
  const reveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          reveal.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  $$('.reveal').forEach((el) => reveal.observe(el));

  /* ---------- Formulario de contacto por WhatsApp ---------- */
  const form = $('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = $('#name')?.value.trim();
      const phone = $('#phone')?.value.trim();
      const reason = $('#reason')?.value.trim();
      const hp = $('#hp-field')?.value;

      if (hp) return;

      let valid = true;
      $$('.field', form).forEach((field) => field.classList.remove('invalid'));

      if (!name) {
        $('#name')?.closest('.field')?.classList.add('invalid');
        valid = false;
      }
      if (!phone) {
        $('#phone')?.closest('.field')?.classList.add('invalid');
        valid = false;
      }
      if (!reason) {
        $('#reason')?.closest('.field')?.classList.add('invalid');
        valid = false;
      }

      if (!valid) return;

      const msg = `Hola, soy ${name}. Mi teléfono es ${phone} y quiero consultar por: ${reason}`;
      window.open(`https://wa.me/34608973090?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }
})();

/* Scroll-to-top: appears after first scroll */
(function(){
  const btn = document.getElementById('toTop');
  if (!btn) return;
  const onScroll = () => {
    if (window.scrollY > 200) btn.classList.add('show');
    else btn.classList.remove('show');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ===== Cookie Banner ===== */
(function () {
  "use strict";

  const STORAGE_KEY = "cookie-consent";
  const VALUES = { ACCEPTED: "accepted", REJECTED: "rejected" };

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      // Storage may be unavailable in private mode or restricted contexts.
    }
  }

  function removeBanner(banner) {
    if (!banner) return;
    banner.classList.add("cookie-banner--exiting");
    banner.addEventListener(
      "transitionend",
      function () {
        banner.remove();
      },
      { once: true }
    );
  }

  function createBanner() {
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Consentimiento de cookies");
    banner.setAttribute("aria-live", "polite");

    banner.innerHTML = [
      '<p class="cookie-banner__text">',
      "Utilizamos cookies para mejorar tu experiencia. ",
      "Puedes aceptar todas las cookies o rechazarlas.",
      "</p>",
      '<div class="cookie-banner__actions">',
      '<button type="button" class="cookie-banner__button" data-action="accept">Aceptar</button>',
      '<button type="button" class="cookie-banner__button" data-action="reject">Rechazar</button>',
      "</div>",
    ].join("");

    banner.addEventListener("click", function (event) {
      const button = event.target.closest("[data-action]");
      if (!button) return;

      const action = button.getAttribute("data-action");
      if (action === "accept") {
        setConsent(VALUES.ACCEPTED);
      } else if (action === "reject") {
        setConsent(VALUES.REJECTED);
      }

      removeBanner(banner);
    });

    return banner;
  }

  function showBanner() {
    if (document.querySelector(".cookie-banner")) return;
    const banner = createBanner();
    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      banner.classList.add("cookie-banner--visible");
    });
  }

  function init() {
    // Listener global para "Gestionar cookies" en el footer
    document.addEventListener("click", function (event) {
      const trigger = event.target.closest("[data-cookie-reset]");
      if (!trigger) return;
      event.preventDefault();
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      showBanner();
    });

    if (getConsent()) return;
    showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

