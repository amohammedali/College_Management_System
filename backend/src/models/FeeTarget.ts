import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeTarget extends Document {
  department: string;
  academicYear: number;
  regulation: string;
  targetAmount: number;
  year: number; // Calendar year for targets
}

const FeeTargetSchema: Schema = new Schema({
  department: { type: String, required: true },
  academicYear: { type: Number, required: true },
  regulation: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  year: { type: Number, required: true }
}, { timestamps: true });

FeeTargetSchema.index({ department: 1, academicYear: 1, regulation: 1, year: 1 }, { unique: true });

export default mongoose.model<IFeeTarget>('FeeTarget', FeeTargetSchema);
