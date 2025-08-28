import { Schema, model } from 'mongoose';

export interface IOTP {
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>({
  email: { 
    type: String, 
    index: true,
    lowercase: true,
    trim: true
  },
  codeHash: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index
  },
  attempts: { 
    type: Number, 
    default: 0,
    max: 5
  }
}, { 
  timestamps: true 
});

// Index for efficient email lookups
otpSchema.index({ email: 1, createdAt: -1 });

export default model<IOTP>('OTP', otpSchema);
