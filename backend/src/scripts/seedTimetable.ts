import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import Staff from '../models/Staff.js';
import FacultyAvailability from '../models/FacultyAvailability.js';

dotenv.config();

const rooms = [
  { name: 'LH-101', type: 'classroom', capacity: 60, block: 'Main', floor: 1 },
  { name: 'LH-102', type: 'classroom', capacity: 60, block: 'Main', floor: 1 },
  { name: 'LAB-201', type: 'lab', capacity: 30, block: 'Main', floor: 2 },
  { name: 'SEM-301', type: 'seminar', capacity: 150, block: 'Science', floor: 3 },
  { name: 'LH-401', type: 'classroom', capacity: 40, block: 'Engineering', floor: 4 }
];

const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    // 1. Seed Rooms
    await Room.deleteMany({});
    await Room.insertMany(rooms);
    console.log('Rooms seeded');

    // 2. Seed Faculty Availability
    await FacultyAvailability.deleteMany({});
    const teachingStaff = await Staff.find({ type: 'teaching' });
    
    console.log(`Seeding availability for ${teachingStaff.length} faculty...`);
    
    const availabilityRecords = [];
    for (const staff of teachingStaff) {
      for (const day of days) {
        for (const period of periods) {
          availabilityRecords.push({
            faculty_id: staff._id,
            day,
            period,
            is_available: true
          });
        }
      }
    }

    // Insert in batches to avoid payload limits
    const batchSize = 1000;
    for (let i = 0; i < availabilityRecords.length; i += batchSize) {
      const batch = availabilityRecords.slice(i, i + batchSize);
      await FacultyAvailability.insertMany(batch);
      console.log(`Inserted batch ${i / batchSize + 1}`);
    }

    console.log('Faculty availability seeded');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
