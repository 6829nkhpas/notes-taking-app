import { z } from 'zod';

export const requestOtpSchema = z.object({ 
  email: z.string().email('Please enter a valid email address') 
});

export const verifyOtpSchema = z.object({ 
  email: z.string().email('Please enter a valid email address'), 
  otp: z.string().length(6, 'OTP must be exactly 6 digits') 
});

export const googleLoginSchema = z.object({ 
  idToken: z.string().min(10, 'Invalid Google token') 
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
