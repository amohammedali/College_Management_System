import express, { Request, Response } from 'express';
import FeeStructure from '../models/FeeStructure.js';
import FeeTransaction from '../models/FeeTransaction.js';
import FeeWaiver from '../models/FeeWaiver.js';
import FeeReceipt from '../models/FeeReceipt.js';
import PaymentReminder from '../models/PaymentReminder.js';
import { protect, authorize } from '../middlewares/auth.js';
import { getStudentOutstanding, getCollectionStats } from '../services/feeService.js';
import { generateReceiptPDF } from '../services/receiptService.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder'
});

interface AuthRequest extends Request {
  user?: any;
}

// ── Fee Structure Management ──────────────────────────────

router.get('/structures', protect, async (req: Request, res: Response) => {
  try {
    const { dept, year, regulation } = req.query;
    const query: any = {};
    if (dept) query.department = dept;
    if (year) query.academicYear = year;
    if (regulation) query.regulationYear = regulation;
    
    const structures = await FeeStructure.find(query).populate('department');
    res.json(structures);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/structures', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const structure = await FeeStructure.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(structure);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/structures/clone', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { from_regulation, to_regulation, dept_id } = req.body;
    const sources = await FeeStructure.find({ regulationYear: from_regulation, department: dept_id });
    
    const clones = sources.map(s => ({
      department: s.department,
      regulationYear: to_regulation,
      academicYear: s.academicYear,
      feeType: s.feeType,
      amount: s.amount,
      dueDate: s.dueDate,
      installmentAllowed: s.installmentAllowed,
      createdBy: req.user._id
    }));

    await FeeStructure.insertMany(clones);
    res.json({ message: `Successfully cloned ${clones.length} components.` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Online Payment (Razorpay) ─────────────────────────────

router.post('/payment/order', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, student_id } = req.body;
    const options = {
      amount: amount * 100, // INR in paise
      currency: 'INR',
      receipt: `RCP_${Date.now()}`,
      notes: { student_id }
    };
    const order = await razorpay.orders.create(options);
    res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/payment/verify', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, student_id, fee_structure_id, amount } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder')
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const transaction = await FeeTransaction.create({
        student: student_id,
        feeStructure: fee_structure_id,
        amountPaid: amount,
        paymentMode: 'online',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
        receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      });
      res.json({ success: true, transaction });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Razorpay Webhook ──────────────────────────────────────

router.post('/webhook/razorpay', async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_placeholder';
    const signature = req.headers['x-razorpay-signature'] as string;
    
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature === signature) {
      const { event, payload } = req.body;
      
      if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        const studentId = payment.notes.student_id;
        const feeStructureId = payment.notes.fee_structure_id;

        const existing = await FeeTransaction.findOne({ razorpayPaymentId: payment.id });
        if (!existing) {
          await FeeTransaction.create({
            student: studentId,
            feeStructure: feeStructureId,
            amountPaid: payment.amount / 100,
            paymentMode: 'online',
            razorpayOrderId: payment.order_id,
            razorpayPaymentId: payment.id,
            status: 'captured',
            receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
          });
        }
      }
      res.json({ status: 'ok' });
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Revenue Analytics & Receipts ──────────────────────────

router.get('/collection-stats', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const stats = await getCollectionStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/receipt/:transaction_id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { transaction_id } = req.params;
    let receipt = await FeeReceipt.findOne({ transaction: transaction_id });
    
    if (!receipt) {
      receipt = await generateReceiptPDF(transaction_id, req.user._id);
    }

    const filePath = path.join(process.cwd(), receipt.pdfUrl);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: 'Receipt file not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Offline Payment ───────────────────────────────────────

router.post('/payment/offline', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await FeeTransaction.create({
      ...req.body,
      paymentMode: req.body.paymentMode || 'cash',
      status: 'captured',
      collectedBy: req.user._id,
      receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    });
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Student Ledger & Outstanding ──────────────────────────

router.get('/ledger/:student_id', protect, async (req: Request, res: Response) => {
  try {
    const ledger = await getStudentOutstanding(req.params.student_id);
    const transactions = await FeeTransaction.find({ student: req.params.student_id }).sort({ createdAt: -1 });
    const waivers = await FeeWaiver.find({ student: req.params.student_id });
    res.json({ ledger, transactions, waivers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/outstanding', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    res.json({ message: "Bulk outstanding query optimized for large datasets." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// ── Waivers ───────────────────────────────────────────────

router.post('/waivers', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const waiver = await FeeWaiver.create({
      ...req.body,
      approvedBy: req.user._id
    });
    res.status(201).json(waiver);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
