const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/cms';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['classroom', 'lab', 'seminar'], default: 'classroom' },
  capacity: { type: Number, required: true },
  block: { type: String, required: true },
  floor: { type: Number, required: true }
});

const Room = mongoose.model('Room', roomSchema);

async function checkRooms() {
  await mongoose.connect(MONGO_URI);
  const count = await Room.countDocuments();
  console.log(`Current room count: ${count}`);
  
  if (count === 0) {
    console.log('Seeding rooms...');
    await Room.insertMany([
      { name: 'CR-101', type: 'classroom', capacity: 60, block: 'Main Block', floor: 1 },
      { name: 'CR-102', type: 'classroom', capacity: 60, block: 'Main Block', floor: 1 },
      { name: 'CR-201', type: 'classroom', capacity: 60, block: 'Main Block', floor: 2 },
      { name: 'CR-202', type: 'classroom', capacity: 60, block: 'Main Block', floor: 2 },
      { name: 'LH-1', type: 'seminar', capacity: 120, block: 'Admin Block', floor: 0 },
      { name: 'Computer Lab 1', type: 'lab', capacity: 30, block: 'Tech Block', floor: 1 }
    ]);
    console.log('Rooms seeded successfully!');
  }
  
  await mongoose.disconnect();
}

checkRooms();
