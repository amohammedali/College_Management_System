import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String },
  department: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Academic', 'Infrastructure', 'Faculty', 'Hostel', 'IT Support'], required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Closed'], default: 'Pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: { type: String },
  attachments: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Grievance', grievanceSchema);
