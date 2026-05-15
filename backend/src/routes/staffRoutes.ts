import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { protect, authorize } from '../middlewares/auth.js';
import { UserRole } from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Mark from '../models/Mark.js';
import User from '../models/User.js';
import { AuthRequest } from '../middlewares/auth.js';
import Question from '../models/Question.js';
import Lecture from '../models/Lecture.js';
import Counseling from '../models/Counseling.js';
import Grievance from '../models/Grievance.js';
import Placement from '../models/Placement.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Subject from '../models/Subject.js';
import SubjectProposal from '../models/SubjectProposal.js';
import TimetableSlot from '../models/TimetableSlot.js';
import SyllabusUnit from '../models/SyllabusUnit.js';
import SyllabusTopic from '../models/SyllabusTopic.js';
import SectionSubject from '../models/SectionSubject.js';
import Department from '../models/Department.js';
import mongoose from 'mongoose';



const router = Router();

// Multer Configuration for Lecture Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});


router.use(protect, authorize(UserRole.STAFF, UserRole.NON_TEACHING));

// ── Staff profile ──────────────────────────────────────────
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?._id;
    
    console.log(`[DEBUG] Profile Request: ${userEmail} (ID: ${userId})`);

    // 1. Try matching by Email first (Most Reliable Primary Key)
    let staff = null;
    if (userEmail) {
      staff = await Staff.findOne({ 
        email: { $regex: new RegExp(`^${userEmail.trim()}$`, 'i') } 
      });
      
      if (staff) {
        console.log(`[DEBUG] Found via email: ${staff.name}`);
        // Repair link if missing or mismatched
        if (!staff.user || staff.user.toString() !== userId.toString()) {
           console.log(`[REPAIR] Linking staff to user ID: ${userId}`);
           staff.user = userId;
           await (staff as any).save();
        }
      }
    }

    // 2. Fallback to User ID if email lookup failed
    if (!staff) {
      console.log(`[DEBUG] Email match failed. Trying user ID fallback: ${userId}`);
      staff = await Staff.findOne({ user: userId });
    }

    if (!staff) {
      console.log(`[DEBUG] TOTAL FAILURE: Profile NOT FOUND for ${userEmail}`);
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    const staffId = staff._id.toString();
    
    // 3. Fetch subjects assigned via Counselor Allocation (SectionSubject)
    const counselorAssignments = await SectionSubject.find({
      'subjects.faculty_id': staff._id
    }).populate('subjects.subject_id').lean();

    const assignedFromCounselor = counselorAssignments.flatMap(section => 
      section.subjects
        .filter(s => s.faculty_id?.toString() === staffId)
        .map(s => {
          const sub = s.subject_id as any;
          return {
            ...sub,
            section: section.section,
            year: section.year,
            isSectionSpecific: true
          };
        })
    );

    // 4. Fetch subjects where staff is listed in Subject model (Legacy/Admin)
    const allActiveSubjects = await Subject.find({ status: 'active' }).lean();
    const assignedFromAdmin = allActiveSubjects.filter((sub: any) => {
      const faculties = sub.faculties || [];
      const primaryFaculty = sub.faculty;
      return faculties.some((f: any) => (f?._id || f)?.toString() === staffId) || 
             primaryFaculty?.toString() === staffId;
    });

    // 5. Merge and deduplicate
    const combinedSubjects = [...assignedFromCounselor];
    assignedFromAdmin.forEach(sub => {
      if (!combinedSubjects.some(c => c._id.toString() === sub._id.toString())) {
        combinedSubjects.push(sub);
      }
    });
    
    // 6. Calculate teaching load from timetable
    const timetableSlots = await TimetableSlot.countDocuments({ 
      $or: [
        { faculty_ids: staff._id },
        { faculty_ids: staffId }
      ]
    });
    
    // Fetch mentored students
    const mentoredStudents = await Student.find({ mentor: staff._id }).lean();
    
    res.json({
      ...(staff.toObject ? staff.toObject() : staff),
      assignedSubjectsCount: combinedSubjects.length,
      subjects: combinedSubjects, // Proper database allocation
      totalTeachingHours: timetableSlots,
      academicLoad: timetableSlots > 0 ? `${Math.min(100, Math.round((timetableSlots / 24) * 100))}%` : '0%',
      mentoredStudents,
      counselorForClass: staff.assignedYear && staff.assignedSection ? `${staff.assignedYear} - Section ${staff.assignedSection}` : 'General'
    });
  } catch (e: any) {
    console.error(`[ERROR] Profile Route: ${e.message}`);
    res.status(500).json({ message: e.message });
  }
});

