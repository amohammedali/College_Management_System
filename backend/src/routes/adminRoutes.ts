import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { UserRole } from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import Broadcast from '../models/Broadcast.js';
import Leave from '../models/Leave.js';
import Inventory from '../models/Inventory.js';
import Recruitment from '../models/Recruitment.js';
import Timetable from '../models/Timetable.js';
import Appraisal from '../models/Appraisal.js';
import Subject from '../models/Subject.js';
import Department from '../models/Department.js';
import SubjectProposal from '../models/SubjectProposal.js';
import Room from '../models/Room.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect, authorize(UserRole.ADMIN));

// ── Department Governance ──────────────────────────────────
router.get('/departments', async (_req, res) => {
  try {
    const departments = await Department.find().populate('hod', 'name').lean();
    res.json(departments);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/departments', async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    const { status, hod, name, code, totalSemesters, totalSections, regulations, details } = req.body;
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Dept not found' });

    if (status) dept.status = status;
    if (hod) dept.hod = hod;
    if (name) dept.name = name;
    if (code) dept.code = code;
    if (totalSemesters) dept.totalSemesters = totalSemesters;
    if (totalSections) dept.totalSections = totalSections;
    if (regulations) dept.regulations = regulations;

    // Log the change
    dept.auditLog.push({
      action: 'UPDATE',
      user: 'Administrator', // Ideally from req.user
      timestamp: new Date(),
      details: details || 'Manual record update'
    });

    await dept.save();
    res.json(dept);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/departments/audit/:id', async (req, res) => {
  const dept = await Department.findById(req.params.id).select('auditLog').lean();
  res.json(dept?.auditLog || []);
});

// ── System Settings ──────────────────────────────────────────
router.get('/settings', async (_req, res) => {
  const settings = await Setting.find().lean();
  const config = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  res.json(config);
});

router.post('/settings', async (req, res) => {
  const updates = req.body; // { key: value, ... }
  try {
    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true
      }
    }));
    await Setting.bulkWrite(ops);
    res.json({ message: 'Settings updated successfully' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { email, password, studentId, ...studentData } = req.body;
    
    // 1. Pre-validation
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: `Email ${email} is already registered.` });
    }

    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: `Student ID ${studentId} is already assigned.` });
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
        ...studentData,
        studentId,
        user: user._id
      });
      res.status(201).json(student);
    } catch (studentError: any) {
      // Rollback
      await User.findByIdAndDelete(user._id);
      throw studentError;
    }
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

import FeeTransaction from '../models/FeeTransaction.js';
import Analytics from '../models/Analytics.js';
import ScoreSnapshot from '../models/ScoreSnapshot.js';

