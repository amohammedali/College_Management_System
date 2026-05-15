const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const SubjectSchema = new mongoose.Schema({
  name: String,
  code: String,
  faculties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  status: String
});

const Subject = mongoose.model('Subject', SubjectSchema);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/college_management';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const subjects = await Subject.find({ faculties: { $exists: true, $not: { $size: 0 } } }).populate('faculties', 'name');
  console.log(`Found ${subjects.length} assigned subjects`);
  
  subjects.forEach(s => {
    console.log(`Subject: ${s.name} (${s.code})`);
    console.log(`Faculties: ${s.faculties.map(f => f ? f.name : 'NULL').join(', ')}`);
    console.log(`Status: ${s.status}`);
    console.log('---');
  });
  
  await mongoose.disconnect();
}

check().catch(console.error);
