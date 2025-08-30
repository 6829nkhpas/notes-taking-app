# Backend Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended - Free Tier)
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `notes-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `server`

### Option 2: Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `server`
6. Railway will auto-detect and deploy

## 🔧 Environment Variables

Set these in your hosting platform:

```bash
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/notes_app
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
JWT_EXPIRES_IN=7d
COOKIE_SECURE=true
COOKIE_SAMESITE=none
EMAIL_FROM="Notes App <no-reply@yourdomain.com>"
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## 📊 Database Setup

### MongoDB Atlas (Free Tier)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Create database user
5. Get connection string
6. Update `MONGO_URI` in environment variables

## 🔗 Update Frontend

After deploying backend, update your frontend environment:

```bash
VITE_API_URL=https://your-backend-url.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## ✅ Test Your Deployment

1. Check health endpoint: `https://your-backend-url.com/api/health`
2. Should return: `{"status":"ok"}`
3. Test frontend with new backend URL

## 🆘 Troubleshooting

- **Build fails**: Check if all dependencies are in `package.json`
- **Runtime errors**: Check environment variables are set correctly
- **Database connection**: Verify MongoDB URI and network access
- **CORS issues**: Ensure `CLIENT_ORIGIN` matches your frontend domain
