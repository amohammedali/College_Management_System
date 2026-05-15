const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/cms');
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'admin@college.com' });
  
  if (!user) {
    console.log('USER NOT FOUND');
  } else {
    console.log('USER FOUND:', user.email);
    const isMatch = await bcrypt.compare('password123', user.password);
    console.log('PASSWORD MATCH:', isMatch);
  }
  process.exit();
}

test();
