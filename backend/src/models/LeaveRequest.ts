import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  user: mongoose.Types.ObjectId;
  role: 'student' | 'staff';
  type: 'Sick' | 'Casual' | 'Duty' | 'Medical' | 'Earned';
  startDate: Date;
  endDate: Date;
  reason: string;
  documentUrl?: string;
  status: 'Pending' | 'HOD_Approved' | 'Approved' | 'Rejected';
  approvals: {
    step: 'HOD' | 'Principal';
    approver: mongoose.Types.ObjectId;
    date: Date;
    remarks?: string;
  }[];
  attendanceAdjusted: boolean;
}

const LeaveRequestSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['student', 'staff'], required: true },
  type: { 
    type: String, 
    enum: ['Sick', 'Casual', 'Duty', 'Medical', 'Earned'],
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  documentUrl: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'HOD_Approved', 'Approved', 'Rejected'],
    default: 'Pending' 
  },
  approvals: [{
    step: { type: String, enum: ['HOD', 'Principal'] },
    approver: { type: Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    remarks: { type: String }
  }],
  attendanceAdjusted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
