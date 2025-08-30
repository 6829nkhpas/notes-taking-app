import { z } from 'zod';

export const emailSchema = z.object({ 
  email: z.string().email('Enter a valid email') 
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Enter a valid email')
});

export const otpSchema = z.object({ 
  email: z.string().email('Enter a valid email'), 
  otp: z.string().length(6, '6-digit code required') 
});

export const googleSchema = z.object({ 
  idToken: z.string().min(10, 'Invalid Google token') 
});

export type EmailInput = z.infer<typeof emailSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type GoogleInput = z.infer<typeof googleSchema>;
