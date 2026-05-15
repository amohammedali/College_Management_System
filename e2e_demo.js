const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_management';

async function runDemo() {
  await mongoose.connect(MONGO_URI);
  console.log('--- E2E Simulation Start ---');

  const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { strict: false }));
  const Staff = mongoose.model('Staff', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, name: String, email: String, department: String }, { strict: false }));
  const Subject = mongoose.model('Subject', new mongoose.Schema({ name: String, faculties: Array, status: String, department: String }, { strict: false }));

  // 1. Create a demo user
  const testEmail = `test_faculty_${Date.now()}@college.com`;
  const newUser = await User.create({
    email: testEmail,
    role: 'staff',
    isActive: true
  });
  console.log(`Step 1: Created User with ID: ${newUser._id}`);

  // 2. Create a demo staff record
  const newStaff = await Staff.create({
    user: newUser._id,
    name: 'Demo Faculty',
    email: testEmail,
    department: 'Computer Science and Engineering',
    staffId: `STF-${Date.now()}`
  });
  console.log(`Step 2: Created Staff Profile with ID: ${newStaff._id}`);

  // 3. Assign a subject to this staff
  const testSubject = await Subject.findOne({ department: 'Computer Science and Engineering' });
  if (testSubject) {
    testSubject.faculties = [newStaff._id.toString()]; // Storing as string to test my robust query
    testSubject.status = 'active';
    await testSubject.save();
    console.log(`Step 3: Assigned Subject "${testSubject.name}" to Demo Faculty`);
  } else {
    console.log('Step 3: No CSE subject found to assign.');
  }

  // 4. Simulate Staff Login & Subject Fetch (The actual fix verification)
  console.log('\n--- Simulation: Staff Portal Fetch ---');
  
  // Logic from my updated staffRoutes.ts
  const staffQuery = await Staff.findOne({ user: newUser._id });
  const staffId = staffQuery._id.toString();
  
  const subjects = await Subject.find({
    $or: [
      { faculties: staffQuery._id },
      { faculties: staffId },
      { faculty: staffQuery._id },
      { faculty: staffId }
    ],
    status: 'active'
  }).lean();

  console.log(`Result: Staff Portal found ${subjects.length} subjects.`);
  subjects.forEach(s => console.log(` >> Visible Subject: ${s.name} (${s.code || 'N/A'})`));

  if (subjects.length > 0) {
    console.log('\nSUCCESS: End-to-end assignment and visibility confirmed.');
  } else {
    console.log('\nFAILURE: Subjects still not visible.');
  }

  // Cleanup
  await User.deleteOne({ _id: newUser._id });
  await Staff.deleteOne({ _id: newStaff._id });
  console.log('\n--- Simulation Finished & Cleaned ---');
  
  await mongoose.disconnect();
}

runDemo().catch(console.error);
