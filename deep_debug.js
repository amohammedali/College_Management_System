const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_management';

async function debug() {
  await mongoose.connect(MONGO_URI);
  console.log('--- Database Inspection ---');
  
  // 1. Get all staff to see their IDs
  const Staff = mongoose.model('Staff', new mongoose.Schema({}, { strict: false }));
  const allStaff = await Staff.find().lean();
  console.log(`Total Staff in DB: ${allStaff.length}`);
  allStaff.forEach(s => console.log(`Staff: ${s.name} | ID: ${s._id} | UserID: ${s.user}`));

  // 2. Get all subjects that have ANY faculties
  const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
  const assignedSubjects = await Subject.find({ 
    $or: [
      { faculties: { $exists: true, $not: { $size: 0 } } },
      { faculty: { $exists: true } }
    ]
  }).lean();
  
  console.log(`\n--- Assigned Subjects (${assignedSubjects.length}) ---`);
  assignedSubjects.forEach(sub => {
    console.log(`Subject: ${sub.name} (${sub.code})`);
    console.log(`  - Status: ${sub.status}`);
    console.log(`  - faculties (new): ${JSON.stringify(sub.faculties)}`);
    console.log(`  - faculty (old): ${sub.faculty}`);
    console.log('---');
  });

  await mongoose.disconnect();
}

debug().catch(console.error);
