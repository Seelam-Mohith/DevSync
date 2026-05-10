# Authentication Flow Fix - Complete Guide

## Overview

The authentication system has been comprehensively fixed to address:
- ✅ JWT token generation and validation
- ✅ Authorization header format (Bearer <token>)
- ✅ Request payload validation (email, password, name)
- ✅ Password hashing with bcrypt comparison
- ✅ CORS configuration with credentials support
- ✅ Error handling and detailed logging
- ✅ Protected routes with middleware verification
- ✅ Token expiry handling (7-day TTL)

---

## File Changes

### Backend Files

#### 1. `server/src/controllers/authController.js`
**Changes:**
- Added email format validation (regex check)
- Added password strength validation (min 6 chars)
- Improved error handling with proper status codes
- Added comprehensive console logging for debugging
- Better error messages for client
- Validated required fields before processing

**Key Functions:**
- `register()`: Creates new user with starter data
- `login()`: Authenticates user and returns JWT token
- `validateEmail()`: Validates email format
- `validatePassword()`: Validates password requirements

#### 2. `server/src/middleware/authMiddleware.js`
**Changes:**
- Added detailed logging for debugging
- Separated error cases (missing header, invalid format, no token, JWT verification)
- Better error messages
- Validates JWT_SECRET configuration
- Handles token expiry separately from invalid tokens

**Protection:**
- Verifies Bearer token format
- Validates JWT signature and expiry
- Ensures user exists in database
- Attaches user object to request

#### 3. `server/src/middleware/errorMiddleware.js`
**Changes:**
- Added request logging
- Properly handles error status codes
- Includes detailed error information in development mode
- Better error response format

#### 4. `server/src/app.js`
**Changes:**
- Enhanced CORS configuration with explicit options
- Added allowed HTTP methods and headers
- Configured max age for preflight requests
- Added request logging middleware
- Increased JSON body limit to 10MB
- Added health check with timestamp

#### 5. `server/src/utils/generateToken.js`
**Changes:**
- Added JWT_SECRET validation
- Added userId validation
- Added error handling with logging
- Specified algorithm (HS256)

#### 6. `server/src/server.js`
**Changes:**
- Validates required environment variables at startup
- Logs configuration on startup
- Better error handling for connection failures
- Displays startup success message with URLs

### Frontend Files

#### 1. `client/src/lib/api.js`
**Changes:**
- Added timeout configuration (10 seconds)
- Added request interceptor logging
- Detailed error logging with status codes
- Better 401 handling (calls logout)
- Logs Bearer token addition

**Features:**
- Automatically adds token to all requests
- Handles 401/400/500 errors specifically
- Logs all requests and responses

#### 2. `client/src/context/AuthContext.jsx`
**Changes:**
- Added error state management
- Added logging throughout auth lifecycle
- Better error messages for user
- Validates payload before API calls
- Improved bootstrap logic with logging

**Methods:**
- `persistAuth()`: Saves token and user to localStorage
- `register()`: Registers new user with validation
- `login()`: Authenticates user with validation
- `logout()`: Clears auth state

#### 3. `client/src/pages/LoginPage.jsx`
**Changes:**
- Added client-side form validation
- Password minimum length check (6 chars)
- Email and password required check
- Better error messages
- Detailed error logging
- Distinguishes between registration and login errors

---

## Setup & Verification

### 1. Environment Variables

**Server (.env):**
```
PORT=5000
JWT_SECRET=devsync_local_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (.env):**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

**Verify:**
```bash
# Server: Check JWT_SECRET is set
echo $env:JWT_SECRET  # Windows PowerShell
# Should output: devsync_local_secret

# Client: Check API base URL
echo $env:VITE_API_BASE_URL  # Windows PowerShell
# Should output: http://localhost:5000/api
```

### 2. Start Services

```bash
# Terminal 1: Start backend
cd server
npm run dev
# Expected output:
# [SERVER] ✓ Server running on http://localhost:5000
# [SERVER] ✓ CORS enabled for: http://localhost:5173

# Terminal 2: Start frontend
cd client
npm run dev
# Expected output:
# VITE v8.0.8  ready in 123 ms
# ➜  Local:   http://localhost:5173/
```

### 3. Test Registration

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "xxx",
    "name": "Test User",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Test Login

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "xxx",
    "name": "Test User",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. Test Protected Route

```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "xxx",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

