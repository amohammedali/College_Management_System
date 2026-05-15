import React from 'react';
import { 
  Calendar, CheckCircle2, XCircle, Clock, BookOpen, 
  BarChart3, PieChart, Activity, Sparkles, LayoutGrid,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const StudentAttendanceView = () => {
  // Fetch subject-wise stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['my-attendance-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/student/attendance/my-stats');
      return res.data;
    }
  });

  // Fetch session history
  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['my-attendance-history'],
    queryFn: async () => {
      const res = await axios.get('/api/student/attendance/my-history');
      return res.data;
    }
  });

  const overallPct = stats?.overall?.percentage || 0;
  const isDefaulter = overallPct < 75;

  return (
    <DashboardLayout title="Attendance Analytics" subtitle="Real-time Academic Presence Tracking">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 -m-10 p-10 pb-32">
        
        <div className="grid grid-cols-12 gap-10">
            
            {/* ── Top Overview Section ── */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
                {/* 1. Overall Percentage Gauge */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="dash-card p-12 bg-slate-900 text-white border-none relative overflow-hidden group shadow-2xl shadow-slate-900/40"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Activity size={180} /></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-10">Consolidated Presence</h5>
                        
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle 
                                    cx="96" cy="96" r="88" 
                                    className="stroke-white/5 fill-none" 
                                    strokeWidth="12" 
                                />
                                <motion.circle 
                                    cx="96" cy="96" r="88" 
                                    className={`fill-none ${isDefaulter ? 'stroke-rose-500' : 'stroke-emerald-500'}`} 
                                    strokeWidth="12" 
                                    strokeDasharray="552.92"
                                    initial={{ strokeDashoffset: 552.92 }}
                                    animate={{ strokeDashoffset: 552.92 - (552.92 * overallPct) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black italic tracking-tighter">{Math.round(overallPct)}%</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Aggregate</span>
                            </div>
                        </div>

                        <div className="mt-12 flex gap-8">
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total</p>
                                <p className="text-xl font-bold">{stats?.overall?.total || 0}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Present</p>
                                <p className="text-xl font-bold text-emerald-400">{stats?.overall?.present || 0}</p>
                            </div>
                        </div>

                        {isDefaulter && (
                            <div className="mt-10 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                                <AlertCircle size={18} className="text-rose-500" />
                                <span className="text-[10px] font-black uppercase text-rose-400 tracking-widest">Below Required 75% Threshold</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 2. Monthly Trend Shortcut */}
                <div className="dash-card p-10 bg-white border-slate-100 space-y-8">
                    <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Consistency Index</h5>
                        <TrendingUp size={16} className="text-emerald-500" />
                    </div>
                    <div className="flex items-end gap-3 h-24">
                        {[40, 70, 85, 60, 90, 75, 80].map((h, i) => (
                            <motion.div 
                                key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                                className={`flex-1 rounded-t-lg ${h > 75 ? 'bg-emerald-500/20' : 'bg-slate-100'}`} 
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">Weekly Presence Frequency</p>
                </div>
            </div>

            {/* ── Right Side: Subject Breakdown & History ── */}
            <div className="col-span-12 lg:col-span-8 space-y-12">
                
                {/* Subject Breakdown */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
                            <LayoutGrid size={18} className="text-emerald-500" /> Subject-wise Distribution
                        </h4>
                        <div className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {stats?.breakdown?.length || 0} Subjects Tracked
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isStatsLoading ? (
                            [1,2,3,4].map(i => <div key={i} className="skeleton h-32 w-full rounded-[40px]" />)
                        ) : stats?.breakdown?.map((sub: any, i: number) => (
                            <motion.div 
                                key={sub.code} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                className="dash-card p-8 bg-white/80 backdrop-blur-xl border-white hover:border-emerald-200 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h5 className="text-lg font-black italic tracking-tight text-slate-800">{sub.name}</h5>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub.code}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black ${sub.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {sub.percentage}%
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} animate={{ width: `${sub.percentage}%` }}
                                        className={`h-full rounded-full ${sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                    />
                                </div>
                                <div className="flex justify-between mt-4">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{sub.present} / {sub.total} Sessions</span>
                                    <Sparkles size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sub.percentage >= 90 ? 'text-amber-400' : 'text-slate-200'}`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Session History */}
                <div className="space-y-8 pt-6">
                    <div className="flex items-center gap-4 px-4">
                        <div className="w-3 h-8 bg-emerald-500 rounded-full" />
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Trail: Recent Sessions</h4>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md rounded-[48px] border border-slate-100 overflow-hidden">
                        <div className="grid grid-cols-12 p-6 bg-slate-50/50 border-b border-slate-100">
                            <div className="col-span-5 text-[10px] font-black uppercase text-slate-400 px-4">Subject & Instructor</div>
                            <div className="col-span-3 text-[10px] font-black uppercase text-slate-400">Date & Period</div>
                            <div className="col-span-4 text-[10px] font-black uppercase text-slate-400 text-right px-4">Verification Status</div>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {isHistoryLoading ? (
                                [1,2,3].map(i => <div key={i} className="h-20 w-full border-b border-slate-50 animate-pulse bg-white/40" />)
                            ) : history?.map((sess: any) => (
                                <div key={sess._id} className="grid grid-cols-12 p-8 border-b border-slate-50 hover:bg-emerald-50/30 transition-colors items-center">
                                    <div className="col-span-5 px-4">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 italic">{sess.subject.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Prof. {sess.faculty.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <p className="text-xs font-bold text-slate-600">{new Date(sess.date).toLocaleDateString()}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1 italic">Hour {sess.hour}</p>
                                    </div>
                                    <div className="col-span-4 text-right px-4">
                                        <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl ${sess.myStatus === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {sess.myStatus === 'present' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{sess.myStatus}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendanceView;
