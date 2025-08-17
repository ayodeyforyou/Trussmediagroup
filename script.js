// script.js - Truss Media Group Website
// Handles: Navigation, Contact Form, Lightbox, Animated Stats, Theme Toggle, Mobile Menu

// --- DOM Content Loaded Event ---
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeMobileMenu();
    initializeThemeToggle();
    initializeContactForm();
    initializeStatsAnimation();
    initializeAccessibility();
    generateCaptcha(); // Generate initial captcha
    initializeCarousel();
});

// --- Navigation & Smooth Scrolling ---
function initializeNavigation() {
    // Smooth scroll for navigation links
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                // Update active state
                document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Smooth scroll to target
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// --- Mobile Menu (Hamburger) ---
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hero__hamburger');
    const nav = document.querySelector('.hero__nav');
    const body = document.body;

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            nav.classList.toggle('open');
            body.classList.toggle('no-scroll');
        });

        // Close menu when navigation link is clicked
        nav.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                nav.classList.remove('open');
                body.classList.remove('no-scroll');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('open');
                nav.classList.remove('open');
                body.classList.remove('no-scroll');
            }
        });
    }
}

// --- Theme Toggle ---
function initializeThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    // Use correct selectors matching HTML
    const sunIcon = document.querySelector('.sun-svg');
    const moonIcon = document.querySelector('.moon-svg');

    // Helper to update icon visibility
    function updateIcons(isLight) {
        if (sunIcon) sunIcon.style.display = isLight ? 'none' : 'block';
        if (moonIcon) moonIcon.style.display = isLight ? 'block' : 'none';
    }

    // Set theme and update icons
    function setTheme(mode) {
        const isLight = mode === 'light';
        body.classList.toggle('light-mode', isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateIcons(isLight);
    }

    // Apply saved theme on load (default: dark)
    setTheme(localStorage.getItem('theme') === 'light' ? 'light' : 'dark');

    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = body.classList.contains('light-mode');
            setTheme(isLight ? 'dark' : 'light');
        });
    }
}

// --- Contact Form with Validation and Captcha ---
function initializeContactForm() {
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", submitContactForm);
    }
}

// Generate Math Captcha
function generateCaptcha() {
    const captchaElement = document.getElementById('captcha');
    const captchaQuestionElement = document.getElementById('captcha-question');
    
    if (captchaElement && captchaQuestionElement) {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const answer = num1 + num2;
        
        captchaQuestionElement.textContent = `${num1} + ${num2} = ?`;
        captchaElement.setAttribute('data-answer', answer);
        captchaElement.value = '';
    }
}

// Submit Contact Form
async function submitContactForm(event) {
    event.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    const captcha = document.getElementById('captcha')?.value.trim();
    const captchaAnswer = document.getElementById('captcha')?.getAttribute('data-answer');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('spinner');

    // Validation
    if (!name || !email || !message || !captcha) {
        updateFormStatus('Please fill all required fields.', 'error');
        return;
    }

    if (parseInt(captcha, 10) !== parseInt(captchaAnswer, 10)) {
        updateFormStatus('Incorrect captcha answer. Please try again.', 'error');
        generateCaptcha();
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        updateFormStatus('Please enter a valid email address.', 'error');
        return;
    }

    // Show loading state
    updateFormStatus('Sending message...', 'loading');
    toggleSubmitButton(true);

    try {
        const formData = { name, email, message };
    //change this to your host later
        const response = await fetch("http://localhost:4000/api/contact", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit form');
        }

        // Success
        event.target.reset();
        updateFormStatus('Thank you! Your message has been sent successfully.', 'success');
        generateCaptcha();

        // Google Analytics event
        if (window.gtag) {
            gtag('event', 'form_submission', {
                'event_category': 'Contact',
                'event_label': 'Contact Form',
                'value': 1
            });
        }

    } catch (error) {
        console.error("Error submitting form:", error);
        updateFormStatus(error.message || "Failed to submit form. Please try again.", 'error');
    } finally {
        toggleSubmitButton(false);
    }
}

// Helper function to update form status
function updateFormStatus(message, type) {
    const formStatus = document.getElementById('formStatus');
    if (formStatus) {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
    }
}

