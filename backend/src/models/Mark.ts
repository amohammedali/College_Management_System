import mongoose, { Schema, Document } from 'mongoose';

export enum AssessmentType {
  IA1 = 'Internal Assessment 1',
  IA2 = 'Internal Assessment 2',
  MODEL = 'Model Exam',
  SEMESTER = 'Semester Exam',
  ASSIGNMENT = 'Assignment'
}

export interface IMark extends Document {
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  type: AssessmentType;
  score: number;
  totalScore: number;
  grade: string;
  semester: number;
  academicYear: string;
  markedBy: mongoose.Types.ObjectId;
}

const MarkSchema: Schema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
  type: { type: String, enum: Object.values(AssessmentType), required: true },
  score: { type: Number, required: true },
  totalScore: { type: Number, required: true },
  grade: { type: String, required: true },
  semester: { type: Number, required: true, index: true },
  academicYear: { type: String, required: true },
  markedBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }
}, { timestamps: true });

export default mongoose.model<IMark>('Mark', MarkSchema);
