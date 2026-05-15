import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, BookOpen, Award, 
  BarChart3, CheckCircle2, AlertCircle, ChevronRight, 
  Filter, Search, Info, Download, Layers, Sparkles,
  PieChart, Target, Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentPerformance = () => {
  const [filterType, setFilterType] = useState('all');

  const { data: marks, isLoading } = useQuery({
    queryKey: ['student-marks'],
    queryFn: () => axios.get(`${API}/student/marks`).then(r => r.data),
  });

  const { data: profile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => axios.get(`${API}/student/profile`).then(r => r.data),
  });

  // Analytics Helpers
  const calculateCGPA = () => {
    if (!marks || marks.length === 0) return 0;
    const semesterMarks = marks.filter((m: any) => m.type === 'Semester');
    if (semesterMarks.length === 0) return 0;
    
    const gradePoints: Record<string, number> = { 'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'F': 0 };
    let totalPoints = 0;
    let totalCredits = 0;

    semesterMarks.forEach((m: any) => {
      const credits = m.subject?.credits || 3;
      totalPoints += (gradePoints[m.grade] || 0) * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const filteredMarks = marks?.filter((m: any) => 
    filterType === 'all' ? true : m.type === filterType
  );

  const getStatusColor = (grade: string) => {
     if (grade === 'S' || grade === 'A') return 'emerald';
     if (grade === 'F') return 'rose';
     return 'indigo';
  };

  return (
    <DashboardLayout title="Academic Performance" subtitle="Real-time Grade Intelligence, CGPA Tracking & Assessment Analytics">
      <div className="max-w-7xl mx-auto pb-32">
        
        {/* Top Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-8 bg-slate-900 text-white border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:rotate-12 transition-transform"><Trophy size={80} /></div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Cumulative GPA</p>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black italic">{calculateCGPA()}</h3>
                    <span className="text-xs font-bold text-emerald-400">/ 10.0</span>
                 </div>
                 <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400">
                    <TrendingUp size={12} /> Top 5% of Batch
                 </div>
              </div>
           </motion.div>

           {[
             { label: 'Credits Earned', value: marks?.filter((m: any) => m.grade !== 'F').reduce((acc: number, curr: any) => acc + (curr.subject?.credits || 0), 0) || 0, icon: Target, color: 'indigo', sub: 'Institutional Target: 160' },
             { label: 'Subjects Cleared', value: marks?.filter((m: any) => m.type === 'Semester' && m.grade !== 'F').length || 0, icon: BookOpen, color: 'purple', sub: 'Across all semesters' },
             { label: 'Academic Standing', value: 'Excellent', icon: Award, color: 'emerald', sub: 'Based on current trend' }
           ].map((stat, i) => (
             <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="dash-card p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                      <stat.icon size={24} />
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-black text-slate-800 italic leading-none">{stat.value}</h3>
                   </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50">
                   <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.sub}</p>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
           {/* Detailed Performance List */}
           <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black text-slate-800">Assessment Ledger</h3>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                       {filteredMarks?.length || 0} Records
                    </div>
                 </div>
                 
                 <div className="flex bg-white rounded-2xl border border-slate-100 p-1">
                    {['all', 'IA-1', 'IA-2', 'Model', 'Semester'].map(type => (
                       <button 
                         key={type} onClick={() => setFilterType(type)}
                         className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                       >
                          {type}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 {isLoading ? (
                    <div className="py-20 text-center">
                       <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Results...</p>
                    </div>
                 ) : filteredMarks?.map((mark: any, i: number) => (
                    <motion.div 
                      key={mark._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="dash-card p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-indigo-200 transition-all cursor-pointer"
                    >
                       <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center font-black text-xl italic shadow-sm transition-all group-hover:scale-110 ${mark.grade === 'S' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
                          {mark.grade}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{mark.subject?.code}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200" />
                             <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{mark.type}</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800 truncate">{mark.subject?.name}</h4>
                       </div>

                       <div className="flex items-center gap-12">
                          <div className="text-center">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Internals</p>
                             <p className="text-xs font-black text-slate-700">{mark.internalMarks || '-'}</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">External</p>
                             <p className="text-xs font-black text-slate-700">{mark.externalMarks || '-'}</p>
                          </div>
                          <div className="text-center">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                             <p className="text-sm font-black text-slate-900">{mark.totalMarks}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${mark.grade === 'F' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             {mark.grade === 'F' ? 'Reappear' : 'Success'}
                          </div>
                       </div>
                    </motion.div>
                 ))}
                 
                 {filteredMarks?.length === 0 && (
                    <div className="py-20 text-center dash-card border-dashed">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Layers className="text-slate-200" size={32} /></div>
                       <h4 className="text-lg font-black text-slate-400">No Assessment Records Found</h4>
                       <p className="text-xs font-medium text-slate-500 mt-2">Check back once the institutional audit is complete.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Performance Insights (Sidebar) */}
           <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="dash-card p-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-2xl shadow-indigo-200">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/10 rounded-2xl"><Sparkles size={24} /></div>
                    <div>
                       <h4 className="text-lg font-black italic">AI Insight</h4>
                       <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Predictive Performance</p>
                    </div>
                 </div>
                 <p className="text-sm font-medium leading-relaxed mb-8">Based on your IA-1 and IA-2 trends in <span className="font-black underline underline-offset-4">Discrete Math</span>, you are projected to achieve an <span className="bg-white/20 px-2 rounded-lg">S-Grade</span> in the final Semester.</p>
                 <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all">View detailed roadmap</button>
              </div>

              <div className="dash-card p-8 space-y-8">
                 <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-800">Grade Distribution</h4>
                    <PieChart size={18} className="text-slate-400" />
                 </div>
                 <div className="space-y-4">
                    {[
                      { grade: 'S-Grade', count: marks?.filter((m: any) => m.grade === 'S').length || 0, color: 'bg-amber-400' },
                      { grade: 'A-Grade', count: marks?.filter((m: any) => m.grade === 'A').length || 0, color: 'bg-indigo-500' },
                      { grade: 'B/C Grade', count: marks?.filter((m: any) => m.grade === 'B' || m.grade === 'C').length || 0, color: 'bg-slate-300' },
                    ].map((g, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                             <span className="text-slate-400">{g.grade}</span>
                             <span className="text-slate-800">{g.count} Subjects</span>
                          </div>
                          <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${(g.count / (marks?.length || 1)) * 100}%` }} className={`h-full ${g.color}`} />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="dash-card p-8 text-center border-dashed border-2">
                 <div className="p-4 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-slate-300"><Download size={24} /></div>
                 <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Unofficial Transcript</h4>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Generate PDF report for this semester</p>
                 <button className="mt-6 text-[10px] font-black text-indigo-600 hover:underline">Download Report</button>
              </div>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentPerformance;
