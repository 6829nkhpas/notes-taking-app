#!/bin/bash

# Cursor Deployment Script for Notes App
# This script prepares the application for deployment

set -e

echo "🚀 Preparing Notes App for Cursor Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "client" ] && [ ! -d "server" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Create production build directories
print_status "Creating production build directories..."
mkdir -p dist/client dist/server

# Build client
print_status "Building client application..."
cd client
if [ ! -d "node_modules" ]; then
    print_status "Installing client dependencies..."
    npm install
fi

print_status "Building client for production..."
npm run build
cd ..

# Copy client build to dist
print_status "Copying client build to dist directory..."
cp -r client/dist/* dist/client/

# Build server
print_status "Building server application..."
cd server
if [ ! -d "node_modules" ]; then
    print_status "Installing server dependencies..."
    npm install
fi

print_status "Building server for production..."
npm run build
cd ..

# Copy server build to dist
print_status "Copying server build to dist directory..."
cp -r server/dist/* dist/server/

# Copy necessary files
print_status "Copying configuration files..."
cp server/package.json dist/server/
cp -r server/node_modules dist/server/ 2>/dev/null || true

# Create production environment file
print_status "Creating production environment template..."
cat > dist/server/.env.production << EOF
# Production Environment Variables
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/notes_app
CLIENT_ORIGIN=https://yourdomain.com
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long_for_production
JWT_EXPIRES_IN=7d
COOKIE_SECURE=true
COOKIE_SAMESITE=none
EMAIL_FROM="Notes App <no-reply@yourdomain.com>"
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
GOOGLE_CLIENT_ID=your_production_google_client_id.apps.googleusercontent.com
EOF

# Create deployment instructions
print_status "Creating deployment instructions..."
cat > DEPLOYMENT.md << EOF
# Cursor Deployment Instructions

## 🚀 Quick Deploy

1. **Upload the \`dist\` folder** to your hosting platform
2. **Set environment variables** in your hosting platform
3. **Start the application** with: \`node dist/server/index.js\`

## 📁 What's in the dist folder?

- \`client/\` - Built React frontend (static files)
- \`server/\` - Built Node.js backend
- \`server/.env.production\` - Environment template

## 🔧 Environment Variables

Copy the values from \`server/.env.production\` to your hosting platform:

- \`MONGO_URI\` - Your MongoDB connection string
- \`JWT_SECRET\` - A strong secret key (32+ characters)
- \`GOOGLE_CLIENT_ID\` - Your Google OAuth client ID
- \`CLIENT_ORIGIN\` - Your frontend domain

## 🌐 Hosting Platforms

### Render
- Upload \`dist\` folder
- Set build command: \`npm install && npm start\`
- Set start command: \`node dist/server/index.js\`

### Railway
- Connect your GitHub repo
- Set environment variables
- Deploy automatically

### Fly.io
- Use \`flyctl deploy\`
- Set environment variables in \`fly.toml\`

## 📱 Frontend Hosting

Deploy the \`dist/client\` folder to:
- Vercel
- Netlify
- GitHub Pages

## 🔍 Health Check

Your app will be available at: \`https://yourdomain.com/api/health\`

## 📧 Support

For issues, check the logs in your hosting platform dashboard.
EOF

# Create a simple start script
print_status "Creating start script..."
cat > dist/start.sh << 'EOF'
#!/bin/bash
cd server
npm install --production
node index.js
EOF

chmod +x dist/start.sh

# Create package.json for the dist folder
print_status "Creating package.json for deployment..."
cat > dist/package.json << EOF
{
  "name": "notes-app-production",
  "version": "1.0.0",
  "description": "Production build of Notes App",
  "main": "server/index.js",
  "scripts": {
    "start": "cd server && npm start",
    "install-deps": "cd server && npm install --production",
    "postinstall": "npm run install-deps"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

print_success "🎉 Deployment package created successfully!"
print_status "📁 Your deployment files are in the \`dist\` folder"
print_status "📖 Check \`DEPLOYMENT.md\` for detailed instructions"
print_status "🚀 Ready to deploy to Cursor or any hosting platform!"

echo ""
echo "📋 Next steps:"
echo "1. Upload the \`dist\` folder to your hosting platform"
echo "2. Set your environment variables"
echo "3. Start the application"
echo ""
echo "💡 For Cursor deployment, you can now:"
echo "- Use the \`dist\` folder in your deployment"
echo "- Follow the instructions in \`DEPLOYMENT.md\`"
echo "- Customize the environment variables as needed"
