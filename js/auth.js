// Authentication module for QuickNotes
import API from './api.js';
import TwoFactorAuth from './components/TwoFactorAuth.js';

// DOM Elements
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const verifyEmailContainer = document.getElementById('verify-email-container');
const authToggle = document.getElementById('auth-toggle');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginLink = document.getElementById('back-to-login-link');
const resendVerificationBtn = document.getElementById('resend-verification-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const appContainer = document.getElementById('app-container');

// Initialize two-factor authentication
const twoFactorAuth = new TwoFactorAuth();

// State
let isAuthenticated = false;
let currentUser = null;

// Initialize authentication
function initAuth() {
    // Check for URL parameters (for email verification and password reset)
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify');
    const resetToken = urlParams.get('reset');

    if (verifyToken) {
        // Handle email verification
        handleEmailVerification(verifyToken);
        return;
    }

    if (resetToken) {
        // Show reset password form
        showResetPasswordForm(resetToken);
        return;
    }

    // Check if user is logged in
    const accessToken = localStorage.getItem('quicknotes-access-token');
    const refreshToken = localStorage.getItem('quicknotes-refresh-token');

    if (accessToken) {
        // Try to get user profile
        API.auth.getProfile()
            .then(response => {
                if (response.success) {
                    setAuthenticatedUser(response.user, { accessToken, refreshToken });
                } else {
                    // Try to refresh the token
                    refreshAccessToken();
                }
            })
            .catch(error => {
                if (error.message === 'Your token has expired. Please log in again' && refreshToken) {
                    // Try to refresh the token
                    refreshAccessToken();
                } else {
                    // Clear tokens and show login form
                    clearTokens();
                    showAuthForms();
                }
            });
    } else if (refreshToken) {
        // Try to refresh the token
        refreshAccessToken();
    } else {
        showAuthForms();
    }

    // Setup event listeners
    setupAuthListeners();

    // Make handleAuthSuccess available globally
    window.handleAuthSuccess = handleAuthSuccess;
}

// Refresh the access token
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('quicknotes-refresh-token');

    if (!refreshToken) {
        clearTokens();
        showAuthForms();
        return;
    }

    try {
        const response = await API.auth.refreshToken(refreshToken);

        if (response.success) {
            // Update the access token
            localStorage.setItem('quicknotes-access-token', response.accessToken);

            // Get the user profile
            const userResponse = await API.auth.getProfile();

            if (userResponse.success) {
                setAuthenticatedUser(userResponse.user, {
                    accessToken: response.accessToken,
                    refreshToken
                });
            } else {
                clearTokens();
                showAuthForms();
            }
        } else {
            clearTokens();
            showAuthForms();
        }
    } catch (error) {
        clearTokens();
        showAuthForms();
    }
}

// Handle email verification
async function handleEmailVerification(token) {
    try {
        const response = await API.auth.verifyEmail(token);

        if (response.success) {
            // Show verification success message
            if (verifyEmailContainer) {
                const messageElement = verifyEmailContainer.querySelector('.verify-email-message');
                if (messageElement) {
                    messageElement.textContent = 'Your email has been verified successfully. You can now log in.';
                    messageElement.classList.add('success');
                }

                verifyEmailContainer.classList.remove('hidden');
                authContainer.classList.add('hidden');
            } else {
                showNotification('Your email has been verified successfully. You can now log in.');
                showAuthForms();
            }
        } else {
            // Show verification error message
            if (verifyEmailContainer) {
                const messageElement = verifyEmailContainer.querySelector('.verify-email-message');
                if (messageElement) {
                    messageElement.textContent = 'Invalid or expired verification link. Please request a new one.';
                    messageElement.classList.add('error');
                }

                verifyEmailContainer.classList.remove('hidden');
                authContainer.classList.add('hidden');
            } else {
                showNotification('Invalid or expired verification link. Please request a new one.', true);
                showAuthForms();
            }
        }
    } catch (error) {
        // Show verification error message
        if (verifyEmailContainer) {
            const messageElement = verifyEmailContainer.querySelector('.verify-email-message');
            if (messageElement) {
                messageElement.textContent = error.message || 'An error occurred during email verification.';
                messageElement.classList.add('error');
            }

            verifyEmailContainer.classList.remove('hidden');
            authContainer.classList.add('hidden');
        } else {
            showNotification(error.message || 'An error occurred during email verification.', true);
            showAuthForms();
        }
    }
}

// Show reset password form
function showResetPasswordForm(token) {
    if (resetPasswordForm) {
        // Set the token as a data attribute
        resetPasswordForm.dataset.token = token;

        // Show the reset password form
        resetPasswordForm.classList.remove('hidden');
        authContainer.classList.add('hidden');
    } else {
        showNotification('Reset password form not found', true);
    }
}

// Clear all tokens
function clearTokens() {
    localStorage.removeItem('quicknotes-access-token');
    localStorage.removeItem('quicknotes-refresh-token');
}

// Handle successful authentication
function handleAuthSuccess(user, tokens) {
    if (typeof tokens === 'string') {
        // For backward compatibility
        setAuthenticatedUser(user, { accessToken: tokens });
    } else {
        setAuthenticatedUser(user, tokens);
    }
    showNotification('Logged in successfully');
}

