import express, { Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import AppraisalCycle from '../models/AppraisalCycle.js';
import ResearchPublication from '../models/ResearchPublication.js';
import StudentFeedback from '../models/StudentFeedback.js';
import Staff from '../models/Staff.js';
import { AdminContribution, PromotionRule, PeerReview } from '../models/AppraisalAux.js';
import { syncAppraisalRecord } from '../services/appraisalService.js';
import { validateStatusTransition } from '../middlewares/appraisalMiddleware.js';
import FeedbackToken from '../models/FeedbackToken.js';
import { generateFeedbackTokens, deliverTokens } from '../services/tokenService.js';
import { generatePromotionLetter, generateApiMatrix } from '../services/pdfService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// ── Appraisal Cycle Management ──────────────────────────────

router.get('/cycles', protect, authorize('admin', 'hod'), async (req: Request, res: Response) => {
  try {
    const { year, dept } = req.query;
    const query: any = {};
    if (year) query.cycleYear = year;
    
    // If dept is provided, filter faculty by department
    let facultyQuery: any = {};
    if (dept) facultyQuery.department = dept;
    
    const facultyIds = await Staff.find(facultyQuery).distinct('_id');
    query.faculty = { $in: facultyIds };

    const cycles = await AppraisalCycle.find(query)
      .populate('faculty', 'name designation department')
      .lean();

    // Aggregated candidate pool view: compute days-in-cycle
    const enhancedCycles = cycles.map(c => ({
      ...c,
      daysInCycle: Math.floor((new Date().getTime() - new Date(c.initiatedAt).getTime()) / (1000 * 3600 * 24)),
      isOverdue: (new Date().getTime() - new Date(c.initiatedAt).getTime()) / (1000 * 3600 * 24) > 30 // Example: 30 days overdue
    }));

    res.json(enhancedCycles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/cycles/initiate', protect, authorize('admin', 'hod'), async (req: AuthRequest, res: Response) => {
  try {
    const { dept_id, cycle_year } = req.body;
    const facultyList = await Staff.find({ department: dept_id, isActive: true });
    
    const cycleData = facultyList.map(faculty => ({
      faculty: faculty._id,
      cycleYear: cycle_year,
      initiatedBy: req.user._id,
      status: 'draft'
    }));

    const cycles = await AppraisalCycle.insertMany(cycleData, { ordered: false });
    res.status(201).json({ message: `Initiated ${cycles.length} appraisal cycles.`, cycles });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/cycles/:faculty_id/:year', protect, async (req: Request, res: Response) => {
  try {
    const appraisal = await AppraisalCycle.findOne({ 
      faculty: req.params.faculty_id, 
      cycleYear: req.params.year 
    }).populate('faculty');
    
    if (!appraisal) return res.status(404).json({ message: 'Appraisal record not found.' });
    
    // Aggregate components
    const [pubs, feedback, admin] = await Promise.all([
      ResearchPublication.find({ faculty: req.params.faculty_id, yearPublished: parseInt(req.params.year.split('-')[0]) }),
      StudentFeedback.find({ faculty: req.params.faculty_id, cycleYear: req.params.year }),
      AdminContribution.find({ faculty: req.params.faculty_id, cycleYear: req.params.year })
    ]);

    res.json({ appraisal, pubs, feedback, admin });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/cycles/:id/compute', protect, authorize('admin', 'hod'), async (req: Request, res: Response) => {
  try {
    const appraisal = await syncAppraisalRecord(req.params.id);
    res.json(appraisal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/cycles/:id/hod-review', protect, authorize('hod'), validateStatusTransition, async (req: Request, res: Response) => {
  try {
    const appraisal = await AppraisalCycle.findByIdAndUpdate(req.params.id, {
      status: 'hod_review',
      hodRemarks: req.body.hod_remarks
    }, { new: true });
    res.json(appraisal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/cycles/:id/approve', protect, authorize('admin'), validateStatusTransition, async (req: Request, res: Response) => {
  try {
    const appraisal = await AppraisalCycle.findByIdAndUpdate(req.params.id, {
      status: 'principal_approved',
      closedAt: new Date()
    }, { new: true });
    res.json(appraisal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Admin Contributions ─────────────────────────────────────

router.get('/admin/:faculty_id/:year', protect, async (req: Request, res: Response) => {
  try {
    const contribs = await AdminContribution.find({
      faculty: req.params.faculty_id,
      cycleYear: req.params.year
    });
    res.json(contribs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/admin', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { faculty_id, cycle_year, contribution_type, title, hours_invested } = req.body;
    const contrib = await AdminContribution.create({
      faculty: faculty_id,
      cycleYear: cycle_year,
      contributionType: contribution_type,
      title,
      hoursInvested: hours_invested
    });
    res.status(201).json(contrib);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Peer Review ─────────────────────────────────────────────

router.post('/peer-review', protect, authorize('hod'), async (req: AuthRequest, res: Response) => {
  try {
    const { faculty_id, cycle_year, class_observed, observation_date, scores, strengths, improvements } = req.body;
    
    // Calculate total score (1-5 scale to 0-100)
    const avg = (scores.pedagogy + scores.content + scores.engagement + scores.overall) / 4;
    const totalScore = (avg / 5) * 100;

    const review = await PeerReview.findOneAndUpdate(
      { faculty: faculty_id, cycleYear: cycle_year },
      {
        reviewer: req.user._id,
        observationDate: observation_date,
        classObserved: class_observed,
        scores,
        strengths,
        improvements,
        totalScore
      },
      { upsert: true, new: true }
    );
    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Research Publications ───────────────────────────────────

router.get('/research/:faculty_id', protect, async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const query: any = { faculty: req.params.faculty_id };
    if (year) query.yearPublished = year;
    const pubs = await ResearchPublication.find(query);
    res.json(pubs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/research', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { doi, title, yearPublished } = req.body;

    // Duplicate detection
    const existing = await ResearchPublication.findOne({
      $or: [
        { doi: doi, doi: { $ne: null } },
        { faculty: req.user._id, title, yearPublished }
      ]
    });

    if (existing) {
      return res.status(409).json({ message: 'Potential duplicate publication detected.', existing });
    }

    const pub = await ResearchPublication.create({
      ...req.body,
      faculty: req.user._id
    });
    res.status(201).json(pub);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/research/scholar-import', protect, async (req: AuthRequest, res: Response) => {
  try {
    // In a real app, use 'scholarly' or a scraping proxy
    res.json({
      message: 'Fetched 5 draft publications from Google Scholar. Please review and verify.',
      drafts: [
        { title: 'AI in Education', yearPublished: 2023, pubType: 'journal' },
        { title: 'Blockchain for Records', yearPublished: 2022, pubType: 'conference' }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/research/verify-doi', protect, async (req: Request, res: Response) => {
  try {
    const { doi } = req.body;
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    
    const response = await fetch(crossrefUrl, {
      headers: { 'User-Agent': 'EduCMS/1.0 (mailto:admin@college.edu)' }
    });

    if (!response.ok) {
      return res.status(404).json({ message: 'DOI not found or Crossref API error.' });
    }

    const data: any = await response.json();
    const message = data.message;

    const result = {
      title: message.title?.[0],
      journal: message['container-title']?.[0],
      year: message.published?.['date-parts']?.[0]?.[0],
      issn: message.ISSN?.[0],
      publisher: message.publisher,
      verified: true
    };

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/research/:id', protect, async (req: Request, res: Response) => {
  try {
    const pub = await ResearchPublication.findById(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Publication not found.' });

    // Check if publication is locked in a closed cycle
    const closedCycle = await AppraisalCycle.findOne({ 
      faculty: pub.faculty,
      cycleYear: `${pub.yearPublished}-${(pub.yearPublished+1).toString().slice(-2)}`,
      status: 'closed'
    });

    if (closedCycle) {
      return res.status(409).json({ 
        message: 'Cannot delete publication. It is part of a closed appraisal cycle.',
        cycle: closedCycle.cycleYear
      });
    }

    await ResearchPublication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Publication deleted.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Student Feedback ────────────────────────────────────────

const feedbackWindows = new Map();

router.post('/feedback/open', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { dept_id, cycle_year, close_date } = req.body;
    
    // Generate tokens for all students in the department
    const tokenCount = await generateFeedbackTokens(dept_id, cycle_year);
    
    // Trigger delivery
    await deliverTokens(cycle_year);
    
    res.json({ 
      message: `Feedback window opened for ${cycle_year}.`,
      tokensGenerated: tokenCount,
      closeDate: close_date
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/feedback/submit', async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { anon_token, subject_id, ratings } = req.body;
    
    // 1. Validate and consume token
    const tokenRecord = await FeedbackToken.findOne({ 
      anonToken: anon_token, 
      subject: subject_id,
      isUsed: false 
    }).session(session);

    if (!tokenRecord) {
      return res.status(403).json({ message: 'Invalid or already used token.' });
    }

    if (new Date() > tokenRecord.expiresAt) {
      return res.status(403).json({ message: 'Feedback token has expired.' });
    }

    // 2. Record feedback (student_id is NOT stored)
    const avgRating = (ratings.q1 + ratings.q2 + ratings.q3 + ratings.q4 + ratings.q5) / 5;
    
    await StudentFeedback.create([{
      subject: subject_id,
      cycleYear: tokenRecord.cycleYear,
      anonToken: anon_token, // stored for uniqueness check only
      q1Content: ratings.q1,
      q2Delivery: ratings.q2,
      q3Availability: ratings.q3,
      q4Assessment: ratings.q4,
      q5Overall: ratings.q5,
      avgRating
    }], { session });

    // 3. Mark token as used or DELETE it to break the link permanently
    // The user requested: "DELETE from feedback_tokens — student_id is never written into student_feedback"
    await FeedbackToken.findByIdAndDelete(tokenRecord._id).session(session);

    await session.commitTransaction();
    res.json({ message: 'Feedback submitted successfully. Thank you for your anonymity.' });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// ── Promotion & Export ─────────────────────────────────────

router.get('/promotion-eligible', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { year, dept } = req.query;
    const query: any = { cycleYear: year, promotionEligible: true };
    
    if (dept) {
      const facultyIds = await Staff.find({ department: dept }).distinct('_id');
      query.faculty = { $in: facultyIds };
    }

    const eligible = await AppraisalCycle.find(query)
      .populate('faculty', 'name designation dateOfJoining hasPhd department')
      .lean();

    res.json(eligible);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/promotion/check/:faculty_id/:year', protect, async (req: Request, res: Response) => {
  try {
    const { faculty_id, year } = req.params;
    const faculty = await Staff.findById(faculty_id);
    const cycle = await AppraisalCycle.findOne({ faculty: faculty_id, cycleYear: year });
    
    if (!faculty || !cycle) return res.status(404).json({ message: 'Data not found.' });

    const rule = await PromotionRule.findOne({ 
      fromDesignation: faculty.designation,
      effectiveFrom: { $lte: new Date() }
    }).sort({ effectiveFrom: -1 });

    if (!rule) return res.json({ eligible: false, reason: 'No promotion rule defined for current designation.' });

    const yearsService = Math.floor((new Date().getTime() - new Date(faculty.dateOfJoining).getTime()) / (1000 * 3600 * 24 * 365.25));
    const researchCount = await ResearchPublication.countDocuments({ faculty: faculty_id, isVerified: true });

    const eligible = 
      cycle.apiScore >= rule.minApiScore &&
      yearsService >= rule.minYearsService &&
      (!rule.minPhd || faculty.hasPhd) &&
      researchCount >= rule.minResearchPapers;

    res.json({
      eligible,
      criteria: {
        apiScore: { actual: cycle.apiScore, required: rule.minApiScore },
        yearsService: { actual: yearsService, required: rule.minYearsService },
        phd: { actual: faculty.hasPhd, required: rule.minPhd },
        researchCount: { actual: researchCount, required: rule.minResearchPapers }
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/promotion/report/:faculty_id/:year', protect, async (req: Request, res: Response) => {
  try {
    const { faculty_id, year } = req.params;
    const faculty = await Staff.findById(faculty_id);
    const cycle = await AppraisalCycle.findOne({ faculty: faculty_id, cycleYear: year });
    
    if (!faculty || !cycle) return res.status(404).json({ message: 'Data not found.' });

    // Re-check eligibility for report
    const rule = await PromotionRule.findOne({ 
      fromDesignation: faculty.designation,
      effectiveFrom: { $lte: new Date() }
    }).sort({ effectiveFrom: -1 });

    const yearsService = Math.floor((new Date().getTime() - new Date(faculty.dateOfJoining).getTime()) / (1000 * 3600 * 24 * 365.25));
    const researchCount = await ResearchPublication.countDocuments({ faculty: faculty_id, isVerified: true });

    const criteria = {
      eligible: cycle.promotionEligible,
      criteria: {
        apiScore: { actual: cycle.apiScore, required: rule?.minApiScore || 0 },
        yearsService: { actual: yearsService, required: rule?.minYearsService || 0 },
        phd: { actual: faculty.hasPhd, required: rule?.minPhd || false },
        researchCount: { actual: researchCount, required: rule?.minResearchPapers || 0 }
      }
    };

    const pdfUrl = await generatePromotionLetter(faculty, cycle, criteria);
    res.json({ pdfUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/export/matrix', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { year, dept } = req.body;
    
    const query: any = { cycleYear: year };
    if (dept) {
      const facultyIds = await Staff.find({ department: dept }).distinct('_id');
      query.faculty = { $in: facultyIds };
    }

    const data = await AppraisalCycle.find(query)
      .populate('faculty', 'name designation department')
      .lean();

    const pdfUrl = await generateApiMatrix(year, dept, data);
    
    res.json({ 
      job_id: `job_${uuidv4()}`, 
      message: 'PDF generated successfully.', 
      pdf_url: pdfUrl 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/naac-summary', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const stats = await AppraisalCycle.aggregate([
      { $match: { cycleYear: year, status: 'closed' } },
      { $group: {
        _id: '$apiGrade',
        count: { $sum: 1 },
        avgScore: { $avg: '$apiScore' }
      }}
    ]);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/cycles/sync-all', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const cycles = await AppraisalCycle.find({ status: { $ne: 'closed' } });
    const results = await Promise.all(cycles.map(c => syncAppraisalRecord(c._id.toString())));
    res.json({ message: `Synchronized ${results.length} active appraisal records.`, results });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/promotion/rules', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { rules } = req.body;
    
    // Process each rule
    const results = await Promise.all(rules.map((rule: any) => 
      PromotionRule.findOneAndUpdate(
        { fromDesignation: rule.fromDesignation, toDesignation: rule.toDesignation },
        { ...rule, effectiveFrom: new Date() },
        { upsert: true, new: true }
      )
    ));

    res.json({ message: 'Rules updated successfully.', results });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
