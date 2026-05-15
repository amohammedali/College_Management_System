const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cms');
  const staff = await mongoose.connection.db.collection('staffs').find({
    assignedYear: { $exists: true }
  }).toArray();
  console.log(staff.map(s => ({
    name: s.name, 
    dept: s.department, 
    year: s.assignedYear, 
    sec: s.assignedSection,
    userId: s.user
  })));
  process.exit();
}

test();