---

## Error Handling

### Client-Side Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Authorization header missing` | No token in localStorage | Login again |
| `Invalid authorization header format` | Token sent without "Bearer " prefix | Check api.js interceptor |
| `Invalid token` | Token tampered or corrupted | Login again |
| `Token expired` | JWT token exceeded 7-day TTL | Login again |
| `Email is already in use` | Email exists in database | Use different email or login |
| `Invalid email format` | Email doesn't match regex | Check email format |
| `Password must be at least 6 characters` | Password too short | Enter 6+ character password |
| `Invalid credentials` | Email or password incorrect | Check and retry |
| `User not found` | User deleted from database | Register new account |

### Console Logging

**Enable/Disable Logging:**
- Backend: Logs always enabled (shows [AUTH], [MIDDLEWARE], [API], [ERROR] tags)
- Frontend: Logs in console (use DevTools → Console tab)

**Log Format:**
```
[COMPONENT] [ACTION] details...
Example: [AUTH] Login successful, token generated { userId: xxx }
```

---

## Common Issues & Fixes

### Issue: "Unauthorized: token missing" on protected routes

**Cause:** Token not being sent in Authorization header

**Fix:**
1. Verify token exists: `localStorage.getItem("devsync_token")`
2. Check api.js interceptor is adding Bearer prefix
3. Check CORS credentials setting

```bash
# Debug: Check API call headers in browser DevTools
# Network tab → Click request → Headers → Authorization
# Should show: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issue: "JWT_SECRET is not configured"

**Cause:** Missing JWT_SECRET in .env file

**Fix:**
1. Check server/.env exists
2. Verify JWT_SECRET=devsync_local_secret is present
3. Restart server with: `npm run dev`

### Issue: CORS errors in browser console

**Cause:** Client and server URLs don't match CORS config

**Fix:**
1. Verify CLIENT_URL in server/.env = http://localhost:5173
2. Verify VITE_API_BASE_URL in client = http://localhost:5000/api
3. Ensure credentials: true in both CORS config and requests

### Issue: "Invalid credentials" on login

**Cause:** Password doesn't match stored hash

**Fix:**
1. Verify password is correct (case-sensitive)
2. Check password is at least 6 characters
3. Try registering new account if forgot password

### Issue: Token works for one request but not next

**Cause:** Token not persisted in localStorage or lost in tab

**Fix:**
1. Check localStorage: `localStorage.devsync_token`
2. Verify AuthContext setToken is called
3. Check browser privacy settings aren't blocking localStorage

---

## Testing Checklist

- [ ] Server starts without errors on `npm run dev`
- [ ] Client starts without errors on `npm run dev`
- [ ] Health check works: `GET /api/health` → 200 OK
- [ ] Can register new user: `POST /api/auth/register`
- [ ] Token returned after registration
- [ ] Token stored in localStorage: `devsync_token`
- [ ] Can login with credentials: `POST /api/auth/login`
- [ ] Token returned after login (different from registration)
- [ ] Can access protected route with token: `GET /api/user/profile`
- [ ] Get 401 error without token to protected route
- [ ] Get 401 error with invalid/expired token
- [ ] CORS works (check browser Network tab, no CORS errors)
- [ ] Can navigate from login page to dashboard after auth
- [ ] Logout clears token and user from localStorage
- [ ] Logging out redirects to login page on next protected route access

---

## Performance Optimizations

- JWT tokens cached in localStorage (no DB lookup on every request)
- Token validation happens once per app boot in bootstrap
- Protected routes check user existence only on auth
- Error responses are cached for redirect handling

---

## Security Notes

⚠️ **Important for Production:**
1. Use strong JWT_SECRET (32+ random characters)
2. Enable HTTPS (change http:// to https://)
3. Use secure database (not in-memory)
4. Set NODE_ENV=production
5. Enable rate limiting on auth endpoints
6. Add CSRF protection for forms
7. Use httpOnly cookies for token (instead of localStorage)
8. Add password reset functionality
9. Add email verification for registration
10. Implement account lockout after failed attempts

---

## Demo Credentials

After registration, use these in UI:
- Email: `test@example.com`
- Password: `password123` (or any 6+ char password)

Or create test account via:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo User",
    "email": "demo@example.com",
    "password": "demo123456"
  }'
```
