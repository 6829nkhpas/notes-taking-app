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
    // Get token from cookie first, then Authorization header as fallback
    const token = req.cookies.access_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw createApiError('Access token required', 401, 'TOKEN_MISSING');
    }

    const payload = verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(createApiError('Invalid token', 401, 'TOKEN_INVALID'));
    } else if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(createApiError('Token expired', 401, 'TOKEN_EXPIRED'));
    } else {
      next(createApiError('Authentication failed', 401, 'AUTH_FAILED'));
    }
  }
}