// ── Mentored Students ──────────────────────────────────────
router.get('/my-students', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    // Find students where:
    // 1. If staff is assigned to "All", match all students in their department
    // 2. Otherwise, match specifically by Year and Section
    // 3. Or if explicitly mentored by this staff member
    
    const isGlobalYear = staff.assignedYear === 'All';
    const isGlobalSection = staff.assignedSection === 'All';

    const students = await Student.find({
      department: staff.department,
      $or: [
        { 
          $and: [
            isGlobalYear ? {} : { year: staff.assignedYear },
            isGlobalSection ? {} : { class: { $regex: new RegExp(`Section ${staff.assignedSection}$`, 'i') } }
          ]
        },
        { mentor: staff._id }
      ]
    }).populate('user', 'email').lean();

    res.json(students);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Mark attendance (New Class-wise Batch Logic) ──────────────────
router.get('/attendance/students-list', async (req: AuthRequest, res) => {
  try {
    const { department, year, section } = req.query;
    if (!department || !year || !section) {
      return res.status(400).json({ message: 'Department, Year, and Section are required' });
    }

    // High-flexibility matching to handle varied DB formats (e.g., "3" matching "3rd Year")
    const students = await Student.find({
      department: { $regex: new RegExp(department as string, 'i') },
      year: { $regex: new RegExp(year as string, 'i') },
      class: { $regex: new RegExp(section as string, 'i') }
    }).select('name studentId').sort('name').lean();

    res.json(students);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/attendance/session', async (req: AuthRequest, res) => {
  const { 
    subjectId, date, hour, students, 
    department, year, section 
  } = req.body;

  const staff = await Staff.findOne({ user: req.user?._id });
  if (!staff) return res.status(404).json({ message: 'Staff not found' });

  try {
    const totalStudents = students.length;
    const presentCount = students.filter((s: any) => s.status === 'present').length;
    const absentCount = totalStudents - presentCount;

    // 1. Save Session Record
    const session = await ClassAttendance.findOneAndUpdate(
      { subject: subjectId, date: new Date(date), hour, section, year },
      { 
        faculty: staff._id,
        department,
        students,
        totalStudents,
        presentCount,
        absentCount
      },
      { upsert: true, new: true }
    );

    // 2. Atomic Update for Student-level aggregate stats
    // We update the 'attendance' object in the Student model for quick display
    for (const record of students) {
      // Find all sessions for this student across all subjects
      const studentSessions = await ClassAttendance.find({
        'students.studentId': record.studentId
      }).lean();

      let totalPresent = 0;
      let totalConducted = studentSessions.length;

      studentSessions.forEach(sess => {
        const studentStatus = sess.students.find((s: any) => s.studentId.toString() === record.studentId.toString());
        if (studentStatus?.status === 'present') totalPresent++;
      });

      await Student.findByIdAndUpdate(record.studentId, {
        'attendance.total': totalConducted,
        'attendance.present': totalPresent,
        'attendance.percentage': totalConducted > 0 ? (totalPresent / totalConducted) * 100 : 0
      });
    }

    res.json({ message: 'Attendance session recorded successfully', session });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/attendance/sessions', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const sessions = await ClassAttendance.find({ faculty: staff._id })
      .populate('subject', 'name code')
      .sort({ date: -1, hour: -1 })
      .lean();
    
    res.json(sessions);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Attendance history ─────────────────────────────────────
router.get('/attendance/history', async (_req, res) => {
  const records = await Attendance.find().populate('student', 'name studentId').lean();
  res.json(records);
});

// ── Marks entry ────────────────────────────────────────────
router.post('/marks', async (req: AuthRequest, res) => {
  const { studentId, subject, type, score, totalScore, semester, academicYear } = req.body;

  // Simple grade calculation
  const pct = (score / totalScore) * 100;
  const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'F';

  const mark = await Mark.findOneAndUpdate(
    { student: studentId, subject, type, semester, academicYear },
    { score, totalScore, grade },
    { upsert: true, new: true }
  );
  res.json(mark);
});

router.post('/students', async (req, res) => {
  const { email, password, studentId, name, department, class: className, phone, address, fees, ...otherData } = req.body;
  try {
    // 1. Pre-validation
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: `A user with email ${email} is already registered.` });
    }

    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: `Student ID ${studentId} is already assigned to ${existingStudent.name}.` });
    }

    // 2. Create User
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: UserRole.STUDENT
    });

    try {
      // 3. Create Student
      const student = await Student.create({
        ...otherData,
        user: user._id,
        studentId,
        name,
        department,
        class: className,
        phone,
        address,
        fees: fees || { total: 50000, paid: 0, balance: 50000 }
      });
      res.status(201).json(student);
    } catch (studentError: any) {
      // Rollback user creation if student creation fails
      await User.findByIdAndDelete(user._id);
      throw studentError;
    }
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

