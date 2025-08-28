import { api } from '../../app/axios';

export const requestOtp = (email: string) => 
  api.post('/auth/request-otp', { email });

export const verifyOtp = (email: string, otp: string) => 
  api.post('/auth/verify-otp', { email, otp });

export const googleLogin = (idToken: string) => 
  api.post('/auth/google', { idToken });

export const me = () => 
  api.get('/auth/me');

export const logout = () => 
  api.post('/auth/logout');
