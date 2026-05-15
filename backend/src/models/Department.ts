import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string; // e.g. CSE, ECE
  degreeType: string; // BE, B.Tech, ME
  hod: mongoose.Types.ObjectId;
  totalSemesters: number;
  totalSections: number;
  regulations: string[]; // e.g. ["2021", "2023"]
  status: 'active' | 'inactive';
  auditLog: {
    action: string;
    user: string;
    timestamp: Date;
    details: string;
  }[];
}

const DepartmentSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  degreeType: { type: String, required: true },
  hod: { type: Schema.Types.ObjectId, ref: 'Staff' },
  totalSemesters: { type: Number, default: 8 },
  totalSections: { type: Number, default: 1 },
  regulations: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  auditLog: [{
    action: String,
    user: String,
    timestamp: { type: Date, default: Date.now },
    details: String
  }]
}, { timestamps: true });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
