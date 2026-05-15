import mongoose from 'mongoose';
import Department from '../models/Department.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkDepts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cms');
    const depts = await Department.find().lean();
    console.log(`Departments found: ${depts.length}`);
    console.log(JSON.stringify(depts.map(d => d.name), null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

checkDepts();
