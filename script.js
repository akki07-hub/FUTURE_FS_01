/* ============================================================
   Portfolio Script — Aakhil
   ============================================================ */

// ── Element References ──────────────────────────────────────
const menuToggle  = document.getElementById('menu-toggle');
const navLinks    = document.getElementById('nav-links');
const navItems    = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('section[id]');
const siteHeader  = document.getElementById('site-header');

// ── Theme Toggle ────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () =>
  document.documentElement.getAttribute('data-theme') || (prefersDark.matches ? 'dark' : 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

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
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
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

// ── Contact: Email & LinkedIn with pre-written messages ─────
const CONTACT_EMAIL = 'smdaakhil1493@gmail.com';

const EMAIL_SUBJECT = 'Opportunity for Aakhil (via your portfolio)';
const EMAIL_BODY = [
  'Hi Aakhil,',
  '',
  'I came across your portfolio and would like to talk with you about an opportunity.',
  '',
  'My name: ',
  'Company / organisation: ',
  'Type of opportunity (internship / freelance / full-time / other): ',
  'Details: ',
  '',
  'Looking forward to hearing from you.',
  '',
  'Best regards,'
].join('\n');

const LINKEDIN_MESSAGE =
  "Hi Aakhil, I came across your portfolio and was impressed by your projects. " +
  "I'd like to connect and talk about a possible opportunity. Looking forward to hearing from you!";

const connectStatus = document.getElementById('connect-status');
let statusTimer;
const showStatus = text => {
  if (!connectStatus) return;
  connectStatus.textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => { connectStatus.textContent = ''; }, 7000);
};

const copyText = async text => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Fallback for browsers that block the Clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) {}
    ta.remove();
    return ok;
  }
};

const emailBtn = document.getElementById('email-btn');
if (emailBtn) {
  emailBtn.href =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(EMAIL_BODY)}`;
}

const linkedinBtn = document.getElementById('linkedin-btn');
if (linkedinBtn) {
  // The link opens LinkedIn in a new tab; we copy the message at the same time.
  linkedinBtn.addEventListener('click', async () => {
    const ok = await copyText(LINKEDIN_MESSAGE);
    showStatus(ok
      ? 'Message copied. On LinkedIn, click Message or Connect and paste it (Ctrl+V).'
      : 'LinkedIn opened. Introduce yourself and mention you saw my portfolio.');
  });
}

document.querySelectorAll('[data-copy="email"]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const ok = await copyText(CONTACT_EMAIL);
    showStatus(ok ? `Email address copied: ${CONTACT_EMAIL}` : `My email: ${CONTACT_EMAIL}`);
  });
});
