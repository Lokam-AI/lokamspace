# AutoPulse Integration Implementation Plan

This document outlines the strategy for integrating the AutoPulse backend (FastAPI server) with the frontend (React client).

## 1. Architecture Overview

```
┌───────────────┐     HTTP/REST     ┌─────────────────┐
│               │ <───────────────> │                 │
│  React Client │                   │  FastAPI Server │ <───> Database
│  (TypeScript) │ <-- WebSockets--> │                 │
│               │                   │                 │
└───────────────┘                   └─────────────────┘
```

## 2. API Integration

### 2.1 Backend API Endpoints

The FastAPI backend exposes the following primary endpoints:

- Auth: `/api/v1/auth/*`
- Calls: `/api/v1/calls/*`
- Campaigns: `/api/v1/campaigns/*`
- Organizations: `/api/v1/organizations/*`
- Users: `/api/v1/users/*`
- Transcripts: `/api/v1/transcripts/*`
- Analytics: `/api/v1/analytics/*`
- Settings: `/api/v1/settings/*`

### 2.2 Frontend API Client

Create a structured API client in the frontend:

```
client/src/api/
├── config.ts             # Base configuration, auth headers
├── index.ts             # Main export file
├── endpoints/
│   ├── auth.ts          # Authentication API methods
│   ├── calls.ts         # Call management
│   ├── campaigns.ts     # Campaign management
│   ├── organizations.ts # Organization management
│   └── users.ts         # User management
└── hooks/
    ├── useAuth.ts       # Auth-related hooks
    ├── useCalls.ts      # Call-related hooks
    └── useCampaigns.ts  # Campaign-related hooks
```

### 2.3 API Client Implementation

Using Axios or fetch for HTTP requests with interceptors for:

- Authentication token management
- Error handling
- Request/response transformation

## 3. Authentication Flow

1. User logs in through frontend login form
2. Frontend sends credentials to `/api/v1/auth/login`
3. Backend validates and returns JWT token
4. Frontend stores token in secure storage (httpOnly cookie preferred)
5. Token is included in Authorization header for subsequent requests
6. Implement token refresh mechanism
7. Proper logout to clear tokens

## 4. State Management

### 4.1 Frontend State

Use React Context API or Redux for global state management:

- Authentication state
- User preferences
- Application-wide settings

### 4.2 Data Fetching

Implement data fetching using React Query or SWR:

- Automatic caching
- Background refreshing
- Optimistic updates
- Error handling

## 5. Environment Configuration

### 5.1 Backend (.env)

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/autopulse

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Services
VAPI_API_KEY=your-vapi-key

# CORS
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### 5.2 Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WEBSOCKET_URL=ws://localhost:8000/ws
VITE_AUTH_COOKIE_NAME=autopulse_auth
```

## 6. Development Workflow

### 6.1 Local Development Setup

1. **Backend**:

   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend**:

   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Database**:
   ```bash
   cd server
   alembic upgrade head
   ```

### 6.2 API Contract Management

- Define TypeScript interfaces that match FastAPI Pydantic models
- Consider using OpenAPI schema generation to keep types in sync

## 7. Error Handling

### 7.1 Backend Error Structure

```json
{
  "detail": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "params": {}
  }
}
```

### 7.2 Frontend Error Handling

- Global error boundary for React components
- Toast notifications for API errors
- Form validation errors displayed inline
- Proper offline handling

## 8. Security Considerations

1. **CORS Configuration**:

   - Configure FastAPI CORS middleware with appropriate origins
   - Set proper headers for security

2. **Input Validation**:

   - Backend: Use Pydantic for request validation
   - Frontend: Form validation with libraries like Formik, React Hook Form, or Zod

3. **Authentication**:

   - JWT with short expiration
   - Refresh token rotation
   - CSRF protection

4. **Data Protection**:
   - Sanitize all user inputs
   - Implement rate limiting
   - Protect against common web vulnerabilities

## 9. Deployment Strategy

### 9.1 Backend Deployment

1. Build Docker image using provided Dockerfile
2. Deploy to AWS, GCP, or other cloud provider
3. Set up database migrations in CI/CD pipeline

### 9.2 Frontend Deployment

1. Build static assets
   ```bash
   cd client
   npm run build
   ```
2. Deploy to CDN or static hosting service
3. Configure for different environments (dev/staging/prod)

### 9.3 Environment-specific Configuration

Create separate environment configurations:

- Development
- Staging
- Production

## 10. Testing Strategy

### 10.1 Backend Tests

1. Unit tests for services and utilities
2. API integration tests
3. Database tests with test database

### 10.2 Frontend Tests

1. Component tests with React Testing Library
2. Integration tests for user flows
3. End-to-end tests with Cypress

## 11. Monitoring and Logging

1. **Backend**:

   - Structured logging with timestamps and request IDs
   - Performance monitoring
   - Error reporting

2. **Frontend**:
   - Client-side error tracking
   - Analytics for user behavior
   - Performance monitoring

## 12. Integration Points

### 12.1 Call Management

- Frontend components in `client/src/components/calls/`
- Backend endpoints in `server/app/api/v1/endpoints/calls.py`
- Data model alignment for call objects

### 12.2 Campaign Management

- Frontend components in `client/src/components/calls/NewCampaignModal.tsx`
- Backend endpoints in `server/app/api/v1/endpoints/campaigns.py`

### 12.3 Analytics and Metrics

- Frontend components in `client/src/components/metrics/`
- Backend endpoints in `server/app/api/v1/endpoints/analytics.py`

## 13. Next Steps

1. Implement API client in frontend
2. Set up authentication flow
3. Connect dashboard components to real data
4. Implement error handling
5. Set up continuous integration
6. Deploy development environment
