import mongoose, { Schema, Document } from 'mongoose';

export interface IAccreditation extends Document {
  type: 'NAAC' | 'NBA';
  criterionId: string; // e.g., "1.1.1" or "PO1"
  name: string;
  weightage: number;
  currentScore: number;
  maxScore: number;
  status: 'Not Started' | 'In Progress' | 'In Review' | 'Verified';
  lastRefreshed: Date;
  metadata: any; // Dynamic data like calculation rules
}

const AccreditationSchema: Schema = new Schema({
  type: { type: String, enum: ['NAAC', 'NBA'], required: true },
  criterionId: { type: String, required: true },
  name: { type: String, required: true },
  weightage: { type: Number, default: 0 },
  currentScore: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Not Started', 'In Progress', 'In Review', 'Verified'],
    default: 'Not Started'
  },
  lastRefreshed: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Ensure unique criteria per type
AccreditationSchema.index({ type: 1, criterionId: 1 }, { unique: true });

export default mongoose.model<IAccreditation>('Accreditation', AccreditationSchema);
