import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { UserRole } from '../models/User.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import ClassAttendance from '../models/ClassAttendance.js';
import Subject from '../models/Subject.js';
import Mark from '../models/Mark.js';
import { AuthRequest } from '../middlewares/auth.js';
import Grievance from '../models/Grievance.js';
import Placement from '../models/Placement.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Lecture from '../models/Lecture.js';
import Timetable from '../models/Timetable.js';
import Broadcast from '../models/Broadcast.js';
import Subject from '../models/Subject.js';
import StudentChoice from '../models/StudentChoice.js';
import SyllabusUnit from '../models/SyllabusUnit.js';
import SyllabusTopic from '../models/SyllabusTopic.js';

const router = Router();

router.use(protect, authorize(UserRole.STUDENT));

// ── Student profile ────────────────────────────────────────
router.get('/profile', async (req: AuthRequest, res) => {
  const student = await Student.findOne({ user: req.user?._id }).populate('user', 'email').lean();
  if (!student) return res.status(404).json({ message: 'Profile not found' });
  res.json(student);
});


// ── Marks ─────────────────────────────────────────────────
router.get('/marks', async (req: AuthRequest, res) => {
  const student = await Student.findOne({ user: req.user?._id }).lean();
  if (!student) return res.status(404).json({ message: 'Not found' });

  const marks = await Mark.find({ student: student._id })
    .populate('subject', 'name code credits type')
    .sort({ createdAt: -1 })
    .lean();
    
  res.json(marks);
});

// ── Elective Selection ──────────────────────────────────────
router.get('/electives/available', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Find elective subjects for student's current semester and dept
    const electives = await Subject.find({ 
       department: student.department, 
       semester: student.currentSemester,
       type: 'Elective',
       status: 'active'
    }).lean();

    // Add seat counts (Mocking for now: 60 total seats)
    const electivesWithSeats = await Promise.all(electives.map(async (e) => {
       const taken = await StudentChoice.countDocuments({ subject: e._id });
       return { ...e, seatsRemaining: 60 - taken, totalSeats: 60 };
    }));

    res.json(electivesWithSeats);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/electives/select', async (req: AuthRequest, res) => {
  try {
    const { subjectId } = req.body;
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if seats are full
    const taken = await StudentChoice.countDocuments({ subject: subjectId });
    if (taken >= 60) return res.status(400).json({ message: 'Error: Elective seats are full.' });

    const choice = await StudentChoice.create({
       student: student._id,
       subject: subjectId,
       semester: student.currentSemester,
       academicYear: '2023-24' // Should be dynamic
    });

    res.status(201).json(choice);
  } catch (e: any) {
    res.status(400).json({ message: 'You have already selected an elective for this semester.' });
  }
});

