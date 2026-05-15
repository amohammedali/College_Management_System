import mongoose, { Schema, Document } from 'mongoose';

// ── Admin Contribution ──────────────────────────────────────
const AdminContributionSchema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  cycleYear: { type: String, required: true },
  contributionType: { 
    type: String, 
    required: true, 
    enum: ['committee', 'exam_duty', 'event_coord', 'mentor', 'dept_role'] 
  },
  title: { type: String, required: true }, // e.g. 'NBA Coordinator'
  hoursInvested: { type: Number, required: true },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'Staff' }, // HOD
  points: { type: Number, default: 0 }
}, { timestamps: true });

AdminContributionSchema.index({ faculty: 1, cycleYear: 1 });

export const AdminContribution = mongoose.model('AdminContribution', AdminContributionSchema);

// ── Peer Review ─────────────────────────────────────────────
const PeerReviewSchema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: 'Staff', required: true }, // HOD
  cycleYear: { type: String, required: true },
  observationDate: { type: Date, required: true },
  classObserved: { type: String, required: true },
  subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
  scores: {
    pedagogy: { type: Number, min: 1, max: 5 },
    content: { type: Number, min: 1, max: 5 },
    engagement: { type: Number, min: 1, max: 5 },
    overall: { type: Number, min: 1, max: 5 }
  },
  strengths: { type: String },
  improvements: { type: String },
  totalScore: { type: Number, min: 0, max: 100 } // Weighted conversion
}, { timestamps: true });

PeerReviewSchema.index({ faculty: 1, cycleYear: 1 }, { unique: true });

export const PeerReview = mongoose.model('PeerReview', PeerReviewSchema);

// ── Promotion Rule ──────────────────────────────────────────
const PromotionRuleSchema = new Schema({
  fromDesignation: { type: String, required: true },
  toDesignation: { type: String, required: true },
  minApiScore: { type: Number, required: true },
  minYearsService: { type: Number, required: true },
  minPhd: { type: Boolean, default: false },
  minResearchPapers: { type: Number, default: 0 },
  effectiveFrom: { type: Date, required: true }
}, { timestamps: true });

PromotionRuleSchema.index({ fromDesignation: 1, effectiveFrom: -1 }, { unique: true });

export const PromotionRule = mongoose.model('PromotionRule', PromotionRuleSchema);

// ── Appraisal Snapshot ──────────────────────────────────────
const AppraisalSnapshotSchema = new Schema({
  cycleYear: { type: String, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department' }, // NULL = all depts
  pdfUrl: { type: String, required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  generatedAt: { type: Date, default: Date.now },
  facultyCount: { type: Number, required: true }
}, { timestamps: true });

export const AppraisalSnapshot = mongoose.model('AppraisalSnapshot', AppraisalSnapshotSchema);
