import { Router, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import ClassAttendance from '../models/ClassAttendance.js';
import Student from '../models/Student.js';
import { AuthRequest } from '../middlewares/auth.js';

const router = Router();

// GET students for a specific section to mark attendance
router.get('/students', protect, authorize('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { department, year, section } = req.query;
    const students = await Student.find({
      department,
      year: Number(year),
      class: section
    }).select('name registerNumber _id').sort({ registerNumber: 1 });
    
    res.json(students);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// POST bulk attendance
router.post('/submit', protect, authorize('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { subject, department, year, section, date, hour, students } = req.body;
    
    const presentCount = students.filter((s: any) => s.status === 'present').length;
    const absentCount = students.length - presentCount;

    const attendance = await ClassAttendance.findOneAndUpdate(
      { subject, date: new Date(date), hour, section, year },
      {
        faculty: req.user?._id, // Assumes user is Staff
        department,
        students,
        totalStudents: students.length,
        presentCount,
        absentCount
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Attendance recorded successfully', attendance });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// GET attendance history for a section
router.get('/history', protect, async (req, res) => {
  try {
    const { department, year, section, subject } = req.query;
    const filter: any = { department, year: Number(year), section };
    if (subject) filter.subject = subject;

    const history = await ClassAttendance.find(filter)
      .populate('subject', 'name code')
      .populate('faculty', 'name')
      .sort({ date: -1, hour: -1 });
    
    res.json(history);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
