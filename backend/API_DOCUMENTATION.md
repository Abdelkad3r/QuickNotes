# QuickNotes API Documentation

This document provides detailed information about the QuickNotes API endpoints, request/response formats, and authentication requirements.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT). Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

## User Endpoints

### Register User

- **URL**: `/users/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "JWT_TOKEN"
  }
  ```

### Login User

- **URL**: `/users/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "preferences": {
        "theme": "light",
        "defaultView": "list",
        "defaultSort": "newest",
        "defaultCategory": "Uncategorized",
        "fontSize": "medium",
        "showDateCreated": true,
        "showDateUpdated": true,
        "autoSave": true,
        "notificationSettings": {
          "emailNotifications": false,
          "sharedNotes": true
        }
      },
      "bio": "User bio",
      "avatar": "avatar_url",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastLogin": "2023-01-01T00:00:00.000Z"
    },
    "token": "JWT_TOKEN"
  }
  ```

### Get User Profile

- **URL**: `/users/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "username": "johndoe",
      "email": "john@example.com",
      "preferences": {
        "theme": "light",
        "defaultView": "list",
        "defaultSort": "newest",
        "defaultCategory": "Uncategorized",
        "fontSize": "medium",
        "showDateCreated": true,
        "showDateUpdated": true,
        "autoSave": true,
        "notificationSettings": {
          "emailNotifications": false,
          "sharedNotes": true
        }
      },
      "bio": "User bio",
      "avatar": "avatar_url",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastLogin": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Update User Profile

- **URL**: `/users/profile`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "username": "johndoe_updated",
    "email": "john_updated@example.com",
    "bio": "Updated bio",
    "avatar": "new_avatar_url"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user_id",
      "username": "johndoe_updated",
      "email": "john_updated@example.com",
      "preferences": { ... },
      "bio": "Updated bio",
      "avatar": "new_avatar_url",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "lastLogin": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Update User Preferences

- **URL**: `/users/preferences`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "theme": "dark",
    "defaultView": "grid",
    "fontSize": "large",
    "notificationSettings": {
      "emailNotifications": true
    }
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "preferences": {
      "theme": "dark",
      "defaultView": "grid",
      "defaultSort": "newest",
      "defaultCategory": "Uncategorized",
      "fontSize": "large",
      "showDateCreated": true,
      "showDateUpdated": true,
      "autoSave": true,
      "notificationSettings": {
        "emailNotifications": true,
        "sharedNotes": true
      }
    }
  }
  ```

### Change Password

- **URL**: `/users/password`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

## Note Endpoints

### Get All Notes

- **URL**: `/notes`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `category`: Filter by category
  - `tag`: Filter by tag
  - `pinned`: Filter by pinned status (true/false)
  - `archived`: Filter by archived status (true/false)
  - `search`: Search in title and content
  - `sort`: Sort by (newest, oldest, title, category)
- **Success Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "categories": ["Work", "Personal", "Uncategorized"],
    "tags": ["important", "todo", "idea"],
    "data": [
      {
        "_id": "note_id_1",
        "title": "Note 1",
        "content": "Note content",
        "category": "Work",
        "tags": ["important", "todo"],
        "color": "#ffffff",
        "isPinned": true,
        "isArchived": false,
        "user": "user_id",
        "sharedWith": [
          {
            "user": {
              "_id": "user_id_2",
              "username": "janedoe",
              "email": "jane@example.com"
            },
            "permission": "read"
          }
        ],
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "_id": "note_id_2",
        "title": "Note 2",
        "content": "Another note content",
        "category": "Personal",
        "tags": ["idea"],
        "color": "#f8f8f8",
        "isPinned": false,
        "isArchived": false,
        "user": "user_id",
        "sharedWith": [],
        "createdAt": "2023-01-02T00:00:00.000Z",
        "updatedAt": "2023-01-02T00:00:00.000Z"
      }
    ]
  }
  ```

### Get Single Note

- **URL**: `/notes/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "note_id",
      "title": "Note Title",
      "content": "Note content",
      "category": "Work",
      "tags": ["important", "todo"],
      "color": "#ffffff",
      "isPinned": true,
      "isArchived": false,
      "user": "user_id",
      "sharedWith": [
        {
          "user": {
            "_id": "user_id_2",
            "username": "janedoe",
            "email": "jane@example.com"
          },
          "permission": "read"
        }
      ],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "permission": "owner"
  }
  ```

### Create Note

- **URL**: `/notes`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "New Note",
    "content": "Note content",
    "category": "Work",
    "tags": ["important", "todo"],
    "color": "#ffffff",
    "isPinned": false
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "note_id",
      "title": "New Note",
      "content": "Note content",
      "category": "Work",
      "tags": ["important", "todo"],
      "color": "#ffffff",
      "isPinned": false,
      "isArchived": false,
      "user": "user_id",
      "sharedWith": [],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Update Note

- **URL**: `/notes/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Updated Note",
    "content": "Updated content",
    "category": "Personal",
    "tags": ["important", "updated"],
    "color": "#f0f0f0",
    "isPinned": true
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "note_id",
      "title": "Updated Note",
      "content": "Updated content",
      "category": "Personal",
      "tags": ["important", "updated"],
      "color": "#f0f0f0",
      "isPinned": true,
      "isArchived": false,
      "user": "user_id",
      "sharedWith": [],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  }
  ```

### Delete Note

- **URL**: `/notes/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

### Share Note

- **URL**: `/notes/:id/share`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "permission": "read"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Note shared with jane@example.com",
    "data": {
      "_id": "note_id",
      "title": "Note Title",
      "content": "Note content",
      "category": "Work",
      "tags": ["important", "todo"],
      "color": "#ffffff",
      "isPinned": true,
      "isArchived": false,
      "user": "user_id",
      "sharedWith": [
        {
          "user": {
            "_id": "user_id_2",
            "username": "janedoe",
            "email": "jane@example.com"
          },
          "permission": "read"
        }
      ],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Remove Share Access

- **URL**: `/notes/:id/share/:userId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Share access removed",
    "data": {
      "_id": "note_id",
      "title": "Note Title",
      "content": "Note content",
      "category": "Work",
      "tags": ["important", "todo"],
      "color": "#ffffff",
      "isPinned": true,
      "isArchived": false,
      "user": "user_id",
      "sharedWith": [],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Get Categories

- **URL**: `/notes/categories`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "name": "Work",
        "count": 5
      },
      {
        "name": "Personal",
        "count": 3
      },
      {
        "name": "Uncategorized",
        "count": 2
      }
    ]
  }
  ```

### Get Tags

- **URL**: `/notes/tags`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "name": "important",
        "count": 4
      },
      {
        "name": "todo",
        "count": 3
      },
      {
        "name": "idea",
        "count": 2
      }
    ]
  }
  ```

### Get Note Statistics

- **URL**: `/notes/stats`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalNotes": 10,
      "activeNotes": 8,
      "archivedNotes": 2,
      "pinnedNotes": 3,
      "sharedWithOthers": 2,
      "sharedWithMe": 5,
      "categories": [
        {
          "name": "Work",
          "count": 5
        },
        {
          "name": "Personal",
          "count": 3
        },
        {
          "name": "Uncategorized",
          "count": 2
        }
      ],
      "mostRecentNote": {
        "title": "Recent Note",
        "updatedAt": "2023-01-10T00:00:00.000Z"
      },
      "oldestNote": {
        "title": "Old Note",
        "createdAt": "2022-01-01T00:00:00.000Z"
      }
    }
  }
  ```
