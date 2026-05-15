const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_management';

async function runRepairDemo() {
  await mongoose.connect(MONGO_URI);
  console.log('--- Self-Repair Simulation Start ---');

  const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { strict: false }));
  const Staff = mongoose.model('Staff', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, name: String, email: String }, { strict: false }));
  const Subject = mongoose.model('Subject', new mongoose.Schema({ name: String, faculties: Array, status: String }, { strict: false }));

  // 1. Create a User and an UNLINKED Staff profile (Broken connection)
  const testEmail = `repair_test_${Date.now()}@college.com`;
  const newUser = await User.create({ email: testEmail, role: 'staff' });
  
  const unlinkedStaff = await Staff.create({
    user: new mongoose.Types.ObjectId(), // WRONG ID
    name: 'Repair Demo Faculty',
    email: testEmail,
    staffId: `REP-${Date.now()}`
  });
  console.log(`Step 1: Created User (${newUser._id}) and Orphaned Staff (${unlinkedStaff._id})`);

  // 2. Simulate the REPAIR logic from staffRoutes.ts
  console.log('\n--- Simulation: Self-Repair Triggered ---');
  
  let staff = await Staff.findOne({ user: newUser._id }); // This will fail
  if (!staff && newUser.email) {
    console.log('User ID match failed. Attempting email-based repair...');
    staff = await Staff.findOne({ email: newUser.email });
    if (staff) {
      staff.user = newUser._id; // Repairing
      await staff.save();
      console.log('SUCCESS: Broken link repaired via email lookup.');
    }
  }

  // 3. Verify visibility after repair
  if (staff && staff.user.toString() === newUser._id.toString()) {
    console.log('Result: Link is now healthy. Staff profile is visible to the user.');
  } else {
    console.log('Result: Repair failed.');
  }

  // Cleanup
  await User.deleteOne({ _id: newUser._id });
  await Staff.deleteOne({ _id: unlinkedStaff._id });
  await mongoose.disconnect();
}

runRepairDemo().catch(console.error);
