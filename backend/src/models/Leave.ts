import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'student', 'non-teaching'], required: true },
  type: { type: String, required: true },
  range: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: { type: String }
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
