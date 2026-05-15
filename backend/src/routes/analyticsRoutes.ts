import express, { Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { calculateDropoutRisk, getEnrollmentForecast } from '../services/analyticsService.js';
import Analytics from '../models/Analytics.js';
import AppraisalCycle from '../models/AppraisalCycle.js';
import ResearchPublication from '../models/ResearchPublication.js';

const router = express.Router();

// @route   GET /api/analytics/dropout-risk
// @desc    Get predictive dropout risks
router.get('/dropout-risk', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const risk = await calculateDropoutRisk();
    res.json(risk);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/forecast/enrollment
// @desc    Get enrollment projections
router.get('/forecast/enrollment', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const forecast = await getEnrollmentForecast();
    res.json(forecast);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/latest
// @desc    Get latest snapshots for all types
router.get('/latest', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const types = ['dropout_risk', 'enrollment_forecast', 'health_index', 'revenue_projection'];
    const snapshots = await Promise.all(types.map(t => 
      Analytics.findOne({ type: t }).sort({ 'metadata.generatedAt': -1 })
    ));
    res.json(snapshots.filter(s => s !== null));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics/performance-index
// @desc    Get institutional performance metrics based on appraisal data
router.get('/performance-index', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    
    const [avg] = await AppraisalCycle.aggregate([
      { $match: { cycleYear: year, status: 'closed' } },
      { $group: {
        _id: null,
        avgApi: { $avg: '$apiScore' },
        eligibleCount: { $sum: { $cond: ['$promotionEligible', 1, 0] } },
        avgRating: { $avg: '$feedbackScore' }
      }}
    ]);

    const papers = await ResearchPublication.countDocuments({ 
      yearPublished: parseInt(year as string), 
      isVerified: true 
    });

    res.json({
      avgApi: avg ? Math.round(avg.avgApi * 10) / 10 : 0,
      papers,
      eligibleCount: avg ? avg.eligibleCount : 0,
      avgRating: avg ? Math.round((avg.avgRating / 20) * 10) / 10 : 0 // Scale 0-100 to 0-5
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
