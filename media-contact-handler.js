// media-contact-handler.js
// Handles media contact form for both Netlify and Hostinger
(function(){
  const form = document.querySelector('#contactForm');
  if (!form) return;
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const spinner = document.getElementById('spinner');

  function setLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      spinner.style.display = 'inline-block';
      submitText.textContent = 'Sending...';
    } else {
      submitBtn.disabled = false;
      spinner.style.display = 'none';
      submitText.textContent = 'Send Message';
    }
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    setLoading(true);
    status.textContent = '';
    const data = new FormData(form);
    // Detect Netlify
    if (form.hasAttribute('data-netlify')) {
      fetch('/', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/x-www-form-urlencoded' }
      })
      .then(res => res.ok ? res : Promise.reject(res))
      .then(() => {
        setLoading(false);
        status.textContent = 'Thank you for contacting us. We will respond soon.';
        form.reset();
      })
      .catch(() => {
        setLoading(false);
        status.textContent = 'Submission failed. Please try again.';
      });
    } else {
      // Hostinger/PHP
      fetch('process-contact.php', {
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
        status.textContent = 'Submission failed. Please try again.';
      });
    }
  });
})();
