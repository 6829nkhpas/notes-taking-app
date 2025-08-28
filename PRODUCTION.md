# Production Deployment Guide

## Environment Setup

### Backend Environment Variables
```bash
# Required
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/notes_app
CLIENT_ORIGIN=https://yourdomain.com
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
JWT_EXPIRES_IN=7d

# Security (Production)
COOKIE_SECURE=true
COOKIE_SAMESITE=none

# Email (Production)
EMAIL_FROM="Notes App <no-reply@yourdomain.com>"
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_production_google_client_id.apps.googleusercontent.com
```

### Frontend Environment Variables
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id.apps.googleusercontent.com
```

## Security Hardening

### JWT Configuration
- Use a strong, random JWT_SECRET (at least 32 characters)
- Set reasonable expiration time (7-30 days)
- Rotate secrets periodically

### Cookie Security
- Set `COOKIE_SECURE=true` for HTTPS
- Set `COOKIE_SAMESITE=none` for cross-site requests
- Use `httpOnly` flag (already implemented)

### CORS Configuration
- Restrict `CLIENT_ORIGIN` to your production domain
- Never use `*` in production

### Rate Limiting
- Current limits: 5 OTP requests/hour, 3 verifications/hour
- Adjust based on your user base and requirements

## Deployment Platforms

### Backend Options
- **Render**: Easy deployment, free tier available
- **Railway**: Simple deployment, good for small apps
- **Fly.io**: Global deployment, good performance
- **Heroku**: Mature platform, good documentation

### Frontend Options
- **Vercel**: Excellent for React apps, automatic deployments
- **Netlify**: Great static hosting, good CI/CD
- **GitHub Pages**: Free, good for simple apps

## Database Setup

### MongoDB Atlas
1. Create cluster in your preferred region
2. Set up database user with read/write permissions
3. Configure network access (IP whitelist or 0.0.0.0/0)
4. Get connection string and update MONGO_URI

### Local MongoDB
- Not recommended for production
- Use only for development/testing

## Email Service

### SendGrid (Recommended)
1. Create SendGrid account
2. Verify your domain
3. Generate API key
4. Update SMTP settings in .env

### Alternatives
- **Brevo (Sendinblue)**: Good free tier
- **Mailgun**: Developer-friendly
- **AWS SES**: Cost-effective for high volume

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add production domains to authorized origins
6. Update GOOGLE_CLIENT_ID in both client and server

## Monitoring & Logging

### Application Monitoring
- Implement proper logging (already using morgan)
- Set up error tracking (Sentry, LogRocket)
- Monitor API response times

### Database Monitoring
- Set up MongoDB Atlas alerts
- Monitor connection pool usage
- Track slow queries

## Backup Strategy

### Database Backups
- MongoDB Atlas provides automatic backups
- Set up regular backup verification
- Test restore procedures

### Code Backups
- Use Git for version control
- Set up automated deployments
- Keep deployment scripts in repository

## SSL/TLS

### Frontend
- Most hosting platforms provide SSL automatically
- Ensure HTTPS is enforced

### Backend
- Use reverse proxy (Nginx) with Let's Encrypt
- Or use platform-provided SSL

## Performance Optimization

### Backend
- Enable compression (already using helmet)
- Implement caching for static data
- Use database indexes (already implemented)

### Frontend
- Enable code splitting
- Optimize bundle size
- Use CDN for static assets

## Testing in Production

1. Test authentication flows
2. Verify email delivery
3. Test Google OAuth
4. Check mobile responsiveness
5. Verify error handling
6. Test rate limiting

## Rollback Plan

1. Keep previous deployment ready
2. Use feature flags for new features
3. Maintain database migration scripts
4. Document rollback procedures
