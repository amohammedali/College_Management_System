const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: 'e:/My_Projects/college_management_system/backend/.env' });

async function clean() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const staffs = await db.collection('staffs').find().toArray();
  for (const s of staffs) {
    if (s.email) {
      const cleanEmail = s.email.trim().toLowerCase();
      await db.collection('staffs').updateOne({ _id: s._id }, { $set: { email: cleanEmail } });
    }
  }
  console.log('EMAILS TRIMMED AND LOWERCASED');
  process.exit();
}

clean();
