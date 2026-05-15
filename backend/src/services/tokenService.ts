import { v4 as uuidv4 } from 'uuid';
import FeedbackToken from '../models/FeedbackToken.js';
import Student from '../models/Student.js';
import TimetableSlot from '../models/TimetableSlot.js';
import mongoose from 'mongoose';

export const generateFeedbackTokens = async (deptId: string, cycleYear: string, expiryDays: number = 7) => {
  const students = await Student.find({ department: deptId });
  const tokens: any[] = [];
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  for (const student of students) {
    // Find subjects this student is enrolled in (based on their department and year)
    // For simplicity, we'll assume students in the same dept and year/class study the same subjects
    const slots = await TimetableSlot.find({ dept_id: deptId, section: student.class });
    const subjectIds = [...new Set(slots.map(s => s.subject_id.toString()))];

    for (const subId of subjectIds) {
      tokens.push({
        anonToken: uuidv4(),
        student: student._id,
        subject: new mongoose.Types.ObjectId(subId),
        cycleYear,
        expiresAt
      });
    }
  }

  // Bulk insert tokens
  await FeedbackToken.insertMany(tokens, { ordered: false });
  
  return tokens.length;
};

export const deliverTokens = async (cycleYear: string) => {
  // In a real app, send emails or in-app notifications
  // Mocking delivery logic
  console.log(`Delivering feedback tokens for ${cycleYear}...`);
  return true;
};
