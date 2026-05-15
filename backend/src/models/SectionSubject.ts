import mongoose, { Schema, Document } from 'mongoose';

export interface ISectionSubject extends Document {
  dept_id: mongoose.Types.ObjectId;
  year: number;
  section: string;
  subjects: {
    subject_id: mongoose.Types.ObjectId;
    faculty_id?: mongoose.Types.ObjectId;
    credit_hours: number;
  }[];
}

const sectionSubjectSchema = new Schema<ISectionSubject>({
  dept_id: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  year: { type: Number, required: true },
  section: { type: String, required: true },
  subjects: [{
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty_id: { type: Schema.Types.ObjectId, ref: 'Staff' },
    credit_hours: { type: Number, required: true }
  }]
}, { timestamps: true });

// Ensure unique mapping per dept/year/section
sectionSubjectSchema.index({ dept_id: 1, year: 1, section: 1 }, { unique: true });

export default mongoose.model<ISectionSubject>('SectionSubject', sectionSubjectSchema);
