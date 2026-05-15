import express, { Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import NaacCriterion from '../models/NaacCriterion.js';
import CriterionScore from '../models/CriterionScore.js';
import AccrDocument from '../models/AccrDocument.js';
import NbaPoCoMap from '../models/NbaPoCoMap.js';
import ScoreSnapshot from '../models/ScoreSnapshot.js';
import AuditSchedule from '../models/AuditSchedule.js';
import GapAnalysis from '../models/GapAnalysis.js';
import { runInstitutionalAggregation } from '../services/accreditationComputeService.js';
import { accrUpload } from '../middlewares/accrUpload.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// ── NAAC Criteria Scores ──────────────────────────────────

router.get('/criteria', protect, async (req: Request, res: Response) => {
  try {
    const criteria = await NaacCriterion.find({ isActive: true });
    res.json(criteria);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/criteria/:id/history', protect, async (req: Request, res: Response) => {
  try {
    const history = await CriterionScore.find({ criterion: req.params.id }).sort({ snapshotAt: 1 });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/scores/compute', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await runInstitutionalAggregation(req.user._id);
    res.json({ message: 'Institutional score aggregation completed.', snapshot });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/snapshot/latest', protect, async (req: Request, res: Response) => {
  try {
    const snapshot = await ScoreSnapshot.findOne().sort({ snapshotAt: -1 });
    res.json(snapshot);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/gap-analysis', protect, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = status ? { status } : { status: 'open' };
    const gaps = await GapAnalysis.find(query)
      .populate('criterion')
      .populate('assignedTo', 'name')
      .sort({ gap: -1 });
    res.json(gaps);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── NBA PO/CO Mapping ─────────────────────────────────────

router.get('/nba/mapping', protect, async (req: Request, res: Response) => {
  try {
    const { dept, regulation } = req.query;
    const query: any = {};
    if (dept) query.department = dept;
    if (regulation) query.regulationYear = regulation;
    const mappings = await NbaPoCoMap.find(query).populate('subject');
    res.json(mappings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/nba/mapping', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const mapping = await NbaPoCoMap.findOneAndUpdate(
      { subject: req.body.subject_id, poNumber: req.body.po_number, coNumber: req.body.co_number, regulationYear: req.body.regulation_year },
      req.body,
      { upsert: true, new: true }
    );
    res.json(mapping);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/nba/tier-status', protect, async (req: Request, res: Response) => {
  try {
    res.json({ visionMission: 100, curriculumPEO: 92, studentPerformance: 84, overallTierEligibility: 'Tier-1 Eligible' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Document Repository ────────────────────────────────────

router.get('/documents', protect, async (req: Request, res: Response) => {
  try {
    const { criterion, verified } = req.query;
    const query: any = { isActive: { $ne: false } };
    if (criterion) query.criterion = criterion;
    if (verified) query.isVerified = verified === 'true';
    const docs = await AccrDocument.find(query).populate('uploadedBy', 'name').sort({ uploadedAt: -1 });
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/documents/upload', protect, accrUpload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    await AccrDocument.updateMany({ criterion: req.body.criterion, academicYear: req.body.academicYear }, { isActive: false });
    const doc = await AccrDocument.create({
      criterion: req.body.criterion, docTitle: req.body.docTitle, docType: req.body.docType,
      academicYear: req.body.academicYear, fileUrl: `/uploads/accr/${req.file.filename}`,
      fileSizeKb: Math.round(req.file.size / 1024), uploadedBy: req.user._id
    });
    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/documents/:id/verify', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const doc = await AccrDocument.findByIdAndUpdate(req.params.id, { isVerified: true, verifiedBy: req.user._id, verifiedAt: new Date() }, { new: true });
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/documents/expiring', protect, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const docs = await AccrDocument.find({ expiryDate: { $lte: threshold, $gte: new Date() }, isVerified: true });
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── SSR Generation & Audit ─────────────────────────────────

const ssrJobs = new Map();

router.post('/ssr/generate', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const jobId = 'job_' + Math.random().toString(36).substr(2, 9);
    ssrJobs.set(jobId, { status: 'generating' });
    setTimeout(() => ssrJobs.set(jobId, { status: 'ready', url: '/uploads/reports/ssr_draft_2024.pdf' }), 5000);
    res.json({ jobId });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/ssr/status/:job_id', protect, async (req: Request, res: Response) => {
  const job = ssrJobs.get(req.params.job_id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
});

router.get('/audit-schedule', protect, async (req: Request, res: Response) => {
  try {
    const audits = await AuditSchedule.find().sort({ scheduledDate: 1 });
    res.json(audits);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/audit-schedule', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const audit = await AuditSchedule.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(audit);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
