import React, { useMemo } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { 
  Clock, 
  ChevronRight, CheckCircle2,
  Building2, Users, Calendar,
  Sparkles, Info, HardDrive, Printer,
  BookOpen, Layers, RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

const StudentTimetable = () => {
  const { user } = useAuth();
  const [isTransposed, setIsTransposed] = React.useState(true);
  
  // 1. Fetch Student Profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['student-profile', user?._id],
    queryFn: () => axios.get(`${API}/students/profile`).then(r => r.data),
    enabled: !!user?._id
  });

  // 2. Fetch Departments to get ID
  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  const studentDept = useMemo(() => {
    return departments?.find((d: any) => d.name === profile?.department);
  }, [departments, profile]);

  const academicYearNum = profile?.year ? parseInt(profile.year.match(/\d+/) ? profile.year.match(/\d+/)[0] : '1') : 1;
  const regulationYear = 2023; // Default or could be derived from batch

  // 3. Fetch Timetable Slots
  const { data: slots, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['student-timetable', studentDept?._id, profile?.class, academicYearNum, profile?.semester],
    queryFn: () => axios.get(`${API}/timetable?dept_id=${studentDept?._id}&section=${profile?.class}&academic_year=${academicYearNum}&semester=${profile?.semester}&regulation_year=${regulationYear}`).then(r => r.data),
    enabled: !!studentDept?._id && !!profile?.class
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

  if (isProfileLoading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest">Accessing Academic Registry...</div>;

  const today = DAYS[new Date().getDay() - 1] || 'Mon';

  const pTimes: any = {
    1: '08:30 AM', 2: '09:25 AM', 3: '10:40 AM', 4: '11:35 AM', 
    5: '01:15 PM', 6: '02:10 PM', 7: '03:05 PM', 8: '04:00 PM'
  };

  return (
    <DashboardLayout title="Academic Roadmap" subtitle="Personalized Course Schedule & Resource Map">
      <div className="space-y-10 pb-32">
        
        {/* Student Header Card */}
        <div className="relative overflow-hidden rounded-[48px] bg-slate-900 p-12 text-white shadow-2xl shadow-indigo-950/20">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Layers size={300} className="-rotate-12" />
           </div>
           
           <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-[2px]">Student Portal</span>
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[2px]">{profile?.department}</span>
                 </div>
                 <h2 className="text-4xl font-black italic mb-2">Hello, {profile?.name.split(' ')[0]}</h2>
                 <p className="text-slate-400 font-bold flex items-center gap-2 text-sm">
                    <BookOpen size={18} className="text-indigo-400" /> Currently Enrolled: <span className="text-white">{profile?.year} • Section {profile?.class}</span>
                 </p>
              </div>

              <div className="flex flex-wrap gap-4">
                 <button 
                   onClick={() => setIsTransposed(!isTransposed)}
                   className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md flex items-center gap-3 hover:bg-white/10 transition-all"
                 >
                    <RefreshCw size={18} className={isTransposed ? 'rotate-180 transition-transform text-indigo-400' : 'text-slate-400'} />
                    <div className="text-left">
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Transpose</p>
                       <p className="text-[10px] font-bold text-white uppercase">{isTransposed ? 'Days as Rows' : 'Periods as Rows'}</p>
                    </div>
                 </button>
                 <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md text-center min-w-[120px]">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Attendance</p>
                    <p className={`text-xl font-black italic ${profile?.attendance?.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {profile?.attendance?.percentage || 0}%
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
           {/* Daily Focus Sidebar */}
           <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="dash-card p-10 bg-white border border-slate-100 shadow-2xl rounded-[48px]">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Clock size={24} /></div>
                       <h3 className="text-xl font-black text-slate-800 italic">Today's Sessions</h3>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{today}</span>
                 </div>

                 <div className="space-y-4">
                    {PERIODS.map(p => {
                       const slot = grid[today]?.[p];
                       if (!slot) return null;
                       const colorKey = getSubjectColor(slot.subject_id?.code);
                       return (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={p} 
                            className={`p-6 rounded-[32px] border-2 transition-all flex items-center gap-5 ${colorClasses[colorKey]}`}
                          >
                             <div className="text-center min-w-[40px] border-r border-current/10 pr-4">
                                <p className="text-[10px] font-black">P{p}</p>
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase opacity-60 mb-0.5">{slot.subject_id?.code}</p>
                                <p className="text-xs font-black truncate">{slot.subject_id?.name}</p>
                                <p className="text-[8px] font-bold mt-1 opacity-70 flex items-center gap-1.5">
                                   <Users size={10} /> {slot.faculty_ids?.[0]?.name}
                                </p>
                             </div>
                             <div className="text-right">
                                <p className="text-[8px] font-black uppercase tracking-widest">{slot.room_id?.name}</p>
                             </div>
                          </motion.div>
                       );
                    })}
                    {Object.values(grid[today] || {}).every(s => s === null) && (
                       <div className="py-20 text-center space-y-4 opacity-30">
                          <Sparkles size={40} className="mx-auto text-slate-300" />
                          <p className="text-xs font-black uppercase tracking-widest">No Sessions Today</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Resource Access */}
              <div className="dash-card p-10 bg-slate-900 text-white rounded-[48px] relative overflow-hidden">
                 <div className="absolute -bottom-10 -right-10 opacity-10"><Info size={150} /></div>
                 <h4 className="text-xs font-black uppercase tracking-widest mb-6">Academic Support</h4>
                 <div className="space-y-4 relative z-10">
                    <button className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-indigo-600 transition-all">
                       <span className="text-[10px] font-black uppercase">Download Syllabus</span>
                       <HardDrive size={16} className="text-indigo-400 group-hover:text-white" />
                    </button>
                    <button onClick={() => window.print()} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-slate-800 transition-all">
                       <span className="text-[10px] font-black uppercase">Print Schedule</span>
                       <Printer size={16} className="text-slate-500 group-hover:text-white" />
                    </button>
                 </div>
              </div>
           </div>

           {/* Full Matrix View */}
           <div className="col-span-12 lg:col-span-8">
              <div className="dash-card p-0 overflow-hidden bg-white border border-slate-100 shadow-2xl rounded-[48px]">
                 <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 border border-slate-50"><Calendar size={24} /></div>
                       <h3 className="text-xl font-black text-slate-800 italic uppercase">Master Schedule</h3>
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
                                                     <p className="text-[8px] font-black uppercase truncate leading-none mb-1">{slot.faculty_ids?.[0]?.name}</p>
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
                                                     <p className="text-[8px] font-black uppercase truncate leading-none mb-1">{slot.faculty_ids?.[0]?.name}</p>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentTimetable;
