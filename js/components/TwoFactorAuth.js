// Two-Factor Authentication Component for QuickNotes
import API from '../api.js';

class TwoFactorAuth {
  constructor() {
    this.container = document.getElementById('two-factor-container');
    this.form = document.getElementById('two-factor-form');
    this.codeInput = document.getElementById('two-factor-code');
    this.submitBtn = document.getElementById('two-factor-submit');
    this.cancelBtn = document.getElementById('two-factor-cancel');
    this.message = document.getElementById('two-factor-message');
    
    this.pendingCredentials = null;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', this.hideForm.bind(this));
    }
  }
  
  showForm(credentials) {
    this.pendingCredentials = credentials;
    
    if (this.container) {
      this.container.classList.remove('hidden');
    }
    
    if (this.codeInput) {
      this.codeInput.value = '';
      this.codeInput.focus();
    }
    
    if (this.message) {
      this.message.textContent = 'Please enter the verification code from your authenticator app.';
      this.message.classList.remove('error');
    }
  }
  
  hideForm() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
    
    this.pendingCredentials = null;
  }
  
  showError(message) {
    if (this.message) {
      this.message.textContent = message;
      this.message.classList.add('error');
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (!this.pendingCredentials) {
      this.showError('Authentication error. Please try logging in again.');
      return;
    }
    
    const twoFactorCode = this.codeInput.value.trim();
    
    if (!twoFactorCode) {
      this.showError('Please enter the verification code.');
      return;
    }
    
    try {
      // Disable the submit button
      if (this.submitBtn) {
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Verifying...';
      }
      
      // Complete the login with the 2FA code
      const response = await API.auth.login({
        ...this.pendingCredentials,
        twoFactorCode
      });
      
      if (response.success) {
        // Hide the 2FA form
        this.hideForm();
        
        // Call the authentication success handler
        if (typeof window.handleAuthSuccess === 'function') {
          window.handleAuthSuccess(response.user, response.tokens.accessToken);
        }
      }
    } catch (error) {
      this.showError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      // Re-enable the submit button
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = 'Verify';
      }
    }
  }
}

export default TwoFactorAuth;
