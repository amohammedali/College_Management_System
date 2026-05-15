import express, { Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { generateFinanceAuditReport, generateCompliancePDF } from '../services/reportService.js';
import Department from '../models/Department.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.post('/finance/audit', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { from, to } = req.body;
    const filter: any = { status: 'captured' };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    
    const url = await generateFinanceAuditReport(filter);
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/compliance/ssr', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const departments = await Department.find().lean();
    const data = {
      summary: "This report provides a preliminary draft for the NAAC Self-Study Report (SSR) based on current institutional data.",
      departments: departments.map(d => ({ name: d.name, facultyCount: d.facultyCount || 10 }))
    };
    
    const url = await generateCompliancePDF(data);
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/download', protect, async (req: Request, res: Response) => {
  const { path: filePath } = req.query;
  if (!filePath) return res.status(400).send('File path required');
  
  const absolutePath = path.join(process.cwd(), filePath as string);
  if (fs.existsSync(absolutePath)) {
    res.download(absolutePath);
  } else {
    res.status(404).send('File not found');
  }
});

export default router;
