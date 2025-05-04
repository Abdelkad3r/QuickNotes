// QuickNotes App - Main JavaScript with Backend Integration
import API from './api.js';
import { initAuth, isUserAuthenticated, getCurrentUser } from './auth.js';

// DOM Elements
const notesList = document.getElementById('notes-list');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const saveNoteBtn = document.getElementById('save-note');
const clearNoteBtn = document.getElementById('clear-note');
const exportNoteBtn = document.getElementById('export-note');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');
const charCount = document.getElementById('char-count');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const confirmDialog = document.getElementById('confirm-dialog');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const syncStatusIndicator = document.getElementById('sync-status');

// App State
let notes = [];
let currentNoteId = null;
let darkMode = false;
let isOnline = navigator.onLine;
let syncQueue = [];

// Initialize the app
function initApp() {
    // Initialize authentication
    initAuth();
    
    // Check online status
    updateOnlineStatus();
    
    // Load notes if authenticated
    if (isUserAuthenticated()) {
        loadNotes();
    } else {
        // Load from localStorage as fallback
        loadNotesFromLocalStorage();
    }
    
    renderNotesList();
    setupEventListeners();
    loadThemePreference();
    updateCharCount();
    
    // Load sync queue from localStorage
    loadSyncQueue();
}

// Update online status indicator
function updateOnlineStatus() {
    isOnline = navigator.onLine;
    if (syncStatusIndicator) {
        if (isOnline) {
            syncStatusIndicator.innerHTML = '<i class="fas fa-wifi"></i>';
            syncStatusIndicator.title = 'Online - Changes will sync to server';
            syncStatusIndicator.classList.remove('offline');
            
            // Process sync queue if we're online
            processSyncQueue();
        } else {
            syncStatusIndicator.innerHTML = '<i class="fas fa-wifi-slash"></i>';
            syncStatusIndicator.title = 'Offline - Changes will sync when online';
            syncStatusIndicator.classList.add('offline');
        }
    }
}

// Load notes from the backend API
async function loadNotes() {
    try {
        if (isUserAuthenticated() && isOnline) {
            const response = await API.notes.getNotes();
            if (response.success) {
                notes = response.data;
                // Also save to localStorage as backup
                saveNotesToStorage();
                renderNotesList(searchInput.value);
            }
        } else {
            // Fallback to localStorage if offline or not authenticated
            loadNotesFromLocalStorage();
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        showNotification('Failed to load notes from server. Using local data.', true);
        loadNotesFromLocalStorage();
    }
}

// Load notes from localStorage
function loadNotesFromLocalStorage() {
    const savedNotes = localStorage.getItem('quicknotes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    } else {
        // Add a welcome note if no notes exist
        const welcomeNote = {
            id: generateId(),
            title: 'Welcome to QuickNotes!',
            content: 'This is a simple note-taking app. You can:\n\n• Create new notes\n• Edit existing notes\n• Delete notes you no longer need\n• Search through your notes\n• Toggle dark mode\n• Export notes as text files\n\nYour notes are saved to the server when online, and to your browser\'s local storage when offline.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes = [welcomeNote];
        saveNotesToStorage();
    }
    renderNotesList(searchInput.value);
}

// Save notes to localStorage
function saveNotesToStorage() {
    localStorage.setItem('quicknotes', JSON.stringify(notes));
}

// Load sync queue from localStorage
function loadSyncQueue() {
    const savedQueue = localStorage.getItem('quicknotes-sync-queue');
    if (savedQueue) {
        syncQueue = JSON.parse(savedQueue);
    }
}

// Save sync queue to localStorage
function saveSyncQueue() {
    localStorage.setItem('quicknotes-sync-queue', JSON.stringify(syncQueue));
}

// Add an operation to the sync queue
function addToSyncQueue(operation, noteId, noteData) {
    syncQueue.push({
        operation,
        noteId,
        noteData,
        timestamp: Date.now()
    });
    saveSyncQueue();
}

// Process the sync queue when online
async function processSyncQueue() {
    if (!isOnline || !isUserAuthenticated() || syncQueue.length === 0) {
        return;
    }
    
    // Process each item in the queue
    const newQueue = [];
    
    for (const item of syncQueue) {
        try {
            switch (item.operation) {
                case 'create':
                    await API.notes.createNote(item.noteData);
                    break;
                case 'update':
                    await API.notes.updateNote(item.noteId, item.noteData);
                    break;
                case 'delete':
                    await API.notes.deleteNote(item.noteId);
                    break;
            }
        } catch (error) {
            console.error(`Failed to process sync operation: ${item.operation}`, error);
            newQueue.push(item);
        }
    }
    
    // Update the queue with only failed operations
    syncQueue = newQueue;
    saveSyncQueue();
    
    // Reload notes from server if queue was processed
    if (newQueue.length < syncQueue.length) {
        loadNotes();
    }
}

// Generate a unique ID for notes
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Render the notes list
function renderNotesList(searchTerm = '') {
    notesList.innerHTML = '';
    
    let filteredNotes = notes;
    
    // Filter notes if search term exists
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(term) || 
            note.content.toLowerCase().includes(term)
        );
    }
    
    // Sort notes by updated date (newest first)
    filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    if (filteredNotes.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-notes';
        
        if (searchTerm) {
            emptyState.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No notes match your search</p>
            `;
        } else {
            emptyState.innerHTML = `
                <i class="fas fa-sticky-note"></i>
                <p>No notes yet. Create your first note!</p>
            `;
        }
        
        notesList.appendChild(emptyState);
    } else {
        // Render each note
        filteredNotes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.dataset.id = note.id || note._id; // Support both local and server IDs
            
            if ((note.id || note._id) === currentNoteId) {
                noteCard.classList.add('active');
            }
            
            // Format the date
            const updatedDate = new Date(note.updatedAt);
            const formattedDate = updatedDate.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Create a preview of the content (first 100 characters)
            const contentPreview = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
            
            noteCard.innerHTML = `
                <h3>${note.title || 'Untitled Note'}</h3>
                <p>${contentPreview}</p>
                <div class="note-date">${formattedDate}</div>
                <button class="delete-note" data-id="${note.id || note._id}" title="Delete note">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            notesList.appendChild(noteCard);
        });
        
        // Add event listeners to the note cards and delete buttons
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Ignore clicks on the delete button
                if (!e.target.closest('.delete-note')) {
                    selectNote(card.dataset.id);
                }
            });
        });
        
        document.querySelectorAll('.delete-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showDeleteConfirmation(btn.dataset.id);
            });
        });
    }
}

