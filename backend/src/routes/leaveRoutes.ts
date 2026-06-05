import express, { Request, Response } from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// @route   POST /api/leaves/apply
// @desc    Apply for leave
router.post('/apply', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { type, startDate, endDate, reason, documentUrl } = req.body;
    
    // Check balance logic here...
    
    const leave = await LeaveRequest.create({
      user: req.user._id,
      role: req.user.role === 'student' ? 'student' : 'staff',
      type,
      startDate,
      endDate,
      reason,
      documentUrl
    });
    
    res.status(201).json(leave);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/leaves/my-summary
// @desc    Get personal leave history and balance
router.get('/my-summary', protect, async (req: AuthRequest, res: Response) => {
  try {
    const history = await LeaveRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    const balance = await LeaveBalance.findOne({ user: req.user._id, academicYear: '2024-25' });
    
    res.json({ history, balance });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/leaves/admin/all
// @desc    Get all leave requests for admin
router.get('/admin/all', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string || 'Pending';
    const leaves = await LeaveRequest.find({ status })
      .populate('user', 'email role')
      .sort({ createdAt: -1 })
      .lean();
      
    // Manually fetch names and IDs from Staff/Student collections
    const populatedLeaves = await Promise.all(leaves.map(async (leave: any) => {
       if (leave.user && leave.role === 'staff') {
          const staffRef = await import('../models/Staff.js').then(m => m.default).catch(() => null);
          if (staffRef) {
             const staffDetails = await staffRef.findOne({ user: leave.user._id }).lean();
             if (staffDetails) {
                 leave.user.name = staffDetails.name;
                 leave.user.studentId = staffDetails.staffId;
             }
          }
       } else if (leave.user && leave.role === 'student') {
          const studentRef = await import('../models/Student.js').then(m => m.default).catch(() => null);
          if (studentRef) {
             const studentDetails = await studentRef.findOne({ user: leave.user._id }).lean();
             if (studentDetails) {
                 leave.user.name = studentDetails.name;
                 leave.user.studentId = studentDetails.studentId;
             }
          }
       }
       return leave;
    }));
      
    res.json(populatedLeaves);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/leaves/approve
// @desc    Approve/Reject leave (HOD/Principal)
router.post('/approve', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { leaveId, status, remarks } = req.body;
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    const step = req.user.role === 'admin' ? 'Principal' : 'HOD';
    
    leave.status = status; // In a real flow, this would check if >3 days for Principal step
    leave.approvals.push({
      step,
      approver: req.user._id,
      date: new Date(),
      remarks
    });

    await leave.save();
    res.json(leave);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
