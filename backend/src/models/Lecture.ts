import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true }, // PDF, DOCX, PPTX, IMG, etc.
  url: { type: String, required: true },
  size: { type: String }, // Human readable size
  sizeBytes: { type: Number }, // Raw size for tracking
  department: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  downloads: { type: Number, default: 0 },
  accessLevel: { type: String, enum: ['Internal', 'Public'], default: 'Internal' },
  cdnUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('Lecture', lectureSchema);