// Select a note to edit
function selectNote(noteId) {
    currentNoteId = noteId;
    const note = notes.find(n => (n.id || n._id) === noteId);
    
    if (note) {
        noteTitle.value = note.title || '';
        noteContent.value = note.content || '';
        updateCharCount();
        
        // Update active state in the UI
        document.querySelectorAll('.note-card').forEach(card => {
            card.classList.toggle('active', card.dataset.id === noteId);
        });
    }
}

// Clear the editor
function clearEditor() {
    currentNoteId = null;
    noteTitle.value = '';
    noteContent.value = '';
    updateCharCount();
    
    // Remove active state from all notes
    document.querySelectorAll('.note-card').forEach(card => {
        card.classList.remove('active');
    });
}

// Clear all notes (used when logging out)
function clearNotes() {
    notes = [];
    currentNoteId = null;
    renderNotesList();
    clearEditor();
}

// Save the current note
async function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!content) {
        showNotification('Note content cannot be empty', true);
        return;
    }
    
    const now = new Date().toISOString();
    
    if (currentNoteId) {
        // Update existing note
        const noteIndex = notes.findIndex(n => (n.id || n._id) === currentNoteId);
        if (noteIndex !== -1) {
            const updatedNote = {
                ...notes[noteIndex],
                title,
                content,
                updatedAt: now
            };
            
            notes[noteIndex] = updatedNote;
            
            // Save to server if online and authenticated
            if (isOnline && isUserAuthenticated()) {
                try {
                    await API.notes.updateNote(currentNoteId, { title, content });
                    showNotification('Note updated successfully');
                } catch (error) {
                    console.error('Error updating note:', error);
                    showNotification('Failed to update note on server. Will sync later.', true);
                    // Add to sync queue
                    addToSyncQueue('update', currentNoteId, { title, content });
                }
            } else {
                // Add to sync queue if offline
                addToSyncQueue('update', currentNoteId, { title, content });
                showNotification('Note updated locally. Will sync when online.');
            }
        }
    } else {
        // Create new note
        const newNote = {
            id: generateId(), // Local ID
            title,
            content,
            createdAt: now,
            updatedAt: now
        };
        
        notes.push(newNote);
        currentNoteId = newNote.id;
        
        // Save to server if online and authenticated
        if (isOnline && isUserAuthenticated()) {
            try {
                const response = await API.notes.createNote({ title, content });
                // Update the local note with the server ID
                if (response.success) {
                    const serverNote = response.data;
                    const noteIndex = notes.findIndex(n => n.id === newNote.id);
                    if (noteIndex !== -1) {
                        notes[noteIndex] = {
                            ...serverNote,
                            id: serverNote._id // Ensure we have an id property
                        };
                        currentNoteId = serverNote._id;
                    }
                }
                showNotification('Note created successfully');
            } catch (error) {
                console.error('Error creating note:', error);
                showNotification('Failed to save note to server. Will sync later.', true);
                // Add to sync queue
                addToSyncQueue('create', null, { title, content });
            }
        } else {
            // Add to sync queue if offline
            addToSyncQueue('create', null, { title, content });
            showNotification('Note created locally. Will sync when online.');
        }
    }
    
    // Always save to localStorage as backup
    saveNotesToStorage();
    renderNotesList(searchInput.value);
}

