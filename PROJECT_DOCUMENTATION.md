# DevSync - Complete Project Documentation (A-Z)

## 1. PROJECT OVERVIEW

**DevSync** is a full-stack MERN application that tracks and visualizes developer coding activity and problem-solving progress.

**Purpose:**
- User authentication (register/login with JWT)
- Track coding metrics: commits, PRs, code reviews, focused minutes
- Display LeetCode problem-solving streak and acceptance rate
- Visual heatmap showing activity intensity over time
- Leaderboard ranking developers by total points

**Current Status:**
- ✅ Both servers running (Backend: 5000, Frontend: 5173)
- ✅ MongoDB Atlas cloud database connected and persisting data
- ✅ Authentication fully functional
- ✅ Dashboard displaying user stats and activity

---

## 2. TECHNOLOGY STACK

### Frontend (client/)
- **React 19.2.5** - UI framework
- **Vite 4.x** - Build tool (downgraded from 8 for Node.js 18 compatibility)
- **@vitejs/plugin-react v4** - React plugin (downgraded from v6)
- **Tailwind CSS 3.4.17** - Styling with utility classes
- **Framer Motion 12.38.0** - Animations and transitions
- **Lucide React** - Vector icon library
- **Recharts** - Chart and heatmap visualization
- **React Router DOM 7.14.0** - Client-side routing
- **Axios 1.15.0** - HTTP client (10s timeout, credentials enabled)
- **Class Variance Authority (CVA)** - Component styling

### Backend (server/)
- **Node.js 18.17.1** - Runtime (system constraint; designed for 20.19+)
- **Express.js 5.2.1** - Web server framework
- **Mongoose 9.4.1** - MongoDB ODM (Object Data Modeling)
- **MongoDB Memory Server** - Fallback in-memory database (dev only)
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing (10 salt rounds)
- **dotenv** - Environment variable management
- **Nodemon** - Auto-restart on file changes
- **CORS** - Cross-Origin Resource Sharing

### Database
- **MongoDB Atlas** - Cloud database (cluster0.bcefbuo.mongodb.net)
- **Mongoose Models:**
  - User - User accounts (name, email, password)
  - Score - Problem-solving scores (points, date)
  - Activity - Coding activity (commits, PRs, reviews, minutesFocused, date)

---

## 3. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)              │
│                   http://localhost:5173                 │
├─────────────────────────────────────────────────────────┤
│  - LoginPage (Register/Sign in)                        │
│  - DashboardPage (Main app)                            │
│  - LeaderboardPage (Rankings)                          │
│  - Components: Charts, Heatmap, Stats, Profile         │
│  - AuthContext (Global state + JWT token storage)      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST (Axios)
                         │ Bearer Token Authentication
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express + Node.js)            │
│                   http://localhost:5000                 │
├─────────────────────────────────────────────────────────┤
│  Routes:                                               │
│  - /api/auth (register, login)                         │
│  - /api/user (profile, stats)                          │
│  - /api/activity (get activities)                      │
│  - /api/leaderboard (top users)                        │
│                                                         │
│  Middleware:                                           │
│  - authMiddleware (JWT verification)                   │
│  - errorMiddleware (Error handling)                    │
│  - CORS (Allow frontend origin)                        │
│  - Body parser (JSON)                                  │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose
                         ▼
┌─────────────────────────────────────────────────────────┐
│         MongoDB Atlas (Cloud Database)                  │
│         cluster0 → devsync database                     │
├─────────────────────────────────────────────────────────┤
│  Collections:                                          │
│  - users (login credentials, hashed passwords)         │
│  - scores (problem-solving scores)                     │
│  - activities (coding metrics)                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. AUTHENTICATION FLOW

### A. Registration Flow
```
1. User fills form: name, email, password
2. Frontend validates: email format, password length ≥6
3. POST /api/auth/register → Backend
4. Backend validates again (server-side)
5. Check if email already exists
6. Hash password with bcrypt (10 salt rounds)
7. Create User in database
8. Auto-create starter data (3 scores, 14 days activities)
9. Generate JWT token (7-day expiry)
10. Return: { user, token }
11. Frontend stores token in localStorage
12. Redirect to Dashboard
```

### B. Login Flow
```
1. User enters email, password
2. Frontend validates
3. POST /api/auth/login → Backend
4. Find User by email
5. Compare submitted password with hashed password (bcrypt)
6. If match: Generate JWT token
7. Return: { user, token }
8. Frontend stores token in localStorage
9. All subsequent requests include Authorization header: "Bearer {token}"
10. Redirect to Dashboard
```

