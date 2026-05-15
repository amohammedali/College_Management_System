import AppraisalCycle from '../models/AppraisalCycle.js';
import ResearchPublication from '../models/ResearchPublication.js';
import StudentFeedback from '../models/StudentFeedback.js';
import { AdminContribution, PromotionRule, PeerReview } from '../models/AppraisalAux.js';
import Staff from '../models/Staff.js';
import TimetableSlot from '../models/TimetableSlot.js';
import Mark from '../models/Mark.js';
import Subject from '../models/Subject.js';
import Attendance from '../models/Attendance.js';
import mongoose from 'mongoose';

// ── Composite API Score Calculation ────────────────────────
// Weighted composite: (acad×0.4)+(res×0.3)+(fb×0.2)+(adm×0.1)

export const calculateApiScore = async (facultyId: string, cycleYear: string) => {
  const faculty = await Staff.findById(facultyId);
  if (!faculty) throw new Error('Faculty not found');

  const [research, feedback, admin, peerReview] = await Promise.all([
    ResearchPublication.find({ faculty: facultyId, isVerified: true }),
    StudentFeedback.find({ faculty: facultyId, cycleYear }),
    AdminContribution.find({ faculty: facultyId, cycleYear, verifiedBy: { $ne: null } }),
    PeerReview.findOne({ faculty: facultyId, cycleYear })
  ]);

  // 1. Academic Score (40%)
  const academicScore = await calculateAcademicScore(facultyId, cycleYear, peerReview?.totalScore);

  // 2. Research Score (30%)
  const researchScore = calculateResearchScore(research);

  // 3. Feedback Score (20%)
  const feedbackScore = calculateFeedbackScore(feedback);

  // 4. Admin Score (10%)
  const adminScore = calculateAdminScore(admin);

  // Master Compute Function
  const apiScore = (academicScore * 0.4) + (researchScore * 0.3) + (feedbackScore * 0.2) + (adminScore * 0.1);
  const roundedScore = Math.round(apiScore * 100) / 100;

  // Grade Assignment
  const apiGrade = assignGrade(roundedScore);

  // Promotion Eligibility Check
  const promotionEligible = await checkPromotionEligibility(faculty, roundedScore, research.length);

  return {
    academicScore: Math.round(academicScore * 100) / 100,
    researchScore: Math.round(researchScore * 100) / 100,
    feedbackScore: Math.round(feedbackScore * 100) / 100,
    adminScore: Math.round(adminScore * 100) / 100,
    apiScore: roundedScore,
    apiGrade,
    promotionEligible
  };
};

async function calculateAcademicScore(facultyId: string, cycleYear: string, peerReviewScore?: number) {
  // Pull subjects taught from timetable_slots
  const slots = await TimetableSlot.find({ faculty_id: facultyId });
  const subjectIds = [...new Set(slots.map(s => s.subject_id.toString()))];

  if (subjectIds.length === 0) return 0;

  let totalPassRate = 0;
  let bonusPoints = 0;

  for (const subId of subjectIds) {
    // Get marks for this subject in the current cycle
    const marks = await Mark.find({ 
      subject: subId, 
      academicYear: cycleYear,
      type: 'Semester Exam'
    });

    if (marks.length > 0) {
      const subjectObj = await Subject.findById(subId);
      const passThreshold = subjectObj?.marks?.passingMarks || 50;
      const passedCount = marks.filter(m => m.score >= passThreshold).length;
      const passRate = (passedCount / marks.length) * 100;
      totalPassRate += passRate;

      // Bonus: pass rate > 90%
      if (passRate > 90) bonusPoints += 5;

      // Bonus: completion of full syllabus
      const isSyllabusDone = subjectObj?.syllabus.every(u => u.isCompleted);
      if (isSyllabusDone) bonusPoints += 5;
    }
  }

  const avgPassRate = totalPassRate / subjectIds.length;

  // Bonus: Attendance maintained > 75% average
  const attendanceStats = await Attendance.aggregate([
    { $match: { markedBy: new mongoose.Types.ObjectId(facultyId) } },
    { $group: {
      _id: null,
      total: { $sum: 1 },
      present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
    }}
  ]);
  
  if (attendanceStats.length > 0) {
    const avgAttendance = (attendanceStats[0].present / attendanceStats[0].total) * 100;
    if (avgAttendance > 75) bonusPoints += 3;
  }

  // Peer review contribution (15% of academic score if exists)
  let baseScore = avgPassRate;
  if (peerReviewScore !== undefined) {
    baseScore = (avgPassRate * 0.85) + (peerReviewScore * 0.15);
  }

  return Math.min(baseScore + bonusPoints, 100);
}

function calculateResearchScore(research: any[]) {
  let totalPoints = 0;

  for (const pub of research) {
    let points = 0;
    switch (pub.pubType) {
      case 'journal':
        points = pub.impactFactor > 3.0 ? 25 : (pub.impactFactor > 1.0 ? 15 : 10);
        break;
      case 'conference':
        points = 8;
        break;
      case 'book_chapter':
        points = 10;
        break;
      case 'patent':
        points = 30;
        break;
      case 'funded_project':
        points = 20;
        break;
    }

    // Co-author factor (UGC)
    const authorCount = (pub.coAuthors?.length || 0) + 1; // +1 for the faculty themselves
    let factor = 1.0;
    if (authorCount === 2) factor = 0.8;
    else if (authorCount >= 3) factor = 0.6;

    totalPoints += points * factor;
  }

  return Math.min(totalPoints, 100);
}

function calculateFeedbackScore(feedback: any[]) {
  if (feedback.length === 0) return 0;

  // Weight by student count? (The model doesn't store student count per record, 
  // but StudentFeedback represents ONE student's response. 
  // So we just take the simple average of all responses for that faculty)
  
  const avg = feedback.reduce((acc, f) => acc + f.avgRating, 0) / feedback.length;
  // Convert 1-5 scale to 0-100: ((avg-1)/4 * 100)
  return ((avg - 1) / 4) * 100;
}

function calculateAdminScore(admin: any[]) {
  const totalHours = admin.reduce((acc, a) => acc + a.hoursInvested, 0);
  
  // 200+ hours = 100, 100 hours = 50, scale linearly
  // Formula: (hours / 200) * 100
  const score = (totalHours / 200) * 100;
  return Math.min(score, 100);
}

function assignGrade(score: number) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  return 'C';
}

async function checkPromotionEligibility(faculty: any, apiScore: number, researchCount: number) {
  const rule = await PromotionRule.findOne({ 
    fromDesignation: faculty.designation,
    effectiveFrom: { $lte: new Date() }
  }).sort({ effectiveFrom: -1 });

  if (!rule) return false;

  const yearsInGrade = Math.floor((new Date().getTime() - new Date(faculty.dateOfJoining).getTime()) / (1000 * 3600 * 24 * 365.25));

  return (
    apiScore >= rule.minApiScore &&
    yearsInGrade >= rule.minYearsService &&
    (!rule.minPhd || faculty.hasPhd) &&
    researchCount >= rule.minResearchPapers
  );
}

export const syncAppraisalRecord = async (appraisalId: string) => {
  const appraisal = await AppraisalCycle.findById(appraisalId);
  if (!appraisal) return;

  const scores = await calculateApiScore(appraisal.faculty.toString(), appraisal.cycleYear);
  
  Object.assign(appraisal, scores);
  await appraisal.save();
  return appraisal;
};
