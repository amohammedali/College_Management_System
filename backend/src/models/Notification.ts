import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  broadcast: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: 'announcement' | 'reminder' | 'alert';
  isRead: boolean;
  readAt?: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  broadcast: { type: Schema.Types.ObjectId, ref: 'Broadcast', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['announcement', 'reminder', 'alert'],
    default: 'announcement'
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });

// Index for fast lookup of unread notifications for a user
NotificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
