import puppeteer from 'puppeteer';

export const generateReceiptPDF = async (data: any) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .institution-name { font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase; }
        .receipt-title { font-size: 14px; font-weight: 700; color: #64748b; margin-top: 5px; }
        
        .watermark {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px; color: rgba(15, 23, 42, 0.03); font-weight: 900; pointer-events: none; z-index: -1;
          white-space: nowrap;
        }

        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .value { font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px; }

        .fee-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .fee-table th { text-align: left; background: #f8fafc; padding: 12px; font-size: 10px; text-transform: uppercase; color: #64748b; }
        .fee-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 600; }
        .total-row { background: #f0f9ff; }
        .total-row td { color: #0369a1; font-weight: 900; font-size: 16px; border-top: 2px solid #0ea5e9; }

        .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature { border-top: 1px solid #cbd5e1; width: 150px; text-align: center; padding-top: 10px; font-size: 10px; font-weight: 700; color: #64748b; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
        .status-captured { background: #dcfce7; color: #15803d; }
      </style>
    </head>
    <body>
      <div class="watermark">OFFICIAL RECEIPT</div>
      
      <div class="header">
        <div class="institution-name">EduCMS Global University</div>
        <div class="receipt-title">Official Financial Acknowledgement</div>
      </div>

      <div class="details-grid">
        <div>
          <div class="label">Receipt Number</div>
          <div class="value">${data.receiptNumber}</div>
        </div>
        <div>
          <div class="label">Transaction Date</div>
          <div class="value">${new Date(data.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
        </div>
        <div>
          <div class="label">Student Name</div>
          <div class="value">${data.studentName}</div>
        </div>
        <div>
          <div class="label">Student ID</div>
          <div class="value">${data.studentId}</div>
        </div>
      </div>

      <table class="fee-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Payment Mode</th>
            <th style="text-align: right;">Amount Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${data.feeType} Fee (${data.dept})</td>
            <td>${data.paymentMode.toUpperCase()}</td>
            <td style="text-align: right;">₹${data.amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2" style="text-align: right; padding-right: 24px;">TOTAL PAID</td>
            <td style="text-align: right;">₹${data.amount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div>
          <div class="status-badge status-captured">PAYMENT CAPTURED</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 10px;">Bank Ref: ${data.bankRef || data.razorpayId || 'N/A'}</div>
        </div>
        <div>
          <div class="signature">Accounts Officer</div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
};
