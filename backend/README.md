# QuickNotes Backend API

This is the backend API for the QuickNotes application. It provides endpoints for user authentication, note management, and advanced features like note sharing, categorization, and user preferences.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/quicknotes
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   NODE_ENV=development
   ```

3. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### User Routes

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/preferences` - Update user preferences (protected)
- `PUT /api/users/password` - Change user password (protected)

### Note Routes

All note routes are protected and require authentication.

#### Core Note Operations
- `GET /api/notes` - Get all notes for the authenticated user (with filtering options)
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

#### Note Sharing
- `POST /api/notes/:id/share` - Share a note with another user
- `DELETE /api/notes/:id/share/:userId` - Remove share access for a user

#### Categories and Tags
- `GET /api/notes/categories` - Get all categories with counts
- `GET /api/notes/tags` - Get all tags with counts

#### Statistics
- `GET /api/notes/stats` - Get note statistics

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes, include the token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN
```

## Data Models

### User

- `username` - String (required, unique)
- `email` - String (required, unique)
- `password` - String (required, min length 6)
- `preferences` - Object (user preferences)
  - `theme` - String (light, dark, system)
  - `defaultView` - String (list, grid)
  - `defaultSort` - String (newest, oldest, title, category)
  - `defaultCategory` - String
  - `fontSize` - String (small, medium, large)
  - `showDateCreated` - Boolean
  - `showDateUpdated` - Boolean
  - `autoSave` - Boolean
  - `notificationSettings` - Object
    - `emailNotifications` - Boolean
    - `sharedNotes` - Boolean
- `bio` - String (user biography)
- `avatar` - String (avatar URL)
- `createdAt` - Date
- `lastLogin` - Date

### Note

- `title` - String (default: "Untitled Note")
- `content` - String (required)
- `category` - String (default: "Uncategorized")
- `tags` - Array of Strings
- `color` - String (hex color code)
- `isPinned` - Boolean
- `isArchived` - Boolean
- `user` - ObjectId (reference to User)
- `sharedWith` - Array of Objects
  - `user` - ObjectId (reference to User)
  - `permission` - String (read, write)
- `createdAt` - Date
- `updatedAt` - Date

## Error Handling

The API returns appropriate status codes and error messages in JSON format:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Success Responses

Successful responses include a success flag and the requested data:

```json
{
  "success": true,
  "data": { ... }
}
```

## Advanced Features

### Note Sharing
Users can share notes with other users by email address. Shared notes can have read or write permissions.

### Categories and Tags
Notes can be organized with categories and tags. The API provides endpoints to retrieve all categories and tags with counts.

### User Preferences
Users can customize their experience with preferences for theme, default view, sorting, and more.

### Note Statistics
The API provides statistics about a user's notes, including counts by category, pinned notes, shared notes, and more.

## Documentation

For detailed API documentation, see the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file.
