#!/bin/bash

# Simple Vercel Deployment Script for Notes App Frontend

echo "🚀 Preparing Notes App for Vercel Deployment..."

# Check if we're in the right directory
if [ ! -d "client" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Build the client
echo "📦 Building client application..."
cd client

if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

echo "🔨 Building for production..."
npm run build

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps for Vercel deployment:"
echo "1. Go to https://vercel.com"
echo "2. Create a new project"
echo "3. Import your GitHub repository"
echo "4. Set the following settings:"
echo "   - Framework Preset: Vite"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "   - Install Command: npm install"
echo ""
echo "🔧 Environment Variables to set in Vercel:"
echo "   VITE_API_URL=https://your-backend-url.com/api"
echo "   VITE_GOOGLE_CLIENT_ID=your_google_client_id"
echo ""
echo "🌐 Your app will be deployed to: https://your-project.vercel.app"
echo ""
echo "💡 For backend deployment, you can use:"
echo "   - Render (free tier available)"
echo "   - Railway (simple deployment)"
echo "   - Fly.io (global deployment)"
