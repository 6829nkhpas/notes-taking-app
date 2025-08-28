import { Request, Response, NextFunction } from 'express';
import { requestOtpSchema, verifyOtpSchema, googleLoginSchema } from './auth.schemas';
import { OTPService } from './otp.service';
import { AuthService } from './auth.service';
import { ok, created } from '../../core/http';
import { createApiError } from '../../core/errors';
import env from '../../config/env';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export class AuthController {
  static async requestOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = requestOtpSchema.parse(req.body);
      
      await OTPService.createOTP(email);
      
      return ok(res, { message: 'OTP sent successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = verifyOtpSchema.parse(req.body);
      
      // Verify OTP
      await OTPService.verifyOTP(email, otp);
      
      // Upsert user
      const user = await AuthService.upsertUser(email, { provider: 'email' });
      
      // Issue JWT token
      const token = await AuthService.issueSession(user._id.toString());
      
      // Set httpOnly cookie
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      return ok(res, {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          provider: user.provider
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = googleLoginSchema.parse(req.body);
      
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        throw createApiError('Invalid Google token', 400, 'GOOGLE_TOKEN_INVALID');
      }
      
      const { email, name, sub: googleId } = payload;
      if (!email) {
        throw createApiError('Email not provided by Google', 400, 'GOOGLE_EMAIL_MISSING');
      }
      
      // Upsert user
      const user = await AuthService.upsertUser(email, { 
        name, 
        provider: 'google', 
        googleId 
      });
      
      // Issue JWT token
      const token = await AuthService.issueSession(user._id.toString());
      
      // Set httpOnly cookie
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: env.COOKIE_SECURE,
        sameSite: env.COOKIE_SECURE ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      return ok(res, {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          provider: user.provider
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getUserById(req.user.id);
      if (!user) {
        throw createApiError('User not found', 404, 'USER_NOT_FOUND');
      }
      
      return ok(res, {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          provider: user.provider
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('access_token');
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
