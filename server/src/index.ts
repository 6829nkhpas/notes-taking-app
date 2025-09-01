import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import env from './config/env';

// Import routes
import authRoutes from './features/auth/auth.routes';
import notesRoutes from './features/notes/notes.routes';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      env.CLIENT_ORIGIN,
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4000',
      'http://localhost:5173',
      'http://localhost:4000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(logger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Debug endpoint to test cookie setting
app.get('/api/debug/set-cookie', (req, res) => {
  const origin = req.get('origin') || req.get('host');
  console.log('Debug: Setting test cookie, origin:', origin);
  
  res.cookie('test_cookie', 'test_value_123', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 1000 // 1 minute
  });
  
  console.log('Debug: Test cookie set with options:', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 1000
  });
  
  res.json({ 
    success: true, 
    message: 'Test cookie set',
    origin: origin,
    domain: 'browser default'
  });
});

// Debug endpoint to check cookies
app.get('/api/debug/check-cookies', (req, res) => {
  console.log('Debug: All cookies received:', req.cookies);
  console.log('Debug: All headers:', req.headers);
  
  res.json({ 
    cookies: req.cookies,
    headers: req.headers,
    message: 'Check server console for detailed logs'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND'
  });
});

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client origin: ${env.CLIENT_ORIGIN}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
