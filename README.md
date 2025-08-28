# Full-Stack Note-Taking App

A production-style, mobile-first note-taking application with Email+OTP and Google authentication.

## Features

- **Authentication**: Email + OTP signup/login and Google login
- **Notes Management**: Create, read, and delete notes with JWT protection
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Security**: JWT tokens with httpOnly cookies, rate limiting, and validation

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm/npm
- MongoDB instance
- Google OAuth credentials (for Google login)

### Backend (Server)
```bash
cd server
cp .env.example .env
# Fill in your environment variables
pnpm install
pnpm dev
```

### Frontend (Client)
```bash
cd client
cp .env.example .env
# Fill in your environment variables
pnpm install
pnpm dev
```

Open http://localhost:5173 in your browser.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Authentication**: JWT, Google OAuth, Email OTP
- **State Management**: Zustand
- **Validation**: Zod
