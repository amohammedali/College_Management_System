import Accreditation from '../models/Accreditation.js';
import Mark from '../models/Mark.js';
import Staff from '../models/Staff.js';
import Appraisal from '../models/Appraisal.js';
import Student from '../models/Student.js';

export const refreshAccreditationScores = async () => {
  // Logic to refresh scores for NAAC Criteria
  
  // 1. Criterion 2: Teaching-Learning (Simulated CGPA Forecast)
  const avgCgpa = await calculateInstitutionalGPA();
  await Accreditation.findOneAndUpdate(
    { criterionId: '2.1.1' },
    { 
      name: 'Teaching-Learning Process',
      currentScore: Math.round(avgCgpa * 20), // Simulated weightage mapping
      maxScore: 100,
      status: 'In Review',
      lastRefreshed: new Date()
    },
    { upsert: true }
  );

  // 2. Criterion 4: Infrastructure & Learning Resources
  // (Placeholder: Logic to check library/lab utilization)
  await Accreditation.findOneAndUpdate(
    { criterionId: '4.1.1' },
    { 
      name: 'Infrastructure & Resources',
      currentScore: 85,
      maxScore: 100,
      status: 'Verified',
      lastRefreshed: new Date()
    },
    { upsert: true }
  );

  // 3. NBA: Vision & Mission (Criterion 1)
  await Accreditation.findOneAndUpdate(
    { type: 'NBA', criterionId: 'NBA-C1' },
    { 
      name: 'Vision, Mission & PEOs',
      currentScore: 40,
      maxScore: 50,
      status: 'Verified',
      lastRefreshed: new Date()
    },
    { upsert: true }
  );

  return true;
};

const calculateInstitutionalGPA = async () => {
  const marks = await Mark.aggregate([
    { $group: { _id: null, avg: { $avg: "$internalMarks" } } }
  ]);
  
  // Convert 100-scale average to 4.0 GPA scale (Roughly)
  const avg = marks[0]?.avg || 0;
  return (avg / 25).toFixed(2); // 100 -> 4.0
};
