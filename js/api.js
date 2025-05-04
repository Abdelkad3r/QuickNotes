// API Service for QuickNotes
// Determine the API URL based on the environment
let API_URL;

// Check if we're in production (on Render)
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // For production, use the environment variable or construct the URL
    // Render sets this automatically based on the render.yaml configuration
    API_URL = window.API_URL || 'https://quicknotes-api.onrender.com/api';
} else {
    // For local development
    API_URL = 'http://localhost:5000/api';
}

console.log('Using API URL:', API_URL);

// Helper function for making API requests
async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Add token to headers if available
    const token = localStorage.getItem('quicknotes-token');
    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    // Add body if data is provided
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${url}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Something went wrong');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    // Register a new user
    register: (userData) => {
        return apiRequest('/auth/register', 'POST', userData);
    },

    // Login a user
    login: (credentials) => {
        return apiRequest('/auth/login', 'POST', credentials);
    },

    // Refresh access token
    refreshToken: (refreshToken) => {
        return apiRequest('/auth/refresh-token', 'POST', { refreshToken });
    },

    // Logout user
    logout: (refreshToken) => {
        return apiRequest('/auth/logout', 'POST', { refreshToken });
    },

    // Verify email
    verifyEmail: (token) => {
        return apiRequest(`/auth/verify-email/${token}`, 'GET');
    },

    // Resend verification email
    resendVerification: () => {
        return apiRequest('/auth/resend-verification', 'POST');
    },

    // Forgot password
    forgotPassword: (email) => {
        return apiRequest('/auth/forgot-password', 'POST', { email });
    },

    // Reset password
    resetPassword: (token, password) => {
        return apiRequest(`/auth/reset-password/${token}`, 'POST', { password });
    },

    // Setup two-factor authentication
    setupTwoFactor: () => {
        return apiRequest('/auth/setup-2fa', 'POST');
    },

    // Verify and enable two-factor authentication
    verifyTwoFactor: (token) => {
        return apiRequest('/auth/verify-2fa', 'POST', { token });
    },

    // Disable two-factor authentication
    disableTwoFactor: (password) => {
        return apiRequest('/auth/disable-2fa', 'POST', { password });
    },

    // Get user profile
    getProfile: () => {
        return apiRequest('/users/profile');
    }
};

// Notes API
const notesAPI = {
    // Get all notes
    getNotes: () => {
        return apiRequest('/notes');
    },

    // Get a single note
    getNote: (id) => {
        return apiRequest(`/notes/${id}`);
    },

    // Create a new note
    createNote: (noteData) => {
        return apiRequest('/notes', 'POST', noteData);
    },

    // Update a note
    updateNote: (id, noteData) => {
        return apiRequest(`/notes/${id}`, 'PUT', noteData);
    },

    // Delete a note
    deleteNote: (id) => {
        return apiRequest(`/notes/${id}`, 'DELETE');
    }
};

// Export the API services
const API = {
    auth: authAPI,
    notes: notesAPI
};

export default API;
