import mongoose, { Schema, Document } from 'mongoose';

export enum StaffType {
  TEACHING = 'teaching',
  NON_TEACHING = 'non-teaching'
}

export interface IStaff extends Document {
  user: mongoose.Types.ObjectId;
  staffId: string;
  name: string;
  type: StaffType;
  department: string;
  designation: string;
  subjects?: string[];
  classes?: string[];
  salary: {
    base: number;
    allowances: number;
    deductions: number;
    net: number;
  };
  counselorForClass?: string;
  assignedYear?: string;
  assignedSection?: string;
  phone?: string;
  profileImage?: string;
  joiningDate?: Date;
  employmentType?: string; // Full-time, Contract
  qualification?: string;
  experience?: number;
  gender?: string;
  dob?: Date;
  specialization?: string;
  onboardingStatus: 'incomplete' | 'complete';
  apiScore?: number;
  researchPapers?: number;
  studentRating?: number;
}

const StaffSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  staffId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  type: { type: String, enum: Object.values(StaffType), required: true },
  department: { type: String, required: true, index: true },
  designation: { type: String, required: true },
  subjects: [{ type: String }],
  classes: [{ type: String }],
  salary: {
    base: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net: { type: Number, default: 0 }
  },
  counselorForClass: { type: String },
  assignedYear: { type: String, index: true },
  assignedSection: { type: String, index: true },
  phone: { type: String },
  profileImage: { type: String },
  joiningDate: { type: Date },
  employmentType: { type: String, default: 'Full-time' },
  qualification: { type: String },
  experience: { type: Number, default: 0 },
  gender: { type: String },
  dob: { type: Date },
  specialization: { type: String },
  onboardingStatus: { type: String, enum: ['incomplete', 'complete'], default: 'incomplete' },
  apiScore: { type: Number, default: 0 },
  researchPapers: { type: Number, default: 0 },
  studentRating: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IStaff>('Staff', StaffSchema);