// ── Stats overview ──────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  try {
    const [students, staff, departments, latestAnalytics, latestAccr] = await Promise.all([
      Student.countDocuments(),
      Staff.countDocuments(),
      Department.find().lean(),
      Analytics.find().sort({ 'metadata.generatedAt': -1 }).limit(10),
      ScoreSnapshot.findOne().sort({ snapshotAt: -1 }).lean()
    ]);

    // Financial Stats
    const feeAgg = await FeeTransaction.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const feeCollection = feeAgg[0]?.total || 0;

    // Attendance Stats (Dynamic)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const presentToday = await Attendance.countDocuments({
      date: { $gte: today },
      status: { $in: ['present', 'late'] }
    });
    const campusPresence = students > 0 ? Math.round((presentToday / students) * 100) : 0;

    // Analytics Mapping
    const dropout = latestAnalytics.find(a => a.type === 'dropout_risk');
    const forecast = latestAnalytics.find(a => a.type === 'enrollment_forecast');

    // Revenue Projections (Dynamic)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueAgg = await FeeTransaction.aggregate([
      { 
        $match: { 
          status: 'captured',
          createdAt: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          real: { $sum: "$amountPaid" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const projections = revenueAgg.length > 0 ? revenueAgg.map(r => ({
      name: monthNames[r._id.month - 1],
      real: r.real,
      proj: Math.round(r.real * 1.08) // Mocked 8% projected growth
    })) : [];

    // Academic Grading Index (Dynamic)
    // To be implemented fully when Marks module is wired
    const gradeData: any[] = [];

    // System Intelligence Logs (Dynamic)
    const [recentStaff, recentStudents, recentProposals, recentDepts] = await Promise.all([
      Staff.find().sort({ createdAt: -1 }).limit(3).lean(),
      Student.find().sort({ createdAt: -1 }).limit(3).lean(),
      SubjectProposal.find({ status: { $ne: 'pending' } }).sort({ updatedAt: -1 }).limit(3).lean(),
      Department.find().sort({ updatedAt: -1 }).limit(3).lean(),
    ]);

    const logs: any[] = [];
    
    recentStaff.forEach((s: any) => logs.push({
      event: `Provisioned faculty: ${s.name}`,
      time: s.createdAt ? new Date(s.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }) : 'Recently',
      timestamp: s.createdAt ? new Date(s.createdAt).getTime() : 0
    }));

    recentStudents.forEach((s: any) => logs.push({
      event: `Enrolled student: ${s.name}`,
      time: s.createdAt ? new Date(s.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }) : 'Recently',
      timestamp: s.createdAt ? new Date(s.createdAt).getTime() : 0
    }));

    recentProposals.forEach((p: any) => logs.push({
      event: `Subject proposal ${p.code} ${p.status}`,
      time: p.updatedAt ? new Date(p.updatedAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }) : 'Recently',
      timestamp: p.updatedAt ? new Date(p.updatedAt).getTime() : 0
    }));

    recentDepts.forEach((d: any) => logs.push({
      event: `Department ${d.name} updated`,
      time: d.updatedAt ? new Date(d.updatedAt).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }) : 'Recently',
      timestamp: d.updatedAt ? new Date(d.updatedAt).getTime() : 0
    }));

    // Sort by timestamp desc and take top 5
    logs.sort((a, b) => b.timestamp - a.timestamp);
    const recentLogs = logs.slice(0, 5);

    res.json({ 
      students, 
      staff, 
      campusPresence, 
      feeCollection,
      dropoutRisk: dropout ? `${Math.round(dropout.score || 0)}%` : '0%',
      enrollmentForecast: forecast ? forecast.summary : 'N/A',
      accrGrade: latestAccr?.predictedGrade || 'N/A',
      accrCgpa: latestAccr?.cgpaForecast || 0,
      projections,
      gradeDistribution: gradeData,
      recentLogs
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Students ───────────────────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const { department, year, section, search, placementEligible } = req.query;
    let query: any = {};

    if (department) query.department = department;
    if (year) query.year = year;
    if (section) query.class = { $regex: new RegExp(`Section ${section}$`, 'i') };
    if (placementEligible) query['placementDetails.placementEligibilityStatus'] = placementEligible === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search as string, 'i') } },
        { studentId: { $regex: new RegExp(search as string, 'i') } },
        { registerNumber: { $regex: new RegExp(search as string, 'i') } }
      ];
    }

    const students = await Student.find(query).populate('user', 'email').lean();
    res.json(students);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/students/placement-ready', async (req, res) => {
  try {
    const students = await Student.find({
      'placementDetails.placementEligibilityStatus': true,
      'performance.currentCGPA': { $gte: 6.0 } // Threshold for placement ready
    }).populate('user', 'email').lean();
    res.json(students);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/students/:id', async (req, res) => {
  const student = await Student.findById(req.params.id).populate('user', 'email').lean();
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
});

router.delete('/students/:id', async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  await User.findByIdAndDelete(student.user);
  res.json({ message: 'Student deleted' });
});

