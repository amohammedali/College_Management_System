// Test the actual /api/staff/profile endpoint by simulating what it does
const mongoose = require('mongoose');
require('dotenv').config({ path: 'e:/My_Projects/college_management_system/backend/.env' });

async function testProfileLookup(email) {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  console.log(`\n=== Testing profile lookup for: "${email}" ===`);
  
  // Step 1: Email regex lookup (exactly what the backend does)
  const staffByEmail = await db.collection('staffs').findOne({
    email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
  });
  
  if (staffByEmail) {
    console.log(`✅ Email lookup FOUND: ${staffByEmail.name}`);
    console.log(`   Staff _id: ${staffByEmail._id}`);
    console.log(`   Staff user: ${staffByEmail.user}`);
    
    // Step 2: Now check subjects
    const staffId = staffByEmail._id.toString();
    const subjects = await db.collection('subjects').find({
      $or: [
        { faculties: staffByEmail._id },
        { faculties: staffId },
        { faculty: staffByEmail._id },
        { faculty: staffId }
      ],
      status: 'active'
    }).toArray();
    
    console.log(`\n📚 Subjects found: ${subjects.length}`);
    subjects.forEach(s => console.log(`   - ${s.name} (${s.code})`));
    
    // Step 3: Also check with in-memory filter (fallback)
    const allSubjects = await db.collection('subjects').find({ status: 'active' }).toArray();
    const filtered = allSubjects.filter(sub => {
      const faculties = (sub.faculties || []).map(f => f.toString());
      const faculty = sub.faculty ? sub.faculty.toString() : null;
      return faculties.includes(staffId) || faculty === staffId;
    });
    console.log(`\n📚 Subjects via in-memory filter: ${filtered.length}`);
    filtered.forEach(s => console.log(`   - ${s.name} (${s.code})`));
    
  } else {
    console.log(`❌ Email lookup FAILED - no staff record found for "${email}"`);
    
    // Check if any record exists with similar email
    const all = await db.collection('staffs').find().toArray();
    console.log('\n All staff emails in database:');
    all.forEach(s => console.log(`   "${s.email}" (chars: ${Array.from(s.email || '').map(c => c.charCodeAt(0)).join(',')})`));
  }
  
  process.exit();
}

const testEmail = process.argv[2] || 'anwar@college.in';
testProfileLookup(testEmail).catch(e => { console.error(e); process.exit(1); });
