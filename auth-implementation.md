# AutoPulse Authentication Implementation

This document describes the authentication flow implementation that connects the React frontend with the FastAPI backend.

## Implemented Components

### Frontend

1. **API Client Structure**

   - `client/src/api/config.ts` - Base configuration for API requests
   - `client/src/api/endpoints/auth.ts` - Authentication API methods
   - `client/src/api/index.ts` - Main export file

2. **Authentication Context**

   - `client/src/contexts/AuthContext.tsx` - React context for managing authentication state

3. **Authentication Components**

   - `client/src/pages/Login.tsx` - Login component using the auth context
   - `client/src/pages/SignUp.tsx` - Signup component using the auth context

4. **Main Application**
   - `client/src/main.tsx` - Wrapped app with AuthProvider

### Backend

1. **Existing Authentication Endpoints**
   - `/api/v1/auth/login` - For user login
   - `/api/v1/auth/me` - Get current user details
   - `/api/v1/auth/password/change` - Change password

## Authentication Flow

### Login Flow

1. User enters credentials on the login page
2. Frontend sends credentials to `/api/v1/auth/login`
3. Backend validates and returns JWT token
4. Frontend stores token in localStorage
5. Token is included in Authorization header for subsequent requests
6. When app loads, it checks for existing token and gets user info

### Signup Flow

1. User enters registration details on the signup page
2. Form validation ensures all required fields are provided and passwords match
3. Frontend sends registration data to `/api/v1/auth/register`
4. Backend creates new user account and returns JWT token
5. Frontend stores token in localStorage and updates auth context
6. User is redirected to dashboard

## Environment Variables

### Frontend (to be set in client/.env)

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_AUTH_COOKIE_NAME=autopulse_auth
```

### Backend (to be set in server/.env)

```
# Security
SECRET_KEY=development_secret_key_change_in_production
JWT_SECRET=development_jwt_secret_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400  # 24 hours in seconds

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Next Steps

1. Implement token refresh mechanism
2. Implement password reset flow
3. Add proper error handling
4. Secure token storage (httpOnly cookies instead of localStorage)
5. Add role-based access control
