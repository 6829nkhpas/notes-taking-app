import User from '../users/user.model';
import { signAccessToken } from '../../utils/jwt';
import { createApiError } from '../../core/errors';

export class AuthService {
  static async issueSession(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) {
      throw createApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    return signAccessToken({ id: userId, email: user.email });
  }

  static async upsertUser(email: string, data: { name?: string; provider: 'email' | 'google'; googleId?: string }): Promise<any> {
    const user = await User.findOneAndUpdate(
      { email },
      { 
        ...data,
        email: email.toLowerCase()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    if (!user) {
      throw createApiError('Failed to create user', 500, 'USER_CREATION_FAILED');
    }

    return user;
  }

  static async getUserById(userId: string): Promise<any> {
    return User.findById(userId);
  }

  static async getUserByEmail(email: string): Promise<any> {
    return User.findOne({ email: email.toLowerCase() });
  }

  static async getUserByGoogleId(googleId: string): Promise<any> {
    return User.findOne({ googleId, provider: 'google' });
  }
}
