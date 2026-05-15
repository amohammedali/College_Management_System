const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: 'e:/My_Projects/college_management_system/backend/.env' });

async function reset() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model('User', new mongoose.Schema({ password: { type: String } }));
  const hashedPassword = await bcrypt.hash('password123', 10);
  await User.updateOne({ email: 'admin@college.com' }, { $set: { password: hashedPassword } });
  console.log('PASSWORD RESET SUCCESSFUL');
  process.exit();
}

reset();
