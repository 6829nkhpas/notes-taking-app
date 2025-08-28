import bcrypt from 'bcryptjs';
import OTP from '../otp/otp.model';
import { sendOTPEmail } from '../../utils/email';
import { createApiError } from '../../core/errors';

export class OTPService {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static async hashOTP(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
  }

  private static async verifyOTP(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  static async createOTP(email: string): Promise<string> {
    // Clear any existing OTPs for this email
    await OTP.deleteMany({ email });

    const otp = this.generateOTP();
    const codeHash = await this.hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({
      email,
      codeHash,
      expiresAt
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    return otp;
  }

  static async verifyOTP(email: string, otp: string): Promise<boolean> {
    const otpRecord = await OTP.findOne({ 
      email, 
      expiresAt: { $gt: new Date() } 
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw createApiError('OTP expired or not found', 400, 'OTP_EXPIRED');
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteMany({ email });
      throw createApiError('Too many failed attempts. Please request a new OTP', 400, 'OTP_MAX_ATTEMPTS');
    }

    // Verify OTP
    const isValid = await this.verifyOTP(otp, otpRecord.codeHash);
    
    if (!isValid) {
      // Increment attempts
      await OTP.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
      throw createApiError('Invalid OTP code', 400, 'OTP_INVALID');
    }

    // Clear OTP on successful verification
    await OTP.deleteMany({ email });
    
    return true;
  }

  static async cleanupExpiredOTPs(): Promise<void> {
    await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}
