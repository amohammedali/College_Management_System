const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: 'e:/My_Projects/college_management_system/backend/.env' });

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'anwar@college.in' });
  const staff = await db.collection('staffs').findOne({ email: 'anwar@college.in' });
  if (user && staff) {
    await db.collection('staffs').updateOne(
      { _id: staff._id }, 
      { $set: { user: user._id, email: user.email.toLowerCase().trim() } }
    );
    console.log('ANWAR REPAIRED MANUALLY');
  } else {
    console.log('COULD NOT FIND BOTH RECORDS');
    console.log('USER:', !!user);
    console.log('STAFF:', !!staff);
  }
  process.exit();
}

fix();
