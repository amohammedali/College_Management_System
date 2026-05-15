const mongoose = require('mongoose');
require('dotenv').config({ path: 'e:/My_Projects/college_management_system/backend/.env' });

// Cross-reference: for each subject, check if the assigned staff IDs match actual Staff _id records
async function crossRef() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const staffs = await db.collection('staffs').find().toArray();
  const subjects = await db.collection('subjects').find().toArray();
  const users = await db.collection('users').find({ role: 'staff' }).toArray();

  console.log('\n=== FACULTY-TO-STAFF ID CROSS REFERENCE ===\n');
  
  for (const sub of subjects) {
    const allFacultyIds = [
      ...(sub.faculties || []).map(f => f.toString()),
      ...(sub.faculty ? [sub.faculty.toString()] : [])
    ];
    if (allFacultyIds.length === 0) continue;
    
    console.log(`Subject: "${sub.name}"`);
    for (const fId of allFacultyIds) {
      const matchStaff = staffs.find(s => s._id.toString() === fId);
      if (matchStaff) {
        const linkedUser = users.find(u => u._id.toString() === (matchStaff.user || '').toString());
        console.log(`  ✅ Faculty ID ${fId} → Staff: ${matchStaff.name} (${matchStaff.email}) → Login: ${linkedUser ? linkedUser.email : '❌ NO USER'}`);
      } else {
        console.log(`  ❌ Faculty ID ${fId} → NO MATCHING STAFF RECORD (orphaned ID!)`);
      }
    }
  }

  process.exit();
}

crossRef().catch(e => { console.error(e); process.exit(1); });
