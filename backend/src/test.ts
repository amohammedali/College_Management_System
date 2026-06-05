import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Student from './models/Student';

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db');
  const s = await Student.findOne({ name: 'Mohammed Ali' });
  console.log("Student:", s);

  const u = await User.findOne({ email: 'student1@college.com' });
  console.log("User:", u);
  process.exit(0);
};

run();
