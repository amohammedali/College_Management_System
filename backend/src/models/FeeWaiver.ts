import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeWaiver extends Document {
  student: mongoose.Types.ObjectId;
  feeStructure: mongoose.Types.ObjectId;
  waiverType: 'scholarship' | 'govt' | 'management' | 'merit';
  waiverAmount?: number;
  waiverPercent?: number;
  approvedBy: mongoose.Types.ObjectId;
  approvalDate: Date;
  documentUrl?: string;
}

const FeeWaiverSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructure: { type: Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  waiverType: { 
    type: String, 
    required: true, 
    enum: ['scholarship', 'govt', 'management', 'merit'] 
  },
  waiverAmount: { type: Number },
  waiverPercent: { type: Number, min: 0, max: 100 },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvalDate: { type: Date, default: Date.now },
  documentUrl: { type: String }
}, { timestamps: true });

// Validation: (waiver_amount IS NOT NULL OR waiver_percent IS NOT NULL)
FeeWaiverSchema.pre('save', function(next) {
  if (this.waiverAmount === undefined && this.waiverPercent === undefined) {
    return next(new Error('Either waiverAmount or waiverPercent must be specified.'));
  }
  next();
});

export default mongoose.model<IFeeWaiver>('FeeWaiver', FeeWaiverSchema);
