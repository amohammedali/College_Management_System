const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/cms';

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  type: { type: String, default: 'Theory' },
  regulation: { type: String, required: true },
  credits: {
    lecture: { type: Number, default: 3 },
    tutorial: { type: Number, default: 0 },
    practical: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const Subject = mongoose.model('Subject', SubjectSchema);

const civilSubjects = [
  // Semester 5 - R2021
  {
    name: 'Structural Analysis',
    code: 'CE3501',
    department: 'Civil Engineering',
    semester: 5,
    regulation: 'R2021',
    credits: { total: 4 }
  },
  {
    name: 'Design of Reinforced Concrete Elements',
    code: 'CE3502',
    department: 'Civil Engineering',
    semester: 5,
    regulation: 'R2021',
    credits: { total: 4 }
  },
  {
    name: 'Foundation Engineering',
    code: 'CE3503',
    department: 'Civil Engineering',
    semester: 5,
    regulation: 'R2021',
    credits: { total: 3 }
  },
  // Semester 5 - 2023 (Matching frontend default)
  {
    name: 'Structural Analysis (Modern)',
    code: 'CE23501',
    department: 'Civil Engineering',
    semester: 5,
    regulation: '2023',
    credits: { total: 4 }
  },
  {
    name: 'Design of RC Elements (Advanced)',
    code: 'CE23502',
    department: 'Civil Engineering',
    semester: 5,
    regulation: '2023',
    credits: { total: 4 }
  },
  {
    name: 'Foundation Engineering 2023',
    code: 'CE23503',
    department: 'Civil Engineering',
    semester: 5,
    regulation: '2023',
    credits: { total: 3 }
  },
  // Semester 6
  {
    name: 'Design of Steel Structures',
    code: 'CE3601',
    department: 'Civil Engineering',
    semester: 6,
    regulation: 'R2021',
    credits: { total: 4 }
  },
  {
    name: 'Structural Dynamics and Earthquake Engineering',
    code: 'CE3602',
    department: 'Civil Engineering',
    semester: 6,
    regulation: 'R2021',
    credits: { total: 3 }
  },
  {
    name: 'Water Resources and Irrigation Engineering',
    code: 'CE3603',
    department: 'Civil Engineering',
    semester: 6,
    regulation: 'R2021',
    credits: { total: 3 }
  },
  {
    name: 'Concrete and Highway Engineering Laboratory',
    code: 'CE3611',
    department: 'Civil Engineering',
    semester: 6,
    type: 'Lab/Practical',
    regulation: 'R2021',
    credits: { total: 2 }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const sub of civilSubjects) {
      await Subject.findOneAndUpdate(
        { code: sub.code },
        sub,
        { upsert: true, new: true }
      );
    }

    console.log('Civil Engineering subjects seeded successfully');
    process.exit(0);
  } catch (e) {
    console.error('Seeding failed:', e);
    process.exit(1);
  }
}

seed();
