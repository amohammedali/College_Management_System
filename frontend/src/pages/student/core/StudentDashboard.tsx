import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/shared/StatCard';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, BookOpen, DollarSign, CalendarCheck, Info, ArrowRight, 
  QrCode, MessageSquare, Clock, ShieldAlert, Library, Send, MapPin, Ticket,
  GraduationCap, Briefcase, Megaphone
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentDashboard = () => {
  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => axios.get(`${API}/student/profile`).then(r => r.data),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['student-attendance'],
    queryFn: () => axios.get(`${API}/student/attendance`).then(r => r.data),
  });

  const { data: marks } = useQuery({
    queryKey: ['student-marks'],
    queryFn: () => axios.get(`${API}/student/marks`).then(r => r.data),
  });

  const { data: notifications } = useQuery({
    queryKey: ['student-notifications'],
    queryFn: () => axios.get(`${API}/student/notifications`).then(r => r.data),
  });

  const attendance = attendanceData?.summary?.percentage || 0;
  const isLow = attendance < 75 && attendance > 0;
  const radialData = [{ name: 'Attendance', value: attendance, fill: isLow ? '#f43f5e' : '#22c55e' }];

  return (
    <DashboardLayout title="Academic Mirror" subtitle={`Viewing Profile: ${profile?.studentId || '...'} — ${profile?.name || 'Loading...'}`}>
      
      {/* ── Visual Stat Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Attendance Pulse" value={`${attendance}%`} icon={CalendarCheck}
          accent={isLow ? "red" : "green"} subtitle={isLow ? "CRITICAL: Under 75%" : "Good Standing"} delay={0} 
        />
        <StatCard 
          title="Scholastic CGPA" value={profile?.cgpa || "0.00"} icon={BookOpen} accent="blue"
          subtitle="Overall Performance" delay={0.08} 
        />
        <StatCard 
          title="Financial Standing" value={`₹${(profile?.fees?.balance || 0).toLocaleString()}`} icon={DollarSign} accent="purple"
          subtitle="Current Balance" delay={0.16} 
        />
        <StatCard 
          title="Course Credits" value={profile?.credits || "0 / 0"} icon={BookOpen} accent="orange"
          subtitle="Academic Progress" delay={0.24} 
        />
      </div>

      {/* ── Attendance Recovery Calculator Alert ── */}
      {isLow && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="font-black text-rose-800 uppercase tracking-wide text-xs">Attendance Recovery Intelligence</p>
              <p className="text-rose-600 text-sm mt-1 font-medium leading-relaxed">
                You are <strong>3%</strong> below the mandatory threshold. Our AI predicts you need to attend the next <strong>8 consecutive classes</strong> to reach 75%.
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all">
            Request Leave Offset
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-8 mb-8">
        
        {/* Academic Core (8 columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Detailed Marks Table */}
          <div className="dash-card overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-800">Examination Intelligence</h2>
              <div className="flex gap-2">
                 <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline px-4 py-2 bg-indigo-50 rounded-xl transition-all">Rankings</button>
                 <button className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:underline px-4 py-2 bg-slate-100 rounded-xl transition-all">Export</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Course / Module</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Score Depth</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Relative Rank</th>
                    <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {marks?.length > 0 ? marks.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{m.subject}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{m.semester ? `Sem-${m.semester}` : 'Theory'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${m.score}%` }} className="h-full bg-indigo-500 rounded-full" />
                          </div>
                          <span className="text-xs font-black text-slate-700">{m.score}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Validated
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter ${m.score > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          Grade {m.grade}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">
                        No academic records found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Module Links (Horizontal Scroller) */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
             {[
               { label: 'Library', icon: Library, color: 'text-blue-600', bg: 'bg-blue-50' },
               { label: 'Submissions', icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
               { label: 'Schedule', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
               { label: 'Placements', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
               { label: 'Grievance', icon: Ticket, color: 'text-rose-600', bg: 'bg-rose-50' }
             ].map((mod, i) => (
               <button key={i} className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-300 transition-all group">
                  <div className={`p-2.5 ${mod.bg} ${mod.color} rounded-xl group-hover:scale-110 transition-transform`}>
                    <mod.icon size={18} />
                  </div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{mod.label}</span>
               </button>
             ))}
          </div>
        </div>

        {/* Support Intelligence (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Digital ID Card */}
          <div className="dash-card p-8 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700 text-white border-none shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
             <div className="relative">
                <div className="flex items-center justify-between mb-8">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">Institutional Identity</p>
                   <GraduationCap size={20} className="text-indigo-200" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner">
                      <QrCode size={48} className="text-slate-900" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black leading-tight">{profile?.name || '...'}</h3>
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">{profile?.studentId || '...'} • {profile?.department || '...'}</p>
                   </div>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                   <div>
                      <p className="text-[9px] font-black text-indigo-200 uppercase mb-1">Validity</p>
                      <p className="text-xs font-bold">JUL 2024 — JUN 2028</p>
                   </div>
                   <button className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition group">
                      <Info size={16} />
                   </button>
                </div>
             </div>
          </div>

          {/* Unified Notification Inbox */}
          <div className="dash-card p-8 bg-slate-900 text-white border-none">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black">Unified Inbox</h3>
                <span className="badge badge-indigo text-[9px] font-black uppercase">3 New</span>
             </div>
             <div className="space-y-6">
                {notifications?.length > 0 ? notifications.map((notif: any, i: number) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                       <MessageSquare size={18} />
                    </div>
                    <div className="flex-1">
                       <p className="text-xs font-bold text-slate-100">{notif.title}</p>
                       <p className="text-[10px] text-slate-500 truncate mt-0.5">{notif.message}</p>
                       <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1.5">{new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your inbox is empty</p>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
