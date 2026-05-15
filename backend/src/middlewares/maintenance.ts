import { Request, Response, NextFunction } from 'express';
import Setting from '../models/Setting.js';
import { UserRole } from '../models/User.js';
import { AuthRequest } from './auth.js';

export const checkMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const maintenanceSetting = await Setting.findOne({ key: 'maintenanceMode' }).lean();
  const isMaintenance = maintenanceSetting?.value === true;

  if (isMaintenance && req.user?.role !== UserRole.ADMIN) {
    return res.status(503).json({
      message: 'System is currently under maintenance. Please try again later.',
      status: 'maintenance'
    });
  }

  next();
};
