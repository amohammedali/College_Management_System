import mongoose, { Schema, Document } from 'mongoose';

export interface IFacultyAvailability extends Document {
  faculty_id: mongoose.Types.ObjectId;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  period: number; // 1 to 8
  is_available: boolean;
}

const facultyAvailabilitySchema = new Schema<IFacultyAvailability>({
  faculty_id: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], required: true },
  period: { type: Number, min: 1, max: 8, required: true },
  is_available: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent duplicate availability records for the same faculty/time
facultyAvailabilitySchema.index({ faculty_id: 1, day: 1, period: 1 }, { unique: true });

export default mongoose.model<IFacultyAvailability>('FacultyAvailability', facultyAvailabilitySchema);
