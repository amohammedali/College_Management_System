import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Calendar, Users, Search, Filter, Save } from 'lucide-react';

const mockStudents: any[] = [];

const StaffAttendance = () => {
  const [students, setStudents] = useState(mockStudents);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Engineering - Sec A');

  const markAttendance = (id: string, status: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const submitAttendance = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const markedCount = students.filter(s => s.status !== null).length;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <DashboardLayout title="Student Attendance" subtitle="Mark and manage daily attendance for your classes">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left column: Selection & Summary */}
        <div className="xl:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dash-card p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-primary-500" /> Session Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Class</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500"
                >
                  <option>Engineering - Sec A</option>
                  <option>Engineering - Sec B</option>
                  <option>Science - Lab 1</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</label>
                <p className="text-sm font-semibold text-slate-700 mt-1">{today}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="dash-card p-6 bg-primary-600 text-white shadow-lg shadow-primary-600/20">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Users size={16} /> Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] uppercase opacity-70">Present</p>
                <p className="text-xl font-black">{students.filter(s => s.status === 'present').length}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] uppercase opacity-70">Absent</p>
                <p className="text-xl font-black">{students.filter(s => s.status === 'absent').length}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-1.5 opacity-80">
                <span>Progress</span>
                <span>{students.length > 0 ? Math.round((markedCount / students.length) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${students.length > 0 ? (markedCount / students.length) * 100 : 0}%` }} 
                  className="bg-white h-full"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column: Attendance Table */}
        <div className="xl:col-span-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-card overflow-hidden h-full">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 text-sm px-6" onClick={submitAttendance} disabled={saving || markedCount === 0}>
                  {saving ? 'Saving...' : saved ? '✓ Attendance Saved' : <><Save size={16} /> Save Attendance</>}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status Selection</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? students.map((s, i) => (
                    <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={s.id}>
                      <td className="font-mono text-xs text-slate-400">{s.roll}</td>
                      <td className="font-bold text-slate-800">{s.name}</td>
                      <td>
                        <div className="flex gap-2">
                          {(['present', 'absent', 'late'] as const).map(st => {
                            const cfg = {
                              present: { icon: CheckCircle, cls: 'hover:bg-green-50 hover:text-green-600', active: 'bg-green-500 text-white' },
                              absent: { icon: XCircle, cls: 'hover:bg-red-50 hover:text-red-500', active: 'bg-red-500 text-white' },
                              late: { icon: Clock, cls: 'hover:bg-yellow-50 hover:text-yellow-600', active: 'bg-yellow-400 text-white' },
                            }[st];
                            const isActive = s.status === st;
                            return (
                              <button key={st} onClick={() => markAttendance(s.id, st)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition
                                  ${isActive ? cfg.active + ' border-transparent shadow-lg shadow-current/20' : 'border-slate-200 text-slate-400 ' + cfg.cls}`}>
                                <cfg.icon size={14} />
                                <span className="capitalize">{st}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="text-center py-20 text-slate-400 font-medium italic">
                        No students enrolled in this class yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffAttendance;
