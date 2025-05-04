// QuickNotes App - Main JavaScript

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

// App State
let notes = [];
let currentNoteId = null;
let darkMode = false;

// Initialize the app
function initApp() {
    loadNotes();
    renderNotesList();
    setupEventListeners();
    loadThemePreference();
    updateCharCount();
}

// Load notes from localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem('quicknotes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    } else {
        // Add a welcome note if no notes exist
        const welcomeNote = {
            id: generateId(),
            title: 'Welcome to QuickNotes!',
            content: 'This is a simple note-taking app. You can:\n\n• Create new notes\n• Edit existing notes\n• Delete notes you no longer need\n• Search through your notes\n• Toggle dark mode\n• Export notes as text files\n\nAll your notes are saved in your browser\'s local storage.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes = [welcomeNote];
        saveNotesToStorage();
    }
}

// Save notes to localStorage
function saveNotesToStorage() {
    localStorage.setItem('quicknotes', JSON.stringify(notes));
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
            noteCard.dataset.id = note.id;
            
            if (note.id === currentNoteId) {
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
                <button class="delete-note" data-id="${note.id}" title="Delete note">
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
    const note = notes.find(n => n.id === noteId);
    
    if (note) {
        noteTitle.value = note.title;
        noteContent.value = note.content;
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

// Save the current note
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (!content) {
        showNotification('Note content cannot be empty', true);
        return;
    }
    
    const now = new Date().toISOString();
    
    if (currentNoteId) {
        // Update existing note
        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title,
                content,
                updatedAt: now
            };
            showNotification('Note updated successfully');
        }
    } else {
        // Create new note
        const newNote = {
            id: generateId(),
            title,
            content,
            createdAt: now,
            updatedAt: now
        };
        notes.push(newNote);
        currentNoteId = newNote.id;
        showNotification('Note created successfully');
    }
    
    saveNotesToStorage();
    renderNotesList(searchInput.value);
}

// Delete a note
function deleteNote(noteId) {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        saveNotesToStorage();
        
        if (currentNoteId === noteId) {
            clearEditor();
        }
        
        renderNotesList(searchInput.value);
        showNotification('Note deleted successfully');
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
    
    const note = notes.find(n => n.id === currentNoteId);
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
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
