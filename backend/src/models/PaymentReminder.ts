import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentReminder extends Document {
  student: mongoose.Types.ObjectId;
  reminderType: 'sms' | 'email' | 'in_app';
  sentAt: Date;
  status: 'sent' | 'failed' | 'delivered';
  providerRef?: string;
}

const PaymentReminderSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  reminderType: { 
    type: String, 
    required: true, 
    enum: ['sms', 'email', 'in_app'] 
  },
  sentAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    required: true, 
    enum: ['sent', 'failed', 'delivered'],
    default: 'sent'
  },
  providerRef: { type: String }
}, { timestamps: true });

PaymentReminderSchema.index({ student: 1, sentAt: -1 });

export default mongoose.model<IPaymentReminder>('PaymentReminder', PaymentReminderSchema);
