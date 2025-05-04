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
        return apiRequest('/users/register', 'POST', userData);
    },

    // Login a user
    login: (credentials) => {
        return apiRequest('/users/login', 'POST', credentials);
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
