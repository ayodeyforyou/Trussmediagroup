// --- Contact Form Validation and Submission with Math Captcha and Spinner ---
async function submitContactForm(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const captcha = document.getElementById('captcha').value.trim();
  const captchaAnswer = document.getElementById('captcha').getAttribute('data-answer');

  if (!name || !email || !message || !captcha) {
    document.getElementById('formStatus').textContent = 'Please fill all required fields.';
    return;
  }
  if (parseInt(captcha, 10) !== parseInt(captchaAnswer, 10)) {
    document.getElementById('formStatus').textContent = 'Incorrect captcha answer. Please try again.';
    generateCaptcha();
    document.getElementById('captcha').value = '';
    return;
  }

  const formJson = { name, email, message };
  document.getElementById('formStatus').textContent = '';
  document.getElementById('submitText').style.display = 'none';
  document.getElementById('spinner').style.display = 'inline-block';
  document.getElementById('submitBtn').disabled = true;

  try {
    const response = await fetch("http://localhost:4000/api/contact", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formJson)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit form');
    }

    event.target.reset();
    document.getElementById('formStatus').textContent = 'Thank you! Your message has been sent.';
    generateCaptcha();
    // Google Analytics event for form submission
    if (window.gtag) {
      gtag('event', 'form_submission', {
        'event_category': 'Contact',
        'event_label': 'Contact Form',
        'value': 1
      });
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    document.getElementById('formStatus').textContent = error.message || "Failed to submit form. Please try again.";
  } finally {
    document.getElementById('submitText').style.display = 'inline';
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('submitBtn').disabled = false;
  }
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", submitContactForm);
} else {
  console.error("Contact form element not found in the DOM.");
}
// script.js - Cinematic Film Company Website (Phase 1)
// Handles: Lightbox, animated stats, nav, form validation, smooth scroll

// --- Lightbox Video Player ---
function openLightbox(videoSrc) {
  let overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-content">
      <video src="${videoSrc}" controls autoplay style="width:100%;border-radius:14px;"></video>
      <button class="lightbox-close" title="Close">&times;</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.lightbox-close').onclick = () => overlay.remove();
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
}
// Lightbox styles
const lightboxStyle = document.createElement('style');
lightboxStyle.innerHTML = `
  .lightbox-overlay { position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(26,26,26,0.92);z-index:9999;display:flex;align-items:center;justify-content:center; }
  .lightbox-content { position:relative;max-width:90vw;max-height:90vh; }
  .lightbox-close { position:absolute;top:-18px;right:-18px;background:var(--gold);color:#1a1a1a;font-size:2.2rem;border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.18);transition:background 0.2s; }
  .lightbox-close:hover { background:var(--gold-light); }
`;
document.head.appendChild(lightboxStyle);

// --- Animated Stats (Count Up) ---
function animateStats() {
  document.querySelectorAll('.stat-box__num').forEach(el => {
    let end = +el.getAttribute('data-count');
    let start = 0;
    let duration = 1200;
    let startTime = null;
    function animate(ts) {
      if (!startTime) startTime = ts;
      let progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(progress * (end - start) + start);
      if (progress < 1) requestAnimationFrame(animate);
      else el.textContent = end;
    }
    requestAnimationFrame(animate);
  });
}
// Trigger on scroll into view
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}
window.addEventListener('scroll', () => {
  const stats = document.querySelector('.about__stats');
  if (stats && isInViewport(stats) && !stats.classList.contains('animated')) {
    stats.classList.add('animated');
    animateStats();
  }
});
// Also trigger if already in view on load
window.addEventListener('DOMContentLoaded', () => {
  const stats = document.querySelector('.about__stats');
  if (stats && isInViewport(stats)) {
    stats.classList.add('animated');
    animateStats();
  }
});

// --- Smooth Scroll for Nav ---
document.querySelectorAll('.nav__link').forEach(link => {
  link.onclick = function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({behavior:'smooth'});
    }
  };
});



// Skip to Content link support
const skipLink = document.querySelector('.skip-to-content');
if (skipLink) {
  skipLink.addEventListener('click', function(e) {
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      setTimeout(() => main.removeAttribute('tabindex'), 1000);
    }
  });
}

// ARIA live region for form feedback
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
if (form && formStatus) {
  form.addEventListener('submit', function(e) {
    // ...existing code for form validation...
    // Example feedback:
    formStatus.textContent = 'Sending...';
    // After AJAX or validation:
    // formStatus.textContent = 'Thank you! Your message has been sent.';
    // formStatus.textContent = 'Please fill out all required fields.';
  });
}

// --- Carousel: No JS needed for left scroll on hover (CSS handles it) ---

// --- Blog: No dynamic JS needed for static cards ---

// Theme toggle for light/dark mode
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

function setTheme(mode) {
  if (mode === 'light') {
    body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('light-mode')) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  });
}

// On load, set theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  setTheme('light');
} else {
  setTheme('dark');
}
