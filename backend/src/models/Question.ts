import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  unit: { type: String, required: true },
  text: { type: String, required: true },
  level: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  marks: { type: Number, required: true },
  type: { type: String, enum: ['Theory', 'Problem', 'MCQ'], default: 'Theory' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);
