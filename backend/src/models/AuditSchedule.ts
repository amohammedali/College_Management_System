import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditSchedule extends Document {
  auditType: 'mock' | 'naac_visit' | 'nba_visit' | 'iqac_review';
  scheduledDate: Date;
  department?: mongoose.Types.ObjectId; // NULL = institution-wide
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  reportUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  notes?: string;
}

const AuditScheduleSchema: Schema = new Schema({
  auditType: { 
    type: String, 
    required: true, 
    enum: ['mock', 'naac_visit', 'nba_visit', 'iqac_review'] 
  },
  scheduledDate: { type: Date, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  status: { 
    type: String, 
    required: true, 
    enum: ['planned', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  reportUrl: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  notes: { type: String }
}, { timestamps: true });

AuditScheduleSchema.index({ scheduledDate: 1, status: 1 });

export default mongoose.model<IAuditSchedule>('AuditSchedule', AuditScheduleSchema);
