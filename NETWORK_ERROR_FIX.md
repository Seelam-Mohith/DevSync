# Network Error Fix - Complete Setup Guide

## Files Updated

### Backend Files
1. **server/src/server.js** - Enhanced startup logging, listens on 0.0.0.0
2. **server/src/app.js** - Detailed CORS config with logging
3. **server/src/routes/authRoutes.js** - Route logging
4. **server/.env** - Added HOST=0.0.0.0 for network accessibility

### Frontend Files
1. **client/src/lib/api.js** - Enhanced network error detection and logging
2. **client/.env** - Frontend environment variables (NEW)
3. **client/.env.example** - Reference file

---

## Quick Start (Local Development)

### Terminal 1: Start Backend
```bash
cd server
npm run dev
```

**Expected Output:**
```
============================================================
[SERVER] Starting DevSync Server
============================================================
[SERVER] Configuration:
  - Host: 0.0.0.0
  - Port: 5000
  - Environment: development
  - Client URL (CORS): http://localhost:5173
  - JWT Secret: ✓ Configured
============================================================

[SERVER] Connecting to database...
[SERVER] ✓ Database connected

[SERVER] ✓ Server started successfully!
[SERVER] → API running at http://localhost:5000
[SERVER] → Frontend should connect to: http://localhost:5000/api
[SERVER] → Health check: curl http://localhost:5000/api/health
[SERVER] → Test login: curl -X POST http://localhost:5000/api/auth/login

[SERVER] Ready for incoming connections...
```

### Terminal 2: Start Frontend
```bash
cd client
npm run dev
```

**Expected Output:**
```
VITE v8.0.8  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

---

## Network Error Diagnosis

### Step 1: Verify Backend is Running

**Test from any terminal:**
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-04-25T10:30:45.123Z",
  "uptime": 15.234
}
```

**If fails:**
- ❌ Backend not running → Start with `npm run dev` in /server
- ❌ Wrong port → Check PORT in server/.env (should be 5000)
- ❌ Server crashed → Check terminal for error messages

---

### Step 2: Verify CORS Configuration

**Check browser console (F12 → Console):**

When frontend tries to login, you should see in CONSOLE (not Errors):
```
[API] → REQUEST
  method: POST
  url: http://localhost:5000/api/auth/login
  hasToken: false
  hasBody: true
```

**If you see CORS error:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix:**
1. Verify server/.env: `CLIENT_URL=http://localhost:5173`
2. Verify server/.env: `HOST=0.0.0.0`
3. Restart backend: `npm run dev`

---

### Step 3: Verify Frontend Configuration

**Check that client/.env exists:**
```bash
# Windows
type client\.env
# macOS/Linux
cat client/.env
```

**Should contain:**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

**If missing:**
1. Create client/.env
2. Add: `VITE_API_BASE_URL=http://localhost:5000/api`
3. Restart frontend: `npm run dev`

---

### Step 4: Test Login Request

**Option A: Using curl (Advanced)**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -v
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

**Option B: Using Frontend UI**
1. Navigate to http://localhost:5173
2. Click "Create Account" (or sign in if account exists)
3. Open DevTools (F12 → Console) to watch logs
4. Watch for `[API] → REQUEST` and `[API] ← RESPONSE` logs

---

## Network Error Checklist

### Backend Issues
- [ ] Backend running: `npm run dev` in /server folder
- [ ] Port 5000 available (not blocked by firewall)
- [ ] server/.env has `PORT=5000`
- [ ] server/.env has `HOST=0.0.0.0`
- [ ] server/.env has `CLIENT_URL=http://localhost:5173`
- [ ] server/.env has `JWT_SECRET=devsync_local_secret`
- [ ] Database connected (see `[SERVER] ✓ Database connected`)

### Frontend Issues
- [ ] Frontend running: `npm run dev` in /client folder
- [ ] client/.env exists and has `VITE_API_BASE_URL=http://localhost:5000/api`
- [ ] Port 5173 available
- [ ] Browser not using cached old baseURL (hard refresh: Ctrl+Shift+R)

### Network Issues
- [ ] Both ports 5000 and 5173 accessible
- [ ] No firewall blocking localhost connections
- [ ] No VPN interfering with localhost
- [ ] Browser allowing mixed content (http vs https)

---

## Common Network Errors & Solutions

### Error: "Network Error: timeout of 10000ms exceeded"
**Cause:** Backend not responding within 10 seconds
**Solutions:**
1. Check backend is running: `curl http://localhost:5000/api/health`
2. Increase timeout in client/src/lib/api.js if needed
3. Check for slow database queries

