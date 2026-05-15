import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  salary: { type: String },
  date: { type: Date },
  location: { type: String },
  eligibility: { type: String },
  department: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  status: { type: String, enum: ['Open', 'Applied', 'Closed', 'Upcoming'], default: 'Open' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String }
}, { timestamps: true });

export default mongoose.model('Placement', placementSchema);
