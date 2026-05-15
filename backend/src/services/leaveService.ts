import LeaveRequest from '../models/LeaveRequest.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

export const adjustAttendanceForLeave = async (leaveId: string) => {
  const leave = await LeaveRequest.findById(leaveId);
  if (!leave || leave.status !== 'Approved') return;

  // Find all attendance records for this user between startDate and endDate
  // And update status to 'ML' (Medical Leave) or 'DL' (Duty Leave)
  const statusCode = leave.type === 'Medical' ? 'ML' : leave.type === 'Duty' ? 'DL' : 'L';
  
  // Retroactive adjustment
  // This would use a batch update on the Attendance model
  // await Attendance.updateMany(...)
  
  leave.attendanceAdjusted = true;
  await leave.save();
};

export const checkLeaveEscalation = async () => {
  // Logic to find 'Pending' leaves older than 24h
  // And notify Principal
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const staleLeaves = await LeaveRequest.find({
    status: 'Pending',
    createdAt: { $lt: oneDayAgo }
  });

  // Trigger notifications...
  return staleLeaves.length;
};
