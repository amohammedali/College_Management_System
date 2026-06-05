import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Student from './models/Student';
import Subject from './models/Subject';
import Staff from './models/Staff';
import ClassAttendance from './models/ClassAttendance';
import Mark from './models/Mark';
import Assignment from './models/Assignment';
import Submission from './models/Submission';
import Grievance from './models/Grievance';
import Placement from './models/Placement';

dotenv.config();

const seedStudent1Data = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db');
    console.log('✅ Connected to MongoDB.');
    let user = await User.findOne({ role: 'student' });
    if (!user) {
      console.log('No student users found in DB. Creating one...');
      user = await User.create({ email: 'student_test@college.com', password: 'student123', role: 'student' });
    }

    let student = await Student.findOne();
    if (!student) {
      console.log('No student profiles found. Please run masterSeed first.');
      process.exit(1);
    }

    // Force link them so it works guaranteed
    await Student.updateOne({ _id: student._id }, { 
      userId: user._id, 
      user: user._id 
    });

    const studentName = student.name || 'Mohammed Ali';
    const studentYear = student.year || 2;
    const studentClass = student.class || student.className || student.section || 'A';
    const studentDepartment = student.department || 'CSE';

    console.log(`🎓 Seed Target: Student ${studentName} linked to Login ${user.email}`);

    const subjects = await Subject.find();
    if (subjects.length === 0) {
      console.log('No subjects found in the entire database!');
      process.exit(1);
    }

    const staff = await Staff.findOne();

    console.log('📊 Seeding Class Attendance...');
    let totalClasses = 0;
    let presentClasses = 0;

    for (const subject of subjects.slice(0, 8)) {
      // 10 sessions per subject
      for (let i = 0; i < 10; i++) {
        const isPresent = Math.random() > 0.2; // 80% present rate
        totalClasses++;
        if (isPresent) presentClasses++;

        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 60)); // past 60 days

        await ClassAttendance.create({
          subject: subject._id,
          faculty: staff?._id,
          date: d,
          hour: Math.floor(Math.random() * 8) + 1,
          topicCovered: `Unit ${Math.floor(Math.random() * 5) + 1} - Detailed Analysis`,
          department: studentDepartment,
          section: studentClass,
          year: studentYear,
          totalStudents: 1,
          presentCount: isPresent ? 1 : 0,
          absentCount: isPresent ? 0 : 1,
          students: [
            { studentId: student._id, status: isPresent ? 'present' : 'absent' }
          ]
        });
      }
    }

    await Student.updateOne({ _id: student._id }, {
      attendance: {
        total: totalClasses,
        present: presentClasses,
        percentage: Math.round((presentClasses / totalClasses) * 100)
      }
    });

    console.log('📝 Seeding Marks...');
    // Seed 10-15 marks
    const grades = ['S', 'A', 'B', 'C', 'D'];
    for (const subject of subjects.slice(0, 10)) {
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      let grade = 'S';
      if (score < 90) grade = 'A';
      if (score < 80) grade = 'B';
      if (score < 70) grade = 'C';

      await Mark.create({
        student: student._id,
        subject: subject._id,
        type: 'Semester Exam',
        academicYear: '2023-24',
        semester: subject.semester || 3,
        score: score,
        totalScore: score,
        maxScore: 100,
        grade: grade,
        markedBy: staff?._id,
        remarks: score > 85 ? 'Excellent performance' : 'Good work',
        dateRecorded: new Date()
      });
    }

    console.log('📨 Seeding Assignments & Submissions...');
    for (const subject of subjects.slice(0, 5)) {
      const assignment = await Assignment.create({
        title: `Comprehensive Project: ${subject.name}`,
        description: 'Complete the assigned project requirement with full documentation and source code.',
        subject: subject._id,
        faculty: staff?._id,
        department: studentDepartment,
        year: studentYear,
        section: studentClass,
        deadline: new Date(Date.now() + 86400000 * 7), // Due in 7 days
        maxMarks: 100
      });

      await Submission.create({
        assignment: assignment._id,
        student: student._id,
        contentUrl: 'https://github.com/project-submission.zip',
        status: 'Submitted',
        submittedAt: new Date(),
        marksObtained: Math.floor(Math.random() * 20) + 80,
        feedback: 'Great documentation. Code structure can be slightly improved.'
      });
    }

    console.log('🎟️ Seeding Grievances...');
    await Grievance.create({
      student: student._id,
      studentName: studentName,
      department: studentDepartment,
      year: studentYear,
      section: studentClass,
      category: 'Infrastructure',
      subject: 'Lab Equipment Issue in CS-Lab 3',
      description: 'The systems in row 4 are frequently rebooting during lab sessions. Please check the power supply.',
      status: 'In Progress',
      priority: 'High'
    });

    await Grievance.create({
      student: student._id,
      studentName: studentName,
      department: studentDepartment,
      year: studentYear,
      section: studentClass,
      category: 'Academic',
      subject: 'Discrepancy in Internal Marks',
      description: 'My unit test 2 marks for DBMS have not been updated in the portal. I have attached my evaluated paper.',
      status: 'Resolved',
      priority: 'Medium',
      resolution: 'Marks updated successfully in the DB.'
    });

    console.log('💼 Seeding Placement Drives...');
    await Placement.create({
      company: 'Google',
      role: 'Software Engineer',
      package: '24 LPA',
      eligibilityCriteria: 'CGPA > 8.5',
      deadline: new Date(Date.now() + 86400000 * 30),
      department: studentDepartment,
      year: studentYear,
      section: studentClass,
      faculty: staff?._id,
      description: 'Hiring for Bangalore office. Focus on Data Structures and System Design.',
      link: 'https://careers.google.com'
    });
    
    await Placement.create({
      company: 'Microsoft',
      role: 'Cloud Solutions Architect Intern',
      package: '18 LPA',
      eligibilityCriteria: 'CGPA > 8.0, Azure Knowledge',
      deadline: new Date(Date.now() + 86400000 * 15),
      department: studentDepartment,
      year: studentYear,
      section: studentClass,
      faculty: staff?._id,
      description: 'Internship role with potential PPO. Deep understanding of distributed systems required.',
      link: 'https://careers.microsoft.com'
    });

    console.log('✅ Student1 Data Seeded Successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedStudent1Data();
