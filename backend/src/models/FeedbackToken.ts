import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedbackToken extends Document {
  anonToken: string; // UUID
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  cycleYear: string;
  isUsed: boolean;
  expiresAt: Date;
}

const FeedbackTokenSchema: Schema = new Schema({
  anonToken: { type: String, required: true, unique: true },
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  cycleYear: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

FeedbackTokenSchema.index({ student: 1, subject: 1, cycleYear: 1 }, { unique: true });
FeedbackTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model<IFeedbackToken>('FeedbackToken', FeedbackTokenSchema);