router.put('/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Staff ──────────────────────────────────────────────────
router.get('/staff', async (_req, res) => {
  const staff = await Staff.find().populate('user', 'email').lean();
  res.json(staff);
});

router.delete('/staff/:id', async (req, res) => {
  const staff = await Staff.findByIdAndDelete(req.params.id);
  if (!staff) return res.status(404).json({ message: 'Staff not found' });
  await User.findByIdAndDelete(staff.user);
  res.json({ message: 'Staff deleted' });
});

router.post('/staff', async (req, res) => {
  const { 
    email, password, staffId, name, type, department, designation, 
    phone, salary, counselorForClass, assignedYear, assignedSection,
    joiningDate, employmentType, qualification, experience, 
    gender, dob, specialization, subjects, profileImage, onboardingStatus
  } = req.body;
  
  try {
    // 1. Pre-validation checks
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: `A user with email ${email} already exists.` });
    }

    const existingStaffId = await Staff.findOne({ staffId });
    if (existingStaffId) {
      return res.status(400).json({ message: `Staff ID ${staffId} is already assigned to ${existingStaffId.name}.` });
    }

    if (counselorForClass) {
      const deptTrimmed = department?.trim();
      console.log('DEBUG: Checking counselor conflict:', { counselorForClass, department: deptTrimmed });
      const existingCounselor = await Staff.findOne({ 
        counselorForClass, 
        department: { $regex: new RegExp(`^${deptTrimmed}$`, 'i') } 
      });
      if (existingCounselor) {
        return res.status(400).json({ 
          message: `Counseling conflict: ${counselorForClass} in ${deptTrimmed} is already assigned to ${existingCounselor.name}.` 
        });
      }
    }

    // 2. Create User first
    const user = await User.create({
      email,
      password,
      role: UserRole.STAFF,
    });

    try {
      // 3. Create Staff profile
      const staff = await Staff.create({
        user: user._id,
        staffId,
        name,
        email,
        type,
        department,
        designation,
        phone,
        salary: {
          base: Number(salary?.base) || 0,
          allowances: Number(salary?.allowances) || 0,
          deductions: Number(salary?.deductions) || 0,
          net: (Number(salary?.base) || 0) + (Number(salary?.allowances) || 0) - (Number(salary?.deductions) || 0)
        },
        counselorForClass,
        assignedYear,
        assignedSection,
        joiningDate,
        employmentType,
        qualification,
        experience,
        gender,
        dob,
        specialization,
        subjects,
        profileImage,
        onboardingStatus: onboardingStatus || 'incomplete'
      });

      res.status(201).json(staff);
    } catch (staffError: any) {
      // ROLLBACK: Delete the user if staff creation fails
      await User.findByIdAndDelete(user._id);
      throw staffError;
    }

  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/staff/:id', async (req, res) => {
  const { 
    name, type, department, designation, 
    phone, salary, counselorForClass, assignedYear, assignedSection 
  } = req.body;

  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    staff.name = name || staff.name;
    staff.type = type || staff.type;
    staff.department = department || staff.department;
    staff.designation = designation || staff.designation;
    staff.phone = phone || staff.phone;
    staff.counselorForClass = counselorForClass || staff.counselorForClass;
    staff.assignedYear = req.body.assignedYear || staff.assignedYear;
    staff.assignedSection = assignedSection || staff.assignedSection;
    
    if (salary) {
      staff.salary = {
        base: Number(salary.base) ?? staff.salary.base,
        allowances: Number(salary.allowances) ?? staff.salary.allowances,
        deductions: Number(salary.deductions) ?? staff.salary.deductions,
        net: (Number(salary.base) ?? staff.salary.base) + 
             (Number(salary.allowances) ?? staff.salary.allowances) - 
             (Number(salary.deductions) ?? staff.salary.deductions)
      };
    }

    await staff.save();
    res.json(staff);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Attendance Summary ─────────────────────────────────────
router.get('/attendance/low', async (_req, res) => {
  const students = await Student.find({ 'attendance.percentage': { $lt: 75 } })
    .select('studentId name department attendance')
    .lean();
  res.json(students);
});

// ── Broadcasts ───────────────────────────────────────────────
router.get('/broadcasts', async (_req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 }).lean();
    res.json(broadcasts);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/broadcasts', async (req, res) => {
  try {
    const broadcast = await Broadcast.create(req.body);
    res.status(201).json(broadcast);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Leaves ───────────────────────────────────────────────────
router.get('/leaves', async (_req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 }).lean();
    res.json(leaves);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/leaves/:id', async (req, res) => {
  const { status, comments } = req.body;
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status, comments }, { new: true });
    res.json(leave);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Inventory ───────────────────────────────────────────────
