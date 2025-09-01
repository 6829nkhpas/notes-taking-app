import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { createApiError } from '../core/errors';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('requireAuth: Checking authentication...');
    console.log('requireAuth: Request URL:', req.url);
    console.log('requireAuth: Request method:', req.method);
    console.log('requireAuth: Cookies:', req.cookies);
    console.log('requireAuth: Authorization header:', req.headers.authorization);
    
    // Get token from cookie first, then Authorization header as fallback
    const token = req.cookies.access_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('requireAuth: No token found');
      throw createApiError('Access token required', 401, 'TOKEN_MISSING');
    }
    
    console.log('requireAuth: Token found:', !!token);
    
    const payload = verifyToken(token);
    req.user = payload;
    
    console.log('requireAuth: Token verified successfully');
    next();
  } catch (error) {
    console.log('requireAuth: Error name:', error instanceof Error ? error.name : 'Unknown');
    console.log('requireAuth: Error message:', error instanceof Error ? error.message : 'Unknown');
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(createApiError('Invalid token', 401, 'TOKEN_INVALID'));
    } else if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(createApiError('Token expired', 401, 'TOKEN_EXPIRED'));
    } else {
      next(createApiError('Authentication failed', 401, 'AUTH_FAILED'));
    }
  }
}