// Delete a note
async function deleteNote(noteId) {
    const noteIndex = notes.findIndex(n => (n.id || n._id) === noteId);
    if (noteIndex !== -1) {
        // Remove from local array
        const deletedNote = notes.splice(noteIndex, 1)[0];
        
        // Delete from server if online and authenticated
        if (isOnline && isUserAuthenticated()) {
            try {
                await API.notes.deleteNote(noteId);
                showNotification('Note deleted successfully');
            } catch (error) {
                console.error('Error deleting note:', error);
                showNotification('Failed to delete note from server. Will sync later.', true);
                // Add to sync queue
                addToSyncQueue('delete', noteId, null);
            }
        } else {
            // Add to sync queue if offline
            addToSyncQueue('delete', noteId, null);
            showNotification('Note deleted locally. Will sync when online.');
        }
        
        // Clear editor if the deleted note was selected
        if (currentNoteId === noteId) {
            clearEditor();
        }
        
        // Always update localStorage
        saveNotesToStorage();
        renderNotesList(searchInput.value);
    }
}

// Show delete confirmation dialog
function showDeleteConfirmation(noteId) {
    confirmDialog.classList.add('show');
    
    // Store the note ID to be deleted
    confirmDeleteBtn.dataset.noteId = noteId;
}

// Export note as text file
function exportNote() {
    if (!currentNoteId) {
        showNotification('No note selected to export', true);
        return;
    }
    
    const note = notes.find(n => (n.id || n._id) === currentNoteId);
    if (!note) return;
    
    const filename = `${note.title || 'Untitled Note'}.txt`;
    const content = `${note.title || 'Untitled Note'}\n\n${note.content}\n\nCreated: ${new Date(note.createdAt).toLocaleString()}\nLast Updated: ${new Date(note.updatedAt).toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Note exported successfully');
}

// Show notification
function showNotification(message, isError = false) {
    notificationMessage.textContent = message;
    notification.classList.toggle('error', isError);
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Toggle dark mode
function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-theme', darkMode);
    
    // Update the icon
    themeToggle.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Save preference
    localStorage.setItem('quicknotes-dark-mode', darkMode);
}

// Load theme preference
function loadThemePreference() {
    const savedPreference = localStorage.getItem('quicknotes-dark-mode');
    if (savedPreference !== null) {
        darkMode = savedPreference === 'true';
        document.body.classList.toggle('dark-theme', darkMode);
        themeToggle.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// Update character count
function updateCharCount() {
    const count = noteContent.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

// Setup event listeners
function setupEventListeners() {
    // Save note
    saveNoteBtn.addEventListener('click', saveNote);
    
    // Clear editor
    clearNoteBtn.addEventListener('click', clearEditor);
    
    // Export note
    exportNoteBtn.addEventListener('click', exportNote);
    
    // Search notes
    searchInput.addEventListener('input', (e) => {
        renderNotesList(e.target.value);
    });
    
    // Toggle theme
    themeToggle.addEventListener('click', toggleDarkMode);
    
    // Character count
    noteContent.addEventListener('input', updateCharCount);
    
    // Confirm delete
    confirmDeleteBtn.addEventListener('click', () => {
        const noteId = confirmDeleteBtn.dataset.noteId;
        if (noteId) {
            deleteNote(noteId);
        }
        confirmDialog.classList.remove('show');
    });
    
    // Cancel delete
    cancelDeleteBtn.addEventListener('click', () => {
        confirmDialog.classList.remove('show');
    });
    
    // Close dialog when clicking outside
    confirmDialog.addEventListener('click', (e) => {
        if (e.target === confirmDialog) {
            confirmDialog.classList.remove('show');
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Save with Ctrl+S or Cmd+S
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveNote();
        }
        
        // Close dialog with Escape
        if (e.key === 'Escape' && confirmDialog.classList.contains('show')) {
            confirmDialog.classList.remove('show');
        }
    });
    
    // Online/offline status
    window.addEventListener('online', () => {
        updateOnlineStatus();
        showNotification('You are back online. Syncing notes...');
    });
    
    window.addEventListener('offline', () => {
        updateOnlineStatus();
        showNotification('You are offline. Changes will be saved locally.', true);
    });
}

// Export functions for use in auth.js
export {
    loadNotes,
    clearNotes
};

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
