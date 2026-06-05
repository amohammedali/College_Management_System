import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  user: mongoose.Types.ObjectId;
  studentId: string;
  registerNumber?: string;
  name: string;
  gender?: string;
  dateOfBirth?: Date;
  bloodGroup?: string;
  
  // Academic Information
  department: string;
  course?: string;
  year: string; 
  semester?: number;
  class: string; // Section
  batchYear?: string;
  admissionType?: string; // Regular, Lateral, etc.
  
  // Contact Details
  phone?: string;
  alternatePhone?: string;
  address?: string;
  profileImage?: string;
  
  // Parent Information
  parentDetails?: {
    fatherName?: string;
    motherName?: string;
    parentPhone?: string;
    occupation?: string;
  };
  
  // Placement Information
  placementDetails?: {
    resumeUrl?: string;
    skills: string[];
    certifications: string[];
    internships: string[];
    preferredRole?: string;
    willingToRelocate?: boolean;
    linkedInProfile?: string;
    githubProfile?: string;
    resumeLink?: string;
    placementStatus?: string;
  };
  
  // Academic Performance
  performance?: {
    tenthPercentage?: number;
    eleventhPercentage?: number;
    twelfthPercentage?: number;
    admissionCutoff?: number;
    currentCGPA?: number;
    arrearHistory?: number;
    activeBacklogs?: number;
    riskScore?: number;
  };

  // Additional Details
  achievements?: string[];
  extracurricular?: string[];
  attendance: {
    present: number;
    total: number;
    percentage: number;
  };
  fees: {
    total: number;
    paid: number;
    balance: number;
  };
  remarks: string[];
  mentor?: mongoose.Types.ObjectId;
}

const StudentSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true, unique: true, index: true },
  registerNumber: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dateOfBirth: { type: Date },
  bloodGroup: { type: String },
  
  department: { type: String, required: true, index: true },
  course: { type: String },
  year: { type: Number, required: true, index: true },
  semester: { type: Number },
  class: { type: String, required: true },
  batchYear: { type: String },
  admissionType: { type: String },
  
  phone: { type: String },
  alternatePhone: { type: String },
  address: { type: String },
  profileImage: { type: String },
  
  parentDetails: {
    fatherName: { type: String },
    motherName: { type: String },
    parentPhone: { type: String },
    occupation: { type: String }
  },
  
  placementDetails: {
    resumeUrl: { type: String },
    skills: [{ type: String }],
    certifications: [{ type: String }],
    internships: [{ type: String }],
    preferredRole: { type: String },
    willingToRelocate: { type: Boolean, default: false },
    linkedInProfile: { type: String },
    githubProfile: { type: String },
    resumeLink: { type: String },
    placementStatus: { type: String, default: 'Eligible' }
  },
  
  performance: {
    tenthPercentage: { type: Number },
    eleventhPercentage: { type: Number },
    twelfthPercentage: { type: Number },
    admissionCutoff: { type: Number },
    currentCGPA: { type: Number },
    arrearHistory: { type: Number, default: 0 },
    activeBacklogs: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 }
  },

  achievements: [{ type: String }],
  extracurricular: [{ type: String }],
  
  attendance: {
    present: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 }
  },
  fees: {
    total: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }
  },
  remarks: [{ type: String }],
  mentor: { type: Schema.Types.ObjectId, ref: 'Staff' }
}, { timestamps: true });

export default mongoose.model<IStudent>('Student', StudentSchema);
