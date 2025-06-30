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

    function setTheme(mode) {
        if (mode === 'light') {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    }

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
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

// Export functions for global access
window.openLightbox = openLightbox;
window.generateCaptcha = generateCaptcha;