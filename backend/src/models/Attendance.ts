import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late';
  markedBy: mongoose.Types.ObjectId;
  remarks?: string;
}

const AttendanceSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  date: { type: Date, required: true, index: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  markedBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  remarks: { type: String }
}, { timestamps: true });

// Compound index to prevent duplicate marking for same student on same day
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
