/* ============================================================
   Portfolio Script — Aakhil
   ============================================================ */

// ── Element References ──────────────────────────────────────
const menuToggle  = document.getElementById('menu-toggle');
const navLinks    = document.getElementById('nav-links');
const navItems    = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('section[id]');
const siteHeader  = document.getElementById('site-header');
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');
const submitBtn   = document.getElementById('submit-btn');

// ── Mobile Menu Toggle ──────────────────────────────────────
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', isOpen);
});

// Close menu when a nav link is clicked
navItems.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Active Nav Link on Scroll ───────────────────────────────
const highlightNav = () => {
  let current = '';

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });

  navItems.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
};

// ── Navbar Shadow on Scroll ─────────────────────────────────
const handleHeaderScroll = () => {
  if (window.scrollY > 20) {
    siteHeader.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
  } else {
    siteHeader.style.boxShadow = 'none';
  }
};

window.addEventListener('scroll', () => {
  highlightNav();
  handleHeaderScroll();
}, { passive: true });

// ── Scroll-In Animation (Intersection Observer) ─────────────
const animatedEls = document.querySelectorAll('[data-aos]');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el    = entry.target;
      const delay = el.dataset.aosDelay || 0;
      setTimeout(() => {
        el.classList.add('aos-animate');
      }, parseInt(delay));
      observer.unobserve(el);
    }
  });
}, { threshold: 0.12 });

// Prepare elements for animation
animatedEls.forEach(el => {
  el.classList.add('aos-init');
  observer.observe(el);
});

// ── Contact Form ────────────────────────────────────────────
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    // Basic client-side validation
    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      formStatus.style.color = '#f87171';
      formStatus.textContent = 'Please fill in all fields.';
      return;
    }

    // Simulate sending (replace with real backend / EmailJS / Formspree)
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    setTimeout(() => {
      formStatus.style.color = '#4ade80';
      formStatus.textContent = '✓ Message sent! I will get back to you soon.';
      contactForm.reset();
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send Message';

      // Clear status after 5 seconds
      setTimeout(() => { formStatus.textContent = ''; }, 5000);
    }, 1200);
  });
}
