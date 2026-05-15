import mongoose, { Schema, Document } from 'mongoose';

export interface IScoreSnapshot extends Document {
  department?: mongoose.Types.ObjectId; // NULL = institution level
  cycleYear: string;
  cgpaForecast: number;
  predictedGrade: 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'C';
  totalScore: number;
  maxPossible: number;
  criteriaCount: number;
  snapshotAt: Date;
  nextCycleDate?: Date;
}

const ScoreSnapshotSchema: Schema = new Schema({
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  cycleYear: { type: String, required: true },
  cgpaForecast: { type: Number, required: true },
  predictedGrade: { 
    type: String, 
    required: true, 
    enum: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C'] 
  },
  totalScore: { type: Number, required: true },
  maxPossible: { type: Number, required: true },
  criteriaCount: { type: Number, required: true },
  snapshotAt: { type: Date, default: Date.now },
  nextCycleDate: { type: Date }
}, { timestamps: true });

ScoreSnapshotSchema.index({ department: 1, cycleYear: 1, snapshotAt: -1 }, { unique: true });

export default mongoose.model<IScoreSnapshot>('ScoreSnapshot', ScoreSnapshotSchema);
