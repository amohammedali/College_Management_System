import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchPublication extends Document {
  faculty: mongoose.Types.ObjectId;
  pubType: 'journal' | 'conference' | 'book_chapter' | 'patent' | 'funded_project';
  title: string;
  journalName?: string;
  publisher?: string;
  impactFactor?: number;
  doi?: string;
  yearPublished: number;
  coAuthors: string[];
  isVerified: boolean;
  citationCount: number;
  grantAmount?: number;
}

const ResearchPublicationSchema: Schema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  pubType: { 
    type: String, 
    required: true, 
    enum: ['journal', 'conference', 'book_chapter', 'patent', 'funded_project'] 
  },
  title: { type: String, required: true },
  journalName: { type: String },
  publisher: { type: String },
  impactFactor: { type: Number },
  doi: { type: String },
  yearPublished: { type: Number, required: true },
  coAuthors: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  citationCount: { type: Number, default: 0 },
  grantAmount: { type: Number }
}, { timestamps: true });

ResearchPublicationSchema.index({ faculty: 1, yearPublished: -1 });

export default mongoose.model<IResearchPublication>('ResearchPublication', ResearchPublicationSchema);