router.get('/electives/my-choice', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const choice = await StudentChoice.findOne({ 
       student: student._id, 
       semester: student.currentSemester 
    }).populate('subject').lean();

    res.json(choice);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Fees ──────────────────────────────────────────────────
router.get('/fees', async (req: AuthRequest, res) => {
  const student = await Student.findOne({ user: req.user?._id }).select('fees').lean();
  if (!student) return res.status(404).json({ message: 'Not found' });
  res.json(student.fees);
});

// ── Grievances ──────────────────────────────────────────────
router.get('/grievances', async (req: AuthRequest, res) => {
  try {
    const tickets = await Grievance.find({ student: req.user?._id }).sort({ createdAt: -1 }).lean();
    res.json(tickets);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/grievances', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const ticket = await Grievance.create({ 
      ...req.body, 
      student: req.user?._id,
      studentName: student.name,
      department: student.department,
      year: student.year,
      section: student.class 
    });
    res.status(201).json(ticket);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Placements ─────────────────────────────────────────────
router.get('/placements', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const drives = await Placement.find({
      department: student.department,
      year: student.year,
      section: student.class
    }).sort({ createdAt: -1 }).lean();
    res.json(drives);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Assignments & Submissions ──────────────────────────────
router.get('/assignments', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const assignments = await Assignment.find({
      department: student.department,
      year: student.year,
      section: student.class
    }).sort({ deadline: 1 }).lean();
    res.json(assignments);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/submissions', async (req: AuthRequest, res) => {
  try {
    const submission = await Submission.create({ ...req.body, student: req.user?._id });
    res.status(201).json(submission);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Library ────────────────────────────────────────────────
router.get('/library', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const resources = await Lecture.find({
      department: student.department,
      year: student.year,
      section: student.class
    }).sort({ createdAt: -1 }).lean();
    res.json(resources);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Timetable ─────────────────────────────────────────────
router.get('/timetable', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const timetable = await Timetable.findOne({
      department: student.department,
      section: student.class
    }).lean();
    res.json(timetable);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Inbox (Broadcasts) ────────────────────────────────────
router.get('/notifications', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const notifications = await Broadcast.find({ 
      $and: [
        { $or: [{ audience: 'All' }, { audience: 'Students' }] },
        { $or: [{ department: 'All' }, { department: student.department }] }
      ]
    }).sort({ createdAt: -1 }).lean();
    res.json(notifications);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Syllabus View ──────────────────────────────────────────
router.get('/syllabus/units/:subjectId', async (req, res) => {
  try {
    const units = await SyllabusUnit.find({ subject: req.params.subjectId }).sort({ unitNumber: 1 }).lean();
    res.json(units);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/syllabus/topics/:unitId', async (req, res) => {
  try {
    const topics = await SyllabusTopic.find({ unit: req.params.unitId }).sort({ createdAt: 1 }).lean();
    res.json(topics);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/syllabus/analysis/:subjectId', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const units = await SyllabusUnit.find({ subject: subject._id });
    const unitIds = units.map(u => u._id);
    
    const totalTopics = await SyllabusTopic.countDocuments({ unit: { $in: unitIds } });
    const completedTopics = await SyllabusTopic.countDocuments({ unit: { $in: unitIds }, isCompleted: true });

    const actualProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
    const currentWeek = 10; 
    const totalWeeks = subject.totalWeeks || 16;
    const expectedProgress = (currentWeek / totalWeeks) * 100;
    const gap = expectedProgress - actualProgress;

    res.json({
      actualProgress: Math.round(actualProgress),
      expectedProgress: Math.round(expectedProgress),
      gap: Math.round(gap),
      totalTopics,
      completedTopics
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Attendance summary ─────────────────────────────────────
router.get('/attendance/summary', async (req: AuthRequest, res) => {
  const student = await Student.findOne({ user: req.user?._id });
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student.attendance);
});

router.get('/attendance/my-stats', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const sessions = await ClassAttendance.find({
      'students.studentId': student._id
    }).populate('subject', 'name code').lean();

    const subjectStats: Record<string, any> = {};
    sessions.forEach((sess: any) => {
      const subId = sess.subject._id.toString();
      if (!subjectStats[subId]) {
        subjectStats[subId] = {
          name: sess.subject.name,
          code: sess.subject.code,
          total: 0,
          present: 0
        };
      }
      subjectStats[subId].total++;
      const myStatus = sess.students.find((s: any) => s.studentId.toString() === student._id.toString());
      if (myStatus?.status === 'present') subjectStats[subId].present++;
    });

    const breakdown = Object.values(subjectStats).map((s: any) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    res.json({
      overall: student.attendance,
      breakdown
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Attendance summary ─────────────────────────────────────
router.get('/attendance/summary', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student.attendance);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/attendance/my-stats', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const sessions = await ClassAttendance.find({
      'students.studentId': student._id
    }).populate('subject', 'name code').lean();

    const subjectStats: Record<string, any> = {};
    sessions.forEach((sess: any) => {
      if (!sess.subject) return;
      const subId = sess.subject._id.toString();
      if (!subjectStats[subId]) {
        subjectStats[subId] = {
          name: sess.subject.name,
          code: sess.subject.code,
          total: 0,
          present: 0
        };
      }
      subjectStats[subId].total++;
      const myStatus = sess.students.find((s: any) => s.studentId.toString() === student._id.toString());
      if (myStatus?.status === 'present') subjectStats[subId].present++;
    });

    const breakdown = Object.values(subjectStats).map((s: any) => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    res.json({
      overall: student.attendance,
      breakdown
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/attendance/my-history', async (req: AuthRequest, res) => {
  try {
    const student = await Student.findOne({ user: req.user?._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const sessions = await ClassAttendance.find({
      'students.studentId': student._id
    })
    .populate('subject', 'name code')
    .populate('faculty', 'name')
    .sort({ date: -1, hour: -1 })
    .lean();

    const history = sessions.map((sess: any) => {
      const myStatus = sess.students.find((s: any) => s.studentId.toString() === student._id.toString());
      return {
        ...sess,
        myStatus: myStatus?.status
      };
    });

    res.json(history);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
