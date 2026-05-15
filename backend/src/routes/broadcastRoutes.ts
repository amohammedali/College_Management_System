import express, { Request, Response } from 'express';
import Broadcast from '../models/Broadcast.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// @route   POST /api/broadcast/send
// @desc    Dispatch an announcement
router.post('/send', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, channels, targetAudience } = req.body;
    const broadcast = await Broadcast.create({
      title,
      content,
      channels,
      targetAudience,
      sender: req.user._id,
      status: 'Sent'
    });

    // In a real flow, this would trigger the notificationService dispatcher
    // For now, we return the created broadcast
    res.status(201).json(broadcast);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/broadcast/history
// @desc    Get broadcast history for admin
router.get('/history', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const history = await Broadcast.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/notifications/my
// @desc    Get current user's notifications
router.get('/notifications/my', protect, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
