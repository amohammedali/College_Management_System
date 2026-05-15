import mongoose, { Schema, Document } from 'mongoose';

export interface ISyllabusUnit extends Document {
  subject: mongoose.Types.ObjectId;
  unitNumber: number;
  unitName: string;
  totalHours: number;
  expectedWeekRange: string; // e.g. "Week 1-3"
  resources: {
    type: 'PDF' | 'Lab Manual' | 'Video' | 'Link';
    title: string;
    url: string;
  }[];
}

const SyllabusUnitSchema: Schema = new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  unitNumber: { type: Number, required: true },
  unitName: { type: String, required: true },
  totalHours: { type: Number, required: true },
  expectedWeekRange: { type: String },
  resources: [{
    type: { type: String, enum: ['PDF', 'Lab Manual', 'Video', 'Link'], required: true },
    title: { type: String, required: true },
    url: { type: String, required: true }
  }]
}, { timestamps: true });

// Ensure unit numbers are unique per subject
SyllabusUnitSchema.index({ subject: 1, unitNumber: 1 }, { unique: true });

export default mongoose.model<ISyllabusUnit>('SyllabusUnit', SyllabusUnitSchema);
