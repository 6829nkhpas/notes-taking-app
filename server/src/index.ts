import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import env from './config/env';

// Import routes (will create these next)
// import authRoutes from './features/auth/auth.routes';
// import notesRoutes from './features/notes/notes.routes';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_ORIGIN,
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
// app.use('/api/auth', authRoutes);
// app.use('/api/notes', notesRoutes);

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
