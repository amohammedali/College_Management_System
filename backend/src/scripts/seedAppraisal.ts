import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PromotionRule } from '../models/AppraisalAux.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cms';

const rules = [
  {
    fromDesignation: 'Assistant Professor',
    toDesignation: 'Associate Professor',
    minApiScore: 75,
    minYearsService: 8,
    minPhd: true,
    minResearchPapers: 10,
    effectiveFrom: new Date('2024-01-01')
  },
  {
    fromDesignation: 'Associate Professor',
    toDesignation: 'Professor',
    minApiScore: 85,
    minYearsService: 12,
    minPhd: true,
    minResearchPapers: 15,
    effectiveFrom: new Date('2024-01-01')
  },
  {
    fromDesignation: 'Lecturer',
    toDesignation: 'Assistant Professor',
    minApiScore: 60,
    minYearsService: 3,
    minPhd: false,
    minResearchPapers: 2,
    effectiveFrom: new Date('2024-01-01')
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await PromotionRule.deleteMany({});
    await PromotionRule.insertMany(rules);

    console.log('✅ Promotion rules seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding promotion rules:', error);
    process.exit(1);
  }
}

seed();
