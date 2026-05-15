import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';
import Student from '../models/Student';
import Staff, { StaffType } from '../models/Staff';
import Attendance from '../models/Attendance';
import Mark from '../models/Mark';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cms';

const subjects = ['Mathematics', 'Physics', 'Computer Science', 'English', 'History'];
const departments = ['Engineering', 'Science', 'Arts'];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Staff.deleteMany({});
    await Attendance.deleteMany({});
    await Mark.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Admin
    const adminUser = await User.create({
      email: 'admin@college.com',
      password: 'password123',
      role: UserRole.ADMIN
    });
    console.log('Admin created.');

    // 2. Create Staff (5 Teaching, 2 Non-Teaching)
    const staffMembers: any[] = [];
    for (let i = 1; i <= 7; i++) {
      const isTeaching = i <= 5;
      const staffUser = await User.create({
        email: `staff${i}@college.com`,
        password: 'password123',
        role: isTeaching ? UserRole.STAFF : UserRole.NON_TEACHING
      });

      const staff = await Staff.create({
        user: staffUser._id,
        staffId: `STF00${i}`,
        name: isTeaching ? `Professor ${i}` : `Staff ${i}`,
        type: isTeaching ? StaffType.TEACHING : StaffType.NON_TEACHING,
        department: departments[i % 3],
        designation: isTeaching ? 'Lecturer' : 'Administrator',
        subjects: isTeaching ? [subjects[i % 5]] : [],
        salary: { base: 50000 + (i * 1000), allowances: 5000, deductions: 2000, net: 53000 + (i * 1000) }
      });
      staffMembers.push(staff);
    }
    console.log('Staff created.');

    // 3. Create 20 Students
    const students: any[] = [];
    for (let i = 1; i <= 20; i++) {
      const studentUser = await User.create({
        email: `student${i}@college.com`,
        password: 'password123',
        role: UserRole.STUDENT
      });

      const student = await Student.create({
        user: studentUser._id,
        studentId: `STU00${i}`,
        name: `Student Name ${i}`,
        department: departments[i % 3],
        class: i <= 10 ? 'A' : 'B',
        attendance: { present: 0, total: 30, percentage: 0 },
        fees: { total: 50000, paid: 20000 + (i * 1000), balance: 30000 - (i * 1000) }
      });
      students.push(student);

      // Create some Mark records for each student
      for (const subject of subjects) {
        await Mark.create({
          student: student._id,
          subject,
          type: 'exam',
          score: Math.floor(Math.random() * 40) + 60,
          totalScore: 100,
          grade: 'A',
          semester: '1',
          academicYear: '2024-2025'
        });
      }
    }
    console.log('Students and Marks created.');

    // 4. Create Attendance records for last 30 days
    const today = new Date();
    for (const student of students) {
      let presentCount = 0;
      for (let d = 0; d < 30; d++) {
        const date = new Date();
        date.setDate(today.getDate() - d);
        
        const isPresent = Math.random() > 0.15; // 85% attendance
        if (isPresent) presentCount++;

        await Attendance.create({
          student: student._id,
          date,
          status: isPresent ? 'present' : 'absent',
          markedBy: staffMembers[0]._id
        });
      }
      student.attendance.present = presentCount;
      student.attendance.percentage = (presentCount / 30) * 100;
      await student.save();
    }
    console.log('Attendance records created.');

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
