import puppeteer from 'puppeteer';
import FeeTransaction from '../models/FeeTransaction.js';
import FeeReceipt from '../models/FeeReceipt.js';
import path from 'path';
import fs from 'fs';

export const generateReceiptPDF = async (transactionId: string, userId: string) => {
  const transaction = await FeeTransaction.findById(transactionId)
    .populate('student')
    .populate('feeStructure');
    
  if (!transaction) throw new Error('Transaction not found');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica', sans-serif; color: #1e293b; padding: 40px; position: relative; }
        .watermark {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px; color: rgba(0,0,0,0.05); font-weight: 900; pointer-events: none; z-index: -1;
          white-space: nowrap;
        }
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; font-weight: 900; color: #4f46e5; font-style: italic; }
        .receipt-title { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .label { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; }
        .value { font-size: 12px; font-weight: 700; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background: #f8fafc; padding: 15px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; }
        td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 600; }
        .footer { border-top: 1px solid #f1f5f9; padding-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
        .amount-box { background: #4f46e5; color: white; padding: 20px 40px; border-radius: 12px; text-align: center; }
        .amount-label { font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; opacity: 0.8; }
        .amount-value { font-size: 24px; font-weight: 900; }
        .qr-placeholder { width: 80px; height: 80px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="watermark">OFFICIAL RECEIPT</div>
      
      <div class="header">
        <div class="logo">EduCMS.</div>
        <div class="receipt-title">Payment Receipt</div>
      </div>

      <div class="grid">
        <div>
          <div class="label">Billed To</div>
          <div class="value">${(transaction.student as any).firstName} ${(transaction.student as any).lastName}</div>
          <div class="value">${(transaction.student as any).studentId}</div>
        </div>
        <div style="text-align: right;">
          <div class="label">Receipt Number</div>
          <div class="value" style="font-size: 16px; color: #4f46e5;">${transaction.receiptNumber}</div>
          <div class="label" style="margin-top: 10px;">Date of Payment</div>
          <div class="value">${new Date(transaction.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Term</th>
            <th>Payment Mode</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-transform: capitalize;">${(transaction.feeStructure as any).feeType} Fee</td>
            <td>Year ${(transaction.feeStructure as any).academicYear}</td>
            <td style="text-transform: uppercase;">${transaction.paymentMode}</td>
            <td style="text-align: right; font-weight: 900;">₹${transaction.amountPaid.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div>
          <div class="label">Reference ID</div>
          <div class="value">${transaction.razorpayPaymentId || transaction.bankRef || 'OFFLINE_CASH'}</div>
          <div style="margin-top: 20px;" class="qr-placeholder">SCAN TO VERIFY<br/>ONLINE</div>
        </div>
        <div class="amount-box">
          <div class="amount-label">Total Amount Paid</div>
          <div class="amount-value">₹${transaction.amountPaid.toLocaleString()}</div>
        </div>
      </div>

      <div style="margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; font-style: italic;">
        This is a computer-generated document. No physical signature is required.
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  
  const fileName = `receipt_${transaction.receiptNumber}.pdf`;
  const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  await page.pdf({ path: filePath, format: 'A4', printBackground: true });
  await browser.close();

  // Record in database
  const receipt = await FeeReceipt.create({
    transaction: transaction._id,
    receiptNumber: transaction.receiptNumber,
    pdfUrl: `/uploads/receipts/${fileName}`,
    generatedBy: userId
  });

  return receipt;
};