// ── Questions ───────────────────────────────────────────────
router.get('/questions', async (_req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 }).lean();
    res.json(questions);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Lectures ───────────────────────────────────────────────
router.get('/lectures', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const lectures = await Lecture.find({ faculty: staff._id }).sort({ createdAt: -1 }).lean();
    res.json(lectures);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/lectures', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { subject, year, section, title, description, accessLevel, subject_id } = req.body;

    // Check storage limits (5GB limit for now)
    const currentUsage = await Lecture.aggregate([
      { $match: { faculty: staff._id } },
      { $group: { _id: null, total: { $sum: "$sizeBytes" } } }
    ]);
    const totalBytes = currentUsage[0]?.total || 0;
    const LIMIT = 5 * 1024 * 1024 * 1024; // 5GB

    if (totalBytes + req.file.size > LIMIT) {
      // Remove uploaded file if over limit
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(413).json({ message: 'Cloud storage limit exceeded (5GB Max)' });
    }

    const lecture = await Lecture.create({
      title: title || req.file.originalname,
      description,
      subject,
      subject_id,
      department: staff.department,
      year,
      section,
      type: path.extname(req.file.originalname).toUpperCase().replace('.', ''),
      url: `/uploads/${req.file.filename}`,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
      sizeBytes: req.file.size,
      faculty: staff._id,
      accessLevel: accessLevel || 'Internal',
      cdnUrl: accessLevel === 'Public' ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null
    });

    res.status(201).json(lecture);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/lectures/storage', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const usage = await Lecture.aggregate([
      { $match: { faculty: staff._id } },
      { $group: { _id: null, total: { $sum: "$sizeBytes" } } }
    ]);

    res.json({
      usedBytes: usage[0]?.total || 0,
      limitBytes: 5 * 1024 * 1024 * 1024,
      usedGB: ((usage[0]?.total || 0) / (1024 * 1024 * 1024)).toFixed(2),
      limitGB: 5
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/lectures/:id', async (req: AuthRequest, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    // Delete physical file
    const filePath = path.join(process.cwd(), lecture.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Lecture.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lecture material deleted' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});


// ── Counseling ──────────────────────────────────────────────
router.get('/counseling', async (_req, res) => {
  try {
    const logs = await Counseling.find().sort({ createdAt: -1 }).lean();
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/counseling', async (req, res) => {
  try {
    const log = await Counseling.create(req.body);
    res.status(201).json(log);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Assignments ────────────────────────────────────────────
router.get('/assignments', async (_req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).lean();
    res.json(assignments);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/assignments', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const assignment = await Assignment.create({
      ...req.body,
      department: req.body.department || staff.department,
      faculty: staff._id
    });
    res.status(201).json(assignment);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Marks Wizard (Bulk) ─────────────────────────────────────
router.post('/marks/bulk', async (req, res) => {
  try {
    const { marks } = req.body; // [{ studentId, subject, type, score, ... }]
    const ops = marks.map((m: any) => ({
      updateOne: {
        filter: { student: m.studentId, subject: m.subject, type: m.type },
        update: { $set: { score: m.score, grade: m.grade } },
        upsert: true
      }
    }));
    await Mark.bulkWrite(ops);
    res.json({ message: 'Bulk marks updated' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Diagnostic Bridge ──────────────────────────────────────
router.get('/debug-link', async (req: AuthRequest, res) => {
  const userEmail = req.user?.email;
  const userId = req.user?._id;

  const userRecord = await User.findById(userId).select('-password').lean();
  const staffByUserId = await Staff.findOne({ user: userId }).lean();
  const staffByEmail = await Staff.findOne({ email: userEmail }).lean();

  res.json({
    loggedInAs: { userId, userEmail },
    userRecord,
    staffByUserId,
    staffByEmail,
    status: {
      hasUserRecord: !!userRecord,
      hasStaffLink: !!staffByUserId,
      emailMatchExists: !!staffByEmail,
      isBroken: !!staffByEmail && !staffByUserId
    }
  });
});

// ── Subjects ────────────────────────────────────────────────
router.get('/subjects', async (req: AuthRequest, res) => {
  try {
    const userEmail = req.user?.email;
    let staff = await Staff.findOne({ 
      $or: [
        { email: { $regex: new RegExp(`^${userEmail}$`, 'i') } },
        { user: req.user?._id }
      ]
    });

    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const staffId = staff._id.toString();
    
    // 1. Fetch subjects assigned via Counselor Allocation (SectionSubject)
    const counselorAssignments = await SectionSubject.find({
      'subjects.faculty_id': staff._id
    }).populate('subjects.subject_id').lean();

    const assignedFromCounselor = counselorAssignments.flatMap(section => 
      section.subjects
        .filter(s => s.faculty_id?.toString() === staffId)
        .map(s => {
          const sub = s.subject_id as any;
          return {
            ...sub,
            section: section.section,
            year: section.year,
            isSectionSpecific: true
          };
        })
    );

    // 2. Fetch subjects where staff is listed in Subject model (Legacy/Admin)
    const allActiveSubjects = await Subject.find({ status: 'active' }).lean();
    const assignedFromAdmin = allActiveSubjects.filter((sub: any) => {
      const faculties = sub.faculties || [];
      const primaryFaculty = sub.faculty;
      return faculties.some((f: any) => (f?._id || f)?.toString() === staffId) || 
             primaryFaculty?.toString() === staffId;
    });

    // 3. Merge and deduplicate
    const combined = [...assignedFromCounselor];
    
    assignedFromAdmin.forEach(sub => {
      if (!combined.some(c => c._id.toString() === sub._id.toString())) {
        combined.push(sub);
      }
    });

    res.json(combined);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/subjects/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid Subject ID' });
    }
    const subject = await Subject.findById(req.params.id).lean();
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/subjects/:id/syllabus', async (req: AuthRequest, res) => {
  try {
    const { syllabus } = req.body;
    const subject = await Subject.findByIdAndUpdate(req.params.id, { syllabus }, { new: true });
    res.json(subject);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/subjects/suggest', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const subject = new Subject({
      ...req.body,
      department: staff.department,
      status: 'pending',
      faculties: [staff._id]
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Error suggesting subject' });
  }
});

router.post('/subjects/proposals', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const proposal = await SubjectProposal.create({
      ...req.body,
      proposedBy: staff._id,
      department: staff.department,
      status: 'pending'
    });
    res.status(201).json(proposal);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/students/:id', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Ensure this staff is the mentor
    if (student.mentor.toString() !== staff._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You are not the mentor for this student' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Syllabus Tracker ───────────────────────────────────────
router.post('/syllabus/units', async (req: AuthRequest, res) => {
  try {
    const unit = await SyllabusUnit.create(req.body);
    res.status(201).json(unit);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/syllabus/units/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId || subjectId === 'undefined' || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Valid Subject ID is required' });
    }

    const units = await SyllabusUnit.find({ subject: subjectId }).sort({ unitNumber: 1 }).lean();
    res.json(units);
  } catch (e: any) {
    console.error(`[Syllabus] Error fetching units: ${e.message}`);
    res.status(500).json({ message: e.message });
  }
});


router.post('/syllabus/topics', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });
    
    const topic = await SyllabusTopic.create({ ...req.body, faculty: staff._id });
    res.status(201).json(topic);
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

router.patch('/syllabus/topics/:id/complete', async (req, res) => {
  try {
    const { isCompleted } = req.body;
    const topic = await SyllabusTopic.findByIdAndUpdate(req.params.id, {
      isCompleted,
      completedDate: isCompleted ? new Date() : null
    }, { new: true });
    res.json(topic);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/syllabus/topics/:id', async (req: AuthRequest, res) => {
  try {
    const topic = await SyllabusTopic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json(topic);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/syllabus/topics/:id', async (req: AuthRequest, res) => {
  try {
    const topic = await SyllabusTopic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json({ message: 'Topic deleted' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Unit Resource Management ───────────────────────────────
router.post('/syllabus/units/:id/resources', async (req: AuthRequest, res) => {
  try {
    const { type, title, url } = req.body;
    const unit = await SyllabusUnit.findById(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    unit.resources.push({ type, title, url });
    await unit.save();
    res.json(unit);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/syllabus/units/:id/resources/:resIndex', async (req: AuthRequest, res) => {
  try {
    const unit = await SyllabusUnit.findById(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    const index = parseInt(req.params.resIndex);
    unit.resources.splice(index, 1);
    await unit.save();
    res.json(unit);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/syllabus/units/:id', async (req: AuthRequest, res) => {
  try {
    const unit = await SyllabusUnit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    res.json(unit);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.delete('/syllabus/units/:id', async (req: AuthRequest, res) => {
  try {
    const unit = await SyllabusUnit.findByIdAndDelete(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    
    // Also delete associated topics
    await SyllabusTopic.deleteMany({ unit: req.params.id });
    
    res.json({ message: 'Unit and associated topics deleted' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/syllabus/analysis/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    if (!subjectId || subjectId === 'undefined' || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Valid Subject ID is required for analysis' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const units = await SyllabusUnit.find({ subject: subject._id });
    const unitIds = units.map(u => u._id);
    
    const totalTopics = await SyllabusTopic.countDocuments({ unit: { $in: unitIds } });
    const completedTopics = await SyllabusTopic.countDocuments({ unit: { $in: unitIds }, isCompleted: true });

    console.log(`[Syllabus Analysis] Subject: ${subjectId}, Total: ${totalTopics}, Completed: ${completedTopics}`);


    // Aggregate CO/PO mappings for analysis
    const allTopics = await SyllabusTopic.find({ unit: { $in: unitIds } }).lean();
    const coDistribution: Record<string, number> = {};
    const poDistribution: Record<string, number> = {};

    allTopics.forEach(t => {
      t.coMapping?.forEach(co => { coDistribution[co] = (coDistribution[co] || 0) + 1; });
      t.poMapping?.forEach(po => { poDistribution[po] = (poDistribution[po] || 0) + 1; });
    });

    // Progress % = (completed topics / total topics) * 100
    const actualProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    // Expected % = (current week / total weeks) * 100
    const currentWeek = 10; 
    const totalWeeks = subject.totalWeeks || 16;
    const expectedProgress = (currentWeek / totalWeeks) * 100;

    const gap = expectedProgress - actualProgress;

    res.json({
      actualProgress: Math.round(actualProgress),
      expectedProgress: Math.round(expectedProgress),
      gap: Math.round(gap),
      totalTopics,
      completedTopics,
      isBehind: gap > 5,
      coDistribution,
      poDistribution
    });
  } catch (e: any) {
    console.error(`[Syllabus] Error analyzing subject: ${e.message}`);
    res.status(500).json({ message: e.message });
  }
});


// ── Staff List for Allocation ────────────────────────────
router.get('/teaching-staff', async (req: AuthRequest, res) => {
  try {
    const { department } = req.query;
    const filter: any = { type: 'teaching' };
    
    if (department) {
      filter.department = { $regex: new RegExp(`^${(department as string).trim()}$`, 'i') };
    }

    const staff = await Staff.find(filter).select('name staffId designation department').lean();
    res.json(staff);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/available-subjects', async (req: AuthRequest, res) => {
  try {
    const { department, regulation, semester } = req.query;
    console.log(`[Staff] Fetching subjects:`, { department, regulation, semester });
    
    if (!department) return res.json([]);

    const query: any = { status: 'active' };

    if (department) {
      // Very flexible regex for department to handle typos or abbreviations
      const deptPart = (department as string).trim().split(' ')[0]; // Take first word
      query.department = { $regex: new RegExp(deptPart, 'i') };
    }

    if (regulation) {
      // Match "2023" or "R2023"
      query.regulation = { $regex: new RegExp(regulation as string, 'i') };
    }
    if (semester && Number(semester) !== 0) query.semester = Number(semester);

    const subjects = await Subject.find(query).lean();
    
    console.log(`[Staff] Found ${subjects.length} subjects`);
    res.json(subjects);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Section Subject Allocation (Counselor Only) ──────────
router.get('/my-class/subjects', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    if (!staff.assignedYear || !staff.assignedSection) {
      return res.status(403).json({ message: 'Unauthorized: You are not assigned as a Class Counselor' });
    }

    const dept = await Department.findOne({ name: staff.department });
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    // Numeric year conversion
    const yearNum = parseInt(staff.assignedYear.match(/\d+/) ? staff.assignedYear.match(/\d+/)[0] : '1');

    const allocation = await SectionSubject.findOne({
      dept_id: dept._id,
      year: yearNum,
      section: staff.assignedSection
    }).populate('subjects.subject_id', 'name code type').populate('subjects.faculty_id', 'name staffId designation').lean();

    res.json(allocation || { subjects: [] });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/my-class/subjects/allocate', async (req: AuthRequest, res) => {
  try {
    const { subjectId, facultyId } = req.body;
    const staff = await Staff.findOne({ user: req.user?._id });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

    if (!staff.assignedYear || !staff.assignedSection) {
      return res.status(403).json({ message: 'Unauthorized: You are not a Class Counselor' });
    }

    const dept = await Department.findOne({ name: staff.department });
    const yearNum = parseInt(staff.assignedYear.match(/\d+/) ? staff.assignedYear.match(/\d+/)[0] : '1');

    let allocation = await SectionSubject.findOne({
      dept_id: dept._id,
      year: yearNum,
      section: staff.assignedSection
    });

    if (!allocation) {
      allocation = new SectionSubject({
        dept_id: dept._id,
        year: yearNum,
        section: staff.assignedSection,
        subjects: []
      });
    }

    const subjectIndex = allocation.subjects.findIndex((s: any) => 
      (s.subject_id?._id || s.subject_id).toString() === subjectId
    );

    if (subjectIndex > -1) {
      allocation.subjects[subjectIndex].faculty_id = facultyId;
    } else {
      const subInfo = await Subject.findById(subjectId);
      allocation.subjects.push({
        subject_id: subjectId,
        faculty_id: facultyId,
        credit_hours: subInfo?.credits?.total || 3
      } as any);
    }

    await allocation.save();
    res.json({ message: 'Faculty allocated successfully', allocation });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/departments', protect, async (req, res) => {
  try {
    const depts = await Department.find({}).select('name _id').lean();
    res.json(depts);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Public Staff Profile (Shared for institutional visibility) ──────────────────
router.get('/public/:id', async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .select('name email staffId type department designation qualification experience specialization subjects profileImage onboardingStatus')
      .lean();
    
    if (!staff) return res.status(404).json({ message: 'Faculty record not found' });
    res.json(staff);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export default router;

