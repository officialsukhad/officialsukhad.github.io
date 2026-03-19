'use strict';

/* ─── DOM READY ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initCustomCursor();
  initNavbar();
  initMobileMenu();
  initTypingAnimation();
  initScrollReveal();
  initSkillBars();
  initProjectCardMouseEffect();
  initContactForm();
  initSmoothScroll();
});

/* ─── 1. ANIMATED CANVAS BACKGROUND ─────────────────────────── */
/**
 * Renders a glowing grid + floating particles on a canvas element.
 * The grid subtly pulses; particles drift and fade.
 */
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const ACCENT = '0, 255, 156';
  const GRID_SIZE = 60;

  /* Resize handler */
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    createParticles();
  }

  /* Create floating particles */
  function createParticles() {
    particles = [];
    const count = Math.floor((W * H) / 18000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        a: Math.random(),
        da: (Math.random() - 0.5) * 0.005,
      });
    }
  }

  /* Draw perspective grid */
  function drawGrid(t) {
    const pulse = 0.04 + Math.sin(t * 0.0008) * 0.02;

    ctx.lineWidth = 0.5;

    /* Vertical lines */
    for (let x = 0; x <= W + GRID_SIZE; x += GRID_SIZE) {
      const alpha = pulse * (0.4 + Math.sin((x / W) * Math.PI) * 0.6);
      ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }

    /* Horizontal lines */
    for (let y = 0; y <= H + GRID_SIZE; y += GRID_SIZE) {
      const alpha = pulse * (0.4 + Math.sin((y / H) * Math.PI) * 0.6);
      ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  /* Draw glow nodes at grid intersections */
  function drawNodes(t) {
    for (let x = 0; x <= W; x += GRID_SIZE) {
      for (let y = 0; y <= H; y += GRID_SIZE) {
        /* Only draw a subset for performance */
        if ((x / GRID_SIZE + y / GRID_SIZE) % 4 !== 0) continue;
        const alpha = (Math.sin(t * 0.001 + x * 0.02 + y * 0.02) * 0.5 + 0.5) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT}, ${alpha})`;
        ctx.fill();
      }
    }
  }

  /* Draw floating particles */
  function drawParticles() {
    for (const p of particles) {
      /* Drift */
      p.x += p.dx;
      p.y += p.dy;
      p.a += p.da;

      /* Wrap */
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      if (p.a < 0) p.a = 1;
      if (p.a > 1) p.a = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, ${p.a * 0.6})`;
      ctx.fill();

      /* Soft glow */
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      g.addColorStop(0, `rgba(${ACCENT}, ${p.a * 0.15})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  /* Main render loop */
  let raf;
  function render(t) {
    ctx.clearRect(0, 0, W, H);
    drawGrid(t);
    drawNodes(t);
    drawParticles();
    raf = requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize);
  resize();
  raf = requestAnimationFrame(render);
}

/* ─── 2. CUSTOM CURSOR ──────────────────────────────────────── */
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursor-trail');
  if (!cursor || !cursorTrail) return;

  /* Hide on touch devices */
  if (window.matchMedia('(hover: none)').matches) return;

  let mx = -100, my = -100;
  let tx = -100, ty = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  /* Smooth trail with lerp */
  function updateTrail() {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    cursorTrail.style.left = tx + 'px';
    cursorTrail.style.top = ty + 'px';
    requestAnimationFrame(updateTrail);
  }
  updateTrail();

  /* Expand on hover over interactive elements */
  const interactives = 'a, button, input, textarea, .skill-card, .project-card';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ─── 3. NAVBAR — scroll + active link ─────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  /* Scrolled class */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightActiveLink();
  }, { passive: true });

  /* Highlight the nav link whose section is in view */
  function highlightActiveLink() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 140) {
        current = sec.getAttribute('id');
      }
    });
    links.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }
}

/* ─── 4. MOBILE MENU ────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  if (!hamburger || !mobileMenu) return;

  function close() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => link.addEventListener('click', close));
}

/* ─── 5. TYPING ANIMATION ───────────────────────────────────── */
function initTypingAnimation() {
  const target = document.getElementById('typed-text');
  if (!target) return;

  const phrases = [
    'BTech Student',
    'Linux Enthusiast',
    'Server Administrator',
    'Python Developer',
    'Infrastructure Builder',
    'Web Developer',
    'Competitive Programmer',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;
  const TYPING_SPEED = 80;
  const DELETE_SPEED = 40;
  const PAUSE_AFTER = 1800;
  const PAUSE_BEFORE = 400;

  function type() {
    const current = phrases[phraseIdx];

    if (!deleting) {
      /* Typing forward */
      target.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        /* Pause, then start deleting */
        deleting = true;
        setTimeout(type, PAUSE_AFTER);
        return;
      }
      setTimeout(type, TYPING_SPEED);
    } else {
      /* Deleting */
      target.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, PAUSE_BEFORE);
        return;
      }
      setTimeout(type, DELETE_SPEED);
    }
  }

  /* Small start delay */
  setTimeout(type, 800);
}

/* ─── 6. SCROLL REVEAL ──────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          /* Keep observing so re-animations work on scroll back (optional: unobserve) */
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ─── 7. SKILL BAR ANIMATIONS ──────────────────────────────── */
/**
 * Triggers the CSS width transition on skill fill bars
 * when the skills section enters the viewport.
 */
function initSkillBars() {
  const skillCards = document.querySelectorAll('.skill-card');
  if (!skillCards.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillCards.forEach(card => observer.observe(card));
}

/* ─── 8. PROJECT CARD MOUSE GLOW ────────────────────────────── */
/**
 * Tracks mouse position over project cards and passes it as
 * CSS variables for the radial gradient spotlight effect.
 */
function initProjectCardMouseEffect() {
  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });
}

/* ─── 9. CONTACT FORM ───────────────────────────────────────── */
/**
 * Basic front-end validation + simulated submit.
 * Replace the "simulate" block with a real fetch() call as needed.
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const btn = document.getElementById('submit-btn');
  const success = document.getElementById('form-success');
  if (!form || !btn) return;

  btn.addEventListener('click', () => {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();

    /* Simple validation */
    if (!name || !email || !message) {
      shakeButton(btn);
      return;
    }
    if (!isValidEmail(email)) {
      shakeButton(btn);
      return;
    }

    /* Loading state */
    btn.querySelector('.btn-text').textContent = 'Sending...';
    btn.disabled = true;

    /* Simulate async send — replace with real fetch if needed */
    setTimeout(() => {
      btn.style.display = 'none';
      success.classList.add('show');

      /* Reset after 5s */
      setTimeout(() => {
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('message').value = '';
        btn.querySelector('.btn-text').textContent = 'Send Message';
        btn.disabled = false;
        btn.style.display = '';
        success.classList.remove('show');
      }, 5000);
    }, 1200);
  });

  /* Shake animation for invalid submit */
  function shakeButton(el) {
    el.style.animation = 'none';
    el.offsetHeight;  /* Reflow */
    el.style.animation = 'shake 0.4s ease';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* Inject shake keyframes */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
}

/* ─── 10. SMOOTH SCROLL ─────────────────────────────────────── */
/**
 * Intercepts internal anchor clicks and scrolls smoothly
 * to the target section with a fixed navbar offset.
 */
function initSmoothScroll() {
  const OFFSET = 80; /* Navbar height compensation */

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
/* ─── DEVTOOLS PROTECTION ───────────────────────── */

(function () {
  // Disable right click
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    showWarning();
  });

  // Disable key shortcuts
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) ||
      (e.ctrlKey && (e.key === "u" || e.key === "U"))
    ) {
      e.preventDefault();
      showWarning();
    }
  });

  // Detect DevTools open
  let devtoolsOpen = false;

  setInterval(function () {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;

    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        showWarning();
      }
    } else {
      devtoolsOpen = false;
    }
  }, 1000);

  // Warning UI
  function showWarning() {
    if (document.getElementById("devtools-warning")) return;

    const div = document.createElement("div");
    div.id = "devtools-warning";

    div.innerHTML = `
    <div style="
      position: fixed;
      top:0;left:0;width:100%;height:100%;
      background:#0a0000;
      color:#ff4d4d;
      display:flex;
      align-items:center;
      justify-content:center;
      flex-direction:column;
      font-family: monospace;
      z-index:999999;
      text-align:center;
      padding:20px;
    ">
      <h1 style="font-size:2.5rem; margin-bottom:20px;">
        ⚠️ UNAUTHORIZED ACCESS DETECTED
      </h1>

      <p style="font-size:1.1rem; max-width:500px; line-height:1.6;">
        DevTools inspection attempt has been detected.
        <br><br>
        This action is monitored and strictly prohibited.
      </p>

      <p style="
        margin-top:30px;
        font-size:0.9rem;
        color:#ff9999;
        opacity:0.8;
      ">
        Refresh the page immediately to continue browsing.
      </p>
    </div>
  `;

    document.body.appendChild(div);

    // Lock scroll completely
    document.body.style.overflow = "hidden";
  }
})();
