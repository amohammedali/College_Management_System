import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveBalance extends Document {
  user: mongoose.Types.ObjectId;
  academicYear: string;
  balances: {
    sick: number;
    casual: number;
    duty: number;
    earned: number;
  };
}

const LeaveBalanceSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  balances: {
    sick: { type: Number, default: 10 },
    casual: { type: Number, default: 12 },
    duty: { type: Number, default: 15 },
    earned: { type: Number, default: 30 }
  }
}, { timestamps: true });

// One balance per user per year
LeaveBalanceSchema.index({ user: 1, academicYear: 1 }, { unique: true });

export default mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);
