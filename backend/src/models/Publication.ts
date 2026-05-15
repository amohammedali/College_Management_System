import mongoose, { Schema, Document } from 'mongoose';

export interface IPublication extends Document {
  faculty: mongoose.Types.ObjectId;
  title: string;
  journalName: string;
  type: 'Journal' | 'Book' | 'Conference' | 'Patent';
  impactFactor: number;
  year: number;
  authors: string[];
  url?: string;
  isVerified: boolean;
}

const PublicationSchema: Schema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  journalName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Journal', 'Book', 'Conference', 'Patent'],
    required: true 
  },
  impactFactor: { type: Number, default: 0 },
  year: { type: Number, required: true },
  authors: [{ type: String }],
  url: { type: String },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IPublication>('Publication', PublicationSchema);
