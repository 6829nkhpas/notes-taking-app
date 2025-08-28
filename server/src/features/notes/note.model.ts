import { Schema, model, Types } from 'mongoose';

export interface INote {
  userId: Types.ObjectId;
  title: string;
  body?: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  userId: { 
    type: Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  title: { 
    type: String, 
    required: true, 
    maxlength: 100,
    trim: true
  },
  body: { 
    type: String, 
    default: '',
    maxlength: 5000,
    trim: true
  }
}, { 
  timestamps: true 
});

// Index for efficient user queries
noteSchema.index({ userId: 1, createdAt: -1 });

export default model<INote>('Note', noteSchema);