### C. Protected Route Flow
```
1. Frontend makes authenticated request (GET /api/user/profile)
2. Axios intercepts → adds Authorization header with Bearer token
3. Backend receives request
4. authMiddleware extracts token from header
5. Verify token signature and expiry with JWT_SECRET
6. Extract userId from token payload
7. Find User by userId (exclude password field)
8. Attach user object to req.user
9. Route handler accesses req.user
10. Return protected data
```

### JWT Token Details
- **Algorithm:** HS256
- **Payload:** `{ userId: "...", iat: ..., exp: ... }`
- **Expiry:** 7 days
- **Secret:** `devsync_local_secret` (in .env)
- **Storage:** Browser localStorage (frontend)
- **Sent as:** `Authorization: Bearer <token>`

### Password Security
- **Algorithm:** bcryptjs
- **Salt rounds:** 10
- **Storage:** Hashed only (never plain text)
- **Verification:** Backend uses bcrypt.compare() on login

---

## 5. DATABASE STRUCTURE

### Collections and Schemas

#### A. Users Collection
```javascript
{
  _id: ObjectId,
  name: String,           // User display name
  email: String,          // Unique, lowercase
  password: String,       // Hashed with bcryptjs
  createdAt: DateTime,    // Auto-generated
  updatedAt: DateTime     // Auto-generated
}
```
**Example:**
```json
{
  "_id": "69feffaa38d93ef6fea2d656",
  "name": "Test User",
  "email": "test@example.com",
  "password": "$2a$10$...[bcrypt hash]...",
  "createdAt": "2026-05-09T09:34:34.245Z",
  "updatedAt": "2026-05-09T09:34:34.245Z"
}
```

#### B. Scores Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  points: Number,         // LeetCode problems solved
  date: DateTime,         // When achieved
  createdAt: DateTime,
  updatedAt: DateTime
}
```
**Example:**
```json
{
  "_id": "69ff...",
  "user": "69feffaa38d93ef6fea2d656",
  "points": 120,
  "date": "2026-05-08T00:00:00.000Z",
  "createdAt": "2026-05-09T09:34:34.245Z"
}
```

#### C. Activities Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  date: DateTime,         // Date of activity
  commits: Number,        // Git commits
  prs: Number,            // Pull requests
  reviews: Number,        // Code reviews
  minutesFocused: Number, // Minutes spent coding
  createdAt: DateTime,
  updatedAt: DateTime
}
```
**Example:**
```json
{
  "_id": "69ff...",
  "user": "69feffaa38d93ef6fea2d656",
  "date": "2026-05-09T00:00:00.000Z",
  "commits": 5,
  "prs": 2,
  "reviews": 3,
  "minutesFocused": 180,
  "createdAt": "2026-05-09T09:34:34.245Z"
}
```

---

## 6. FILE STRUCTURE

```
DevSync/
├── client/                          # React Frontend
│   ├── .env                        # Frontend config
│   ├── package.json
│   ├── vite.config.js              # Vite build config
│   ├── tailwind.config.cjs          # Tailwind CSS config
│   ├── postcss.config.cjs
│   ├── index.html
│   └── src/
│       ├── main.jsx                # React entry point
│       ├── App.jsx                 # Root component
│       ├── index.css               # Global styles
│       ├── components/
│       │   ├── Navbar.jsx           # Top navigation
│       │   ├── ProtectedRoute.jsx   # Route protection wrapper
│       │   ├── ActivityGraph.jsx    # Activity visualization
│       │   ├── StreakHeatmap.jsx    # Calendar heatmap
│       │   ├── CodingProfileMetrics.jsx # Stats display
│       │   ├── LeaderboardTable.jsx # Rankings
│       │   ├── StatsCards.jsx       # Summary cards
│       │   ├── UserCard.jsx         # User profile card
│       │   └── ui/                 # Reusable UI components
│       │       ├── button.jsx
│       │       ├── card.jsx
│       │       └── input.jsx
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state (Redux-like)
│       ├── hooks/
│       │   └── useAuth.js           # Auth context hook
│       ├── lib/
│       │   ├── api.js               # Axios HTTP client config
│       │   └── utils.js             # Helper functions
│       └── pages/
│           ├── LoginPage.jsx        # Register/Login UI
│           ├── DashboardPage.jsx    # Main dashboard
│           └── LeaderboardPage.jsx  # Rankings page
│
├── server/                          # Express Backend
│   ├── .env                        # Backend config + MongoDB URI
│   ├── package.json
│   ├── src/
│   │   ├── app.js                  # Express app setup
│   │   ├── server.js               # Server startup & DB connection
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection logic
│   │   │   └── seed.js             # Test user seeding
│   │   ├── models/
│   │   │   ├── User.js             # User schema
│   │   │   ├── Score.js            # Score schema
│   │   │   └── Activity.js         # Activity schema
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register/Login logic
│   │   │   ├── userController.js   # User profile/stats
│   │   │   ├── activityController.js # Activity endpoints
│   │   │   └── leaderboardController.js # Leaderboard logic
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT verification
│   │   │   └── errorMiddleware.js  # Error handling
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # /api/auth endpoints
│   │   │   ├── userRoutes.js       # /api/user endpoints
│   │   │   ├── activityRoutes.js   # /api/activity endpoints
│   │   │   └── leaderboardRoutes.js # /api/leaderboard endpoints
│   │   └── utils/
│   │       └── generateToken.js    # JWT token generation
│   └── node_modules/
│
└── README.md                        # Project documentation
```

