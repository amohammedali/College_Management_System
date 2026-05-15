import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetableSlot extends Document {
  dept_id: mongoose.Types.ObjectId;
  section: string;
  academic_year: number; // 1, 2, 3, 4
  semester: number; // 1 to 8
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  period: number; // 1 to 8
  subject_id: mongoose.Types.ObjectId;
  faculty_ids: mongoose.Types.ObjectId[];
  room_id: mongoose.Types.ObjectId;
  regulation_year: number;
  auditLog: any[];
}

const auditSchema = new Schema({
  action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  details: String
});

const timetableSlotSchema = new Schema<ITimetableSlot>({
  dept_id: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  section: { type: String, required: true },
  academic_year: { type: Number, required: true },
  semester: { type: Number, required: true },
  day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], required: true },
  period: { type: Number, min: 1, max: 8, required: true },
  subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  faculty_ids: [{ type: Schema.Types.ObjectId, ref: 'Staff', required: true }],
  room_id: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  regulation_year: { type: Number, required: true },
  auditLog: [auditSchema]
}, { timestamps: true });

// CRITICAL: Unique constraint to prevent double-booking at DB level
timetableSlotSchema.index({ dept_id: 1, section: 1, academic_year: 1, semester: 1, day: 1, period: 1 }, { unique: true });

// Optimized indices for conflict detection
timetableSlotSchema.index({ faculty_ids: 1, day: 1, period: 1 });
timetableSlotSchema.index({ room_id: 1, day: 1, period: 1 });

export default mongoose.model<ITimetableSlot>('TimetableSlot', timetableSlotSchema);
