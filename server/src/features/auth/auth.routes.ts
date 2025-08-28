import { Router } from 'express';
import { AuthController } from './auth.controllers';
import { createRateLimitMiddleware, otpRateLimiter, otpVerifyRateLimiter, authRateLimiter } from '../../core/rateLimit';

const router = Router();

// Rate limiting
router.use(createRateLimitMiddleware(authRateLimiter));

// OTP endpoints with specific rate limiting
router.post('/request-otp', 
  createRateLimitMiddleware(otpRateLimiter),
  AuthController.requestOtp
);

router.post('/verify-otp', 
  createRateLimitMiddleware(otpVerifyRateLimiter),
  AuthController.verifyOtp
);

// Google login
router.post('/google', AuthController.googleLogin);

// User management (requires auth)
router.get('/me', AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
