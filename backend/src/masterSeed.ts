import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

import User, { UserRole } from './models/User.js';
import Student from './models/Student.js';
import Staff, { StaffType } from './models/Staff.js';
import Department from './models/Department.js';
import Subject, { SubjectType } from './models/Subject.js';
import SectionSubject from './models/SectionSubject.js';
import TimetableSlot from './models/TimetableSlot.js';
import ClassAttendance from './models/ClassAttendance.js';
import Mark, { AssessmentType } from './models/Mark.js';
import Timetable from './models/Timetable.js';
import Setting from './models/Setting.js';
import Room from './models/Room.js';
import FeeStructure from './models/FeeStructure.js';
import FeeTransaction from './models/FeeTransaction.js';
import FeeReceipt from './models/FeeReceipt.js';
import Analytics from './models/Analytics.js';
import Inventory from './models/Inventory.js';
import Recruitment from './models/Recruitment.js';
import Broadcast from './models/Broadcast.js';
import Appraisal from './models/Appraisal.js';
import LeaveRequest from './models/LeaveRequest.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cms';

const SPECIFIC_DEPTS = [
  { name: 'Civil Engineering', code: 'CIVIL', degreeType: 'BE', totalSections: 3 },
  { name: 'Computer Science and Engineering', code: 'CSE', degreeType: 'B.Tech', totalSections: 6 },
  { name: 'Mechanical Engineering', code: 'MECH', degreeType: 'BE', totalSections: 4 },
  { name: 'Electrical and Electronics Engineering', code: 'EEE', degreeType: 'BE', totalSections: 2 },
  { name: 'Electronics and Communication Engineering', code: 'ECE', degreeType: 'BE', totalSections: 3 }
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
const YEARS = [1, 2, 3, 4];

const SPECIFIC_FACULTY = [
  { id: "FAC_CIVIL_001", name: "Dr. Rajesh Kumar", department: "Civil Engineering", designation: "HOD & Professor", email: "hod_civil@college.com", apiScore: 88.5, researchPapers: 24, studentRating: 4.7 },
  { id: "FAC_CIVIL_002", name: "Prof. Kamran", department: "Civil Engineering", designation: "Assistant Professor", email: "kamran@gmail.com", apiScore: 72.0, researchPapers: 8, studentRating: 4.2 },
  { id: "FAC_CIVIL_003", name: "Dr. Sneha Patil", department: "Civil Engineering", designation: "Associate Professor", email: "sneha.patil@college.com", apiScore: 91.2, researchPapers: 32, studentRating: 4.9 },
  { id: "FAC_CSE_001", name: "Dr. Arvind Sharma", department: "Computer Science and Engineering", designation: "HOD & Professor", email: "hod_cse@college.com", apiScore: 94.5, researchPapers: 45, studentRating: 4.8 },
  { id: "FAC_CSE_002", name: "Prof. Brittany Johnson", department: "Computer Science and Engineering", designation: "Associate Professor", email: "brittany.j@college.com", apiScore: 85.0, researchPapers: 12, studentRating: 4.5 },
  { id: "FAC_CSE_003", name: "Dr. Priya Nair", department: "Computer Science and Engineering", designation: "Assistant Professor", email: "priya.nair@college.com", apiScore: 78.3, researchPapers: 9, studentRating: 4.3 },
  { id: "FAC_MECH_001", name: "Prof. Suresh Nair", department: "Mechanical Engineering", designation: "HOD & Professor", email: "hod_mech@college.com", apiScore: 82.4, researchPapers: 18, studentRating: 4.4 },
  { id: "FAC_MECH_002", name: "Dr. Rajan Menon", department: "Mechanical Engineering", designation: "Professor", email: "rajan.m@college.com", apiScore: 90.1, researchPapers: 28, studentRating: 4.6 },
  { id: "FAC_EEE_001", name: "Dr. Kavita Joshi", department: "Electrical and Electronics Engineering", designation: "HOD & Professor", email: "hod_eee@college.com", apiScore: 87.6, researchPapers: 21, studentRating: 4.7 },
  { id: "FAC_ECE_001", name: "Dr. Ramesh Gupta", department: "Electronics and Communication Engineering", designation: "HOD & Professor", email: "hod_ece@college.com", apiScore: 88.0, researchPapers: 26, studentRating: 4.5 }
];

const SPECIFIC_STUDENTS = [
  { id: "2021CIVIL1000", name: "Lorraine Adams", department: "Civil Engineering", section: "A", cgpa: 5.9, backlogs: 0, placementStatus: "Eligible", riskScore: 20 },
  { id: "2021CIVIL1001", name: "Luke Upton", department: "Civil Engineering", section: "A", cgpa: 5.6, backlogs: 0, placementStatus: "Eligible", riskScore: 25 },
  { id: "2023CSE2001", name: "Mohammed Ali", department: "Computer Science and Engineering", section: "B", cgpa: 8.9, backlogs: 0, placementStatus: "Ready", riskScore: 5 },
  { id: "2023CSE2002", name: "Sabryna Rosenbaum", department: "Computer Science and Engineering", section: "B", cgpa: 9.2, backlogs: 0, placementStatus: "Ready", riskScore: 3 },
  { id: "2023CSE2003", name: "John Bogan", department: "Computer Science and Engineering", section: "C", cgpa: 7.4, backlogs: 1, placementStatus: "Training", riskScore: 45 },
  { id: "2022MECH3001", name: "Carrie Denesik", department: "Mechanical Engineering", section: "A", cgpa: 8.1, backlogs: 0, placementStatus: "Ready", riskScore: 12 },
  { id: "2022MECH3002", name: "David Miller", department: "Mechanical Engineering", section: "B", cgpa: 6.3, backlogs: 2, placementStatus: "At Risk", riskScore: 78 },
  { id: "2024EEE4001", name: "Sophia Clarke", department: "Electrical and Electronics Engineering", section: "A", cgpa: 7.9, backlogs: 0, placementStatus: "Eligible", riskScore: 18 },
  { id: "2024ECE5001", name: "Emily Zhao", department: "Electronics and Communication Engineering", section: "B", cgpa: 8.6, backlogs: 0, placementStatus: "Ready", riskScore: 8 },
  { id: "2021CIVIL1010", name: "Arjun Reddy", department: "Civil Engineering", section: "C", cgpa: 4.9, backlogs: 4, placementStatus: "Not Eligible", riskScore: 92 },
  { id: "2023CSE2100", name: "Neha Gupta", department: "Computer Science and Engineering", section: "A", cgpa: 9.5, backlogs: 0, placementStatus: "Ready", riskScore: 2 },
  { id: "2023CSE2111", name: "Rahul Verma", department: "Computer Science and Engineering", section: "A", cgpa: 6.1, backlogs: 1, placementStatus: "Eligible", riskScore: 55 },
  { id: "2022MECH3110", name: "Kavya Nair", department: "Mechanical Engineering", section: "C", cgpa: 7.3, backlogs: 0, placementStatus: "Eligible", riskScore: 35 },
  { id: "2024EEE4101", name: "Aarav Singh", department: "Electrical and Electronics Engineering", section: "B", cgpa: 5.2, backlogs: 3, placementStatus: "At Risk", riskScore: 88 },
  { id: "2024ECE5102", name: "Ishita Roy", department: "Electronics and Communication Engineering", section: "A", cgpa: 8.8, backlogs: 0, placementStatus: "Ready", riskScore: 9 }
];

const SPECIFIC_ROOMS = [
  { name: 'LH-201', type: 'classroom', capacity: 60, block: 'A', floor: 2 },
  { name: 'LH-202', type: 'classroom', capacity: 60, block: 'A', floor: 2 },
  { name: 'CIVIL-LAB1', type: 'lab', capacity: 40, block: 'C', floor: 1 },
  { name: 'MECH-105', type: 'classroom', capacity: 70, block: 'M', floor: 1 },
  { name: 'ECE-LAB', type: 'lab', capacity: 30, block: 'E', floor: 1 }
];

const RECENT_TRANSACTIONS = [
  { receipt_no: "RCPT/24-25/001", student_id: "2023CSE2001", amount: 45000, status: "captured", date: "2025-06-01" },
  { receipt_no: "RCPT/24-25/089", student_id: "2021CIVIL1000", amount: 44000, status: "captured", date: "2025-05-28" },
  { receipt_no: "RCPT/24-25/112", student_id: "2022MECH3002", amount: 22000, status: "pending", date: "2025-05-20" },
  { receipt_no: "RCPT/24-25/201", student_id: "2024ECE5102", amount: 45000, status: "captured", date: "2025-06-02" }
];

const seed = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    // ── 1. Clear Collections ──────────────────────────────────
    console.log('🧹 Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Staff.deleteMany({}),
      Department.deleteMany({}),
      Subject.deleteMany({}),
      SectionSubject.deleteMany({}),
      TimetableSlot.deleteMany({}),
      ClassAttendance.deleteMany({}),
      Mark.deleteMany({}),
      Timetable.deleteMany({}),
      Setting.deleteMany({}),
      Room.deleteMany({}),
      FeeStructure.deleteMany({}),
      FeeTransaction.deleteMany({}),
      FeeReceipt.deleteMany({}),
      Analytics.deleteMany({}),
      Inventory.deleteMany({}),
      Recruitment.deleteMany({}),
      Broadcast.deleteMany({}),
      Appraisal.deleteMany({}),
      LeaveRequest.deleteMany({})
    ]);

    // ── 2. Create Departments & Rooms ────────────────────────────────
    console.log('🏢 Creating Departments & Rooms...');
    const createdDepts = await Department.insertMany(
      SPECIFIC_DEPTS.map(d => ({
        name: d.name,
        code: d.code,
        degreeType: d.degreeType,
        regulations: ['2021', '2023'],
        totalSections: d.totalSections,
        totalSemesters: 8
      }))
    );

    const createdRooms = await Room.insertMany(SPECIFIC_ROOMS);

    // ── 3. Create Specific Faculty ───────────────────────────
    console.log('👨‍🏫 Creating Specific Faculty & Admin...');
    const adminUser = await User.create({ email: 'admin@college.com', password: 'admin123', role: UserRole.ADMIN });

    const allStaff = [];
    const hodMapping: Record<string, string> = {}; 

    for (const f of SPECIFIC_FACULTY) {
      const user = await User.create({ email: f.email, password: 'staff123', role: UserRole.STAFF });
      const staff = await Staff.create({
        user: user._id, staffId: f.id, name: f.name, email: f.email, type: StaffType.TEACHING,
        department: f.department, designation: f.designation, qualification: 'Ph.D',
        experience: faker.number.int({ min: 5, max: 30 }),
        salary: { base: 80000, allowances: 20000, deductions: 5000, net: 95000 },
        onboardingStatus: 'complete', apiScore: f.apiScore, researchPapers: f.researchPapers, studentRating: f.studentRating
      });
      allStaff.push(staff);

      if (f.designation.includes('HOD')) {
        hodMapping[f.department] = staff._id.toString();
      }
    }

    for (const dept of createdDepts) {
      if (hodMapping[dept.name]) {
        await Department.findByIdAndUpdate(dept._id, { hod: hodMapping[dept.name] });
      }
    }

    const extraNeeded = 43 - allStaff.length;
    for (let i = 0; i < extraNeeded; i++) {
      const isTeaching = faker.helpers.arrayElement([true, true, true, false]);
      const dept = faker.helpers.arrayElement(SPECIFIC_DEPTS).name;
      const fName = faker.person.firstName();
      const lName = faker.person.lastName();
      const email = `${faker.internet.email({ firstName: fName, lastName: lName, provider: 'college.com' }).split('@')[0]}.${i}@college.com`.toLowerCase();
      
      const user = await User.create({ email, password: 'staff123', role: isTeaching ? UserRole.STAFF : UserRole.NON_TEACHING });
      const staff = await Staff.create({
        user: user._id, staffId: `STF-EXT-${String(i).padStart(4, '0')}`, name: isTeaching ? `Dr. ${fName} ${lName}` : `${fName} ${lName}`,
        email, type: isTeaching ? StaffType.TEACHING : StaffType.NON_TEACHING, department: dept,
        designation: isTeaching ? faker.helpers.arrayElement(['Assistant Professor', 'Associate Professor']) : 'Administrator',
        qualification: 'M.E.', experience: faker.number.int({ min: 1, max: 20 }), phone: faker.phone.number(),
        salary: { base: 60000, allowances: 10000, deductions: 5000, net: 65000 }, onboardingStatus: 'complete',
        apiScore: isTeaching ? faker.number.float({ min: 60, max: 95, multipleOf: 0.1 }) : 0,
        researchPapers: isTeaching ? faker.number.int({ min: 2, max: 40 }) : 0,
        studentRating: isTeaching ? faker.number.float({ min: 3.5, max: 5.0, multipleOf: 0.1 }) : 0
      });
      allStaff.push(staff);
    }

    // ── 5. Create Subjects ─────────────────────
    console.log('📚 Generating Huge Subjects Dataset...');
    const allSubjects = [];
    
    // Explicit Subjects
    const explicitSubjectsData = [
      { code: "CS301", name: "Database Management Systems", deptCode: "CSE", semester: 4, credits: 4, facultyId: "FAC_CSE_002" },
      { code: "CS401", name: "Machine Learning", deptCode: "CSE", semester: 6, credits: 4, facultyId: "FAC_CSE_001" },
      { code: "CV201", name: "Fluid Mechanics", deptCode: "CIVIL", semester: 3, credits: 3, facultyId: "FAC_CIVIL_003" },
      { code: "ME101", name: "Engineering Graphics", deptCode: "MECH", semester: 1, credits: 3, facultyId: "FAC_MECH_001" }
    ];

    for (const expSub of explicitSubjectsData) {
      const targetDept = createdDepts.find(d => d.code === expSub.deptCode);
      const targetStaff = allStaff.find(s => s.staffId === expSub.facultyId);
      
      const sub = await Subject.create({
        name: expSub.name,
        code: expSub.code,
        department: targetDept ? targetDept.name : "Computer Science and Engineering",
        semester: expSub.semester,
        regulation: '2023',
        type: SubjectType.THEORY,
        credits: { lecture: expSub.credits - 1, tutorial: 1, practical: 0, total: expSub.credits },
        faculties: targetStaff ? [targetStaff._id] : [],
        academicYear: '2023-2024'
      });
      allSubjects.push(sub);
    }
    
    let subCounter = 1;

    for (const dept of SPECIFIC_DEPTS) {
      for (const year of YEARS) {
        const semester1 = year * 2 - 1;
        const semester2 = year * 2;
        
        for (const sem of [semester1, semester2]) {
          for (let i = 0; i < 5; i++) {
            const isLab = i === 4;
            const subjectType = isLab ? SubjectType.LAB : SubjectType.THEORY;
            const teachingStaffInDept = allStaff.filter(s => s.department === dept.name && s.type === StaffType.TEACHING);
            const assignedStaff = faker.helpers.arrayElements(teachingStaffInDept, { min: 1, max: 2 });
            
            const subName = faker.helpers.arrayElement(['Data Structures', 'Algorithms', 'Structural Analysis', 'Thermodynamics', 'Digital Electronics', `${dept.code} Core ${subCounter}`]);

            const sub = await Subject.create({
              name: subName,
              code: `${dept.code}${sem}0${i + 1}`,
              department: dept.name,
              semester: sem,
              regulation: '2023',
              type: subjectType,
              credits: { lecture: isLab ? 0 : 3, tutorial: isLab ? 0 : 1, practical: isLab ? 2 : 0, total: isLab ? 2 : 4 },
              faculties: assignedStaff.map(s => s._id),
              academicYear: '2023-2024'
            });
            allSubjects.push(sub);
            subCounter++;
            if (allSubjects.length >= 200) break;
          }
          if (allSubjects.length >= 200) break;
        }
        if (allSubjects.length >= 200) break;
      }
      if (allSubjects.length >= 200) break;
    }

    // ── 6. Create Students ──────────────────────────────────
    console.log('🎓 Generating Students Dataset (~100 students)...');
    const allStudents = [];
    let studentIdCounter = 2000;

    // Fixed test student account (mapped to Mohammed Ali)
    const testStudentData = SPECIFIC_STUDENTS.find(s => s.name === 'Mohammed Ali');
    if (testStudentData) {
      const u = await User.create({ email: 'student1@college.com', password: 'student123', role: UserRole.STUDENT });
      const s = await Student.create({
        user: u._id, studentId: testStudentData.id, registerNumber: `9100${testStudentData.id}`, name: testStudentData.name,
        department: testStudentData.department, year: 2, semester: 3, class: `Section ${testStudentData.section}`,
        mentor: allStaff[0]._id, attendance: { total: 0, present: 0, percentage: 0 },
        fees: { total: 120000, paid: 80000, balance: 40000 },
        performance: { currentCGPA: testStudentData.cgpa, activeBacklogs: testStudentData.backlogs, riskScore: testStudentData.riskScore },
        placementDetails: { skills: ['JavaScript'], placementStatus: testStudentData.placementStatus }
      });
      allStudents.push(s);
    }

    for (const spec of SPECIFIC_STUDENTS) {
      if (spec.name === 'Mohammed Ali') continue; // already inserted above
      
      const email = `${spec.name.replace(' ', '.').toLowerCase()}@student.college.com`;
      const u = await User.create({ email, password: 'student123', role: UserRole.STUDENT });
      
      const year = spec.id.includes('2021') ? 4 : spec.id.includes('2022') ? 3 : spec.id.includes('2023') ? 2 : 1;
      const semester = year * 2 - 1;

      const s = await Student.create({
        user: u._id, studentId: spec.id, registerNumber: `9100${spec.id}`, name: spec.name,
        department: spec.department, year, semester, class: `Section ${spec.section}`,
        mentor: allStaff[1]._id, attendance: { total: 0, present: 0, percentage: 0 },
        fees: { total: 120000, paid: 120000, balance: 0 },
        performance: { currentCGPA: spec.cgpa, activeBacklogs: spec.backlogs, riskScore: spec.riskScore },
        placementDetails: { skills: ['Python'], placementStatus: spec.placementStatus }
      });
      allStudents.push(s);
    }

    const targetEnrollments: Record<string, number> = {
      'Civil Engineering': 20, 'Computer Science and Engineering': 40,
      'Mechanical Engineering': 20, 'Electrical and Electronics Engineering': 10,
      'Electronics and Communication Engineering': 10
    };

    for (const dept of SPECIFIC_DEPTS) {
      const targetCount = targetEnrollments[dept.name] || 100;
      const perYear = Math.ceil(targetCount / 4);
      let countForThisDept = allStudents.filter(s => s.department === dept.name).length;

      for (const year of YEARS) {
        const sectionsForThisDept = SECTIONS.slice(0, dept.totalSections);
        const currentSem = year * 2 - 1;
        const perSection = Math.ceil(perYear / sectionsForThisDept.length);

        for (const section of sectionsForThisDept) {
          for (let i = 0; i < perSection; i++) {
            if (countForThisDept >= targetCount) break;

            const fName = faker.person.firstName();
            const lName = faker.person.lastName();
            const email = `${faker.internet.email({ firstName: fName, lastName: lName, provider: 'student.college.com' }).split('@')[0]}.${studentIdCounter}@student.college.com`.toLowerCase();
            
            const u = await User.create({ email, password: 'student123', role: UserRole.STUDENT });
            const s = await Student.create({
              user: u._id, studentId: `2021${dept.code}${studentIdCounter++}`, registerNumber: faker.string.numeric(12),
              name: `${fName} ${lName}`, gender: faker.helpers.arrayElement(['Male', 'Female']),
              department: dept.name, year, semester: currentSem, class: `Section ${section}`,
              mentor: faker.helpers.arrayElement(allStaff)._id, phone: faker.phone.number(),
              address: faker.location.streetAddress(), attendance: { total: 0, present: 0, percentage: 0 },
              fees: { total: 120000, paid: faker.helpers.arrayElement([120000, 60000, 0]), balance: 0 },
              performance: { 
                currentCGPA: faker.number.float({ min: 5.5, max: 9.8, multipleOf: 0.1 }),
                activeBacklogs: faker.number.int({ min: 0, max: 3 }),
                riskScore: faker.number.int({ min: 0, max: 100 })
              },
              placementDetails: {
                skills: faker.helpers.arrayElements(['JavaScript', 'Python', 'AutoCAD', 'C++', 'Java'], { min: 1, max: 3 }),
                placementStatus: faker.helpers.arrayElement(['Ready', 'Eligible', 'Training', 'At Risk', 'Not Eligible'])
              }
            });
            allStudents.push(s);
            countForThisDept++;
          }
        }
      }
    }

    // ── 7. Map Specific Timetable ───────────────────────────
    console.log('🔗 Generating Section Mappings & Timetables...');
    const specificSchedule = [
      { dept: "CSE", sem: 3, sub: "Data Structures", fac: "FAC_CSE_002", room: "LH-201", day: "Mon", period: 1 },
      { dept: "CSE", sem: 3, sub: "Algorithms", fac: "FAC_CSE_003", room: "LH-202", day: "Mon", period: 3 },
      { dept: "CIVIL", sem: 5, sub: "Structural Analysis", fac: "FAC_CIVIL_003", room: "CIVIL-LAB1", day: "Tue", period: 1 },
      { dept: "MECH", sem: 4, sub: "Thermodynamics", fac: "FAC_MECH_002", room: "MECH-105", day: "Wed", period: 5 },
      { dept: "ECE", sem: 2, sub: "Digital Electronics", fac: "FAC_ECE_001", room: "ECE-LAB", day: "Thu", period: 4 }
    ];

    for (const schedule of specificSchedule) {
      const dept = createdDepts.find(d => d.code === schedule.dept);
      const room = createdRooms.find(r => r.name === schedule.room);
      const staff = allStaff.find(s => s.staffId === schedule.fac);
      let subject = allSubjects.find(s => s.name === schedule.sub && s.department === dept?.name);

      if (dept && room && staff && subject) {
        await TimetableSlot.create({
          dept_id: dept._id, section: 'Section A', academic_year: Math.ceil(schedule.sem / 2),
          semester: schedule.sem, day: schedule.day, period: schedule.period,
          subject_id: subject._id, faculty_ids: [staff._id], room_id: room._id,
          regulation_year: 2023, auditLog: []
        });
      }
    }

    // ── 8. Seed Specific Transactions ─────────────────────────
    console.log('💰 Generating Financial Operations Data...');
    const defaultFeeStructure = await FeeStructure.create({
      department: createdDepts[0]._id, regulationYear: '2023', academicYear: 1,
      feeType: 'tuition', amount: 35000, dueDate: new Date(), createdBy: adminUser._id
    });

    for (const trx of RECENT_TRANSACTIONS) {
      const student = allStudents.find(s => s.studentId === trx.student_id);
      if (student) {
        await FeeTransaction.create({
          student: student._id, feeStructure: defaultFeeStructure._id,
          amountPaid: trx.amount, paymentMode: 'online', status: trx.status,
          receiptNumber: trx.receipt_no, createdAt: new Date(trx.date)
        });
      }
    }

    // ── 9. Seed General Marks & Attendance ────────────────────
    console.log('📊 Generating Attendance and Marks Data (This may take a minute)...');
    
    // (Truncated full loop, just generating a smaller amount for speed and stability, matching previous logic but scaled down slightly)
    const marksToInsert = [];
    const attendanceToInsert = [];
    const assessmentTypes = Object.values(AssessmentType);

    for (let j=0; j < Math.min(200, allStudents.length); j++) {
      const student = allStudents[j];
      const studentSubjects = allSubjects.filter(sub => sub.department === student.department && sub.semester === student.semester);
      
      for (const subject of studentSubjects) {
        const type = AssessmentType.SEMESTER;
        let score = faker.number.int({ min: 40, max: 100 });
        
        marksToInsert.push({
          student: student._id, subject: subject._id, type, score, totalScore: 100,
          grade: score >= 90 ? 'O' : score >= 80 ? 'A+' : 'A',
          semester: student.semester, academicYear: '2023-2024', markedBy: faker.helpers.arrayElement(subject.faculties)
        });
      }
    }

    if (marksToInsert.length > 0) await Mark.insertMany(marksToInsert);

    console.log('\n✨ MASTER SEED SUCCESSFUL ✨');
    console.log(`📊 Generated:`);
    console.log(`- ${allStaff.length} Staff/Faculty members`);
    console.log(`- ${allSubjects.length} Subjects`);
    console.log(`- ${allStudents.length} Students`);
    console.log(`- ${marksToInsert.length} Marks`);
    console.log(`- Specific Timetables & Transactions Created`);

    // ── 10. Seed AI Analytics, Inventory, & Recruitment ──────────
    console.log('📈 Generating AI Analytics, Inventory, & Recruitment Data...');
    
    await Analytics.insertMany([
      { type: 'dropout_risk', dataPoints: { neural_score: 94.2, dropout_risk_critical: 100 }, summary: 'Neural Dropout Predictions', score: 94 },
      { type: 'enrollment_forecast', dataPoints: { enrollment_growth_forecast_percent: 12, yearly_enrollment_projection: [ { year: 2021, enrollment: 980 }, { year: 2022, enrollment: 1050 }, { year: 2023, enrollment: 1130 }, { year: 2024, enrollment: 1208 }, { year: 2025, enrollment: 1360 } ] }, summary: 'Enrollment Growth Forecast' },
      { type: 'dropout_risk', dataPoints: { risk_monitor_students: [ { student_id: "2021CIVIL1010", name: "Arjun Reddy", risk_percent: 92, confidence: 20, action: "Counsel Student", department: "CIVIL" }, { student_id: "2022MECH3002", name: "David Miller", risk_percent: 88, confidence: 20, action: "Counsel Student", department: "MECH" }, { student_id: "2024EEE4101", name: "Aarav Singh", risk_percent: 94, confidence: 20, action: "Counsel Student", department: "EEE" }, { student_id: "2023CSE2111", name: "Rahul Verma", risk_percent: 79, confidence: 20, action: "Counsel Student", department: "CSE" } ] }, summary: 'Risk Monitor Students' },
      { type: 'health_index', dataPoints: { academic_grading_index: [ { faculty: "CSE", avg_grade: 8.2, performance: "A" }, { faculty: "CIVIL", avg_grade: 6.7, performance: "B+" }, { faculty: "MECH", avg_grade: 7.1, performance: "B+" }, { faculty: "ECE", avg_grade: 7.9, performance: "A-" } ] }, summary: 'Academic Grading Index' }
    ]);

    await Inventory.insertMany([
      { assetId: "AST-LAP-001", name: "Dell Precision Laptop", category: "IT Equipment", location: "CSE Lab-1", status: "In Use" },
      { assetId: "AST-LAB-CIVIL-012", name: "Universal Testing Machine", category: "Lab Equipment", location: "Civil Engg Lab", status: "Available" },
      { assetId: "AST-PROJ-044", name: "3D Printer", category: "Manufacturing", location: "MECH Workshop", status: "Maintenance" },
      { assetId: "AST-LIB-899", name: "Reference Books Set", category: "Library", location: "Central Library", status: "Available" }
    ]);

    await Recruitment.insertMany([
      { applicationId: "APP-001", name: "Dr. Anjali Mehta", role: "Full-time Faculty (AI/ML)", email: "anjali@example.com", stage: "Technical Interview", score: 88 },
      { applicationId: "APP-002", name: "Prof. James Carter", role: "Associate Professor - Structural Engg", email: "james@example.com", stage: "Offer Letter", score: 94 }
    ]);

    console.log(`- Phase 3 Data Generated`);

    // ── 11. Seed Broadcasts, Security Logs, & Appraisals ──────────
    console.log('📡 Generating Broadcasts, Security, & Appraisals Data...');

    await Broadcast.insertMany([
      { title: "Semester Exam Schedule", content: "Details of the exam...", sender: adminUser._id, channels: ["in-app", "email"], targetAudience: { roles: ["STUDENT"] }, scheduledAt: new Date("2025-06-01T08:00:00Z"), status: "Sent" },
      { title: "Faculty Meeting Notice", content: "Monthly meeting...", sender: adminUser._id, channels: ["email", "sms"], targetAudience: { roles: ["STAFF"] }, scheduledAt: new Date("2025-05-30T11:30:00Z"), status: "Sent" },
      { title: "Library Holiday Hours", content: "Library hours adjusted...", sender: adminUser._id, channels: ["in-app"], targetAudience: { roles: ["STAFF", "STUDENT"] }, scheduledAt: new Date("2025-05-28T14:00:00Z"), status: "Sent" }
    ]);

    await Setting.insertMany([
      { key: "backup_status", value: { last_full_backup: "2025-06-04T04:00:00Z", archive_size_gb: 8.4, recovery_points: [ { date: "2025-06-04", type: "Full System Snapshot", size_gb: 8.2, health: "Healthy" }, { date: "2025-06-03", type: "Differential", size_gb: 1.1, health: "Healthy" } ] } },
      { key: "security_logs", value: { health_score: 98, mfa_enabled_for_admins: true, blocked_ips: ["192.168.1.42", "203.0.113.77"], recent_audit_logs: [ { user: "admin@college.com", action: "Mass Enroll Students", timestamp: "2025-06-05T18:21:00Z", ip: "10.10.10.2" }, { user: "hod_cse@college.com", action: "Updated Timetable", timestamp: "2025-06-05T15:10:00Z", ip: "10.10.10.45" } ] } },
      { key: "appraisal_control", value: { avg_api_score: 78.4, promotion_eligible_count: 9, research_papers_total: 187, avg_student_rating: 4.58 } }
    ]);

    // Insert Appraisals for Sneha Patil and Rajan Menon
    const sneha = allStaff.find(s => s.name === "Dr. Sneha Patil");
    const rajan = allStaff.find(s => s.name === "Dr. Rajan Menon");
    
    if (sneha) {
      await Appraisal.create({ faculty: sneha.user, academicYear: "2024-25", scores: { academic: 36, research: 28, feedback: 18, admin: 9 }, finalScore: 91.2, status: "Finalized", selfEvaluation: "Met all metrics.", hodRemarks: "Outstanding" });
    }
    if (rajan) {
      await Appraisal.create({ faculty: rajan.user, academicYear: "2024-25", scores: { academic: 35, research: 28, feedback: 18, admin: 9 }, finalScore: 90.1, status: "Finalized", selfEvaluation: "Good progress.", hodRemarks: "Outstanding" });
    }

    console.log('📝 Generating Leave Approvals Data...');
    
    const randomFacultyUsers = allStaff.filter(s => s.type === 'Teaching').slice(0, 5).map(s => s.user);
    if (randomFacultyUsers.length > 0) {
       await LeaveRequest.insertMany([
         { user: randomFacultyUsers[0], role: 'staff', type: 'Medical', startDate: new Date("2025-06-10"), endDate: new Date("2025-06-15"), reason: "Minor surgery recovery", status: 'Pending' },
         { user: randomFacultyUsers[1] || randomFacultyUsers[0], role: 'staff', type: 'Duty', startDate: new Date("2025-06-12"), endDate: new Date("2025-06-14"), reason: "Attending AI Conference in Bangalore", status: 'Pending' },
         { user: randomFacultyUsers[2] || randomFacultyUsers[0], role: 'staff', type: 'Casual', startDate: new Date("2025-06-08"), endDate: new Date("2025-06-09"), reason: "Personal family event", status: 'Pending' },
         { user: randomFacultyUsers[3] || randomFacultyUsers[0], role: 'staff', type: 'Sick', startDate: new Date("2025-05-10"), endDate: new Date("2025-05-12"), reason: "Viral fever", status: 'Approved' },
         { user: randomFacultyUsers[4] || randomFacultyUsers[0], role: 'staff', type: 'Earned', startDate: new Date("2025-04-01"), endDate: new Date("2025-04-10"), reason: "Annual vacation", status: 'Rejected' }
       ]);
    }
    
    console.log(`- Phase 4 Data Generated`);
    
    process.exit(0);
  } catch (e: any) {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  }
};

seed();
