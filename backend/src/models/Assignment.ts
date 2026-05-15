import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  points: { type: Number, default: 100 },
  department: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  rubric: [{
    criterion: { type: String },
    maxPoints: { type: Number }
  }]
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
