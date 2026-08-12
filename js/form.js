// Contact Form Module

class ContactForm {
  constructor(formElement) {
    this.form = formElement;
    this.nameField = this.form.querySelector('#name');
    this.emailField = this.form.querySelector('#email');
    this.messageField = this.form.querySelector('#message');
    this.honeypotField = this.form.querySelector('#honeypot');
    this.submitButton = this.form.querySelector('button[type="submit"]');
    this.messagesContainer = this.form.querySelector('.form-messages');
    
    this.init();
  }
  
  init() {
    // Set up real-time validation
    this.nameField.addEventListener('blur', () => this.validateField(this.nameField, 'name'));
    this.emailField.addEventListener('blur', () => this.validateField(this.emailField, 'email'));
    this.messageField.addEventListener('blur', () => this.validateField(this.messageField, 'message'));
    
    // Set up form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  validateField(field, type) {
    const value = field.value.trim();
    const errorElement = document.getElementById(`${type}-error`);
    let isValid = true;
    let errorMessage = '';
    
    switch(type) {
      case 'name':
        if (value.length < 2) {
          isValid = false;
          errorMessage = 'Name must be at least 2 characters';
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;
        
      case 'message':
        if (value.length < 10) {
          isValid = false;
          errorMessage = 'Message must be at least 10 characters';
        }
        break;
    }
    
    if (!isValid) {
      field.classList.add('error');
      field.classList.remove('success');
      errorElement.textContent = errorMessage;
      errorElement.classList.add('visible');
    } else {
      field.classList.remove('error');
      field.classList.add('success');
      errorElement.textContent = '';
      errorElement.classList.remove('visible');
    }
    
    return isValid;
  }
  
  validateForm() {
    const nameValid = this.validateField(this.nameField, 'name');
    const emailValid = this.validateField(this.emailField, 'email');
    const messageValid = this.validateField(this.messageField, 'message');
    
    // Check honeypot (should be empty)
    if (this.honeypotField.value !== '') {
      return false; // Likely spam
    }
    
    return nameValid && emailValid && messageValid;
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.validateForm()) {
      this.showMessage('error', 'Please correct the errors in the form');
      return;
    }
    
    // Preserve form data
    this.preserveFormData();
    
    // Show loading state
    this.setLoadingState(true);
    
    const formData = new FormData(this.form);
    
    try {
      const response = await this.submitWithTimeout(formData, 5000);
      const result = await response.json();
      
      if (response.ok && result.success) {
        this.showMessage('success', 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
        this.clearForm();
        this.clearStoredData();
        
        // Track successful submission
        if (window.gtag) {
          gtag('event', 'form_submit', {
            event_category: 'form',
            event_label: 'contact_form_success'
          });
        }
      } else {
        throw new Error(result.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoadingState(false);
    }
  }
  
  async submitWithTimeout(formData, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  handleError(error) {
    let errorMessage = 'Something went wrong. Please try again or contact us directly at: ';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      errorMessage = 'Unable to send message. Please check your internet connection.';
    } else if (error.message.includes('429')) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    }
    
    // Add email fallback if it's a network issue
    if (error.name === 'AbortError' || error.message.includes('Network')) {
      errorMessage += ' Or email us at: lf.digitalsolutions.official@gmail.com';
    }
    
    this.showMessage('error', errorMessage);
    
    // Track error
    if (window.gtag) {
      gtag('event', 'form_error', {
        event_category: 'form',
        event_label: error.message
      });
    }
  }
  
  setLoadingState(isLoading) {
    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.classList.add('loading');
    } else {
      this.submitButton.disabled = false;
      this.submitButton.classList.remove('loading');
    }
  }
  
  showMessage(type, message) {
    // Create toast notification instead of inline message
    this.showToast(type, message);
  }
  
  showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Determine title and icon based on type
    const title = type === 'success' ? 'Success!' : 'Error';
    const icon = type === 'success' ? '✓' : '✕';
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Set up close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.removeToast(toast));
    
    // Auto remove after 5 seconds
    setTimeout(() => this.removeToast(toast), 5000);
  }
  
  removeToast(toast) {
    if (!toast || !toast.parentElement) return;
    
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }
  
  preserveFormData() {
    const formData = {
      name: this.nameField.value,
      email: this.emailField.value,
      message: this.messageField.value
    };
    sessionStorage.setItem('contactFormData', JSON.stringify(formData));
  }
  
  restoreFormData() {
    const savedData = sessionStorage.getItem('contactFormData');
    if (savedData) {
      const formData = JSON.parse(savedData);
      this.nameField.value = formData.name || '';
      this.emailField.value = formData.email || '';
      this.messageField.value = formData.message || '';
    }
  }
  
  clearStoredData() {
    sessionStorage.removeItem('contactFormData');
  }
  
  clearForm() {
    this.form.reset();
    // Remove validation classes
    [this.nameField, this.emailField, this.messageField].forEach(field => {
      field.classList.remove('error', 'success');
    });
    // Hide error messages
    document.querySelectorAll('.error-message').forEach(el => {
      el.classList.remove('visible');
    });
  }
}

// Initialize form when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (form) {
      const contactForm = new ContactForm(form);
      // Restore form data if page was reloaded
      contactForm.restoreFormData();
    }
  });
} else {
  const form = document.getElementById('contact-form');
  if (form) {
    const contactForm = new ContactForm(form);
    contactForm.restoreFormData();
  }
}

