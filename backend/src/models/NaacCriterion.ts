import mongoose, { Schema, Document } from 'mongoose';

export interface INaacCriterion extends Document {
  criterionCode: string;
  criterionName: string;
  maxScore: number;
  dataSource: 'students' | 'staff' | 'curriculum' | 'fee' | 'other';
  aggregationQuery?: string;
  weightPercent: number;
  isActive: boolean;
}

const NaacCriterionSchema: Schema = new Schema({
  criterionCode: { type: String, required: true, unique: true },
  criterionName: { type: String, required: true },
  maxScore: { type: Number, required: true },
  dataSource: { 
    type: String, 
    required: true, 
    enum: ['students', 'staff', 'curriculum', 'fee', 'other'] 
  },
  aggregationQuery: { type: String },
  weightPercent: { type: Number, required: true, min: 0, max: 100 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<INaacCriterion>('NaacCriterion', NaacCriterionSchema);
