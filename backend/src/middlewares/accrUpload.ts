import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'accr');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req: any, file, cb) => {
    // key: accr/{criterion_code}/{year}/{uuid}.{ext} - Simulated via filename
    const ext = path.extname(file.originalname);
    const criterion = req.body.criterionCode || 'misc';
    const year = req.body.academicYear || new Date().getFullYear().toString();
    cb(null, `${criterion}_${year}_${uuidv4()}${ext}`);
  }
});

export const accrUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG are allowed.'));
    }
  }
});
