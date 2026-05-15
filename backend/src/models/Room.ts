import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  type: 'classroom' | 'lab' | 'seminar';
  capacity: number;
  block: string;
  floor: number;
}

const roomSchema = new Schema<IRoom>({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['classroom', 'lab', 'seminar'], default: 'classroom' },
  capacity: { type: Number, required: true },
  block: { type: String, required: true },
  floor: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IRoom>('Room', roomSchema);
