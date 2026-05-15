import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import FeeWaiver from '../models/FeeWaiver.js';
import AccrDocument from '../models/AccrDocument.js';
import NaacCriterion from '../models/NaacCriterion.js';
import CriterionScore from '../models/CriterionScore.js';
import ScoreSnapshot from '../models/ScoreSnapshot.js';
import GapAnalysis from '../models/GapAnalysis.js';

// ── C2: Teaching-Learning (The Core) ────────────────────────
export const computeC2Score = async (deptId?: string) => {
  // 1. Attendance % (Max: 100)
  const attendance = await Attendance.aggregate([
    { $group: { _id: null, avg: { $avg: { $cond: [{ $eq: ["$status", "Present"] }, 100, 0] } } } }
  ]);
  const attendanceScore = Math.min(((attendance[0]?.avg || 0) / 75) * 100, 100);

  // 2. Pass Rate (Max: 150)
  const marks = await Mark.aggregate([
    { $group: { _id: null, avg: { $avg: "$marksObtained" } } }
  ]);
  const passRateScore = Math.min(((marks[0]?.avg || 0) / 60) * 150, 150);

  // 3. Slow Learner Support (Placeholder - Max: 100)
  const supportScore = 80; 

  return { 
    score: attendanceScore + passRateScore + supportScore, 
    max: 350,
    rawData: { attendance: attendance[0]?.avg, marks: marks[0]?.avg }
  };
};

// ── C4: Infrastructure (Asset Health) ───────────────────────
export const computeC4Score = async () => {
  const assets = await Inventory.find();
  const healthyAssets = assets.filter(a => a.status === 'Functional').length;
  const healthRate = assets.length > 0 ? (healthyAssets / assets.length) * 100 : 0;
  
  // Library volumes (Mock lookup)
  const libraryVolumes = 25000;
  const libraryScore = Math.min((libraryVolumes / 50000) * 50, 50);

  return {
    score: (healthRate / 100 * 50) + libraryScore,
    max: 100,
    rawData: { healthRate, libraryVolumes }
  };
};

// ── C6: Governance (Policy Documents) ──────────────────────
export const computeC6Score = async () => {
  const requiredDocs = ['Strategic Plan', 'HR Policy', 'E-Governance Policy'];
  const uploadedDocs = await AccrDocument.find({ 
    docTitle: { $in: requiredDocs },
    isVerified: true 
  });
  
  const score = (uploadedDocs.length / requiredDocs.length) * 100;
  return {
    score,
    max: 100,
    rawData: { uploaded: uploadedDocs.length, total: requiredDocs.length }
  };
};

import cron from 'node-cron';

// ── Nightly Recalculation (3 AM) ──────────────────────────
cron.schedule('0 3 * * *', async () => {
  console.log('Nightly Accreditation Sync Started...');
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await runInstitutionalAggregation(admin._id.toString());
      console.log('Nightly Sync Completed Successfully.');
    }
  } catch (error) {
    console.error('Nightly Sync Failed:', error);
  }
});

// ── Master Aggregation Engine ───────────────────────────────
export const runInstitutionalAggregation = async (adminId: string) => {
  const criteria = await NaacCriterion.find({ isActive: true });
  let totalScore = 0;
  let maxPossible = 0;

  for (const c of criteria) {
    let result = { score: 0, max: c.maxScore, rawData: {} };

    if (c.criterionCode === 'C2') result = await computeC2Score();
    if (c.criterionCode === 'C4') result = await computeC4Score();
    if (c.criterionCode === 'C6') result = await computeC6Score();
    if (['C1', 'C3', 'C5', 'C7'].includes(c.criterionCode)) {
      result = { score: c.maxScore * 0.85, max: c.maxScore, rawData: { status: 'estimated' } };
    }

    const snapshot = await CriterionScore.create({
      criterion: c._id,
      score: result.score,
      maxScore: result.max,
      compliancePercent: (result.score / result.max) * 100,
      computedBy: adminId,
      rawData: result.rawData
    });

    // Gap Analysis: Target 90% for A++
    const targetScore = result.max * 0.9;
    if (result.score < targetScore) {
      await GapAnalysis.findOneAndUpdate(
        { criterion: c._id, status: { $ne: 'resolved' } },
        {
          currentScore: result.score,
          targetScore,
          gap: targetScore - result.score,
          actionRequired: `Automated Compliance Alert: ${c.criterionName} is below target.`,
          assignedTo: adminId,
          dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000)
        },
        { upsert: true }
      );
    }

    // Critical Alert: Below 50%
    if ((result.score / result.max) < 0.5) {
      console.log(`CRITICAL ALERT: ${c.criterionName} compliance dropped below 50%!`);
      // sendEmail(adminId, `Compliance Drop: ${c.criterionName}`);
    }

    totalScore += (result.score / result.max) * c.weightPercent;
    maxPossible += c.weightPercent;
  }

  const cgpa = (totalScore / maxPossible) * 4;
  let grade = 'B';
  if (cgpa >= 3.51) grade = 'A++';
  else if (cgpa >= 3.26) grade = 'A+';
  else if (cgpa >= 3.01) grade = 'A';
  else if (cgpa >= 2.76) grade = 'B++';
  else if (cgpa >= 2.51) grade = 'B+';

  return await ScoreSnapshot.create({
    cycleYear: '2024-25',
    cgpaForecast: cgpa.toFixed(2),
    predictedGrade: grade,
    totalScore,
    maxPossible,
    criteriaCount: criteria.length,
    snapshotAt: new Date()
  });
};
