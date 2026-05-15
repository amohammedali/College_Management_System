import mongoose, { Schema, Document } from 'mongoose';

export enum SubjectType {
  THEORY = 'Theory',
  LAB = 'Lab/Practical',
  ELECTIVE = 'Elective',
  PROJECT = 'Project',
  AUDIT = 'Audit Course',
  ONLINE = 'Online Course'
}

export interface ISubject extends Document {
  name: string;
  code: string;
  department: string;
  semester: number;
  type: SubjectType;
  regulation: string;
  credits: {
    lecture: number;
    tutorial: number;
    practical: number;
    total: number;
  };
  marks: {
    internalMax: number;
    modelMax: number;
    universityMax: number;
    passingMarks: number;
  };
  syllabus: {
    unit: number;
    title: string;
    topics: string[];
    hours: number;
    isCompleted: boolean;
  }[];
  outcomes: {
    co: string; // Course Outcome (CO1, CO2...)
    description: string;
    poMapping: number[]; // Mapping to Programme Outcomes (PO1-PO12)
  }[];
  faculties: mongoose.Types.ObjectId[];
  status: 'active' | 'pending' | 'archived';
  version: number;
  totalWeeks: number;
  academicYear: string;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  department: { type: String, required: true, index: true },
  semester: { type: Number, required: true },
  type: { type: String, enum: Object.values(SubjectType), default: SubjectType.THEORY },
  regulation: { type: String, required: true, index: true },
  totalWeeks: { type: Number, default: 16 },
  academicYear: { type: String, index: true },
  credits: {
    lecture: { type: Number, default: 3 },
    tutorial: { type: Number, default: 0 },
    practical: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  marks: {
    internalMax: { type: Number, default: 20 },
    modelMax: { type: Number, default: 80 },
    universityMax: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 50 }
  },
  syllabus: [{
    unit: { type: Number },
    title: { type: String },
    topics: [{ type: String }],
    hours: { type: Number },
    isCompleted: { type: Boolean, default: false }
  }],
  outcomes: [{
    co: { type: String },
    description: { type: String },
    poMapping: [{ type: Number }]
  }],
  faculties: [{ type: Schema.Types.ObjectId, ref: 'Staff' }],
  status: { type: String, enum: ['active', 'pending', 'archived'], default: 'active' },
  version: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model<ISubject>('Subject', SubjectSchema);
