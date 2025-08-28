import nodemailer from 'nodemailer';
import env from '../config/env';

// Create transporter (in dev, this will just log to console)
const transporter = nodemailer.createTransporter({
  host: env.SMTP_HOST || 'localhost',
  port: env.SMTP_PORT || 587,
  secure: false,
  auth: env.SMTP_USER ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  } : undefined,
  // In development, log emails to console
  ...(process.env.NODE_ENV === 'development' && {
    logger: true,
    debug: true
  })
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Your OTP Code - Notes App',
    html: `
      <h2>Your OTP Code</h2>
      <p>Use this code to verify your email: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 OTP Email (dev mode):', { to: email, otp });
      return;
    }
    
    await transporter.sendMail(mailOptions);
    console.log('📧 OTP email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}
