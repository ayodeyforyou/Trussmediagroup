// form-validation.js
// Real-time validation for media website forms
(function(){
  function showError(input, message) {
    input.classList.add('form-error');
    let error = input.parentNode.querySelector('.form-error-msg');
    if (!error) {
      error = document.createElement('div');
      error.className = 'form-error-msg';
      input.parentNode.appendChild(error);
    }
    error.textContent = message;
  }
  function clearError(input) {
    input.classList.remove('form-error');
    let error = input.parentNode.querySelector('.form-error-msg');
    if (error) error.textContent = '';
  }
  function validateInput(input) {
    if (input.required && !input.value.trim()) {
      showError(input, 'This field is required.');
      return false;
    }
    if (input.type === 'email' && input.value) {
      const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!re.test(input.value)) {
        showError(input, 'Please enter a valid email.');
        return false;
      }
    }
    clearError(input);
    return true;
  }
  document.querySelectorAll('form').forEach(form => {
    form.querySelectorAll('input,textarea').forEach(input => {
      input.addEventListener('input', () => validateInput(input));
      input.addEventListener('blur', () => validateInput(input));
    });
    form.addEventListener('submit', function(e) {
      let valid = true;
      form.querySelectorAll('input,textarea').forEach(input => {
        if (!validateInput(input)) valid = false;
      });
      if (!valid) e.preventDefault();
    });
  });
})();
