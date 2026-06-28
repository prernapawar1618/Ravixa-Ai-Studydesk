/**
 * Effects and Animations Controller
 * Handles typing effect, mouse glow, 3D card tilt, particle systems, and scroll reveals.
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTypingEffect();
  initMouseGlow();
  initCardTilt();
  initScrollReveal();
  initCounters();
});

/* ==========================================================================
   1. AMBIENT PARTICLE SYSTEM
   ========================================================================== */
function initParticles() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const particleCount = 35;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random sizes, positions, and animation parameters
    const size = Math.random() * 4 + 2; // 2px to 6px
    const left = Math.random() * 100; // 0% to 100%
    const delay = Math.random() * 15; // 0s to 15s delay
    const duration = Math.random() * 15 + 15; // 15s to 30s duration
    const opacity = Math.random() * 0.4 + 0.1; // 0.1 to 0.5 opacity

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.bottom = `-20px`;
    particle.style.opacity = opacity;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    
    // Customize particle drift using CSS animation defined in animations.css
    container.appendChild(particle);
  }
}

/* ==========================================================================
   2. HERO TYPING EFFECT
   ========================================================================== */
function initTypingEffect() {
  const textEl = document.getElementById('hero-typing-desc');
  if (!textEl) return;

  const phrases = [
    "Maximize your focus with a cognitive workstation designed for deep work.",
    "Eliminate distractions and stream lo-fi beats directly inside your desk.",
    "Track your study sessions with custom data visualization and AI analytics."
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 50; // ms per char

  textEl.classList.add('typing-cursor');

  function type() {
    const currentPhrase = phrases[phraseIdx];
    
    if (isDeleting) {
      // Remove character
      textEl.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 25; // Delete faster
    } else {
      // Add character
      textEl.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 55; // Standard typing speed
    }

    // Determine state changes
    if (!isDeleting && charIdx === currentPhrase.length) {
      // Pause at the end of the phrase
      isDeleting = true;
      typingSpeed = 2500; // Wait before starting to delete
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typingSpeed = 500; // Wait before typing next phrase
    }

    setTimeout(type, typingSpeed);
  }

  // Start typing loop
  setTimeout(type, 800);
}

/* ==========================================================================
   3. MOUSE GLOW EFFECT
   ========================================================================== */
function initMouseGlow() {
  const panels = document.querySelectorAll('.glass-panel');
  
  panels.forEach(panel => {
    // Inject glow element if not already present
    if (!panel.querySelector('.mouse-glow-bg')) {
      const glow = document.createElement('div');
      glow.classList.add('mouse-glow-bg');
      panel.appendChild(glow);
    }
    
    panel.addEventListener('mousemove', e => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const glow = panel.querySelector('.mouse-glow-bg');
      if (glow) {
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
      }
    });
  });
}

/* ==========================================================================
   4. 3D CARD TILT EFFECT (Vanilla Implementation)
   ========================================================================== */
function initCardTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  
  // Only apply on screens wider than mobile
  if (window.innerWidth < 768) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const cardRect = card.getBoundingClientRect();
      const cardWidth = cardRect.width;
      const cardHeight = cardRect.height;
      
      // Calculate mouse position relative to center of card (-0.5 to 0.5)
      const mouseX = (e.clientX - cardRect.left) / cardWidth - 0.5;
      const mouseY = (e.clientY - cardRect.top) / cardHeight - 0.5;
      
      // Calculate rotation angles (max 8 degrees tilt)
      const rotateX = -(mouseY * 12).toFixed(2);
      const rotateY = (mouseX * 12).toFixed(2);
      
      // Apply 3D transform
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.transition = 'none'; // Snappy response
    });
    
    card.addEventListener('mouseleave', () => {
      // Reset card position smoothly
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s';
    });
  });
}

/* ==========================================================================
   5. SCROLL REVEAL (Fade-Up)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-fade-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve after showing
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });
  
  revealElements.forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   6. ANIMATED COUNTERS
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.animate-counter');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetVal = parseFloat(target.getAttribute('data-target'));
        animateValue(target, 0, targetVal, 2000);
        observer.unobserve(target);
      }
    });
  }, {
    threshold: 0.5
  });
  
  counters.forEach(counter => {
    observer.observe(counter);
  });
}

/**
 * Animate numeric value over time
 * @param {HTMLElement} obj - Element to animate
 * @param {number} start - Start value
 * @param {number} end - Target value
 * @param {number} duration - Animation duration in ms
 */
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const isDecimal = end % 1 !== 0;
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Easing function: easeOutExpo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    
    const current = easeProgress * (end - start) + start;
    
    if (isDecimal) {
      obj.textContent = current.toFixed(1);
    } else {
      obj.textContent = Math.floor(current);
    }
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  
  window.requestAnimationFrame(step);
}

/* ==========================================================================
   7. BUTTON RIPPLE EFFECT
   ========================================================================== */
document.addEventListener('click', e => {
  const button = e.target.closest('.btn-ripple');
  if (!button) return;

  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  
  // Set glow color if it's a primary button
  if (button.classList.contains('btn-primary') || button.classList.contains('play-btn')) {
    ripple.classList.add('ripple-primary');
  }

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  ripple.style.width = ripple.style.height = `${size}px`;
  
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  button.appendChild(ripple);
  
  ripple.addEventListener('animationend', () => {
    ripple.remove();
  });
});
