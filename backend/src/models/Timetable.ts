import mongoose, { Schema, Document } from 'mongoose';

const timetableSchema = new mongoose.Schema({
  batch: { type: String, required: true }, // e.g. "2021-2025"
  department: { type: String, required: true },
  section: { type: String, required: true },
  semester: { type: Number, required: true },
  schedule: [{
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], required: true },
    slots: [{
      time: { type: String, required: true }, // e.g. "09:00 AM"
      subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
      faculty: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
      room: { type: String },
      color: { type: String }
    }]
  }]
}, { timestamps: true });

export default mongoose.model('Timetable', timetableSchema);
