import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Attendance from '../models/Attendance.js';
import Mark from '../models/Mark.js';
import Setting from '../models/Setting.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cms';

const resetData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for reset...');

    // Clear all existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Staff.deleteMany({}),
      Attendance.deleteMany({}),
      Mark.deleteMany({}),
      Setting.deleteMany({})
    ]);

    console.log('Cleared all existing data (Users, Students, Staff, Attendance, Marks, Settings).');

    // Create Initial Admin
    await User.create({
      email: 'admin@college.com',
      password: 'password123', // This will be auto-hashed by the pre-save hook
      role: UserRole.ADMIN,
      isActive: true
    });

    console.log('Default Admin created:');
    console.log('Email: admin@college.com');
    console.log('Password: password123');

    // Initialize default settings
    await Setting.insertMany([
      { key: 'university_name', value: 'EduCMS University' },
      { key: 'maintenance_mode', value: false },
      { key: 'allow_registration', value: false }
    ]);

    console.log('System settings initialized.');

    console.log('Reset completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
};

resetData();
