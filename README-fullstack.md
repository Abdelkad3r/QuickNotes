# QuickNotes - Full Stack Note-Taking Application

QuickNotes is a simple yet powerful note-taking application with both frontend and backend components. It allows users to create, edit, and manage notes with a clean, responsive interface.

## Features

### Core Features
- User authentication (register, login, logout)
- Create, read, update, and delete notes
- Notes synchronized between devices
- Offline support with local storage
- Responsive design for all device sizes

### Additional Features
- Dark mode toggle
- Search/filter notes
- Export notes to .txt file
- Character count
- Keyboard shortcuts (Ctrl+S to save)
- Sync status indicator

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage for offline data persistence
- Font Awesome for icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
QuickNotes/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── noteController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Note.js
│   │   └── User.js
│   ├── routes/
│   │   ├── noteRoutes.js
│   │   └── userRoutes.js
│   ├── .env
│   ├── package.json
│   ├── README.md
│   └── server.js
├── css/
│   ├── auth-styles.css
│   └── styles.css
├── js/
│   ├── api.js
│   ├── app.js
│   ├── app-with-backend.js
│   └── auth.js
├── assets/
│   └── favicon.png
├── index.html
├── index-with-backend.html
└── README.md
```

## Setup and Installation

### Prerequisites
- Node.js and npm
- MongoDB (local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/quicknotes
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   NODE_ENV=development
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Open `index-with-backend.html` in your browser to use the full-stack version
2. Or open `index.html` to use the localStorage-only version

## API Endpoints

### User Routes
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile (protected)

### Note Routes
- `GET /api/notes` - Get all notes for the authenticated user
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Offline Support

QuickNotes provides offline support through:
1. LocalStorage backup of all notes
2. Sync queue for operations performed while offline
3. Automatic synchronization when connection is restored
4. Visual indicator of online/offline status

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:
1. User registers or logs in
2. Server returns a JWT token
3. Token is stored in localStorage
4. Token is included in all API requests
5. Protected routes verify the token before processing requests

## Usage

### Creating a Note
1. Enter a title in the "Note Title" field
2. Write your note content in the text area
3. Click "Save" or press Ctrl+S/Cmd+S

### Editing a Note
1. Click on a note in the sidebar
2. Make your changes
3. Click "Save" or press Ctrl+S/Cmd+S

### Deleting a Note
1. Click the trash icon on a note in the sidebar
2. Confirm deletion in the dialog

### Searching Notes
Type in the search box to filter notes by title or content

### Toggling Dark Mode
Click the moon/sun icon in the header

### Exporting a Note
1. Select a note
2. Click the "Export" button to download as a text file

## License

This project is open source and available under the MIT License.
