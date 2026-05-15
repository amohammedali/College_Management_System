import nodeCron from 'node-cron';
import FeeStructure from '../models/FeeStructure.js';
import PaymentReminder from '../models/PaymentReminder.js';
import User from '../models/User.js';
import { getStudentOutstanding } from './feeService.js';

export const checkRecentReminder = async (studentId: string, hours: number) => {
  const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);
  const existing = await PaymentReminder.findOne({
    student: studentId,
    sentAt: { $gte: threshold }
  });
  return !!existing;
};

export const dispatchReminders = async () => {
  console.log('Running daily fee reminder job...');
  
  // 1. Get all students (In a real system, filter by active)
  const students = await User.find({ role: 'student' });

  for (const student of students) {
    // 2. Check if already sent in last 48h
    if (await checkRecentReminder(student._id.toString(), 48)) continue;

    // 3. Get outstanding fees
    const ledger = await getStudentOutstanding(student._id.toString());
    const overdueOrUpcoming = ledger.filter(item => {
      const dueDate = new Date(item.feeStructure.dueDate);
      const diffDays = (dueDate.getTime() - Date.now()) / (1000 * 3600 * 24);
      return item.outstanding > 0 && (diffDays <= 7 || diffDays < 0);
    });

    if (overdueOrUpcoming.length > 0) {
      // 4. Send Email/SMS (Placeholder for actual dispatch)
      console.log(`Reminder sent to ${student.email} for ${overdueOrUpcoming.length} components.`);
      
      await PaymentReminder.create({
        student: student._id,
        reminderType: 'email',
        status: 'sent',
        providerRef: 'SIM_ID_' + Math.random().toString(36).substr(2, 9)
      });
    }
  }
};

// Daily at 8 AM
nodeCron.schedule('0 8 * * *', dispatchReminders);
