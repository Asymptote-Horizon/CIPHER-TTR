/**
 * CIPHER TECH RECRUITMENT · BUILD ACTIVITY
 * Interactive Presentation & Event Management Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initNavigation();
  initHorizontalTimeline();
  initProblemReveal();
  initLightbox();
  initCountdownTimer();
  initKeyboardShortcuts();
});

/* ==========================================================================
   1. AMBIENT PARTICLES
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles = [];

  function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width; this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.3; this.speedY = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.45 + 0.15;
      this.gold = Math.random() > 0.38;
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.gold ? `rgba(212,175,55,${this.alpha})` : `rgba(56,189,248,${this.alpha * 0.7})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.gold ? '#d4af37' : '#38bdf8';
      ctx.fill(); ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < 40; i++) particles.push(new Particle());

  function render() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(212,175,55,${0.09 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(render);
  }
  render();
}

/* ==========================================================================
   2. NAVIGATION ACTIVE STATE
   ========================================================================== */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.scrollToSection = scrollToSection;

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section.section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-target') === id));
      }
    });
  }, { threshold: 0.32 });
  sections.forEach(s => observer.observe(s));
}

/* ==========================================================================
   3. HORIZONTAL TIMELINE
   ========================================================================== */
function initHorizontalTimeline() {
  const wrapper = document.getElementById('timeline-scroll-wrapper');
  const cards = document.querySelectorAll('.timeline-card');
  const dots = document.querySelectorAll('.t-dot');
  const prevBtn = document.getElementById('timeline-prev-btn');
  const nextBtn = document.getElementById('timeline-next-btn');
  const fillBar = document.getElementById('timeline-fill-bar');
  if (!wrapper || !cards.length) return;

  let current = 0;
  const total = cards.length;

  function goTo(index, smooth = true) {
    if (index < 0) index = 0;
    if (index >= total) index = total - 1;
    current = index;

    cards.forEach((c, i) => {
      const active = i === current;
      c.classList.toggle('active', active);
      const tag = c.querySelector('.step-status-tag');
      if (tag) tag.classList.toggle('current', active && i === 0);
    });

    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    if (fillBar) fillBar.style.width = `${(current / (total - 1)) * 100}%`;

    const card = cards[current];
    wrapper.scrollTo({ left: card.offsetLeft - (wrapper.clientWidth / 2) + (card.clientWidth / 2), behavior: smooth ? 'smooth' : 'auto' });
  }

  prevBtn?.addEventListener('click', () => { soundSynth.playTick(); goTo(current - 1); });
  nextBtn?.addEventListener('click', () => { soundSynth.playTick(); goTo(current + 1); });
  dots.forEach(d => d.addEventListener('click', e => { soundSynth.playTick(); goTo(parseInt(e.target.dataset.index, 10)); }));
  cards.forEach((c, i) => c.addEventListener('click', () => goTo(i)));

  // Wheel-to-horizontal-slide
  wrapper.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault(); wrapper.scrollLeft += e.deltaY;
      detectActive();
    }
  }, { passive: false });

  // Drag scroll
  let isDown = false, startX, scrollStart;
  wrapper.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - wrapper.offsetLeft; scrollStart = wrapper.scrollLeft; });
  wrapper.addEventListener('mouseleave', () => isDown = false);
  wrapper.addEventListener('mouseup', () => isDown = false);
  wrapper.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    wrapper.scrollLeft = scrollStart - (x - startX);
  });

  let scrollTimeout;
  wrapper.addEventListener('scroll', () => { clearTimeout(scrollTimeout); scrollTimeout = setTimeout(detectActive, 60); });

  function detectActive() {
    const center = wrapper.scrollLeft + wrapper.clientWidth / 2;
    let closest = 0, minDist = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - center);
      if (d < minDist) { minDist = d; closest = i; }
    });
    if (closest !== current) {
      current = closest;
      cards.forEach((c, i) => c.classList.toggle('active', i === current));
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      if (fillBar) fillBar.style.width = `${(current / (total - 1)) * 100}%`;
    }
  }

  window.addEventListener('keydown', e => {
    const rect = wrapper.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView && !isInputActive()) {
      if (e.key === 'ArrowRight') goTo(current + 1);
      else if (e.key === 'ArrowLeft') goTo(current - 1);
    }
  });

  goTo(0, false);
}