router.get('/inventory', async (_req, res) => {
  try {
    const items = await Inventory.find().lean();
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Recruitment ─────────────────────────────────────────────
router.get('/recruitment', async (_req, res) => {
  try {
    const candidates = await Recruitment.find().sort({ createdAt: -1 }).lean();
    res.json(candidates);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/recruitment', async (req, res) => {
  try {
    const candidate = await Recruitment.create(req.body);
    res.status(201).json(candidate);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Timetable ───────────────────────────────────────────────
router.get('/timetable', async (req, res) => {
  try {
    const { batch, department, semester } = req.query;
    const timetable = await Timetable.findOne({ batch, department, semester }).lean();
    res.json(timetable);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/timetable', async (req, res) => {
  try {
    const { batch, department, section, semester, schedule } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { batch, department, section, semester },
      { schedule },
      { upsert: true, new: true }
    );
    res.json(timetable);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Subjects ────────────────────────────────────────────────
router.get('/subjects/stats', async (req, res) => {
  try {
    const { regulation } = req.query;
    const filter: any = {};
    if (regulation) filter.regulation = regulation;

    const stats = await Subject.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      }
    ]);
    res.json(stats);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const { department, semester, regulation } = req.query;
    const filter: any = {};
    if (department) filter.department = department;
    if (semester && semester !== 'all') filter.semester = Number(semester);
    if (regulation) filter.regulation = regulation;
    
    const subjects = await Subject.find(filter).populate('faculties', 'name staffId department').lean();
    res.json(subjects);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/subjects/assign/:id', async (req, res) => {
  const { facultyIds } = req.body; // Expecting an array of IDs
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    // Workload Validation for each faculty
    if (Array.isArray(facultyIds)) {
      for (const fId of facultyIds) {
        const assignedSubjects = await Subject.find({ faculties: fId, status: 'active' });
        const totalHours = assignedSubjects.reduce((acc, curr) => acc + (curr.credits?.total || 0), 0);
        
        if (totalHours > 24) { // Threshold: 24 credits
           return res.status(400).json({ message: `Workload Warning: One or more selected faculty members already exceed 24 credits.` });
        }
      }
      subject.faculties = facultyIds;
    }

    subject.status = 'active';
    await subject.save();
    
    // Return populated subject
    const updated = await Subject.findById(subject._id).populate('faculties', 'name staffId department').lean();
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/subjects/unassigned', async (_req, res) => {
  try {
    const subjects = await Subject.find({ faculty: { $exists: false }, status: 'active' }).populate('department').lean();
    res.json(subjects);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Subject Proposals & Approvals ──────────────────────────
router.get('/subjects/proposals', async (_req, res) => {
  try {
    const proposals = await SubjectProposal.find({ status: 'pending' }).populate('proposedBy', 'name').lean();
    res.json(proposals);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.put('/subjects/proposals/:id', async (req, res) => {
  const { status, rejectionReason, adminNote } = req.body;
  try {
    const proposal = await SubjectProposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

    proposal.status = status;
    proposal.rejectionReason = rejectionReason;
    proposal.adminNote = adminNote;
    await proposal.save();

    if (status === 'approved') {
       // Atomic Provisioning: Create the real subject from the proposal
       await Subject.create({
          name: proposal.name,
          code: proposal.code,
          department: proposal.department,
          semester: proposal.semester,
          type: proposal.type,
          regulation: proposal.regulation,
          credits: proposal.credits,
          status: 'active'
       });
    }

    res.json(proposal);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Appraisal ───────────────────────────────────────────────
router.get('/appraisals', async (_req, res) => {
  try {
    const appraisals = await Appraisal.find().lean();
    res.json(appraisals);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Rooms ──────────────────────────────────────────────────
router.get('/rooms', async (_req, res) => {
  try {
    const rooms = await Room.find().lean();
    res.json(rooms);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
