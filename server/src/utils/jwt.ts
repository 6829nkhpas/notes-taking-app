import jwt from 'jsonwebtoken';
import env from '../config/env';

export interface JWTPayload {
  id: string;
  email: string;
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw error;
  }
}