// Helper function to toggle submit button state
function toggleSubmitButton(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('spinner');

    if (submitBtn) submitBtn.disabled = isLoading;
    if (submitText) submitText.style.display = isLoading ? 'none' : 'inline';
    if (spinner) spinner.style.display = isLoading ? 'inline-block' : 'none';
}

// --- Animated Stats Counter ---
function initializeStatsAnimation() {
    const statsSection = document.querySelector('.about__stats');
    if (!statsSection) return;

    const animateStats = () => {
        document.querySelectorAll('.stat-box__num').forEach(el => {
            const end = parseInt(el.getAttribute('data-count')) || 0;
            const duration = 1500;
            let start = 0;
            let startTime = null;

            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const current = Math.floor(progress * (end - start) + start);
                
                el.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = end;
                }
            };
            
            requestAnimationFrame(animate);
        });
    };

    // Intersection Observer for better performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}

// --- Lightbox Video Player ---
function openLightbox(videoSrc) {
    if (!videoSrc) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <div class="lightbox-content">
            <video src="${videoSrc}" controls autoplay style="width:100%;border-radius:14px;" aria-label="Video player">
                Your browser does not support the video tag.
            </video>
            <button class="lightbox-close" title="Close" aria-label="Close video">&times;</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Event listeners
    const closeBtn = overlay.querySelector('.lightbox-close');
    closeBtn.addEventListener('click', () => closeLightbox(overlay));
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLightbox(overlay);
    });

    // Keyboard support
    document.addEventListener('keydown', handleLightboxKeydown);
    
    // Focus management
    closeBtn.focus();
}

function closeLightbox(overlay) {
    overlay.remove();
    document.removeEventListener('keydown', handleLightboxKeydown);
}

function handleLightboxKeydown(e) {
    if (e.key === 'Escape') {
        const overlay = document.querySelector('.lightbox-overlay');
        if (overlay) closeLightbox(overlay);
    }
}

// --- Accessibility Features ---
function initializeAccessibility() {
    // Skip to content link
    const skipLink = document.querySelector('.skip-to-content');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const main = document.getElementById('main-content');
            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus();
                setTimeout(() => main.removeAttribute('tabindex'), 1000);
            }
        });
    }

    // Keyboard navigation for custom elements
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (e.target.classList.contains('clickable')) {
                e.preventDefault();
                e.target.click();
            }
        }
    });
}

