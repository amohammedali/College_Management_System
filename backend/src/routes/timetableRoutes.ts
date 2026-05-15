import express, { Request, Response } from 'express';
import TimetableSlot from '../models/TimetableSlot.js';
import Room from '../models/Room.js';
import Staff from '../models/Staff.js';
import Subject from '../models/Subject.js';
import Department from '../models/Department.js';
import { protect, authorize } from '../middlewares/auth.js';
import puppeteer from 'puppeteer';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

// @route   GET /api/timetable
// @desc    Get full weekly grid for a section
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { dept_id, section, academic_year, semester, regulation_year } = req.query;
    
    const query: any = { dept_id };
    if (section) query.section = section;
    if (academic_year) query.academic_year = Number(academic_year);
    if (semester) query.semester = Number(semester);
    if (regulation_year) query.regulation_year = Number(regulation_year);

    const slots = await TimetableSlot.find(query)
    .populate('subject_id', 'name code')
    .populate('faculty_ids', 'name staffId')
    .populate('room_id', 'name type block');

    res.json(slots);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/timetable/slot
// @desc    Assign a subject/faculty/room to a slot with clash detection
router.post('/slot', protect, authorize('admin', 'staff'), async (req: AuthRequest, res: Response) => {

  try {
    const { 
      dept_id, section, academic_year, semester, day, period, 
      subject_id, faculty_ids, room_id, 
      regulation_year 
    } = req.body;

    // ── Staff Role Check (Counselor Validation) ──────────────
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user._id });
      if (!staff || !staff.assignedYear || !staff.assignedSection) {
        return res.status(403).json({ message: 'Unauthorized: You are not a designated Class Counselor' });
      }

      const dept = await Department.findById(dept_id);
      if (!staff || !dept || dept.name.toLowerCase() !== staff.department.toLowerCase() || section !== staff.assignedSection) {
        return res.status(403).json({ message: `Unauthorized: You are the counselor for Section ${staff.assignedSection} in ${staff.department}, but tried to modify Section ${section} in ${dept?.name}` });
      }
    }


    const subject = await Subject.findById(subject_id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const isLab = subject.type === 'Lab/Practical';
    const affectedPeriods = isLab ? [period, period + 1] : [period];

    if (isLab && period === 8) {
      return res.status(400).json({ message: 'Lab sessions require 2 consecutive periods. Cannot start at P8.' });
    }

    for (const p of affectedPeriods) {
      // 1. Check Faculty Clash for ALL instructors
      for (const fId of (faculty_ids || [])) {
        const facultyClash = await TimetableSlot.findOne({ faculty_ids: fId, day, period: p })
          .populate('dept_id', 'name')
          .populate('subject_id', 'name code');
        
        if (facultyClash) {
          const facultyObj = await Staff.findById(fId);
          return res.status(409).json({ 
            type: 'faculty',
            message: `${facultyObj?.name || 'Faculty'} is already assigned to ${facultyClash.subject_id?.name} (${(facultyClash.dept_id as any).name} - ${facultyClash.section}) at P${p}.`,
            conflictWith: facultyClash,
            day,
            period: p
          });
        }
      }

      // 2. Check Room Clash
      const roomClash = await TimetableSlot.findOne({ room_id, day, period: p })
        .populate('dept_id', 'name');
      
      if (roomClash) {
        return res.status(409).json({ 
          type: 'room',
          message: `Room is already occupied by ${(roomClash.dept_id as any).name} - ${roomClash.section} at P${p}.`,
          conflictWith: roomClash,
          day,
          period: p
        });
      }

      // 3. Section Clash (Enforced by DB index)
      const sectionClash = await TimetableSlot.findOne({ dept_id, section, academic_year, semester, day, period: p, regulation_year })
        .populate('subject_id', 'name');
      
      // If we are updating an existing slot, sectionClash might be the current record itself
      // But findOneAndUpdate handles this. For the check, we just want to avoid 409 if it's the same record.
      // However, for the second period of a lab, it's definitely a clash if not empty.
    }

    // Atomic Upsert for primary period
    const slot = await TimetableSlot.findOneAndUpdate(
      { dept_id, section, academic_year, semester, day, period, regulation_year },
      { subject_id, faculty_ids, room_id },
      { upsert: true, new: true }
    );

    // If Lab, also upsert the next period
    if (isLab) {
      await TimetableSlot.findOneAndUpdate(
        { dept_id, section, academic_year, semester, day, period: period + 1, regulation_year },
        { subject_id, faculty_ids, room_id },
        { upsert: true }
      );
    }

    res.status(201).json(slot);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ 
        type: 'section', 
        message: 'This section already has a class assigned to this slot.', 
        day: req.body.day, 
        period: req.body.period 
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/timetable/audit
// @desc    Get audit trail for a section
router.get('/audit', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { dept_id, section, academic_year, semester, regulation_year } = req.query;
    const slots = await TimetableSlot.find({ dept_id, section, academic_year, semester, regulation_year })
      .populate('auditLog.user', 'name role')
      .select('day period subject_id auditLog')
      .populate('subject_id', 'name code')
      .lean();
    
    // Flatten and sort audit logs
    const auditTrail = slots.flatMap(s => s.auditLog.map(log => ({
      ...log,
      slot: `P${s.period} ${s.day}`,
      subject: s.subject_id?.name
    }))).sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());

    res.json(auditTrail);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/timetable/slot/:id
// @desc    Clear a specific slot
router.delete('/slot/:id', protect, authorize('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const slot = await TimetableSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    // ── Staff Role Check (Counselor Validation) ──────────────
    if (req.user.role === 'staff') {
      const staff = await Staff.findOne({ user: req.user._id });
      const dept = await Department.findById(slot.dept_id);
      const yearNum = parseInt(staff?.assignedYear?.match(/\d+/) ? staff.assignedYear.match(/\d+/)[0] : '0');

      if (!staff || !dept || 
          dept.name.toLowerCase() !== staff.department.toLowerCase() || 
          slot.academic_year !== yearNum || 
          slot.section !== staff.assignedSection) {
        return res.status(403).json({ message: 'Unauthorized: You can only clear slots for your assigned class' });
      }
    }

    await TimetableSlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slot cleared successfully' });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/rooms/available
// @desc    Get rooms not booked for a specific day/period
router.get('/rooms/available', protect, async (req: Request, res: Response) => {
  try {
    const { day, period } = req.query;
    
    const occupiedRoomIds = await TimetableSlot.find({ day, period }).distinct('room_id');
    const availableRooms = await Room.find({ _id: { $nin: occupiedRoomIds } });
    
    res.json(availableRooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/faculty/available
// @desc    Get faculty free for a specific day/period
router.get('/faculty/available', protect, async (req: Request, res: Response) => {
  try {
    const { day, period } = req.query;
    
    const occupiedSlots = await TimetableSlot.find({ day, period })
      .populate('dept_id', 'name')
      .populate('subject_id', 'name')
      .populate('faculty_ids', '_id');
    
    const occupiedFacultyIds = occupiedSlots.flatMap(s => s.faculty_ids.map(f => f._id.toString()));
    
    const allFaculty = await Staff.find({ type: 'teaching' })
      .select('name staffId department');
    
    const results = allFaculty.map(f => {
      const isOccupied = occupiedFacultyIds.includes(f._id.toString());
      const slot = isOccupied ? occupiedSlots.find(s => s.faculty_ids.some(fid => fid._id.toString() === f._id.toString())) : null;
      
      return {
        ...f.toObject(),
        isAvailable: !isOccupied,
        occupiedBy: slot ? {
          dept: (slot.dept_id as any).name,
          section: slot.section,
          subject: (slot.subject_id as any).name
        } : null
      };
    });
    
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/timetable/clone
// @desc    Clone a timetable from one regulation to another
router.post('/clone', protect, authorize('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { dept_id, section, from_regulation, to_regulation } = req.body;

    const sourceSlots = await TimetableSlot.find({ dept_id, section, regulation_year: from_regulation });
    
    if (sourceSlots.length === 0) {
      return res.status(404).json({ message: 'No source slots found to clone' });
    }

    // Delete existing slots for target regulation to avoid conflicts
    await TimetableSlot.deleteMany({ dept_id, section, regulation_year: to_regulation });

    const newSlots = sourceSlots.map(slot => ({
      dept_id: slot.dept_id,
      section: slot.section,
      day: slot.day,
      period: slot.period,
      subject_id: slot.subject_id,
      faculty_ids: (slot as any).faculty_ids || [(slot as any).faculty_id],
      room_id: slot.room_id,
      regulation_year: to_regulation,
      auditLog: [{
        action: 'CREATE',
        user: req.user._id,
        details: `Cloned from R${from_regulation}`
      }]
    }));

    await TimetableSlot.insertMany(newSlots);
    res.json({ message: `Successfully cloned ${newSlots.length} slots to R${to_regulation}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/timetable/faculty/:id
// @desc    Get complete weekly schedule for a faculty member
router.get('/faculty/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    let facultyId = req.params.id;

    // If 'me' is passed, find the staff ID for the current user
    if (facultyId === 'me') {
      const staff = await Staff.findOne({ user: req.user?._id });
      if (!staff) return res.status(404).json({ message: 'Staff profile not found' });
      facultyId = staff._id.toString();
    }

    const slots = await TimetableSlot.find({ faculty_ids: facultyId })
      .populate('dept_id', 'name')
      .populate('subject_id', 'name code')
      .populate('faculty_ids', 'name staffId')
      .populate('room_id', 'name block')
      .lean();
    res.json(slots);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/timetable/room/:id
// @desc    Get complete weekly schedule for a specific room
router.get('/room/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const slots = await TimetableSlot.find({ room_id: req.params.id })
      .populate('dept_id', 'name')
      .populate('subject_id', 'name code')
      .populate('faculty_ids', 'name staffId')
      .lean();
    res.json(slots);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/timetable/pdf
// @desc    Generate a stamped PDF of a section timetable
router.get('/pdf', protect, async (req: Request, res: Response) => {
  try {
    const { dept_id, section, academic_year, semester, regulation_year } = req.query;
    console.log('[DEBUG] PDF Generation Request:', { dept_id, section, academic_year, semester, regulation_year });
    
    if (!dept_id) throw new Error('dept_id is required');

    const dept = await Department.findById(dept_id);
    console.log('[DEBUG] Department Found:', dept?.name);

    const ay = Number(academic_year);
    const sem = Number(semester);
    const reg = Number(regulation_year);

    if (isNaN(ay) || isNaN(sem) || isNaN(reg)) {
      throw new Error(`Invalid parameters: Year(${academic_year}), Sem(${semester}), Reg(${regulation_year})`);
    }

    const query = { 
      dept_id, 
      section, 
      academic_year: ay, 
      semester: sem, 
      regulation_year: reg 
    };
    console.log('[DEBUG] Timetable Query:', query);

    const slots = await TimetableSlot.find(query)
      .populate('subject_id', 'name code')
      .populate('faculty_ids', 'name')
      .populate('room_id', 'name')
      .lean();
    
    console.log('[DEBUG] Slots Found:', slots.length);
    // Group slots by day/period for rendering
    const grid: any = {};
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
      grid[d] = {};
      [1,2,3,4,5,6,7,8].forEach(p => grid[d][p] = null);
    });
    slots.forEach(s => grid[s.day][s.period] = s);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; color: #333; line-height: 1.2; -webkit-print-color-adjust: exact; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #1a237e; padding-bottom: 10px; }
            .header h1 { margin: 0; color: #1a237e; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .header p { margin: 2px 0 0; font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .meta { display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; margin-bottom: 15px; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e0e0e0; }
            table { width: 100%; border-collapse: separate; border-spacing: 2px; margin-top: 5px; table-layout: fixed; }
            th, td { border: 1px solid #dee2e6; padding: 8px 4px; text-align: center; border-radius: 4px; }
            th { background: #1a237e; color: white; text-transform: uppercase; font-size: 10px; height: 35px; letter-spacing: 1px; }
            td { height: 75px; vertical-align: middle; background: white; transition: background 0.3s; }
            .subject-code { font-weight: 800; color: #1a237e; display: block; font-size: 10px; margin-bottom: 3px; }
            .subject-name { font-weight: 700; color: #333; font-size: 9px; line-height: 1.1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .faculty { color: #555; font-style: italic; margin-top: 5px; display: block; font-size: 8px; font-weight: 600; }
            .room { font-size: 7.5px; color: #777; margin-top: 4px; display: block; font-weight: 800; }
            .break { color: #dee2e6; font-style: italic; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; border-top: 1px solid #eee; pt: 15px; }
            .stamp { width: 100px; height: 100px; border: 3px dashed #d32f2f; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-align: center; color: #d32f2f; font-size: 9px; transform: rotate(-15deg); opacity: 0.6; position: absolute; right: 100px; bottom: 80px; font-weight: 900; }
            .sig-line { border-top: 1px solid #333; width: 150px; margin-top: 40px; text-align: center; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Official Academic Timetable</h1>
            <p>Institutional Registry • Master Scheduling System</p>
          </div>
          <div class="meta">
            <span>DEPARTMENT: ${dept?.name || 'N/A'}</span>
            <span>YEAR: ${ay} | SEMESTER: ${sem}</span>
            <span>SECTION: ${section}</span>
            <span>REGULATION: ${reg}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 70px;">DAY / HOUR</th>
                ${[1,2,3,4,5,6,7,8].map(p => `<th>PERIOD ${p}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `
                <tr>
                  <td style="font-weight: 900; background: #f1f3f5; color: #1a237e; font-size: 11px;">${d.toUpperCase()}</td>
                  ${[1,2,3,4,5,6,7,8].map(p => {
                    const s: any = grid[d][p];
                    return `<td>
                      ${s ? `
                        <span class="subject-code">${s.subject_id?.code || 'N/A'}</span>
                        <span class="subject-name">${s.subject_id?.name || 'Unknown'}</span>
                        <span class="faculty">${(s.faculty_ids || []).map((f: any) => f?.name || 'Staff').join(' & ')}</span>
                        <span class="room">RM: ${s.room_id?.name || 'N/A'}</span>
                      ` : '<span class="break">FREE</span>'}
                    </td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="stamp">OFFICIAL<br>REGISTRY<br>APPROVED</div>
          <div class="footer">
            <div class="sig-section">
               <div class="sig-line">Class Counselor</div>
               <div style="font-size: 8px; margin-top: 5px;">Date: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="sig-section">
               <div class="sig-line">Head of Department</div>
            </div>
            <div class="sig-section">
               <div class="sig-line">Principal</div>
            </div>
          </div>
        </body>
      </html>
    `;

    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        scale: 0.95
      });

      await browser.close();
      res.contentType("application/pdf");
      res.send(pdf);

    } catch (error: any) {
      if (browser) await browser.close();
      console.error('[CRITICAL] PDF Generation Failure:', error);
      res.status(500).json({ message: `PDF Generation Failed: ${error.message}` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/timetable/departments
// @desc    Get all departments for selection (Shared)
router.get('/departments', protect, async (_req, res) => {
  try {
    const departments = await Department.find().select('name code').lean();
    res.json(departments);
  } catch (error: any) {
    console.error('[ERROR] PDF Generation Failed:', error);
    res.status(500).json({ message: error.message });
  }
});

// ── Faculty Profile PDF (Shared) ──────────────────
router.get('/pdf/:id', protect, async (req: AuthRequest, res) => {
  try {
    const staff = await Staff.findById(req.params.id).lean();
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 4px solid #4f46e5; padding-bottom: 20px; margin-bottom: 40px; }
            .name { font-size: 32px; font-weight: 900; color: #1e1b4b; margin: 0; }
            .id { font-size: 14px; font-weight: 800; color: #6366f1; letter-spacing: 2px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
            .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 10px; }
            .info-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .label { font-weight: 800; font-size: 11px; color: #64748b; }
            .value { font-weight: 600; font-size: 14px; color: #0f172a; margin-top: 4px; }
            .subjects { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .tag { background: #e2e8f0; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; color: #475569; }
            .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="name">${staff.name}</h1>
            <p class="id">${staff.designation} • ${staff.staffId}</p>
          </div>
          
          <div class="grid">
            <div class="info-box">
              <p class="section-title">Academic Profile</p>
              <div>
                <p class="label">Qualification</p>
                <p class="value">${staff.qualification}</p>
              </div>
              <div style="margin-top: 20px;">
                <p class="label">Experience</p>
                <p class="value">${staff.experience} Years in Academic Excellence</p>
              </div>
            </div>
            
            <div class="info-box">
              <p class="section-title">Department Focus</p>
              <div>
                <p class="label">Primary Department</p>
                <p class="value">${staff.department}</p>
              </div>
              <div style="margin-top: 20px;">
                <p class="label">Specialization</p>
                <p class="value">${staff.specialization || 'General Research'}</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px;" class="info-box">
            <p class="section-title">Active Curriculum Subjects</p>
            <div class="subjects">
              ${(staff.subjects || []).map((s: string) => `<span class="tag">${s}</span>`).join('')}
            </div>
          </div>

          <div class="footer">
            <p>Generated by EduCMS Institutional Dashboard • Official Personnel Record</p>
            <p>Verification Token: ${staff._id}</p>
          </div>
        </body>
      </html>
    `;

    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.contentType("application/pdf");
    res.send(pdf);
  } catch (error: any) {
    console.error('[ERROR] Faculty PDF Generation Failed:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;