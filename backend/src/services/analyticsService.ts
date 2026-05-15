import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';
import { getStudentOutstanding } from './feeService.js';

export const calculateDropoutRisk = async () => {
  const students = await User.find({ role: 'student' }).limit(100); // Sample for performance
  
  const riskProfiles = await Promise.all(students.map(async (student) => {
    // 1. Attendance Weight (40%)
    const attendance = await Attendance.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: null, avg: { $avg: { $cond: [{ $eq: ["$status", "Present"] }, 100, 0] } } } }
    ]);
    const attendanceScore = attendance[0]?.avg || 0;

    // 2. Performance Weight (40%)
    const marks = await Mark.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: null, avg: { $avg: "$marksObtained" } } }
    ]);
    const marksScore = marks[0]?.avg || 0;

    // 3. Financial Weight (20%)
    const ledger = await getStudentOutstanding(student._id.toString());
    const totalOutstanding = ledger.reduce((acc, curr) => acc + curr.outstanding, 0);
    const financialScore = totalOutstanding > 10000 ? 0 : 100; // Low score if high debt

    // Aggregate Risk Score (0 = High Risk, 100 = Low Risk)
    const aggregateScore = (attendanceScore * 0.4) + (marksScore * 0.4) + (financialScore * 0.2);

    return {
      studentId: student._id,
      name: `${student.firstName} ${student.lastName}`,
      score: Math.round(aggregateScore),
      riskLevel: aggregateScore < 40 ? 'High' : aggregateScore < 75 ? 'Medium' : 'Low'
    };
  }));

  // Save insight to DB
  await Analytics.create({
    type: 'dropout_risk',
    dataPoints: riskProfiles.filter(p => p.riskLevel !== 'Low'),
    summary: `Identified ${riskProfiles.filter(p => p.riskLevel === 'High').length} students at critical dropout risk.`,
    score: riskProfiles.reduce((acc, curr) => acc + curr.score, 0) / riskProfiles.length
  });

  return riskProfiles;
};

export const getEnrollmentForecast = async () => {
  // Statistical mockup for enrollment trends
  const currentEnrollment = await User.countDocuments({ role: 'student' });
  const years = [2021, 2022, 2023, 2024, 2025];
  const data = years.map(y => ({
    year: y,
    count: Math.round(currentEnrollment * (1 + (y - 2024) * 0.12)) // 12% projected growth
  }));

  await Analytics.create({
    type: 'enrollment_forecast',
    dataPoints: data,
    summary: "Projecting 12% year-over-year growth in institutional enrollment."
  });

  return data;
};
