import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  faculty: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  semester: number;
  academicYear: string;
  ratings: {
    teachingStyle: number;
    clarity: number;
    punctuality: number;
    materials: number;
  };
  averageRating: number;
  comments?: string;
}

const FeedbackSchema: Schema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: Number, required: true },
  academicYear: { type: String, required: true },
  ratings: {
    teachingStyle: { type: Number, min: 1, max: 5 },
    clarity: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    materials: { type: Number, min: 1, max: 5 }
  },
  averageRating: { type: Number },
  comments: { type: String }
}, { timestamps: true });

// Prevent multiple feedback for same subject/semester
FeedbackSchema.index({ student: 1, subject: 1, academicYear: 1 }, { unique: true });

// Pre-save hook to calculate average
FeedbackSchema.pre('save', function(next) {
  const r = this.ratings;
  this.averageRating = (r.teachingStyle + r.clarity + r.punctuality + r.materials) / 4;
  next();
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
