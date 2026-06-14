# DevSync

DevSync is a full-stack MERN application designed to help developers track, visualize, and compare their coding activity and problem-solving progress. It combines coding metrics, activity analytics, leaderboards, and performance insights into a modern and intuitive dashboard.

## Features

* Secure user authentication with JWT
* Developer activity tracking
* Coding statistics dashboard
* LeetCode-style progress monitoring
* Activity heatmap visualization
* Developer leaderboard and rankings
* Responsive and modern user interface
* Real-time analytics and performance insights

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* Recharts
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

## Project Structure

```text
DevSync/
├── client/        # React frontend
├── server/        # Express backend
└── README.md
```

## Getting Started

### Prerequisites

* Node.js
* npm
* MongoDB

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/devsync.git
cd devsync
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

### Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Create a `.env` file inside the client directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Run the Application

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## Core Modules

### Authentication

* User registration and login
* Password hashing using bcrypt
* JWT-based authorization
* Protected API routes

### Dashboard

* Coding activity overview
* Performance statistics
* Submission heatmaps
* Productivity insights

### Leaderboard

* Developer rankings
* Score aggregation
* Comparative performance metrics

## API Overview

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| POST   | `/api/auth/register` | Register a new user    |
| POST   | `/api/auth/login`    | Authenticate user      |
| GET    | `/api/user/profile`  | Get user profile       |
| GET    | `/api/user/stats`    | Get user statistics    |
| GET    | `/api/activity`      | Fetch activity records |
| GET    | `/api/leaderboard`   | Fetch leaderboard data |

## Security

* Passwords are securely hashed before storage
* JWT-based authentication and authorization
* Protected backend routes
* Environment-based configuration management
* Secure API communication practices

## Future Enhancements

* GitHub integration
* LeetCode API synchronization
* Social authentication
* Profile customization
* Real-time notifications
* Advanced analytics

## Contributing

Contributions are welcome. Feel free to fork the repository, create a feature branch, and submit a pull request.

## License

This project is licensed under the MIT License.
