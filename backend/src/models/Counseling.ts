import mongoose from 'mongoose';

const counselingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  counselor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  topic: { type: String, required: true },
  notes: { type: String },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Concerned', 'Critical'], default: 'Neutral' },
  status: { type: String, enum: ['Completed', 'Follow-up'], default: 'Completed' }
}, { timestamps: true });

export default mongoose.model('Counseling', counselingSchema);
