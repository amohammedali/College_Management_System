import { Request, Response, NextFunction } from 'express';
import AppraisalCycle from '../models/AppraisalCycle.js';

const validTransitions: Record<string, string[]> = {
  draft: ['self_eval'],
  self_eval: ['hod_review'],
  hod_review: ['principal_approved'],
  principal_approved: ['closed']
};

export const validateStatusTransition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status: nextStatus } = req.body;

    if (!nextStatus) return next();

    const appraisal = await AppraisalCycle.findById(id);
    if (!appraisal) {
      return res.status(404).json({ message: 'Appraisal record not found.' });
    }

    const currentStatus = appraisal.status;
    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(nextStatus)) {
      return res.status(409).json({
        message: `Invalid status transition from ${currentStatus} to ${nextStatus}.`,
        allowedTransitions: allowed
      });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
