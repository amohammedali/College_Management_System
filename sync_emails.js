const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_management';

async function syncEmails() {
  await mongoose.connect(MONGO_URI);
  console.log('--- Syncing Staff Emails ---');

  const User = mongoose.model('User', new mongoose.Schema({ email: String }, { strict: false }));
  const Staff = mongoose.model('Staff', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, email: String }, { strict: false }));

  const allStaff = await Staff.find();
  console.log(`Found ${allStaff.length} staff records`);

  for (const staff of allStaff) {
    if (!staff.email && staff.user) {
      const user = await User.findById(staff.user);
      if (user && user.email) {
        staff.email = user.email;
        await staff.save();
        console.log(`Synced email for: ${staff.name || staff._id} -> ${user.email}`);
      }
    }
  }

  console.log('--- Sync Finished ---');
  await mongoose.disconnect();
}

syncEmails().catch(console.error);
