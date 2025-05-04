# QuickNotes Authentication System

This document provides detailed information about the QuickNotes authentication system, including features, implementation details, and security considerations.

## Features

The QuickNotes authentication system includes the following features:

1. **User Registration and Login**
   - Username/email/password registration
   - Email/password login
   - Password hashing with bcrypt

2. **JWT Authentication**
   - Access tokens (short-lived)
   - Refresh tokens (long-lived)
   - Token blacklisting for logout

3. **Email Verification**
   - Verification tokens sent via email
   - Account status tracking
   - Resend verification option

4. **Password Management**
   - Forgot password functionality
   - Password reset via email
   - Password change with current password verification

5. **Two-Factor Authentication (2FA)**
   - TOTP-based 2FA (Time-based One-Time Password)
   - QR code for easy setup with authenticator apps
   - Backup codes for emergency access

6. **Security Features**
   - Token expiration
   - Password change detection
   - CSRF protection
   - Rate limiting (to be implemented)

## Implementation Details

### Authentication Flow

#### Registration Flow
1. User submits registration form with username, email, and password
2. Server validates input and checks for existing users
3. Password is hashed using bcrypt
4. User is created in the database
5. Verification token is generated and sent via email
6. Access and refresh tokens are generated and returned to the client

#### Login Flow
1. User submits login form with email and password
2. Server validates credentials
3. If 2FA is enabled, a challenge is returned
   - User must provide a valid 2FA code to complete login
4. If credentials are valid (and 2FA is passed if enabled):
   - Access token and refresh token are generated
   - Last login time is updated
   - Tokens and user info are returned to the client

#### Token Refresh Flow
1. When access token expires, client sends refresh token
2. Server validates refresh token (not expired, not blacklisted)
3. New access token is generated and returned
4. User can continue using the application without re-login

#### Logout Flow
1. Client sends refresh token to server
2. Server blacklists the refresh token
3. Client removes tokens from local storage

### Token Management

#### Access Tokens
- Short-lived (15 minutes by default)
- Contains user ID and role
- Used for API authentication
- Stateless (not stored in database)

#### Refresh Tokens
- Long-lived (30 days by default)
- Stored in database with expiry date
- Can be blacklisted for logout
- Used to obtain new access tokens

### Two-Factor Authentication

#### Setup Process
1. User initiates 2FA setup
2. Server generates a secret key
3. QR code is generated and displayed to the user
4. User scans QR code with authenticator app
5. User verifies setup by entering a valid code
6. 2FA is enabled for the user's account
7. Backup codes are generated and displayed to the user

#### Login with 2FA
1. User enters email and password
2. If credentials are valid and 2FA is enabled:
   - Server returns a 2FA challenge
   - Client shows 2FA input form
3. User enters code from authenticator app
4. Server verifies the code
5. If valid, authentication completes normally

### Email Verification and Password Reset

#### Email Verification
1. Verification token is generated during registration
2. Email with verification link is sent to user
3. User clicks link, token is validated
4. User's email is marked as verified

#### Password Reset
1. User requests password reset with email
2. Reset token is generated and stored
3. Email with reset link is sent to user
4. User clicks link and enters new password
5. Token is validated, password is updated
6. All refresh tokens for the user are blacklisted

## Security Considerations

### Password Storage
- Passwords are hashed using bcrypt with a cost factor of 10
- Original passwords are never stored

### Token Security
- Access tokens are short-lived to minimize risk if compromised
- Refresh tokens can be blacklisted if compromised
- Tokens are invalidated when password is changed

### 2FA Security
- TOTP algorithm with 30-second window
- Secret keys are stored securely
- Backup codes for emergency access

### API Security
- All sensitive routes are protected
- Role-based access control
- CORS configuration to prevent unauthorized access

## Database Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  isEmailVerified: Boolean,
  twoFactorAuth: {
    enabled: Boolean,
    secret: String,
    backupCodes: [String]
  },
  role: String,
  createdAt: Date,
  lastLogin: Date,
  passwordChangedAt: Date
}
```

### Token Model
```javascript
{
  user: ObjectId (reference to User),
  token: String,
  type: String (refresh, reset, verification),
  expires: Date,
  blacklisted: Boolean,
  createdAt: Date
}
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user (blacklist refresh token)
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/setup-2fa` - Setup two-factor authentication
- `POST /api/auth/verify-2fa` - Verify and enable 2FA
- `POST /api/auth/disable-2fa` - Disable 2FA

## Frontend Integration

The frontend integrates with the authentication system through:

1. **Auth Module** (`auth.js`)
   - Handles login, registration, and token management
   - Manages authentication state
   - Provides authentication status to other components

2. **API Service** (`api.js`)
   - Automatically includes authentication tokens in requests
   - Handles token refresh when access token expires
   - Provides methods for all authentication endpoints

3. **Two-Factor Authentication Component**
   - Handles 2FA challenges during login
   - Provides UI for entering 2FA codes

4. **Authentication Forms**
   - Login form
   - Registration form
   - Forgot password form
   - Reset password form
   - Email verification UI

## Environment Variables

The authentication system uses the following environment variables:

```
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
FRONTEND_URL=http://localhost:8000
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=QuickNotes <noreply@quicknotes.com>
```

## Future Enhancements

1. **OAuth Integration**
   - Google, GitHub, and Facebook login options
   - Account linking

2. **Advanced Security**
   - Rate limiting for login attempts
   - IP-based suspicious activity detection
   - Session management

3. **Admin Features**
   - User management dashboard
   - Account lockout capabilities
   - Activity logging
