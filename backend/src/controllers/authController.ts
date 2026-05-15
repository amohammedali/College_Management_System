import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import Student from '../models/Student';
import Staff, { StaffType } from '../models/Staff';
import { generateToken } from '../utils/jwt';
import { validationResult } from 'express-validator';

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    console.log(`[AUTH] Login attempt for: ${email}`);
    const user = await User.findOne({ email });

    if (user) {
      const isMatch = await user.comparePassword(password);
      console.log(`[AUTH] User found: ${user.email}, Password Match: ${isMatch}`);
      if (isMatch) {
        res.json({
          _id: user._id,
          email: user.email,
          role: user.role,
          token: generateToken(user._id as string, user.role),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log(`[AUTH] No user found for: ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user (Usually done by Admin)
// @route   POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role, name, department, specificInfo } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      role,
    });

    if (user) {
      // Create role-specific profile
      if (role === UserRole.STUDENT) {
        await Student.create({
          user: user._id,
          studentId: specificInfo.studentId,
          name,
          department,
          class: specificInfo.class,
          attendance: { present: 0, total: 0, percentage: 0 },
          fees: { total: specificInfo.feeTotal || 0, paid: 0, balance: specificInfo.feeTotal || 0 }
        });
      } else if (role === UserRole.STAFF || role === UserRole.NON_TEACHING) {
        await Staff.create({
          user: user._id,
          email: user.email,
          staffId: specificInfo.staffId,
          name,
          department,
          type: role === UserRole.STAFF ? StaffType.TEACHING : StaffType.NON_TEACHING,
          designation: specificInfo.designation,
          salary: { base: specificInfo.salaryBase || 0, allowances: 0, deductions: 0, net: specificInfo.salaryBase || 0 }
        });
      }

      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id as string, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
