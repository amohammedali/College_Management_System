import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeStructure extends Document {
  department: mongoose.Types.ObjectId;
  regulationYear: string; // e.g. '2023'
  academicYear: number; // 1, 2, 3, 4
  feeType: 'tuition' | 'exam' | 'lab' | 'hostel' | 'bus' | 'misc';
  amount: number;
  dueDate: Date;
  installmentAllowed: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const FeeStructureSchema: Schema = new Schema({
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  regulationYear: { type: String, required: true },
  academicYear: { type: Number, required: true, min: 1, max: 4 },
  feeType: { 
    type: String, 
    required: true, 
    enum: ['tuition', 'exam', 'lab', 'hostel', 'bus', 'misc'] 
  },
  amount: { type: Number, required: true, min: 1 },
  dueDate: { type: Date, required: true },
  installmentAllowed: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// UNIQUE (dept_id, regulation_year, academic_year, fee_type)
FeeStructureSchema.index({ department: 1, regulationYear: 1, academicYear: 1, feeType: 1 }, { unique: true });

// INDEX on (dept_id, academic_year)
FeeStructureSchema.index({ department: 1, academicYear: 1 });

export default mongoose.model<IFeeStructure>('FeeStructure', FeeStructureSchema);
