import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number },
  feedback: { type: String },
  status: { type: String, enum: ['Submitted', 'Graded', 'Late'], default: 'Submitted' }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
