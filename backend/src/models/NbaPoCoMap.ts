import mongoose, { Schema, Document } from 'mongoose';

export interface INbaPoCoMap extends Document {
  subject: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  regulationYear: string;
  poNumber: number; // 1 to 12
  coNumber: number;
  coDescription: string;
  correlationLevel: number; // 1, 2, or 3
  attainmentPercent: number;
  targetPercent: number;
  isAttained: boolean;
}

const NbaPoCoMapSchema: Schema = new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  regulationYear: { type: String, required: true },
  poNumber: { type: Number, required: true, min: 1, max: 12 },
  coNumber: { type: Number, required: true },
  coDescription: { type: String, required: true },
  correlationLevel: { type: Number, required: true, enum: [1, 2, 3] },
  attainmentPercent: { type: Number, default: 0 },
  targetPercent: { type: Number, required: true, default: 60 },
  isAttained: { type: Boolean, default: false }
}, { timestamps: true });

NbaPoCoMapSchema.index({ subject: 1, poNumber: 1, coNumber: 1, regulationYear: 1 }, { unique: true });
NbaPoCoMapSchema.index({ department: 1, isAttained: 1 });

export default mongoose.model<INbaPoCoMap>('NbaPoCoMap', NbaPoCoMapSchema);
