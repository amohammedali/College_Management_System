const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: 'e:/My_Projects/college_management_system/backend/.env' });

// This script performs the exact same lookup as the backend /profile route
// to diagnose why faculty logins fail

async function diagnose() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const staffs = await db.collection('staffs').find().toArray();
  const users = await db.collection('users').find({ role: 'staff' }).toArray();

  console.log('\n======= STAFF RECORDS =======');
  for (const s of staffs) {
    const linkedUser = users.find(u => u._id.toString() === (s.user || '').toString());
    const emailMatchUser = users.find(u => u.email.toLowerCase() === (s.email || '').toLowerCase());
    
    console.log(`\nSTAFF: ${s.name}`);
    console.log(`  Staff Email:  "${s.email}"`);
    console.log(`  Staff user:   ${s.user}`);
    console.log(`  User by ID:   ${linkedUser ? linkedUser.email : 'NOT FOUND'}`);
    console.log(`  User by Email:${emailMatchUser ? emailMatchUser.email : 'NOT FOUND'}`);
    console.log(`  STATUS: ${!linkedUser && !emailMatchUser ? '❌ BROKEN - no user match' : linkedUser ? '✅ ID Link OK' : '⚠️ Email match only (needs repair)'}`);
  }

  console.log('\n======= SUBJECTS WITH FACULTIES =======');
  const subjects = await db.collection('subjects').find({ $or: [{ 'faculties.0': { $exists: true } }, { faculty: { $exists: true } }] }).toArray();
  for (const sub of subjects) {
    console.log(`\nSUBJECT: ${sub.name}`);
    if (sub.faculties) console.log(`  faculties:`, sub.faculties.map(f => f.toString()));
    if (sub.faculty) console.log(`  faculty:`, sub.faculty.toString());
  }

  process.exit();
}

diagnose().catch(e => { console.error(e); process.exit(1); });