/* ==========================================================================
   4. PROBLEM STATEMENT REVEAL
   ========================================================================== */
function initProblemReveal() {
  const triggerBtn = document.getElementById('reveal-trigger-btn');
  const btnText = document.getElementById('reveal-btn-text');
  const decipherLine = document.getElementById('decipher-line');
  const lockedState = document.getElementById('reveal-locked-state');
  const unlockedState = document.getElementById('reveal-unlocked-state');
  const relockBtn = document.getElementById('relock-btn');
  if (!triggerBtn) return;

  if (sessionStorage.getItem('cipher_ttr_revealed') === 'true') showUnlocked(false);

  triggerBtn.addEventListener('click', () => {
    if (triggerBtn.disabled) return;
    triggerBtn.disabled = true;
    runDecipherAnimation(() => {
      soundSynth.playChime();
      launchConfetti();
      showUnlocked(true);
      sessionStorage.setItem('cipher_ttr_revealed', 'true');
    });
  });

  relockBtn?.addEventListener('click', () => {
    soundSynth.playTick();
    triggerBtn.disabled = false;
    if (btnText) btnText.textContent = 'REVEAL PROBLEM STATEMENT';
    if (decipherLine) { decipherLine.textContent = ''; decipherLine.classList.remove('active'); }
    lockedState.style.display = 'flex';
    unlockedState.classList.add('hidden');
    sessionStorage.removeItem('cipher_ttr_revealed');
  });

  function showUnlocked(animate = true) {
    lockedState.style.display = 'none';
    unlockedState.classList.remove('hidden');
    if (animate) unlockedState.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function runDecipherAnimation(onComplete) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%&';
    const target = 'DECIPHERING CHALLENGE...';
    if (btnText) btnText.textContent = 'DECIPHERING...';
    if (decipherLine) { decipherLine.classList.add('active'); decipherLine.textContent = randomStr(target.length, chars); }

    let iterations = 0;
    const maxIter = target.length * 3;
    const interval = setInterval(() => {
      iterations++;
      const revealed = Math.floor(iterations / 3);
      if (decipherLine) {
        decipherLine.textContent = target.split('').map((ch, i) =>
          i < revealed ? ch : (ch === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)])
        ).join('');
      }
      if (iterations >= maxIter) {
        clearInterval(interval);
        if (decipherLine) decipherLine.textContent = target;
        setTimeout(onComplete, 220);
      }
    }, 38);
  }

  function randomStr(len, chars) {
    return Array.from({ length: len }, (_, i) => chars[Math.floor(Math.random() * chars.length)] ).join('');
  }
}

// Confetti burst
function launchConfetti() {
  const colors = ['#d4af37','#f5cf68','#fff4c7','#38bdf8','#ffffff'];
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '9999' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;

  const particles = Array.from({ length: 80 }, () => ({
    x: canvas.width / 2, y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.7) * 17,
    size: Math.random() * 7 + 4, color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360, vRot: (Math.random() - 0.5) * 10,
    opacity: 1, gravity: 0.33
  }));

  let af;
  function anim() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
      p.rotation += p.vRot; p.opacity -= 0.013;
      if (p.opacity > 0) {
        alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx.restore();
      }
    });
    if (alive) af = requestAnimationFrame(anim);
    else { cancelAnimationFrame(af); canvas.remove(); }
  }
  anim();
}

/* ==========================================================================
   5. LIGHTBOX
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('poster-lightbox');
  const zoomBtn = document.getElementById('zoom-poster-btn');
  const posterClick = document.getElementById('poster-click-wrapper');
  const closeBtn = document.getElementById('lightbox-close');
  const backdrop = document.getElementById('lightbox-backdrop');
  if (!lightbox) return;

  const open = () => { lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; soundSynth.playTick(); };
  const close = () => { lightbox.classList.remove('active'); document.body.style.overflow = ''; };

  zoomBtn?.addEventListener('click', open);
  posterClick?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('active')) close(); });
}

/* ==========================================================================
   6. COUNTDOWN TIMER
   ========================================================================== */
