import cron from 'node-cron';
import Student from '../models/Student.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendLowAttendanceEmail = async (studentEmail: string, name: string, percentage: number) => {
  await transporter.sendMail({
    from: `"EduCMS Alerts" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: '⚠️ Low Attendance Alert — Immediate Action Required',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;border-radius:12px;border:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:20px">
          <div style="width:56px;height:56px;background:#fef2f2;border-radius:14px;display:inline-flex;align-items:center;justify-content:center">
            <span style="font-size:28px">⚠️</span>
          </div>
          <h1 style="color:#ef4444;font-size:22px;margin:12px 0 4px">Low Attendance Warning</h1>
          <p style="color:#64748b;font-size:14px;margin:0">EduCMS College Management System</p>
        </div>
        <p style="color:#374151;font-size:15px">Dear <strong>${name}</strong>,</p>
        <p style="color:#374151;font-size:15px;line-height:1.6">
          Your current attendance is <strong style="color:#ef4444">${percentage.toFixed(1)}%</strong>, 
          which is below the minimum required attendance of <strong>75%</strong>.
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin:20px 0;text-align:center">
          <p style="margin:0;font-size:32px;font-weight:800;color:#ef4444">${percentage.toFixed(1)}%</p>
          <p style="margin:4px 0 0;font-size:13px;color:#b91c1c">Current Attendance Rate</p>
        </div>
        <p style="color:#374151;font-size:15px;line-height:1.6">
          Please attend all upcoming classes to avoid academic penalties, exam eligibility issues, 
          and potential barring from final examinations.
        </p>
        <p style="color:#64748b;font-size:13px;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:16px">
          This is an automated notification from EduCMS. Contact your faculty advisor for further assistance.
        </p>
      </div>
    `,
  });
};

// ── Run every night at 00:00 ───────────────────────────────
export const startAttendanceCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running nightly low-attendance check…');

    try {
      const lowStudents = await Student.find({ 'attendance.percentage': { $lt: 75 } })
        .populate('user', 'email')
        .lean();

      let notified = 0;
      for (const student of lowStudents) {
        const email = (student.user as any)?.email;
        if (email && process.env.SMTP_USER) {
          await sendLowAttendanceEmail(email, student.name, student.attendance.percentage);
          notified++;
        }
      }

      console.log(`[Cron] Notified ${notified} students with low attendance.`);
    } catch (err) {
      console.error('[Cron] Attendance check failed:', err);
    }
  });

  console.log('[Cron] Nightly attendance check scheduled (00:00 daily).');
};
