import mongoose, { Schema, Document } from 'mongoose';

export interface IGapAnalysis extends Document {
  criterion: mongoose.Types.ObjectId;
  currentScore: number;
  targetScore: number;
  gap: number; // target - current
  actionRequired: string;
  assignedTo: mongoose.Types.ObjectId;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

const GapAnalysisSchema: Schema = new Schema({
  criterion: { type: Schema.Types.ObjectId, ref: 'NaacCriterion', required: true },
  currentScore: { type: Number, required: true },
  targetScore: { type: Number, required: true },
  gap: { type: Number, required: true },
  actionRequired: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open'
  }
}, { timestamps: true });

GapAnalysisSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model<IGapAnalysis>('GapAnalysis', GapAnalysisSchema);
