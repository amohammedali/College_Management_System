import mongoose, { Schema, Document } from 'mongoose';

export interface IAccrDocument extends Document {
  criterion: mongoose.Types.ObjectId;
  docTitle: string;
  docType: 'certificate' | 'minutes' | 'policy' | 'report' | 'photo';
  fileUrl: string;
  fileSizeKb: number;
  academicYear: string;
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  expiryDate?: Date;
}

const AccrDocumentSchema: Schema = new Schema({
  criterion: { type: Schema.Types.ObjectId, ref: 'NaacCriterion', required: true },
  docTitle: { type: String, required: true },
  docType: { 
    type: String, 
    required: true, 
    enum: ['certificate', 'minutes', 'policy', 'report', 'photo'] 
  },
  fileUrl: { type: String, required: true },
  fileSizeKb: { type: Number, required: true },
  academicYear: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'Staff' },
  verifiedAt: { type: Date },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  uploadedAt: { type: Date, default: Date.now },
  expiryDate: { type: Date }
}, { timestamps: true });

AccrDocumentSchema.index({ criterion: 1, isVerified: 1 });
AccrDocumentSchema.index({ expiryDate: 1 }, { sparse: true });

export default mongoose.model<IAccrDocument>('AccrDocument', AccrDocumentSchema);
