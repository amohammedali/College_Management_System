import mongoose, { Schema, Document } from 'mongoose';

export interface ISSRDocument extends Document {
  criterion: mongoose.Types.ObjectId; // Ref to Accreditation
  title: string;
  fileUrl: string;
  fileType: string;
  academicYear: string;
  uploadedBy: mongoose.Types.ObjectId;
  version: number;
  tags: string[];
  isVerified: boolean;
  remarks?: string;
}

const SSRDocumentSchema: Schema = new Schema({
  criterion: { type: Schema.Types.ObjectId, ref: 'Accreditation', required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  academicYear: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  version: { type: Number, default: 1 },
  tags: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  remarks: { type: String }
}, { timestamps: true });

export default mongoose.model<ISSRDocument>('SSRDocument', SSRDocumentSchema);
