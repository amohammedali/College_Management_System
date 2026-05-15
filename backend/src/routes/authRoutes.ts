import { Router } from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { UserRole } from '../models/User.js';

const router = Router();

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], login);

router.post('/register', protect, authorize(UserRole.ADMIN), [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(Object.values(UserRole)),
  body('name').notEmpty(),
], register);

export default router;
