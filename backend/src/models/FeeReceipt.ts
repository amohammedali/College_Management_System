import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeReceipt extends Document {
  transaction: mongoose.Types.ObjectId;
  receiptNumber: string;
  pdfUrl: string;
  generatedAt: Date;
  generatedBy: mongoose.Types.ObjectId;
}

const FeeReceiptSchema: Schema = new Schema({
  transaction: { type: Schema.Types.ObjectId, ref: 'FeeTransaction', required: true, unique: true },
  receiptNumber: { type: String, required: true, unique: true },
  pdfUrl: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IFeeReceipt>('FeeReceipt', FeeReceiptSchema);
