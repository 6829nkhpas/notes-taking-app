import jwt from 'jsonwebtoken';
import env from '../config/env';

export interface JWTPayload {
  id: string;
  email: string;
}

export function signAccessToken(payload: JWTPayload): string {
  console.log('JWT: Signing token with secret length:', env.JWT_SECRET.length);
  console.log('JWT: Signing token for payload:', payload);
  
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
  
  console.log('JWT: Token signed successfully, length:', token.length);
  return token;
}

export function verifyToken(token: string): JWTPayload {
  try {
    console.log('JWT: Verifying token, length:', token.length);
    console.log('JWT: Token preview:', token.substring(0, 20) + '...');
    console.log('JWT: Secret length:', env.JWT_SECRET.length);
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    console.log('JWT: Token verified successfully:', decoded);
    return decoded;
  } catch (error) {
    console.log('JWT: Token verification failed:', error);
    throw error;
  }
}
