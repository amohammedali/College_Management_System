import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Static Files ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Security ───────────────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(compression() as any);
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Rate Limiting ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 20,                    // 20 login attempts max
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Rate limit exceeded. Please slow down.' },
});
// app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// ── Routes ─────────────────────────────────────────────────
import authRoutes    from './routes/authRoutes.js';
import adminRoutes   from './routes/adminRoutes.js';
import staffRoutes   from './routes/staffRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import accreditationRoutes from './routes/accreditationRoutes.js';
import appraisalRoutes from './routes/appraisalRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import broadcastRoutes from './routes/broadcastRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import markRoutes from './routes/markRoutes.js';
import { checkMaintenance } from './middlewares/maintenance.js';

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',    authRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/staff',   checkMaintenance, staffRoutes);
app.use('/api/student', checkMaintenance, studentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/fee', feeRoutes);
app.use('/api/accr', accreditationRoutes);
app.use('/api/appraisal', appraisalRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', markRoutes);

// ── Global Error Handler ───────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── 404 handler ────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
