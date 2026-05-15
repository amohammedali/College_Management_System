import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentChoice extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  semester: number;
  academicYear: string;
  status: 'confirmed' | 'pending';
}

const StudentChoiceSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: Number, required: true },
  academicYear: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'pending'], default: 'confirmed' }
}, { timestamps: true });

// Ensure a student can only pick one subject per elective group (simplification: one choice per sem)
StudentChoiceSchema.index({ student: 1, semester: 1 }, { unique: true });

export default mongoose.model<IStudentChoice>('StudentChoice', StudentChoiceSchema);
