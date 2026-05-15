import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  stage: { 
    type: String, 
    enum: ['Inquiry', 'Screening', 'Technical Interview', 'Management Round', 'Offer Letter', 'Joined', 'Rejected'], 
    default: 'Inquiry' 
  },
  scheduledDate: { type: Date },
  resumeUrl: { type: String },
  score: { type: Number, default: 0 },
  feedback: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Recruitment', recruitmentSchema);
