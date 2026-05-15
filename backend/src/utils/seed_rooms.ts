import mongoose from 'mongoose';
import Room from '../models/Room';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college_management';

const seedRooms = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for room seeding...');

    const rooms = [
      { name: 'CSE-301', type: 'Classroom', capacity: 60, block: 'Main Block', floor: '3rd' },
      { name: 'CSE-302', type: 'Classroom', capacity: 60, block: 'Main Block', floor: '3rd' },
      { name: 'CSE-Lab-1', type: 'Lab', capacity: 35, block: 'Main Block', floor: '2nd', amenities: ['PCs', 'Projector', 'AC'] },
      { name: 'CSE-Lab-2', type: 'Lab', capacity: 35, block: 'Main Block', floor: '2nd', amenities: ['PCs', 'AC'] },
      { name: 'ECE-101', type: 'Classroom', capacity: 60, block: 'North Block', floor: '1st' },
      { name: 'Seminar-Hall-A', type: 'Seminar Hall', capacity: 150, block: 'Admin Block', floor: 'Ground' },
    ];

    for (const roomData of rooms) {
      await Room.findOneAndUpdate(
        { name: roomData.name },
        roomData,
        { upsert: true, new: true }
      );
    }

    console.log('Successfully seeded institutional rooms.');
    process.exit(0);
  } catch (error) {
    console.error('Room seeding failed:', error);
    process.exit(1);
  }
};

seedRooms();