// --- Lightbox Styles (injected) ---
const lightboxStyles = `
    .lightbox-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(26, 26, 26, 0.95);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    }
    
    .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    .lightbox-close {
        position: absolute;
        top: -18px;
        right: -18px;
        background: var(--gold, #ffd700);
        color: #1a1a1a;
        font-size: 2.2rem;
        font-weight: bold;
        border: none;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .lightbox-close:hover {
        background: var(--gold-light, #ffed4e);
        transform: scale(1.1);
    }
    
    .lightbox-close:focus {
        outline: 2px solid var(--gold, #ffd700);
        outline-offset: 2px;
    }
    
    .form-status {
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 4px;
        font-weight: 500;
    }
    
    .form-status.success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .form-status.error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .form-status.loading {
        background-color: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
    
    .no-scroll {
        overflow: hidden;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = lightboxStyles;
document.head.appendChild(styleSheet);

// --- Utility Functions ---
// --- Carousel Controls ---
function initializeCarousel() {
    const carouselTrack = document.querySelector('.carousel__track');
    const items = Array.from(document.querySelectorAll('.carousel__item'));
    const leftBtn = document.querySelector('.carousel-nav-arrow--left');
    const rightBtn = document.querySelector('.carousel-nav-arrow--right');
    let currentIndex = 0;

    // Helper: check if mobile (max-width: 768px)
    function isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    function updateCarouselDisplay() {
        if (isMobile()) {
            items.forEach((item, i) => {
                item.style.display = i === currentIndex ? 'block' : 'none';
            });
            if (leftBtn) leftBtn.style.display = 'block';
            if (rightBtn) rightBtn.style.display = 'block';
        } else {
            items.forEach(item => {
                item.style.display = 'block';
            });
            if (leftBtn) leftBtn.style.display = 'none';
            if (rightBtn) rightBtn.style.display = 'none';
        }
    }

    // Initial display
    updateCarouselDisplay();

    // Left button event
    if (leftBtn) {
        leftBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarouselDisplay();
        });
    }

    // Right button event
    if (rightBtn) {
        rightBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateCarouselDisplay();
        });
    }

    // Keyboard accessibility
    [leftBtn, rightBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    btn.click();
                }
            });
        }
    });

    // Responsive: update on resize
    window.addEventListener('resize', updateCarouselDisplay);
}
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// === SCROLL-TRIGGERED ANIMATIONS ===
function initializeScrollAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animatedSelectors = [
        '.fade-in', '.slide-left', '.slide-right', '.slide-up', '.scale-in'
    ];
    const animatedElements = Array.from(document.querySelectorAll(animatedSelectors.join(',')));

    // Staggered delays for groups (cards, etc.)
    function getStaggerDelay(el, groupSelector, baseDelay = 80) {
        if (!groupSelector) return 0;
        const group = el.closest(groupSelector);
        if (!group) return 0;
        const siblings = Array.from(group.querySelectorAll(el.className.split(' ').map(c => '.'+c).join('')));
        const idx = siblings.indexOf(el);
        return idx >= 0 ? idx * baseDelay : 0;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                // Stagger for cards, portfolio, carousel, etc.
                let delay = 0;
                if (el.classList.contains('fade-in') || el.classList.contains('scale-in')) {
                    delay = getStaggerDelay(el, '.services__grid, .portfolio__grid, .carousel__track, .team__grid, .testimonials__carousel');
                }
                setTimeout(() => {
                    el.classList.add('revealed');
                }, delay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.2 });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

document.addEventListener('DOMContentLoaded', initializeScrollAnimations);

// Export functions for global access
window.openLightbox = openLightbox;
window.generateCaptcha = generateCaptcha;

// --- Staggered Scroll Animation ---
(function () {
  // Feature detection for Intersection Observer
  var supportsIntersectionObserver = 'IntersectionObserver' in window;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealElements() {
    var elements = document.querySelectorAll('.reveal-on-scroll');
    if (prefersReducedMotion) {
      elements.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }
    if (supportsIntersectionObserver) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = parseFloat(el.getAttribute('data-reveal-delay')) || 0;
            setTimeout(function () {
              el.classList.add('revealed');
            }, delay);
            obs.unobserve(el);
          }
        });
      }, {
        threshold: 0.15
      });
      elements.forEach(function (el, i) {
        // If no custom delay, stagger by index
        if (!el.hasAttribute('data-reveal-delay')) {
          el.setAttribute('data-reveal-delay', i * 80);
        }
        observer.observe(el);
      });
    } else {
      // Fallback: reveal all immediately
      elements.forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', revealElements);
})();

const scrollTop = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        scrollTop.classList.add('visible');
    } else {
        scrollTop.classList.remove('visible');
    }
});

scrollTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Scroll-triggered Animations with Intersection Observer and Staggered Delays
document.addEventListener('DOMContentLoaded', function () {
  const animatedSelectors = [
    '.fade-in',
    '.slide-up',
    '.slide-down',
    '.slide-left',
    '.slide-right',
    '.scale-in',
    '.shimmer',
    '.pulse'
  ];
  const animatedElements = Array.from(document.querySelectorAll(animatedSelectors.join(',')));

  // Staggered delay for card grids
  function getStaggerDelay(el) {
    // Cards in grids: service-card, team-card, blog__card, testimonial-card
    if (el.classList.contains('service-card') ||
        el.classList.contains('team-card') ||
        el.classList.contains('blog__card') ||
        el.classList.contains('testimonial-card')) {
      const parent = el.parentElement;
      const siblings = Array.from(parent.children).filter(child => child.classList.contains(el.classList[0]));
      const idx = siblings.indexOf(el);
      return idx * 100; // 100ms per card
    }
    return 0;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = getStaggerDelay(el);
        setTimeout(() => {
          el.classList.add('animated');
        }, delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.15
  });

  animatedElements.forEach(el => {
    observer.observe(el);
  });

  // Reduced motion support
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animatedElements.forEach(el => el.classList.add('animated'));
  }
});