---

## 7. API ENDPOINTS

### Authentication Endpoints

#### POST /api/auth/register
**Create new user account**
```
Request:
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201 Created):
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "69feffaa38d93ef6fea2d656",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/login
**Authenticate user and get token**
```
Request:
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "69feffaa38d93ef6fea2d656",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Endpoints (Protected - Require JWT)

#### GET /api/user/profile
**Fetch authenticated user's profile**
```
Request:
GET http://localhost:5000/api/user/profile
Authorization: Bearer <token>

Response (200 OK):
{
  "user": {
    "_id": "69feffaa38d93ef6fea2d656",
    "name": "Test User",
    "email": "test@example.com",
    "createdAt": "2026-05-09T09:34:34.245Z",
    "updatedAt": "2026-05-09T09:34:34.245Z"
  }
}
```

#### GET /api/user/stats
**Fetch user's aggregated statistics**
```
Request:
GET http://localhost:5000/api/user/stats
Authorization: Bearer <token>

Response (200 OK):
{
  "stats": {
    "totalPoints": 365,
    "maxScore": 155,
    "scoreEntries": 3,
    "activityStats": {
      "commits": 42,
      "prs": 15,
      "reviews": 28,
      "minutesFocused": 1440
    }
  }
}
```

### Activity Endpoints (Protected)

#### GET /api/activity
**Fetch user's coding activities**
```
Request:
GET http://localhost:5000/api/activity
Authorization: Bearer <token>

Response (200 OK):
{
  "activities": [
    {
      "_id": "69ff...",
      "user": "69feffaa38d93ef6fea2d656",
      "date": "2026-05-09T00:00:00.000Z",
      "commits": 5,
      "prs": 2,
      "reviews": 3,
      "minutesFocused": 180
    },
    ...
  ]
}
```

### Leaderboard Endpoints (Protected)

#### GET /api/leaderboard
**Fetch top users by total points**
```
Request:
GET http://localhost:5000/api/leaderboard
Authorization: Bearer <token>

Response (200 OK):
{
  "leaderboard": [
    {
      "rank": 1,
      "name": "Test User",
      "totalPoints": 365,
      "scoreCount": 3,
      "avgScore": 121.67
    },
    ...
  ]
}
```

### Health Check

#### GET /api/health
**Server health check (no auth required)**
```
Response (200 OK):
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-05-09T09:34:34.245Z",
  "uptime": 123.45
}
```

---

## 8. ENVIRONMENT CONFIGURATION

