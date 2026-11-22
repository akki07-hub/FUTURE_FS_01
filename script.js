/* ============================================================
   Portfolio Script — Aakhil
   ============================================================ */

const menuToggle = document.getElementById('menu-toggle');
const navLinks   = document.getElementById('nav-links');
const navItems   = document.querySelectorAll('.nav-link');
const siteHeader = document.getElementById('site-header');

// ── Mobile menu ─────────────────────────────────────────────
const closeMenu = () => {
  navLinks.classList.remove('open');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
};

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

navItems.forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    closeMenu();
    menuToggle.focus();
  }
});

document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') && !e.target.closest('#nav-links, #menu-toggle')) closeMenu();
});

// ── Header background after scrolling ───────────────────────
const handleHeaderScroll = () => {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 10);
};
window.addEventListener('scroll', handleHeaderScroll, { passive: true });
handleHeaderScroll();

// ── Active nav link ─────────────────────────────────────────
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navItems.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => navObserver.observe(s));

// ── Reveal on scroll ────────────────────────────────────────
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el, i) => {
    // Stagger the hero lines slightly
    if (el.closest('.hero')) el.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
    if (el.closest('.hero__title')) el.firstElementChild.style.transitionDelay = `${i * 110}ms`;
    revealObserver.observe(el);
  });
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// ── Contact: email & LinkedIn with pre-written messages ─────
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
  'Hi Aakhil, I came across your portfolio and was impressed by your projects. ' +
  'I’d like to connect and talk about a possible opportunity. Looking forward to hearing from you!';

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
