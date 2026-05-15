import React, { useMemo } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, Calendar, Info, Clock, Building2, 
  BookOpen, Sparkles, MapPin, ChevronRight,
  Zap, Award, Users
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const FacultyTimetable = () => {
  const { user } = useAuth();
  
  const { data: slots, isLoading } = useQuery({
    queryKey: ['faculty-timetable', user?._id],
    queryFn: () => axios.get(`${API}/timetable/faculty/me`).then(r => r.data),
    enabled: !!user?._id
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

  // Dynamic Color Assignment based on Subject Code
  const getSubjectColor = (code: any) => {
    if (!code || typeof code !== 'string') return 'slate';
    const colors = ['indigo', 'emerald', 'amber', 'rose', 'violet', 'cyan', 'fuchsia'];
    const charSum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
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

  return (
    <DashboardLayout title="Academic Concierge" subtitle="Personal Resource Allocation & Teaching Roadmap">
      <div className="space-y-10 pb-32">
        
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-[48px] bg-slate-900 p-12 text-white shadow-2xl no-print">
           <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Calendar size={240} className="rotate-12" />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full backdrop-blur-md">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-[2px] text-indigo-100">Official Faculty Registry</span>
                 </div>
                 <h2 className="text-5xl font-black italic tracking-tighter leading-none">Personal Grid</h2>
                 <p className="text-slate-400 font-bold flex items-center gap-2 text-sm">
                    <Award size={18} className="text-amber-400" /> Instructor: <span className="text-white">{user?.name}</span>
                 </p>
              </div>
              
              <div className="flex gap-4">
                 <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest backdrop-blur-xl">
                    <Printer size={18} /> Generate PDF
                 </button>
              </div>
           </div>

           <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-white/5">
              {[
                { label: 'Weekly Load', val: `${slots?.length || 0} Periods`, icon: Clock, color: 'text-indigo-400' },
                { label: 'Utilization', val: `${Math.round(((slots?.length || 0) / 48) * 100)}%`, icon: Zap, color: 'text-amber-400' },
                { label: 'Assigned Depts', val: [...new Set(slots?.map((s: any) => s.dept_id?.name))].length || 0, icon: Users, color: 'text-emerald-400' },
                { label: 'Locations', val: [...new Set(slots?.map((s: any) => s.room_id?.name))].length || 0, icon: MapPin, color: 'text-rose-400' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4 group">
                   <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                      <stat.icon size={20} />
                   </div>
                   <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.val}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Timetable Grid */}
        <div className="dash-card p-0 overflow-hidden bg-white/80 backdrop-blur-2xl border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[48px]">
           <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-indigo-600 border border-slate-50">
                    <BookOpen size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 italic tracking-tight">Master Schedule</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mt-1">Cross-Departmental Synchronization</p>
                 </div>
              </div>
           </div>

           <div className="overflow-x-auto p-4">
              <table className="w-full border-separate border-spacing-2">
                 <thead>
                    <tr>
                       <th className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24 italic">Hour</th>
                       {DAYS.map(day => (
                          <th key={day} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-800 uppercase tracking-widest">{day}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody>
                    {PERIODS.map(p => (
                       <tr key={p}>
                          <td className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 text-center flex flex-col justify-center items-center">
                             <span className="text-xs font-black text-slate-800">P{p}</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Session</span>
                          </td>
                          {DAYS.map(day => {
                             const slot = grid[day][p];
                             const colorKey = slot ? getSubjectColor(slot.subject_id?.code) : 'slate';
                             
                             return (
                                <td key={day} className="min-w-[160px] h-36 relative">
                                   <AnimatePresence mode="wait">
                                      {slot ? (
                                         <motion.div 
                                           initial={{ opacity: 0, scale: 0.9 }}
                                           animate={{ opacity: 1, scale: 1 }}
                                           className={`w-full h-full p-5 rounded-3xl border-2 flex flex-col justify-between transition-all group hover:scale-[1.02] hover:shadow-2xl ${colorClasses[colorKey]}`}
                                         >
                                            <div>
                                               <div className="flex justify-between items-start mb-2">
                                                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60 italic">{slot.dept_id?.name}</span>
                                                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                               </div>
                                               <h6 className="text-[11px] font-black leading-tight mb-1">{slot.subject_id?.code}</h6>
                                               <p className="text-[10px] font-bold leading-snug line-clamp-1 opacity-80 mb-1">{slot.subject_id?.name}</p>
                                                <p className="text-[8px] font-black uppercase opacity-60 italic">{slot.faculty_ids?.[0]?.name} ({slot.faculty_ids?.[0]?.staffId})</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-current/10">
                                               <div className="flex items-center gap-1.5">
                                                  <Building2 size={10} className="opacity-40" />
                                                  <span className="text-[9px] font-black uppercase">{slot.room_id?.name}</span>
                                                   <span className="text-[7px] font-bold opacity-60 ml-2">Y{slot.academic_year}S{slot.semester}</span>
                                               </div>
                                               <span className="text-[8px] font-black px-2 py-0.5 bg-white/40 rounded-md uppercase tracking-widest">Sec {slot.section}</span>
                                            </div>
                                         </motion.div>
                                      ) : (
                                         <div className="w-full h-full rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center group hover:bg-slate-50 transition-all cursor-default">
                                            <div className="text-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Free</p>
                                               <div className="h-0.5 w-4 bg-slate-200 mx-auto mt-1 rounded-full" />
                                            </div>
                                         </div>
                                      )}
                                   </AnimatePresence>
                                </td>
                             );
                          })}
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
           <div className="p-8 bg-indigo-900 rounded-[40px] text-white flex items-center gap-6 shadow-2xl shadow-indigo-900/20 overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                 <Info size={120} />
              </div>
              <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md"><Info size={24} className="text-indigo-300" /></div>
              <div>
                 <h4 className="text-lg font-black italic">Conflict Resolution</h4>
                 <p className="text-xs text-indigo-200/70 font-medium leading-relaxed max-w-sm mt-1">
                    Your schedule is cross-verified against student enrollment and room availability. For any discrepancies, please contact the Registry Office.
                 </p>
              </div>
           </div>
           
           <div className="p-8 bg-white border border-slate-100 rounded-[40px] flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 italic font-black">CMS</div>
                 <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Digital Registry</h4>
                    <p className="text-[10px] text-slate-400 font-bold">Version 2.4.0 • Automated Dispatch</p>
                 </div>
              </div>
              <button className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><ChevronRight size={20} /></button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyTimetable;