### Backend (.env)
```env
# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# Client Configuration (for CORS)
CLIENT_URL=http://localhost:5173

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://seelammohith2222_db_user:pro773190@cluster0.bcefbuo.mongodb.net/devsync?retryWrites=true&w=majority

# JWT Secret (CRITICAL - change in production)
JWT_SECRET=devsync_local_secret
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 9. HOW TO RUN THE PROJECT

### Prerequisites
- Node.js 18.17.1+ (system has 18.17.1)
- npm/yarn
- MongoDB Atlas account with cluster0 (connection string in .env)

### Backend Setup
```bash
cd server
npm install
npm run dev
```
- Runs on http://localhost:5000
- Connects to MongoDB Atlas automatically
- Seeds test user (test@example.com / password123) on startup

### Frontend Setup
```bash
cd client
npm install
npm run dev
```
- Runs on http://localhost:5173
- Vite dev server with hot reload

### First Time Run
1. Start backend (port 5000)
2. Wait for "✓ Database connected" and "Test user ready" messages
3. Start frontend (port 5173)
4. Open http://localhost:5173
5. Login with: test@example.com / password123
6. Dashboard loads with seeded data

---

## 10. KEY FEATURES

### 1. User Authentication
- ✅ Register new account
- ✅ Login with JWT token
- ✅ Password hashing with bcryptjs
- ✅ Protected routes (require valid token)
- ✅ Token persistence in localStorage
- ✅ Auto-logout on token expiry (401)

### 2. Dashboard
- ✅ User profile display
- ✅ Stat cards: Total problems, streak, acceptance rate, peak day
- ✅ Submission intensity heatmap (calendar view)
- ✅ Monthly navigation
- ✅ Activity breakdown: commits, PRs, reviews

### 3. Leaderboard
- ✅ Top users ranked by points
- ✅ Score aggregation
- ✅ Average score calculation

### 4. Data Persistence
- ✅ MongoDB Atlas cloud storage
- ✅ User data survives server restarts
- ✅ Historical activity tracking

### 5. UI/UX
- ✅ Glassmorphism design (backdrop blur)
- ✅ Tailwind CSS styling
- ✅ Dark mode support
- ✅ Responsive layout
- ✅ Framer Motion animations
- ✅ Error notifications

---

## 11. CURRENT STATUS

### ✅ WORKING
- Backend server running (port 5000)
- Frontend running (port 5173)
- MongoDB Atlas connected and persisting data
- Authentication (register/login/protected routes)
- Dashboard with stats and heatmap
- Leaderboard
- Test user auto-creation on startup

### ⏳ LIMITATIONS
- Node.js 18.17.1 (designed for 20.19+)
- Codolio integration disabled (requires Node 20.19+)
- No email verification
- No password reset feature

### ❌ NOT IMPLEMENTED
- Social login (Google, GitHub)
- Real-time notifications
- User profile editing
- Two-factor authentication
- Admin panel

---

## 12. COMMON ISSUES & SOLUTIONS

### Issue: MongoDB Atlas connection SSL error
**Solution:** Already fixed - switched from Memory Server
- Connection using MONGO_URI from .env
- Database persists to Atlas automatically

### Issue: 500 error on /api/user/profile
**Solution:** Already fixed
- Fixed req.body null/undefined check in logging middleware
- Profile endpoint now works properly

### Issue: Frontend can't connect to backend
**Solution:** Already fixed
- CORS enabled on backend
- Host 0.0.0.0 (accessible on all interfaces)
- Frontend axios client configured with correct base URL

### Issue: Test credentials not working
**Solution:** Already fixed
- Seed.js auto-creates test@example.com on server startup
- Idempotent (checks if exists before creating)

---

## 13. DATA FLOW EXAMPLES

### Example: User Logs In
```
Frontend (Browser)                 Backend (Node.js)              Database (MongoDB)
        │                                │                              │
        │ 1. User clicks Sign In         │                              │
        │ 2. Validates form              │                              │
        │ 3. POST /auth/login            │                              │
        ├────────────────────────────────>│                              │
        │                                │ 4. Find user by email        │
        │                                ├─────────────────────────────>│
        │                                │<─────────────────────────────┤
        │                                │    User document             │
        │                                │ 5. Compare password (bcrypt) │
        │                                │ 6. Generate JWT token        │
        │                                │ 7. Return {user, token}      │
        │<────────────────────────────────┤                              │
        │    201 + token                 │                              │
        │ 8. Store token in localStorage │                              │
        │ 9. Redirect to /dashboard      │                              │
        │ 10. GET /user/profile          │                              │
        │ (Header: Authorization: Bearer token)                         │
        ├────────────────────────────────>│                              │
        │                                │ 11. Verify JWT token        │
        │                                │ 12. Extract userId          │
        │                                │ 13. Find user by userId     │
        │                                ├─────────────────────────────>│
        │                                │<─────────────────────────────┤
        │                                │    User without password    │
        │                                │ 14. Return user profile     │
        │<────────────────────────────────┤                              │
        │    200 + user data             │                              │
        │ 15. Render dashboard           │                              │
```

---

## 14. SECURITY FEATURES

1. **Password Security**
   - Hashed with bcryptjs (10 salt rounds)
   - Never stored in plain text
   - Compared server-side on login

2. **Token Security**
   - JWT with HS256 algorithm
   - 7-day expiry
   - Verified on every protected request
   - Stored in browser localStorage

3. **CORS Protection**
   - Only allow frontend origin (http://localhost:5173)
   - Credentials required for cross-origin requests
   - Explicit allowed headers and methods

4. **Error Handling**
   - Generic "Invalid credentials" (don't reveal if email exists)
   - Specific error messages in logs (not exposed to client)
   - Proper HTTP status codes

5. **Input Validation**
   - Email format validation
   - Password length minimum (6 chars)
   - Server-side validation (not just client)

---

## 15. DEPLOYMENT NOTES

For production deployment:
1. Change JWT_SECRET to a secure random value
2. Change MongoDB Atlas password
3. Remove test user seeding or use production flag
4. Set NODE_ENV=production
5. Add HTTPS certificates
6. Configure environment-specific CORS origins
7. Set up error logging/monitoring
8. Add database backups
9. Configure rate limiting
10. Add input sanitization (SQL injection prevention)

---

This documentation covers the complete A-Z understanding of the DevSync project and can be shared with any AI agent for context.
