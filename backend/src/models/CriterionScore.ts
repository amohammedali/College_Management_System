import mongoose, { Schema, Document } from 'mongoose';

export interface ICriterionScore extends Document {
  criterion: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  score: number;
  maxScore: number;
  compliancePercent: number;
  snapshotAt: Date;
  computedBy: string;
  rawData: any;
}

const CriterionScoreSchema: Schema = new Schema({
  criterion: { type: Schema.Types.ObjectId, ref: 'NaacCriterion', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  compliancePercent: { type: Number, required: true, min: 0, max: 100 },
  snapshotAt: { type: Date, default: Date.now },
  computedBy: { type: String, required: true },
  rawData: { type: Schema.Types.Mixed }
}, { timestamps: true });

CriterionScoreSchema.index({ criterion: 1, snapshotAt: -1 });

export default mongoose.model<ICriterionScore>('CriterionScore', CriterionScoreSchema);
