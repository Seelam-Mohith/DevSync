# Dev Sync (MERN)

Modern MERN app with a pure React frontend and Express backend.

## Stack
- Frontend: React + Vite + Tailwind + shadcn-style UI components
- Backend: Node.js + Express + Mongoose
- Auth: JWT + bcrypt
- Charts: Recharts

## Project Structure
- `client/` React frontend
- `server/` Express backend

## Backend Setup
1. Go to `server/`
2. Copy `.env.example` to `.env`
3. Fill in MongoDB Atlas and JWT values
4. Run:

```bash
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

## Frontend Setup
1. Go to `client/`
2. Copy `.env.example` to `.env`
3. Run:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/profile` (protected)
- `GET /api/user/stats` (protected)
- `GET /api/leaderboard` (protected)
- `GET /api/activity` (protected)
- `GET /api/github/:username` (protected)

## Notes
- Invalid/expired JWT responses return 401 and trigger auto-logout in frontend.
- Empty leaderboard/activity states are handled in UI.
- Architecture is organized for future features like Socket.io realtime sync.
