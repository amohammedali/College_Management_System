const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: 'e:/My_Projects/college_management_system/backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const Staff = mongoose.model('Staff', new mongoose.Schema({}, { strict: false }));
  const s = await Staff.find({ email: 'anwar@college.in' }).lean();
  console.log('COUNT:', s.length);
  s.forEach((x, i) => console.log(`RECORD ${i}: ID=${x._id}, USER=${x.user}`));
  process.exit();
}

check();
