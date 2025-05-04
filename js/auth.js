// Authentication module for QuickNotes
import API from './api.js';

// DOM Elements
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authToggle = document.getElementById('auth-toggle');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const appContainer = document.getElementById('app-container');

// State
let isAuthenticated = false;
let currentUser = null;

// Initialize authentication
function initAuth() {
    // Check if user is logged in
    const token = localStorage.getItem('quicknotes-token');
    
    if (token) {
        // Try to get user profile
        API.auth.getProfile()
            .then(response => {
                if (response.success) {
                    setAuthenticatedUser(response.user, token);
                } else {
                    showAuthForms();
                }
            })
            .catch(() => {
                // If there's an error, clear token and show login form
                localStorage.removeItem('quicknotes-token');
                showAuthForms();
            });
    } else {
        showAuthForms();
    }
    
    // Setup event listeners
    setupAuthListeners();
}

// Setup authentication-related event listeners
function setupAuthListeners() {
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await API.auth.login({ email, password });
            
            if (response.success) {
                setAuthenticatedUser(response.user, response.token);
                showNotification('Logged in successfully');
            }
        } catch (error) {
            showNotification(error.message, true);
        }
    });
    
    // Register form submission
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
                setAuthenticatedUser(response.user, response.token);
                showNotification('Account created successfully');
            }
        } catch (error) {
            showNotification(error.message, true);
        }
    });
    
    // Toggle between login and register forms
    authToggle.addEventListener('click', () => {
        loginForm.classList.toggle('hidden');
        registerForm.classList.toggle('hidden');
        
        // Update toggle text
        if (loginForm.classList.contains('hidden')) {
            authToggle.textContent = 'Already have an account? Login';
        } else {
            authToggle.textContent = 'Need an account? Register';
        }
    });
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

// Set authenticated user
function setAuthenticatedUser(user, token) {
    isAuthenticated = true;
    currentUser = user;
    
    // Save token to localStorage
    localStorage.setItem('quicknotes-token', token);
    
    // Update UI
    if (userInfo) {
        userInfo.textContent = `${user.username}`;
    }
    
    // Hide auth forms and show app
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    
    // Load user's notes
    if (typeof loadNotes === 'function') {
        loadNotes();
    }
}

// Logout user
function logout() {
    isAuthenticated = false;
    currentUser = null;
    
    // Remove token from localStorage
    localStorage.removeItem('quicknotes-token');
    
    // Clear notes
    if (typeof clearNotes === 'function') {
        clearNotes();
    }
    
    // Show auth forms and hide app
    showAuthForms();
}

// Show authentication forms
function showAuthForms() {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    
    // Default to showing login form
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authToggle.textContent = 'Need an account? Register';
}

// Check if user is authenticated
function isUserAuthenticated() {
    return isAuthenticated;
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Export auth functions
export {
    initAuth,
    isUserAuthenticated,
    getCurrentUser,
    logout
};
