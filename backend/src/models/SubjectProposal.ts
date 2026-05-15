import mongoose, { Schema, Document } from 'mongoose';
import { SubjectType } from './Subject.js';

export interface ISubjectProposal extends Document {
  name: string;
  code: string;
  department: string;
  semester: number;
  type: SubjectType;
  regulation: string;
  credits: {
    lecture: number;
    tutorial: number;
    practical: number;
    total: number;
  };
  justification: string;
  proposedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  adminNote?: string;
}

const SubjectProposalSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  type: { type: String, enum: Object.values(SubjectType), default: SubjectType.THEORY },
  regulation: { type: String, required: true },
  credits: {
    lecture: { type: Number, default: 3 },
    tutorial: { type: Number, default: 0 },
    practical: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  justification: { type: String, required: true },
  proposedBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  adminNote: { type: String }
}, { timestamps: true });

export default mongoose.model<ISubjectProposal>('SubjectProposal', SubjectProposalSchema);
