import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

// Rate limiter for OTP requests (5 per hour per IP)
export const otpRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 5,
  duration: 60 * 60, // 1 hour
});

// Rate limiter for OTP verification attempts (3 per hour per IP)
export const otpVerifyRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 3,
  duration: 60 * 60, // 1 hour
});

// Rate limiter for auth endpoints (20 per hour per IP)
export const authRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip || 'unknown',
  points: 20,
  duration: 60 * 60, // 1 hour
});

export function createRateLimitMiddleware(limiter: RateLimiterMemory) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await limiter.consume(req.ip || 'unknown');
      next();
    } catch (error: any) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  };
}
