import mongoose, { Schema, Document } from 'mongoose';

export interface IAppraisalCycle extends Document {
  faculty: mongoose.Types.ObjectId;
  cycleYear: string;
  status: 'draft' | 'self_eval' | 'hod_review' | 'principal_approved' | 'closed';
  academicScore: number;
  researchScore: number;
  feedbackScore: number;
  adminScore: number;
  apiScore: number;
  apiGrade: string;
  promotionEligible: boolean;
  hodRemarks?: string;
  initiatedBy: mongoose.Types.ObjectId;
  initiatedAt: Date;
  closedAt?: Date;
}

const AppraisalCycleSchema: Schema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  cycleYear: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['draft', 'self_eval', 'hod_review', 'principal_approved', 'closed'],
    default: 'draft'
  },
  academicScore: { type: Number, default: 0 },
  researchScore: { type: Number, default: 0 },
  feedbackScore: { type: Number, default: 0 },
  adminScore: { type: Number, default: 0 },
  apiScore: { type: Number, default: 0 },
  apiGrade: { type: String },
  promotionEligible: { type: Boolean, default: false },
  hodRemarks: { type: String },
  initiatedBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  initiatedAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
}, { timestamps: true });

AppraisalCycleSchema.index({ faculty: 1, cycleYear: 1 }, { unique: true });
AppraisalCycleSchema.index({ cycleYear: 1, promotionEligible: 1 });

export default mongoose.model<IAppraisalCycle>('AppraisalCycle', AppraisalCycleSchema);