function initCountdownTimer() {
  let initialDuration = 5400;
  let remaining = initialDuration;
  let interval = null;
  let running = false;

  const el = id => document.getElementById(id);
  const dispH = el('disp-hours'), dispM = el('disp-minutes'), dispS = el('disp-seconds');
  const toggleBtn = el('timer-toggle-btn'), toggleText = el('toggle-text'), toggleIcon = el('toggle-icon');
  const resetBtn = el('timer-reset-btn'), fsBtn = el('timer-fullscreen-btn'), fsBtnText = el('fs-btn-text');
  const settingsBtn = el('timer-settings-btn');
  const presetsDrawer = el('timer-presets-drawer');
  const timerBox = el('timer-screen-box');
  const statusText = el('timer-status-text');
  const progressFill = el('timer-progress-fill');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // Settings toggle (collapsible presets)
  settingsBtn?.addEventListener('click', () => {
    soundSynth.playTick();
    presetsDrawer?.classList.toggle('hidden');
    const open = !presetsDrawer?.classList.contains('hidden');
    settingsBtn.querySelector('span:last-child').textContent = open ? 'HIDE' : 'SETTINGS';
  });

  function render() {
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    if (dispH) dispH.textContent = String(h).padStart(2,'0');
    if (dispM) dispM.textContent = String(m).padStart(2,'0');
    if (dispS) dispS.textContent = String(s).padStart(2,'0');
    if (progressFill && initialDuration > 0) progressFill.style.width = `${Math.max(0, Math.min(100, (remaining / initialDuration) * 100))}%`;

    if (timerBox) {
      timerBox.classList.remove('warning','danger');
      if (remaining <= 0) { timerBox.classList.add('danger'); if (statusText) statusText.textContent = "TIME'S UP · SUBMIT ALL DELIVERABLES"; }
      else if (remaining <= 300) { timerBox.classList.add('danger'); if (running && statusText) statusText.textContent = 'FINAL 5 MINUTES · WRAP UP & SUBMIT'; }
      else if (remaining <= 900) { timerBox.classList.add('warning'); if (running && statusText) statusText.textContent = '15 MIN LEFT · DEPLOY & PREPARE SUBMISSION'; }
      else if (running && statusText) statusText.textContent = 'BUILD IN PROGRESS · LEAD THE AI';
    }
  }

  function start() {
    if (running) return;
    running = true; soundSynth.playChime();
    toggleBtn?.classList.replace('start','pause');
    if (toggleText) toggleText.textContent = 'PAUSE TIMER';
    if (toggleIcon) toggleIcon.textContent = '⏸';
    if (remaining > 900 && statusText) statusText.textContent = 'BUILD IN PROGRESS · LEAD THE AI';
    interval = setInterval(() => {
      if (remaining > 0) {
        remaining--;
        render();
        if (remaining === 900 || remaining === 300) soundSynth.playWarningAlert();
        if (remaining === 0) { stop(); soundSynth.playFanfare(); }
      } else stop();
    }, 1000);
  }

  function pause() {
    if (!running) return;
    running = false; clearInterval(interval); soundSynth.playTick();
    toggleBtn?.classList.replace('pause','start');
    if (toggleText) toggleText.textContent = 'RESUME TIMER';
    if (toggleIcon) toggleIcon.textContent = '▶';
    if (statusText) statusText.textContent = 'PAUSED · CLICK RESUME TO CONTINUE';
  }

  function stop() {
    running = false; clearInterval(interval);
    toggleBtn?.classList.replace('pause','start');
    if (toggleText) toggleText.textContent = 'START TIMER';
    if (toggleIcon) toggleIcon.textContent = '▶';
  }

  function reset() {
    stop(); soundSynth.playTick();
    remaining = initialDuration; render();
    const h = Math.floor(initialDuration/3600), m = Math.floor((initialDuration%3600)/60);
    if (statusText) statusText.textContent = `READY · ${h ? h+'H ' : ''}${m}M`;
  }

  toggleBtn?.addEventListener('click', () => running ? pause() : start());
  resetBtn?.addEventListener('click', reset);

  // Fullscreen
  fsBtn?.addEventListener('click', toggleFS);
  function toggleFS() {
    soundSynth.playTick();
    const isFS = document.body.classList.toggle('fullscreen-projector');
    if (fsBtnText) fsBtnText.textContent = isFS ? 'EXIT FULLSCREEN' : 'FULLSCREEN';
    if (isFS) document.documentElement.requestFullscreen?.().catch(()=>{});
    else document.fullscreenElement && document.exitFullscreen?.().catch(()=>{});
  }
  window.toggleProjectorFullscreen = toggleFS;
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && document.body.classList.contains('fullscreen-projector')) {
      document.body.classList.remove('fullscreen-projector');
      if (fsBtnText) fsBtnText.textContent = 'FULLSCREEN';
    }
  });

  // Presets
  presetBtns.forEach(btn => btn.addEventListener('click', e => {
    soundSynth.playTick();
    presetBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const secs = parseInt(e.target.dataset.time, 10);
    initialDuration = secs; remaining = secs; stop(); render();
    const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60);
    if (statusText) statusText.textContent = `SET TO ${h?h+'H ':''}${m}M · READY`;
  }));

  // Adjusters
  function adjust(delta) { soundSynth.playTick(); remaining = Math.max(60, remaining + delta); if (remaining > initialDuration) initialDuration = remaining; render(); }
  el('btn-sub-5m')?.addEventListener('click', () => adjust(-300));
  el('btn-add-5m')?.addEventListener('click', () => adjust(300));
  el('btn-sub-1m')?.addEventListener('click', () => adjust(-60));
  el('btn-add-1m')?.addEventListener('click', () => adjust(60));

  const customH = el('custom-h'), customM = el('custom-m');
  el('btn-set-custom')?.addEventListener('click', () => {
    soundSynth.playTick();
    const h = parseInt(customH?.value,10)||0, m = parseInt(customM?.value,10)||0;
    const total = h*3600 + m*60;
    if (total >= 60) {
      presetBtns.forEach(b => b.classList.remove('active'));
      initialDuration = total; remaining = total; stop(); render();
      if (statusText) statusText.textContent = `CUSTOM ${h}H ${m}M · READY`;
    }
  });

  window.addEventListener('keydown', e => {
    if (e.code === 'Space' && !isInputActive()) { e.preventDefault(); running ? pause() : start(); }
  });

  render();
}

