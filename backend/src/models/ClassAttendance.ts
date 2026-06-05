import mongoose, { Schema, Document } from 'mongoose';

export interface IClassAttendance extends Document {
  subject: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  department: string;
  year: number;
  section: string;
  date: Date;
  hour: number;
  students: {
    studentId: mongoose.Types.ObjectId;
    status: 'present' | 'absent' | 'late';
  }[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

const ClassAttendanceSchema: Schema = new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  faculty: { type: Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
  department: { type: String, required: true, index: true },
  year: { type: Number, required: true, index: true },
  section: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  hour: { type: Number, required: true },
  students: [{
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true }
  }],
  totalStudents: { type: Number, required: true },
  presentCount: { type: Number, required: true },
  absentCount: { type: Number, required: true }
}, { timestamps: true });

// Prevent duplicate attendance for same subject, date, hour in the same class
ClassAttendanceSchema.index({ subject: 1, date: 1, hour: 1, section: 1, year: 1 }, { unique: true });

export default mongoose.model<IClassAttendance>('ClassAttendance', ClassAttendanceSchema);
