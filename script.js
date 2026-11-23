/* ============================================================
   Portfolio Script — Aakhil
   ============================================================ */

const menuToggle = document.getElementById('menu-toggle');
const navLinks   = document.getElementById('nav-links');
const navItems   = document.querySelectorAll('.nav-link');
const siteHeader = document.getElementById('site-header');

// ── Copyright year (always current) ─────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

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

// ── Scroll progress bar (fallback for browsers without scroll-driven CSS) ─
const progressBar = document.getElementById('scroll-progress');
const supportsScrollTimeline = window.CSS?.supports?.('animation-timeline: scroll()');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (progressBar && (!supportsScrollTimeline || prefersReducedMotion)) {
  let ticking = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.setProperty('--progress', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

// ── Section transitions: sections open out as they scroll in ─
if (!prefersReducedMotion) {
  const fxSections = [...document.querySelectorAll('main > section:not(.hero)')];
  document.documentElement.classList.add('scrollfx');
  const clamp01 = n => Math.min(Math.max(n, 0), 1);
  const ease = t => 1 - Math.pow(1 - t, 3);
  const updateSections = () => {
    const vh = window.innerHeight;
    fxSections.forEach(section => {
      const { top, bottom } = section.getBoundingClientRect();
      // 0 when the section's top is at the bottom of the screen, 1 when it reaches 35% from the top
      const enter = ease(clamp01((vh - top) / (vh * 0.65)));
      // 0 until the section's bottom reaches the middle, 1 when it leaves the top
      const leave = clamp01((vh * 0.5 - bottom) / (vh * 0.5));
      section.style.setProperty('--enter', enter.toFixed(3));
      section.style.setProperty('--leave', leave.toFixed(3));
    });
  };
  window.addEventListener('scroll', updateSections, { passive: true });
  window.addEventListener('resize', updateSections);
  updateSections();
}

// ── Text reveal, scroll ticker and 3D tilt ──────────────────
if (!prefersReducedMotion) {
  const clamp = n => Math.min(Math.max(n, 0), 1);

  // 1. About text: split into words that light up as you scroll
  const revealBlocks = [...document.querySelectorAll('.about__body > p')].map(p => {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = part;
        frag.append(span);
      });
      node.replaceWith(frag);
    });
    return { el: p, words: [...p.querySelectorAll('.word')] };
  });

  // 3. Project screenshots: tilt in 3D, alternating sides
  const tiltEls = [...document.querySelectorAll('.project__media:not(.project__media--phone):not(.project__media--type)')];
  tiltEls.forEach(el => {
    el.classList.add('tilt');
    const project = el.closest('.project');
    const even = project && [...project.parentElement.children].filter(c => c.classList.contains('project')).indexOf(project) % 2 === 1;
    el.style.setProperty('--tilt-side', even ? -1 : 1);
  });

  const updateScrollEffects = () => {
    const vh = window.innerHeight;
    revealBlocks.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect();
      // Starts when the paragraph is 85% down the screen, done when its bottom reaches 45%
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.4));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
    });
    tiltEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.75));
      el.style.setProperty('--tilt-in', (1 - Math.pow(1 - p, 2)).toFixed(3));
    });
  };
  window.addEventListener('scroll', updateScrollEffects, { passive: true });
  window.addEventListener('resize', updateScrollEffects);
  updateScrollEffects();

  // 2. Skills strips: drift slowly, speed up and follow your scroll direction
  const tracks = [...document.querySelectorAll('.marquee__track')].map(track => ({
    track,
    sign: track.closest('.marquee--reverse') ? -1 : 1,
    offset: 0,
  }));
  let lastY = window.scrollY, direction = 1, boost = 0, lastT = 0, running = false;
  window.addEventListener('scroll', () => {
    const dy = window.scrollY - lastY;
    lastY = window.scrollY;
    if (dy !== 0) direction = Math.sign(dy);
    boost = Math.min(boost + Math.abs(dy) * 0.6, 60);
  }, { passive: true });

  const tick = t => {
    if (!running) return;
    const dt = lastT ? Math.min(t - lastT, 50) / 1000 : 0;
    lastT = t;
    const speed = (40 + boost * 18) * direction; // pixels per second
    boost *= Math.pow(0.04, dt); // ease back to the base speed
    tracks.forEach(item => {
      if (item.track.parentElement.matches(':hover')) return;
      const half = item.track.scrollWidth / 2;
      item.offset = (((item.offset + speed * item.sign * dt) % half) + half) % half;
      item.track.style.transform = `translateX(${-item.offset}px)`;
    });
    requestAnimationFrame(tick);
  };
  const skills = document.getElementById('skills');
  if (skills && tracks.length) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) { running = true; lastT = 0; requestAnimationFrame(tick); }
      else if (!entry.isIntersecting) running = false;
    }).observe(skills);
  }
}


