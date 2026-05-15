import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  type: 'dropout_risk' | 'enrollment_forecast' | 'health_index' | 'revenue_projection';
  dataPoints: any;
  summary: string;
  score?: number; // Normalized 0-100 score
  metadata: {
    dept?: mongoose.Types.ObjectId;
    batch?: string;
    generatedAt: Date;
  };
}

const AnalyticsSchema: Schema = new Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['dropout_risk', 'enrollment_forecast', 'health_index', 'revenue_projection'] 
  },
  dataPoints: { type: Schema.Types.Mixed, required: true },
  summary: { type: String, required: true },
  score: { type: Number, min: 0, max: 100 },
  metadata: {
    dept: { type: Schema.Types.ObjectId, ref: 'Department' },
    batch: { type: String },
    generatedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Index for quick retrieval of latest insights by type
AnalyticsSchema.index({ type: 1, 'metadata.generatedAt': -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
