import { Router, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import Mark, { AssessmentType } from '../models/Mark.js';
import Student from '../models/Student.js';
import { AuthRequest } from '../middlewares/auth.js';

const router = Router();

// GET students for marks entry
router.get('/students', protect, authorize('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { department, semester, section } = req.query;
    const yearNum = Math.ceil(Number(semester) / 2);

    const students = await Student.find({
      department,
      year: yearNum,
      class: section
    }).select('name registerNumber _id').sort({ registerNumber: 1 });
    
    res.json(students);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// POST bulk marks
router.post('/submit', protect, authorize('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const { subject, type, semester, academicYear, marks } = req.body;
    
    const operations = marks.map((m: any) => ({
      updateOne: {
        filter: { 
          student: m.studentId, 
          subject, 
          type, 
          semester 
        },
        update: {
          $set: {
            score: m.score,
            totalScore: m.totalScore,
            grade: m.grade || 'N/A',
            academicYear,
            markedBy: req.user?._id
          }
        },
        upsert: true
      }
    }));

    await Mark.bulkWrite(operations);

    res.json({ message: 'Marks updated successfully' });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// GET marks for a specific student
router.get('/student/:id', protect, async (req, res) => {
  try {
    const marks = await Mark.find({ student: req.params.id })
      .populate('subject', 'name code')
      .sort({ semester: -1, type: 1 });
    res.json(marks);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