// ── Colour change between sections ──────────────────────────
if (!prefersReducedMotion) {
  // Background tint for each dark section (the Contact section stays light)
  const SECTION_COLOURS = {
    home: [10, 10, 10],
    experience: [9, 14, 30],   // deep navy
    work: [16, 22, 5],         // dark lime
    about: [24, 15, 12],       // warm brown-black
    skills: [10, 10, 10],
  };
  const colourSections = [...document.querySelectorAll('main > section')]
    .filter(s => SECTION_COLOURS[s.id]);
  const root = document.documentElement;
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const updateColour = () => {
    const vh = window.innerHeight;
    const mid = vh * 0.5;
    const blend = vh * 0.45; // how long the fade between two colours lasts
    let colour = SECTION_COLOURS[colourSections[0].id];
    colourSections.forEach((section, i) => {
      const { top, bottom } = section.getBoundingClientRect();
      if (top > mid || bottom < mid) return;
      const own = SECTION_COLOURS[section.id];
      const next = colourSections[i + 1] ? SECTION_COLOURS[colourSections[i + 1].id] : own;
      const t = Math.min(Math.max(1 - (bottom - mid) / blend, 0), 1);
      colour = mix(own, next, t * t * (3 - 2 * t));
    });
    root.style.setProperty('--page-bg', `rgb(${colour.join(',')})`);
  };
  window.addEventListener('scroll', updateColour, { passive: true });
  window.addEventListener('resize', updateColour);
  updateColour();
}

// ── Pinned SmartLab AR showcase: highlight the step beside the phone ─
const pinnedSteps = [...document.querySelectorAll('.project--pinned .project__points li')];
if (pinnedSteps.length) {
  const pinnedLayout = window.matchMedia('(min-width: 981px) and (min-height: 600px)');
  const updateSteps = () => {
    if (!pinnedLayout.matches) { pinnedSteps.forEach(li => li.classList.remove('is-active')); return; }
    const mid = window.innerHeight * 0.5;
    let best = null, bestDist = Infinity;
    pinnedSteps.forEach(li => {
      const r = li.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) { bestDist = d; best = li; }
    });
    pinnedSteps.forEach(li => li.classList.toggle('is-active', li === best));
  };
  window.addEventListener('scroll', updateSteps, { passive: true });
  window.addEventListener('resize', updateSteps);
  updateSteps();
}
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

// ── Demo video: no autoplay for visitors who prefer reduced motion ─
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.demo-video').forEach(video => {
  if (reduceMotion.matches) {
    video.removeAttribute('autoplay');
    video.pause();
  }
});

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
const showStatus = (text, isError = false) => {
  if (!connectStatus) return;
  connectStatus.classList.toggle('is-error', isError);
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
      ? '✓ Message copied. On LinkedIn, click Message or Connect and paste it (Ctrl+V).'
      : 'Couldn’t copy the message automatically. On LinkedIn, introduce yourself and mention you saw my portfolio.', !ok);
  });
}

document.querySelectorAll('[data-copy="email"]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const ok = await copyText(CONTACT_EMAIL);
    showStatus(ok
      ? `✓ Email address copied: ${CONTACT_EMAIL}`
      : `Couldn’t copy automatically. Select and copy this address: ${CONTACT_EMAIL}`, !ok);
  });
});
