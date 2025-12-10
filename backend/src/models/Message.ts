import mongoose, { Schema, Document } from 'mongoose';
import { Message } from '../types';

export interface MessageDocument extends Message, Document {}

const MessageSchema = new Schema<MessageDocument>(
  {
    role: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    sessionId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
MessageSchema.index({ createdAt: 1 });
MessageSchema.index({ sessionId: 1 });

export const MessageModel = mongoose.model<MessageDocument>('Message', MessageSchema);