// Setup authentication-related event listeners
function setupAuthListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await API.auth.login({ email, password });

                if (response.success) {
                    if (response.requiresTwoFactor) {
                        // Show 2FA form
                        twoFactorAuth.showForm({ email, password });
                    } else {
                        handleAuthSuccess(response.user, response.tokens);
                    }
                }
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            // Validate passwords match
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', true);
                return;
            }

            try {
                const response = await API.auth.register({ username, email, password });

                if (response.success) {
                    handleAuthSuccess(response.user, response.tokens);
                    showNotification('Account created successfully. Please check your email to verify your account.');
                }
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }

    // Forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('forgot-password-email').value;

            try {
                const response = await API.auth.forgotPassword(email);

                if (response.success) {
                    showNotification('Password reset email sent. Please check your inbox.');
                    showAuthForms(); // Go back to login form
                }
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }

    // Reset password form submission
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('reset-password').value;
            const confirmPassword = document.getElementById('reset-confirm-password').value;
            const token = resetPasswordForm.dataset.token;

            // Validate passwords match
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', true);
                return;
            }

            try {
                const response = await API.auth.resetPassword(token, password);

                if (response.success) {
                    showNotification('Password reset successful. You can now log in with your new password.');
                    showAuthForms(); // Go back to login form
                }
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }

    // Resend verification email button
    if (resendVerificationBtn) {
        resendVerificationBtn.addEventListener('click', async () => {
            try {
                const response = await API.auth.resendVerification();

                if (response.success) {
                    showNotification('Verification email sent. Please check your inbox.');
                }
            } catch (error) {
                showNotification(error.message, true);
            }
        });
    }

    // Toggle between login and register forms
    if (authToggle) {
        authToggle.addEventListener('click', () => {
            if (forgotPasswordForm && !forgotPasswordForm.classList.contains('hidden')) {
                // If forgot password form is visible, show login form
                forgotPasswordForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                authToggle.textContent = 'Need an account? Register';
            } else {
                // Toggle between login and register forms
                loginForm.classList.toggle('hidden');
                registerForm.classList.toggle('hidden');

                // Update toggle text
                if (loginForm.classList.contains('hidden')) {
                    authToggle.textContent = 'Already have an account? Login';
                } else {
                    authToggle.textContent = 'Need an account? Register';
                }
            }
        });
    }

    // Forgot password link
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Hide login form and show forgot password form
            loginForm.classList.add('hidden');
            forgotPasswordForm.classList.remove('hidden');

            // Update toggle text
            if (authToggle) {
                authToggle.textContent = 'Back to login';
            }
        });
    }

    // Back to login link
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Show login form and hide other forms
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            forgotPasswordForm.classList.add('hidden');

            // Update toggle text
            if (authToggle) {
                authToggle.textContent = 'Need an account? Register';
            }
        });
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
        });
    }
}

// Set authenticated user
function setAuthenticatedUser(user, tokens) {
    isAuthenticated = true;
    currentUser = user;

    // Save tokens to localStorage
    if (typeof tokens === 'string') {
        // For backward compatibility
        localStorage.setItem('quicknotes-access-token', tokens);
    } else {
        if (tokens.accessToken) {
            localStorage.setItem('quicknotes-access-token', tokens.accessToken);
        }
        if (tokens.refreshToken) {
            localStorage.setItem('quicknotes-refresh-token', tokens.refreshToken);
        }
    }

    // Update UI
    if (userInfo) {
        userInfo.textContent = `${user.username}`;

        // Add verification badge if email is verified
        if (user.isEmailVerified) {
            const verifiedBadge = document.createElement('span');
            verifiedBadge.className = 'verified-badge';
            verifiedBadge.title = 'Email verified';
            verifiedBadge.innerHTML = '<i class="fas fa-check-circle"></i>';
            userInfo.appendChild(verifiedBadge);
        }
    }

    // Hide auth forms and show app
    if (authContainer) authContainer.classList.add('hidden');
    if (verifyEmailContainer) verifyEmailContainer.classList.add('hidden');
    if (appContainer) appContainer.classList.remove('hidden');

    // Load user's notes
    if (typeof loadNotes === 'function') {
        loadNotes();
    }
}

// Logout user
async function logout() {
    try {
        // Get refresh token
        const refreshToken = localStorage.getItem('quicknotes-refresh-token');

        // Call logout API if refresh token exists
        if (refreshToken) {
            await API.auth.logout(refreshToken);
        }
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        isAuthenticated = false;
        currentUser = null;

        // Clear tokens
        clearTokens();

        // Clear notes
        if (typeof clearNotes === 'function') {
            clearNotes();
        }

        // Show auth forms and hide app
        showAuthForms();
    }
}

// Show authentication forms
function showAuthForms() {
    if (authContainer) authContainer.classList.remove('hidden');
    if (verifyEmailContainer) verifyEmailContainer.classList.add('hidden');
    if (resetPasswordForm) resetPasswordForm.classList.add('hidden');
    if (appContainer) appContainer.classList.add('hidden');

    // Default to showing login form
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
    if (authToggle) authToggle.textContent = 'Need an account? Register';
}

// Check if user is authenticated
function isUserAuthenticated() {
    return isAuthenticated;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Show notification
function showNotification(message, isError = false) {
    // Check if notification function exists in the global scope
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, isError);
    } else {
        // Fallback to alert
        if (isError) {
            alert(`Error: ${message}`);
        } else {
            alert(message);
        }
    }
}

// Export auth functions
export {
    initAuth,
    isUserAuthenticated,
    getCurrentUser,
    logout
};
