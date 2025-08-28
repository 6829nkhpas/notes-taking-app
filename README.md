# Full-Stack Note-Taking App

A production-style, mobile-first note-taking application with Email+OTP and Google authentication.

## Features

- **Authentication**: Email + OTP signup/login and Google login
- **Notes Management**: Create, read, and delete notes with JWT protection
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Security**: JWT tokens with httpOnly cookies, rate limiting, and validation

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Google OAuth credentials (for Google login)

### Backend (Server)
```bash
cd server
cp .env.example .env
# Fill in your environment variables (see .env.example)
npm install
npm run dev
```

The server will start on http://localhost:4000

### Frontend (Client)
```bash
cd client
cp .env.example .env
# Fill in your environment variables (see .env.example)
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Environment Variables

#### Server (.env)
```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/notes_app
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
EMAIL_FROM="Notes App <no-reply@notesapp.dev>"
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

#### Client (.env)
```bash
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Health Check
```bash
curl http://localhost:4000/api/health
```

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Authentication**: JWT, Google OAuth, Email OTP
- **State Management**: Zustand
- **Validation**: Zod
