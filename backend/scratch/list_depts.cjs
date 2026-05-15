const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/cms');
  const depts = await mongoose.connection.db.collection('departments').find({}).toArray();
  console.log(depts);
  process.exit();
}

test();
