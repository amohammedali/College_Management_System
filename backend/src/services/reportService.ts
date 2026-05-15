import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import FeeTransaction from '../models/FeeTransaction.js';
import User from '../models/User.js';

export const generateFinanceAuditReport = async (filters: any) => {
  const transactions = await FeeTransaction.find(filters).populate('student');
  
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Fee Audit');
  
  sheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Receipt #', key: 'receipt', width: 20 },
    { header: 'Student Name', key: 'student', width: 25 },
    { header: 'Mode', key: 'mode', width: 15 },
    { header: 'Ref #', key: 'ref', width: 25 },
    { header: 'Amount', key: 'amount', width: 15 }
  ];

  transactions.forEach(t => {
    sheet.addRow({
      date: new Date(t.createdAt).toLocaleDateString(),
      receipt: t.receiptNumber,
      student: (t.student as any)?.firstName + ' ' + (t.student as any)?.lastName,
      mode: t.paymentMode,
      ref: t.razorpayPaymentId || t.bankRef || 'CASH',
      amount: t.amountPaid
    });
  });

  const uploadDir = path.join(process.cwd(), 'uploads', 'reports');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = `audit_${Date.now()}.xlsx`;
  const filePath = path.join(uploadDir, fileName);
  await workbook.xlsx.writeFile(filePath);

  return `/uploads/reports/${fileName}`;
};

export const generateCompliancePDF = async (data: any) => {
  const html = `
    <html>
      <body style="font-family: sans-serif; padding: 50px;">
        <h1 style="color: #4f46e5;">Institutional Compliance SSR Draft</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <hr/>
        <h3>Executive Summary</h3>
        <p>${data.summary}</p>
        <h3>Departmental Strength</h3>
        <ul>
          ${data.departments.map((d: any) => `<li>${d.name}: ${d.facultyCount} Faculty</li>`).join('')}
        </ul>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html);
  
  const fileName = `compliance_${Date.now()}.pdf`;
  const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
  await page.pdf({ path: filePath, format: 'A4' });
  await browser.close();

  return `/uploads/reports/${fileName}`;
};