### Error: "Network Error: connect ECONNREFUSED 127.0.0.1:5000"
**Cause:** Backend not running on port 5000
**Solutions:**
1. Start backend: `npm run dev` in /server
2. Verify PORT=5000 in server/.env
3. Check port not in use: `netstat -ano | findstr :5000` (Windows)

### Error: "Network Error: connect ENOTFOUND localhost"
**Cause:** DNS resolution issue or wrong baseURL
**Solutions:**
1. Use `127.0.0.1` instead of `localhost`
2. Update client/.env: `VITE_API_BASE_URL=http://127.0.0.1:5000/api`

### Error: CORS policy blocked request
**Cause:** Backend CORS not configured for frontend URL
**Solutions:**
1. Check server/.env: `CLIENT_URL=http://localhost:5173`
2. Restart backend
3. Clear browser cache: Ctrl+Shift+Delete

### Error: "Request failed with status code 401"
**Cause:** Invalid or missing token
**Solutions:**
1. Register/login first to get token
2. Check token in localStorage: `localStorage.devsync_token`
3. Token might have expired (7-day TTL)

### Error: "Request failed with status code 400"
**Cause:** Invalid request data
**Solutions:**
1. Check email format (must be valid email)
2. Check password length (min 6 characters)
3. Check all required fields are sent (email, password, name for register)

### Error: "Request failed with status code 404"
**Cause:** Endpoint doesn't exist
**Solutions:**
1. Check baseURL: should be `http://localhost:5000/api`
2. Check routes are registered in server/src/app.js
3. Restart backend after adding routes

### Error: "Request failed with status code 500"
**Cause:** Backend server error
**Solutions:**
1. Check backend console for error messages
2. Verify database connection
3. Check JWT_SECRET is set in server/.env
4. Restart backend: `npm run dev`

---

## Browser Console Logging

**All API calls log to browser console:**

**Successful Login:**
```
[API] → REQUEST
  method: POST
  url: http://localhost:5000/api/auth/login
  hasToken: false
  hasBody: true

[API] ← RESPONSE (Success)
  status: 200
  statusText: OK
  url: /auth/login
  dataKeys: ["success", "message", "user"]
```

**Network Error:**
```
[API] ✗ NETWORK ERROR:
  message: connect ECONNREFUSED 127.0.0.1:5000
  baseURL: http://localhost:5000/api
  url: /auth/login
  code: ECONNREFUSED

[API] Network Error Possible Causes:
  1. Backend server not running (npm run dev in /server)
  2. Backend on wrong port (should be 5000)
  3. CORS misconfigured on backend
  4. Frontend API base URL incorrect
```

---

## Testing Endpoints

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```
**Expected:** 200 OK with {success: true, status: "ok"}

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected:** 201 Created with {success: true, token: "...", user: {...}}

### 3. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected:** 200 OK with {success: true, token: "...", user: {...}}

### 4. Get Profile (Protected)
```bash
# Replace TOKEN with actual JWT token from login response
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer TOKEN"
```
**Expected:** 200 OK with {success: true, user: {...}}

---

## Configuration Files Summary

### server/.env (REQUIRED)
```
PORT=5000              # Backend port
HOST=0.0.0.0          # Listen on all interfaces
CLIENT_URL=http://localhost:5173  # Frontend URL for CORS
JWT_SECRET=devsync_local_secret   # JWT signing secret
NODE_ENV=development  # Environment
```

### client/.env (REQUIRED)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### Key Settings for Local Network Communication
- **Backend listens on:** 0.0.0.0:5000 (all interfaces)
- **Frontend connects to:** http://localhost:5000/api
- **CORS origin:** http://localhost:5173
- **Credentials enabled:** true (allows auth headers)

---

## Still Getting Network Error?

1. **Check both servers running:**
   - Backend: `curl http://localhost:5000/api/health`
   - Frontend: Open browser to `http://localhost:5173`

2. **Verify configuration:**
   - `cat server/.env`
   - `cat client/.env`

3. **Check backend logs:**
   - Look for `[APP] CORS configured for: http://localhost:5173`
   - Look for `[SERVER] Ready for incoming connections...`

4. **Check frontend logs:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for `[API] → REQUEST` entries

5. **Restart both servers:**
   - Stop: Ctrl+C in both terminals
   - Start: `npm run dev` again

6. **Clear cache:**
   - Browser: Ctrl+Shift+Delete (clear all cache)
   - Hard refresh: Ctrl+Shift+R

7. **Check ports not blocked:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   netstat -ano | findstr :5173
   
   # macOS/Linux
   lsof -i :5000
   lsof -i :5173
   ```

8. **Ask for help with console logs:**
   - Terminal 1: Full backend console output
   - Terminal 2: Frontend console output
   - Browser Console (F12): API logs
