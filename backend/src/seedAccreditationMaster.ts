import mongoose from 'mongoose';
import NaacCriterion from './models/NaacCriterion.js';
import NbaPoCoMap from './models/NbaPoCoMap.js';

const seedAccreditationMaster = async () => {
  try {
    // 1. Seed NAAC Criteria (C1 - C7)
    const naacCriteria = [
      { criterionCode: 'C1', criterionName: 'Curricular Aspects', maxScore: 100, dataSource: 'curriculum', weightPercent: 10 },
      { criterionCode: 'C2', criterionName: 'Teaching-Learning and Evaluation', maxScore: 350, dataSource: 'students', weightPercent: 35 },
      { criterionCode: 'C3', criterionName: 'Research, Innovations and Extension', maxScore: 120, dataSource: 'staff', weightPercent: 12 },
      { criterionCode: 'C4', criterionName: 'Infrastructure and Learning Resources', maxScore: 100, dataSource: 'other', weightPercent: 10 },
      { criterionCode: 'C5', criterionName: 'Student Support and Progression', maxScore: 130, dataSource: 'students', weightPercent: 13 },
      { criterionCode: 'C6', criterionName: 'Governance, Leadership and Management', maxScore: 100, dataSource: 'other', weightPercent: 10 },
      { criterionCode: 'C7', criterionName: 'Institutional Values and Best Practices', maxScore: 100, dataSource: 'other', weightPercent: 10 }
    ];

    for (const c of naacCriteria) {
      await NaacCriterion.findOneAndUpdate({ criterionCode: c.criterionCode }, c, { upsert: true });
    }

    console.log('NAAC Criteria Seeded Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

// Only run if called directly
if (process.argv[1].includes('seedAccreditationMaster')) {
  seedAccreditationMaster();
}

export default seedAccreditationMaster;
