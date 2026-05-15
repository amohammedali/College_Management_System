import express, { Request, Response } from 'express';
import Inventory from '../models/Inventory.js';
import { protect, authorize } from '../middlewares/auth.js';
import { generateAssetQR } from '../utils/qrGenerator.js';

const router = express.Router();

// @route   GET /api/assets/stats
// @desc    Get asset analytics
router.get('/stats', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const totalAssets = await Inventory.countDocuments();
    const assets = await Inventory.find();
    
    // Calculate health rate
    const healthRate = assets.length > 0 
      ? (assets.reduce((acc, curr) => acc + (curr.health || 0), 0) / assets.length).toFixed(1)
      : "100.0";

    const categoryBreakdown = await Inventory.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json({
      totalAssets,
      healthRate,
      categoryBreakdown,
      statusMetrics: {
        available: await Inventory.countDocuments({ status: 'Available' }),
        maintenance: await Inventory.countDocuments({ status: { $in: ['Maintenance', 'Repair Pending'] } }),
        retired: await Inventory.countDocuments({ status: 'Retired' })
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/assets/qr/:id
// @desc    Generate QR for specific asset
router.get('/qr/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const asset = await Inventory.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    const qr = await generateAssetQR(asset.assetId);
    res.json({ qr });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/assets
// @desc    Get all assets
router.get('/', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const assets = await Inventory.find().sort({ createdAt: -1 });
    res.json(assets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
