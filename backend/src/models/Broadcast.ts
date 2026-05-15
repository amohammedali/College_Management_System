import mongoose, { Schema, Document } from 'mongoose';

export interface IBroadcast extends Document {
  title: string;
  content: string;
  sender: mongoose.Types.ObjectId;
  channels: ('in-app' | 'email' | 'sms')[];
  targetAudience: {
    roles?: string[];
    departments?: string[];
    batches?: string[];
  };
  scheduledAt: Date;
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Failed';
  stats: {
    targetCount: number;
    readCount: number;
    failCount: number;
  };
}

const BroadcastSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  channels: [{ type: String, enum: ['in-app', 'email', 'sms'] }],
  targetAudience: {
    roles: [{ type: String }],
    departments: [{ type: String }],
    batches: [{ type: String }]
  },
  scheduledAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Draft', 'Scheduled', 'Sent', 'Failed'],
    default: 'Draft'
  },
  stats: {
    targetCount: { type: Number, default: 0 },
    readCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model<IBroadcast>('Broadcast', BroadcastSchema);
