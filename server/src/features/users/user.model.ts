import { Schema, model } from 'mongoose';

export interface IUser {
  email: string;
  name?: string;
  provider: 'email' | 'google';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    unique: true, 
    required: true,
    lowercase: true,
    trim: true
  },
  name: { 
    type: String,
    trim: true
  },
  provider: { 
    type: String, 
    enum: ['email', 'google'], 
    required: true 
  },
  googleId: { 
    type: String,
    sparse: true // Allows multiple null values
  }
}, { 
  timestamps: true 
});

// Compound index for Google users
userSchema.index({ provider: 1, googleId: 1 }, { sparse: true });

export default model<IUser>('User', userSchema);
