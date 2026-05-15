import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentFeedback extends Document {
  subject: mongoose.Types.ObjectId;
  cycleYear: string;
  anonToken: string; // Random UUID - student_id is NEVER stored
  q1Content: number; // Rating 1-5: Subject content clarity
  q2Delivery: number; // Rating 1-5: Teaching delivery quality
  q3Availability: number; // Rating 1-5: Faculty availability outside class
  q4Assessment: number; // Rating 1-5: Fairness of assessments
  q5Overall: number; // Rating 1-5: Overall satisfaction
  avgRating: number; // Average of q1-q5
  submittedAt: Date;
}

const StudentFeedbackSchema: Schema = new Schema({
  subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  cycleYear: { type: String, required: true },
  anonToken: { type: String, required: true },
  q1Content: { type: Number, required: true, min: 1, max: 5 },
  q2Delivery: { type: Number, required: true, min: 1, max: 5 },
  q3Availability: { type: Number, required: true, min: 1, max: 5 },
  q4Assessment: { type: Number, required: true, min: 1, max: 5 },
  q5Overall: { type: Number, required: true, min: 1, max: 5 },
  avgRating: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: false });

// Block Updates/Deletes at Mongoose level
StudentFeedbackSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('Student Feedback is immutable and cannot be updated.'));
  }
  next();
});

StudentFeedbackSchema.pre('deleteOne', { document: true, query: false }, function(next) {
  next(new Error('Student Feedback records cannot be deleted.'));
});

// Ensure one feedback per student per subject per cycle
StudentFeedbackSchema.index({ anonToken: 1, subject: 1, cycleYear: 1 }, { unique: true });
StudentFeedbackSchema.index({ subject: 1, cycleYear: 1 });

export default mongoose.model<IStudentFeedback>('StudentFeedback', StudentFeedbackSchema);
