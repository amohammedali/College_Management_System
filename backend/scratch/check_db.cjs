const mongoose = require('mongoose');

const mongoUri = 'mongodb://127.0.0.1:27017/cms';

async function check() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const subjects = await mongoose.connection.db.collection('subjects').find({}).toArray();
    console.log('Total subjects:', subjects.length);
    subjects.forEach(s => {
      console.log(`Subject: ${s.name}, Code: ${s.code}, Dept: ${s.department}, Sem: ${s.semester}, Reg: ${s.regulation}, Status: ${s.status}`);
    });

    const staff = await mongoose.connection.db.collection('staffs').find({}).toArray();
    console.log('Total staff:', staff.length);
    staff.forEach(s => {
        console.log(`Staff: ${s.name}, Dept: ${s.department}, Year: ${s.assignedYear}, Sec: ${s.assignedSection}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
