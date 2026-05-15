import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { 
  Calendar, Printer, HardDrive, 
  Search, Users, BookOpen, 
  Info, CheckCircle2, ChevronRight,
  Layers, MapPin, Clock, X,
  GraduationCap, Briefcase, Award,
  Sparkles, ExternalLink, Mail,
  Loader2, RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const getSubjectColor = (code: any) => {
  if (!code || typeof code !== 'string') return 'slate';
  const hash = code.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const colors = ['indigo', 'emerald', 'amber', 'rose', 'violet', 'cyan', 'fuchsia', 'slate'];
  return colors[hash % colors.length];
};

const colorClasses: any = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 shadow-indigo-500/5',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-emerald-500/5',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-600 shadow-amber-500/5',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-600 shadow-rose-500/5',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-600 shadow-violet-500/5',
  cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 shadow-cyan-500/5',
  fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-600 shadow-fuchsia-500/5',
  slate: 'bg-slate-500/10 border-slate-500/20 text-slate-600 shadow-slate-500/5',
};

const SectionTimetableMaster = () => {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('3');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSem, setSelectedSem] = useState(5);
  const [activeReg, setActiveReg] = useState('2023');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [isTransposed, setIsTransposed] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // 1. Fetch Departments (using shared endpoint)
  const { data: departments } = useQuery({
    queryKey: ['timetable-departments'],
    queryFn: () => axios.get(`${API}/timetable/departments`).then(r => r.data),
  });

  const deptObj = useMemo(() => departments?.find((d: any) => d.name === selectedDept), [departments, selectedDept]);

  // 2. Fetch Timetable Slots
  const { data: slots, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['master-timetable', deptObj?._id, selectedSection, selectedYear, selectedSem, activeReg],
    queryFn: () => axios.get(`${API}/timetable?dept_id=${deptObj?._id}&section=${selectedSection}&academic_year=${selectedYear}&semester=${selectedSem}&regulation_year=${activeReg}`).then(r => r.data),
    enabled: !!deptObj?._id
  });

  const grid = useMemo(() => {
    const matrix: any = {};
    DAYS.forEach(day => {
      matrix[day] = {};
      PERIODS.forEach(p => matrix[day][p] = null);
    });
    slots?.forEach((slot: any) => {
      if (matrix[slot.day]) matrix[slot.day][slot.period] = slot;
    });
    return matrix;
  }, [slots]);

  // 3. Extract Unique Subject Mapping
  const facultyMapping = useMemo(() => {
    if (!slots) return [];
    const map = new Map();
    slots.forEach((s: any) => {
      const key = s.subject_id?._id;
      if (!map.has(key)) {
        map.set(key, {
          code: s.subject_id?.code,
          name: s.subject_id?.name,
          faculty: s.faculty_ids?.[0]?.name,
          staffId: s.faculty_ids?.[0]?.staffId,
          facultyId: s.faculty_ids?.[0]?._id
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [slots]);

  // 4. Fetch Selected Faculty Profile
  const { data: facultyProfile, isLoading: isFacultyLoading } = useQuery({
    queryKey: ['faculty-public-profile', selectedFacultyId],
    queryFn: () => axios.get(`${API}/staff/public/${selectedFacultyId}`).then(r => r.data),
    enabled: !!selectedFacultyId
  });

  const handleDownload = async (url: string, filename: string) => {
    try {
      setIsDownloading(true);
      const response = await axios.get(url, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast.success('PDF Generated Successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to generate PDF';
      toast.error(msg);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DashboardLayout title="Class Timetable Master" subtitle="Finalized Institutional Schedule & Faculty Allocation Registry">
      <div className="space-y-10 pb-32">
        
        {/* Filters Header */}
        <div className="bg-indigo-950 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden no-print">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Layers size={200} className="-rotate-12" />
           </div>
           
           <div className="grid grid-cols-12 gap-6 relative z-10">
              <div className="col-span-12 lg:col-span-3 space-y-2">
                 <label className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-300">Department</label>
                 <div className="relative">
                    <select 
                      value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none cursor-pointer"
                    >
                       <option value="" className="bg-slate-900">-- Select Dept --</option>
                       {departments?.map((d: any) => <option key={d._id} value={d.name} className="bg-slate-900">{d.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-indigo-400" size={16} />
                 </div>
              </div>

              <div className="col-span-12 lg:col-span-9 grid grid-cols-4 gap-4">
                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-300">Academic Year</label>
                    <select 
                      value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none cursor-pointer"
                    >
                       <option value="1" className="bg-slate-900">1st Year</option>
                       <option value="2" className="bg-slate-900">2nd Year</option>
                       <option value="3" className="bg-slate-900">3rd Year</option>
                       <option value="4" className="bg-slate-900">4th Year</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-300">Section</label>
                    <select 
                      value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none cursor-pointer"
                    >
                       <option value="A" className="bg-slate-900">Section A</option>
                       <option value="B" className="bg-slate-900">Section B</option>
                       <option value="C" className="bg-slate-900">Section C</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-300">Semester</label>
                    <select 
                      value={selectedSem} onChange={e => setSelectedSem(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none cursor-pointer"
                    >
                       {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-slate-900">Semester {s}</option>)}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-300">Regulation</label>
                    <select 
                      value={activeReg} onChange={e => setActiveReg(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm font-bold outline-none appearance-none cursor-pointer"
                    >
                       <option value="2023" className="bg-slate-900">R2023</option>
                       <option value="2021" className="bg-slate-900">R2021</option>
                    </select>
                 </div>
              </div>
           </div>
        </div>

        {!selectedDept ? (
           <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[48px] border-2 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/10"><Search size={48} /></div>
              <h3 className="text-3xl font-black text-slate-800 italic">Select Department</h3>
              <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-xs">Awaiting data fetch parameters</p>
           </div>
        ) : (
           <div className="grid grid-cols-12 gap-8">
              {/* Main Grid */}
              <div className="col-span-12 xl:col-span-8 space-y-8">
                 <div className="dash-card p-0 overflow-hidden bg-white border border-slate-100 shadow-2xl rounded-[48px]">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 border border-slate-50"><Calendar size={24} /></div>
                          <div>
                             <h3 className="text-xl font-black text-slate-800 italic leading-none">{selectedDept}</h3>
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Year {selectedYear} • Section {selectedSection} • Sem {selectedSem}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 no-print">
                          <button 
                            onClick={() => setIsTransposed(!isTransposed)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest border ${isTransposed ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'}`}
                          >
                             <RefreshCw size={14} className={isTransposed ? 'rotate-180 transition-transform' : ''} /> Transpose View
                          </button>
                          <button 
                            disabled={isDownloading}
                            onClick={() => handleDownload(
                              `${API}/timetable/pdf?dept_id=${deptObj?._id}&section=${selectedSection}&academic_year=${selectedYear}&semester=${selectedSem}&regulation_year=${activeReg}`,
                              `Timetable_${selectedDept}_Sec${selectedSection}.pdf`
                            )}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all text-[9px] font-black uppercase tracking-widest"
                          >
                             {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <HardDrive size={14} />} Official PDF
                          </button>
                          <button onClick={() => window.print()} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:text-indigo-600 transition-all"><Printer size={16} /></button>
                       </div>
                    </div>

                    <div className="overflow-x-auto p-4">
                       <table className="w-full border-separate border-spacing-1.5">
                          <thead>
                             {isTransposed ? (
                               <tr>
                                  <th className="p-4 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest w-20 italic">Day</th>
                                  {PERIODS.map(p => (
                                     <th key={p} className="p-4 bg-slate-50 rounded-xl text-[9px] font-black text-slate-800 uppercase tracking-widest">P{p}</th>
                                  ))}
                               </tr>
                             ) : (
                               <tr>
                                  <th className="p-4 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest w-20 italic">Hour</th>
                                  {DAYS.map(day => (
                                     <th key={day} className="p-4 bg-slate-50 rounded-xl text-[9px] font-black text-slate-800 uppercase tracking-widest">{day}</th>
                                  ))}
                               </tr>
                             )}
                          </thead>
                          <tbody>
                             {isTransposed ? (
                                DAYS.map(day => (
                                   <tr key={day}>
                                      <td className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                                         <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{day}</span>
                                      </td>
                                      {PERIODS.map(p => {
                                         const slot = grid[day][p];
                                         const colorKey = slot ? getSubjectColor(slot.subject_id?.code) : 'slate';
                                         return (
                                            <td key={p} className="min-w-[130px] h-32">
                                               {slot ? (
                                                  <div className={`w-full h-full p-4 rounded-[28px] border-2 flex flex-col justify-between ${colorClasses[colorKey]}`}>
                                                     <div>
                                                        <p className="text-[7px] font-black uppercase opacity-60 mb-0.5">{slot.subject_id?.code}</p>
                                                        <h6 className="text-[9px] font-black leading-tight line-clamp-1">{slot.subject_id?.name}</h6>
                                                     </div>
                                                     <div className="mt-auto pt-2 border-t border-current/10">
                                                        <p className="text-[8px] font-black uppercase truncate leading-none mb-1 cursor-pointer hover:text-indigo-600 transition-colors" 
                                                           onClick={() => setSelectedFacultyId(slot.faculty_ids?.[0]?._id)}>
                                                           {slot.faculty_ids?.[0]?.name}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                           <span className="text-[7px] font-bold opacity-60 uppercase tracking-widest">{slot.room_id?.name}</span>
                                                           <CheckCircle2 size={10} className="opacity-40" />
                                                        </div>
                                                     </div>
                                                  </div>
                                               ) : (
                                                  <div className="w-full h-full rounded-[28px] border border-dashed border-slate-100 flex items-center justify-center opacity-40">
                                                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Free</span>
                                                  </div>
                                               )}
                                            </td>
                                         );
                                      })}
                                   </tr>
                                ))
                             ) : (
                                PERIODS.map(p => (
                                   <tr key={p}>
                                      <td className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
                                         <span className="text-[10px] font-black text-slate-800">P{p}</span>
                                      </td>
                                      {DAYS.map(day => {
                                         const slot = grid[day][p];
                                         const colorKey = slot ? getSubjectColor(slot.subject_id?.code) : 'slate';
                                         return (
                                            <td key={day} className="min-w-[130px] h-32">
                                               {slot ? (
                                                  <div className={`w-full h-full p-4 rounded-[28px] border-2 flex flex-col justify-between ${colorClasses[colorKey]}`}>
                                                     <div>
                                                        <p className="text-[7px] font-black uppercase opacity-60 mb-0.5">{slot.subject_id?.code}</p>
                                                        <h6 className="text-[9px] font-black leading-tight line-clamp-1">{slot.subject_id?.name}</h6>
                                                     </div>
                                                     <div className="mt-auto pt-2 border-t border-current/10">
                                                        <p className="text-[8px] font-black uppercase truncate leading-none mb-1 cursor-pointer hover:text-indigo-600 transition-colors" 
                                                           onClick={() => setSelectedFacultyId(slot.faculty_ids?.[0]?._id)}>
                                                           {slot.faculty_ids?.[0]?.name}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                           <span className="text-[7px] font-bold opacity-60 uppercase tracking-widest">{slot.room_id?.name}</span>
                                                           <CheckCircle2 size={10} className="opacity-40" />
                                                        </div>
                                                     </div>
                                                  </div>
                                               ) : (
                                                  <div className="w-full h-full rounded-[28px] border border-dashed border-slate-100 flex items-center justify-center opacity-40">
                                                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Free</span>
                                                  </div>
                                               )}
                                            </td>
                                         );
                                      })}
                                   </tr>
                                ))
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>

              {/* Faculty Summary Table */}
              <div className="col-span-12 xl:col-span-4 space-y-8">
                 <div className="dash-card p-10 bg-slate-50 border border-slate-100 shadow-2xl rounded-[48px]">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm"><Users size={24} /></div>
                       <div>
                          <h3 className="text-xl font-black text-slate-800 italic leading-none">Faculty Registry</h3>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Class Assignment Summary</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       {facultyMapping.map((m: any, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedFacultyId(m.facultyId)}
                            className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center gap-5 group hover:border-indigo-400 cursor-pointer transition-all shadow-sm"
                          >
                             <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {m.code.substring(0, 2)}
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-black uppercase text-slate-400 mb-0.5">{m.code}</p>
                                <p className="text-[10px] font-black text-slate-800 truncate mb-1">{m.name}</p>
                                <p className="text-[9px] font-bold text-indigo-600 flex items-center gap-1.5 uppercase italic">
                                   <Users size={12} className="text-indigo-400" /> {m.faculty}
                                </p>
                             </div>
                             <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                                {m.staffId}
                             </div>
                          </div>
                       ))}
                       {facultyMapping.length === 0 && (
                          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[40px]">
                             <BookOpen className="mx-auto text-slate-200 mb-4" size={32} />
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No subjects assigned yet</p>
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="p-10 bg-indigo-950 text-white rounded-[48px] relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-10 opacity-10"><CheckCircle2 size={120} className="rotate-12" /></div>
                    <div className="relative z-10">
                       <h4 className="text-lg font-black italic mb-4">Official Verification</h4>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 italic">
                          "This table represents the institutional master schedule. All resource allocations have been verified for zero-conflict integrity."
                       </p>
                       <div className="flex items-center gap-4">
                          <div className="flex -space-x-3">
                             {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-950 bg-slate-800" />)}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Verified by Board</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Faculty Profile Modal */}
      <AnimatePresence>
         {selectedFacultyId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-12">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedFacultyId(null)}
                 className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
               />
               
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-2xl bg-white rounded-[48px] overflow-hidden shadow-2xl"
               >
                  {isFacultyLoading ? (
                     <div className="p-32 text-center animate-pulse">
                        <Sparkles className="mx-auto text-indigo-200 mb-6" size={48} />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-[4px]">Accessing Personnel Registry...</p>
                     </div>
                  ) : facultyProfile ? (
                     <div className="flex flex-col">
                        {/* Profile Header */}
                        <div className="relative h-48 bg-slate-900 p-10 flex items-end">
                           <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                              <GraduationCap size={200} className="-rotate-12" />
                           </div>
                           <button 
                             onClick={() => setSelectedFacultyId(null)}
                             className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"
                           >
                              <X size={20} />
                           </button>
                           
                           <div className="flex items-center gap-6 relative z-10 translate-y-12">
                              <div className="w-32 h-32 rounded-[32px] bg-indigo-500 border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-black italic">
                                 {facultyProfile.name.charAt(0)}
                              </div>
                              <div className="pb-4">
                                 <h4 className="text-3xl font-black italic text-white leading-tight">{facultyProfile.name}</h4>
                                 <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-[3px] mt-1">{facultyProfile.designation} • {facultyProfile.staffId}</p>
                              </div>
                           </div>
                        </div>

                        {/* Profile Content */}
                        <div className="p-10 pt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-8">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3 text-slate-400">
                                    <GraduationCap size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Academic Credentials</span>
                                 </div>
                                 <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                                    "{facultyProfile.qualification}"
                                 </p>
                              </div>

                              <div className="space-y-4">
                                 <div className="flex items-center gap-3 text-slate-400">
                                    <Briefcase size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Experience & Dept</span>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className="px-5 py-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 font-black text-xs">
                                       {facultyProfile.experience} Years
                                    </div>
                                    <div className="px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 font-black text-xs uppercase">
                                       {facultyProfile.department}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-8">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3 text-slate-400">
                                    <Award size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Specialization</span>
                                 </div>
                                 <p className="text-xs font-bold text-slate-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                    {facultyProfile.specialization || 'General Academic Focus'}
                                 </p>
                              </div>

                              <div className="space-y-4">
                                 <div className="flex items-center gap-3 text-slate-400">
                                    <BookOpen size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Active Curriculum Subjects</span>
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                    {facultyProfile.subjects?.map((s: string, i: number) => (
                                       <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase">{s}</span>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="p-8 bg-slate-50 flex justify-between items-center">
                           <div className="flex items-center gap-3 text-slate-400">
                              <Info size={14} />
                              <span className="text-[9px] font-black uppercase tracking-widest">Institutional ID: {facultyProfile.staffId}</span>
                           </div>
                           <div className="flex gap-3">
                              <button 
                                disabled={isDownloading}
                                onClick={() => handleDownload(
                                  `${API}/timetable/pdf/${selectedFacultyId}`,
                                  `Dossier_${facultyProfile.name.replace(' ', '_')}.pdf`
                                )}
                                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all flex items-center gap-2"
                              >
                                {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <HardDrive size={14} />} Download Dossier
                              </button>
                              <button 
                                onClick={() => window.location.href = `mailto:${facultyProfile.email}`}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                              >
                                Contact Faculty <Mail size={14} />
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="p-20 text-center">
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Record Not Found</p>
                     </div>
                  )}
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SectionTimetableMaster;