/* ==========================================================================
   7. WEB AUDIO SYNTHESIZER
   ========================================================================== */
class SoundSynthesizer {
  constructor() { this.enabled = true; this.ctx = null; this._initToggle(); }
  _ctx() {
    if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) this.ctx = new AC(); }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }
  _initToggle() {
    const btn = document.getElementById('sound-toggle-btn');
    const icon = document.getElementById('sound-icon');
    if (!btn) return;
    btn.addEventListener('click', () => {
      this.enabled = !this.enabled;
      if (icon) {
        icon.innerHTML = this.enabled
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      }
      if (this.enabled) this.playTick();
    });
  }
  _tone(freq, type, gain, dur, start = 0) {
    this._ctx(); if (!this.ctx) return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    const t = this.ctx.currentTime + start;
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t); o.stop(t + dur);
  }
  playTick() { if (!this.enabled) return; this._tone(580, 'sine', 0.07, 0.06); }
  playChime() { if (!this.enabled) return; [523.25, 659.25, 783.99, 1046.5].forEach((f,i) => this._tone(f,'triangle',0.1,0.3,i*0.08)); }
  playWarningAlert() { if (!this.enabled) return; [440,440].forEach((f,i) => this._tone(f,'sawtooth',0.12,0.14,i*0.2)); }
  playFanfare() { if (!this.enabled) return; [523.25,659.25,783.99,1046.5,1318.51].forEach((f,i) => this._tone(f,'sine',0.18,0.48,i*0.11)); }
}
const soundSynth = new SoundSynthesizer();

/* ==========================================================================
   8. KEYBOARD SHORTCUTS
   ========================================================================== */
function initKeyboardShortcuts() {
  window.addEventListener('keydown', e => {
    if (isInputActive()) return;
    const map = { '1':'hero','2':'timeline-section','3':'guidelines-section','4':'reveal-section','5':'countdown-section' };
    if (map[e.key]) { scrollToSection(map[e.key]); return; }
    if (e.key === 'f' || e.key === 'F') window.toggleProjectorFullscreen?.();
    if (e.key === 'r' || e.key === 'R') document.getElementById('reveal-trigger-btn')?.click();
  });
}

function isInputActive() {
  const a = document.activeElement;
  return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable);
}
