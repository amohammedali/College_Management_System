import mongoose, { Schema, Document } from 'mongoose';

export interface IAppraisal extends Document {
  faculty: mongoose.Types.ObjectId;
  academicYear: string;
  scores: {
    academic: number; // 40%
    research: number; // 30%
    feedback: number; // 20%
    admin: number;    // 10%
  };
  finalScore: number;
  status: 'Draft' | 'Submitted' | 'HOD_Reviewed' | 'Finalized';
  selfEvaluation: string;
  hodRemarks?: string;
  lastUpdated: Date;
}

const AppraisalSchema: Schema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  scores: {
    academic: { type: Number, default: 0, min: 0, max: 40 },
    research: { type: Number, default: 0, min: 0, max: 30 },
    feedback: { type: Number, default: 0, min: 0, max: 20 },
    admin: { type: Number, default: 0, min: 0, max: 10 }
  },
  finalScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'HOD_Reviewed', 'Finalized'],
    default: 'Draft'
  },
  selfEvaluation: { type: String },
  hodRemarks: { type: String }
}, { timestamps: true });

// Ensure one appraisal per faculty per year
AppraisalSchema.index({ faculty: 1, academicYear: 1 }, { unique: true });

export default mongoose.model<IAppraisal>('Appraisal', AppraisalSchema);
