import mongoose, { Schema, Document } from 'mongoose';

export interface ISyllabusTopic extends Document {
  unit: mongoose.Types.ObjectId;
  topicName: string;
  plannedHours: number;
  isCompleted: boolean;
  completedDate?: Date;
  faculty: mongoose.Types.ObjectId;
  coMapping: string[]; // e.g. ["CO1", "CO2"]
  poMapping: string[]; // e.g. ["PO1", "PO5"]
  resources: {
    type: 'PDF' | 'Lab Manual' | 'Video' | 'Link';
    title: string;
    url: string;
  }[];
}

const SyllabusTopicSchema: Schema = new Schema({
  unit: { type: Schema.Types.ObjectId, ref: 'SyllabusUnit', required: true, index: true },
  topicName: { type: String, required: true },
  plannedHours: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false },
  completedDate: { type: Date },
  faculty: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  coMapping: [{ type: String }],
  poMapping: [{ type: String }],
  resources: [{
    type: { type: String, enum: ['PDF', 'Lab Manual', 'Video', 'Link'], required: true },
    title: { type: String, required: true },
    url: { type: String, required: true }
  }]
}, { timestamps: true });

export default mongoose.model<ISyllabusTopic>('SyllabusTopic', SyllabusTopicSchema);
