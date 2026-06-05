import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Staff from '../src/models/Staff.js';
import bcrypt from 'bcrypt';

await mongoose.connect('mongodb://127.0.0.1:27017/cms');
const users = await User.find().lean();
const staff = await Staff.find().lean();

const kamran = await User.findOne({ email: 'kamran@gmail.com' }).lean();
console.log('Kamran User:', kamran);
if (kamran) {
  const isMatch = await bcrypt.compare('staff123', kamran.password);
  console.log('Password staff123 matches:', isMatch);
}
process.exit(0);
