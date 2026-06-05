import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeTransaction extends Document {
  student: mongoose.Types.ObjectId;
  feeStructure: mongoose.Types.ObjectId;
  amountPaid: number; // Positive = payment, negative = refund
  paymentMode: 'online' | 'cash' | 'DD' | 'bank_transfer';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  receiptNumber: string;
  collectedBy?: mongoose.Types.ObjectId;
  bankRef?: string;
  remarks?: string;
}

const FeeTransactionSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructure: { type: Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  amountPaid: { type: Number, required: true },
  paymentMode: { 
    type: String, 
    required: true, 
    enum: ['online', 'cash', 'DD', 'bank_transfer'] 
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'captured', 'failed', 'refunded'],
    default: 'pending'
  },
  receiptNumber: { type: String, required: true, unique: true },
  collectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  bankRef: { type: String },
  remarks: { type: String }
}, { timestamps: true });

// ── IMMUTABLE LEDGER PROTECTION ────────────────────────────
// No Update, No Delete via Mongoose middleware
FeeTransactionSchema.pre('save', function() {
  if (!this.isNew) {
    throw new Error('Fee transactions are immutable and cannot be updated.');
  }
});

FeeTransactionSchema.pre('deleteOne', { document: true, query: false }, function() {
  throw new Error('Fee transactions are immutable and cannot be deleted.');
});

FeeTransactionSchema.pre('findOneAndDelete', function() {
  throw new Error('Fee transactions are immutable and cannot be deleted.');
});

// ── INDEXES ────────────────────────────────────────────────
FeeTransactionSchema.index({ student: 1, status: 1 });
FeeTransactionSchema.index({ createdAt: -1 });
FeeTransactionSchema.index({ razorpayPaymentId: 1 });

export default mongoose.model<IFeeTransaction>('FeeTransaction', FeeTransactionSchema);
