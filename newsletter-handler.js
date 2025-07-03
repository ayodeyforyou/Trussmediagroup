// newsletter-handler.js
// Handles newsletter signup for both Netlify and Hostinger
(function(){
  const form = document.querySelector('.newsletter-signup__form');
  if (!form) return;
  const status = document.getElementById('newsletterStatus');
  const btn = form.querySelector('button[type="submit"]');
  function setLoading(loading) {
    if (loading) {
      btn.disabled = true;
      btn.textContent = 'Subscribing...';
    } else {
      btn.disabled = false;
      btn.textContent = 'Subscribe';
    }
  }
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    setLoading(true);
    status.textContent = '';
    const data = new FormData(form);
    if (form.hasAttribute('data-netlify')) {
      fetch('/', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/x-www-form-urlencoded' }
      })
      .then(res => res.ok ? res : Promise.reject(res))
      .then(() => {
        setLoading(false);
        status.textContent = 'Thank you for subscribing! Please check your email to confirm.';
        form.reset();
      })
      .catch(() => {
        setLoading(false);
        status.textContent = 'Subscription failed. Please try again.';
      });
    } else {
      fetch('process-newsletter.php', {
        method: 'POST',
        body: data
      })
      .then(res => res.text())
      .then(msg => {
        setLoading(false);
        status.textContent = msg;
        form.reset();
      })
      .catch(() => {
        setLoading(false);
        status.textContent = 'Subscription failed. Please try again.';
      });
    }
  });
})();
