import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Award, BookOpen, MessageSquare, Briefcase, 
  Plus, Send, TrendingUp, CheckCircle, Clock 
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FacultyDashboard = () => {
  const [activeYear] = useState('2024-25');
  
  const { data: scores, isLoading } = useQuery({
    queryKey: ['my-api-score'],
    queryFn: () => axios.get(`${API}/appraisal/my-score`).then(r => r.data),
  });

  const { data: profile } = useQuery({
    queryKey: ['faculty-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  const selfAppraisalMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/appraisal/self`, data),
    onSuccess: () => alert('Self-appraisal submitted for HOD review.')
  });

  return (
    <DashboardLayout title="Faculty Performance Hub" subtitle="Annual Performance Indicator (API) Scoreboard & Professional Growth Tracking">
      
      {/* ── API Summary Matrix ── */}
      <div className="grid grid-cols-12 gap-8 mb-12">
         <div className="col-span-12 lg:col-span-8 dash-card p-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 text-white/5 transform rotate-12"><Award size={320} /></div>
            <div className="relative">
               <div className="flex items-center gap-6 mb-12">
                  <div className="w-20 h-20 bg-primary-500 rounded-[30px] flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                     <TrendingUp size={36} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black italic">Cumulative API Score</h3>
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Academic Year {activeYear} • Verified Status</p>
                  </div>
               </div>

               <div className="flex items-end gap-10 mb-12">
                  <p className="text-8xl font-black italic text-primary-400 tracking-tighter">
                     {isLoading ? '--' : profile?.apiScore || scores?.total || 0}
                  </p>
                  <div className="mb-4">
                     <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs mb-1">
                        <CheckCircle size={14} /> Promotion Eligible
                     </div>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
                        Your current score exceeds the UGC threshold for Associate Professor rank.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-10 border-t border-white/5">
                  {[
                    { label: 'Research Papers', val: profile?.researchPapers || 0, max: 'Total', icon: <TrendingUp size={14}/> },
                    { label: 'Student Rating', val: profile?.studentRating || 0, max: '5.0', icon: <MessageSquare size={14}/> },
                    { label: 'Academic', val: scores?.academic || 0, max: 40, icon: <BookOpen size={14}/> },
                    { label: 'Admin Duty', val: scores?.admin || 0, max: 10, icon: <Briefcase size={14}/> }
                  ].map((item, i) => (
                    <div key={i}>
                       <div className="flex items-center gap-2 mb-2">
                          <span className="text-primary-500">{item.icon}</span>
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{item.label}</p>
                       </div>
                       <p className="text-2xl font-black italic">{item.val}<span className="text-xs text-slate-600 ml-1 font-bold">/{item.max}</span></p>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="dash-card p-8 bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-xl">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-8">Professional Actions</h4>
               <div className="space-y-4">
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-between px-6 transition-all border border-white/10 group">
                     <span className="text-xs font-black uppercase tracking-widest">Add Publication</span>
                     <Plus size={18} className="group-hover:rotate-90 transition-all" />
                  </button>
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-between px-6 transition-all border border-white/10 group">
                     <span className="text-xs font-black uppercase tracking-widest">Submit Patents</span>
                     <Plus size={18} />
                  </button>
               </div>
               <div className="mt-10 pt-10 border-t border-white/10">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="p-2 bg-white/20 rounded-lg"><Clock size={16}/></div>
                     <p className="text-[10px] font-bold uppercase tracking-widest">Deadline: May 20, 2025</p>
                  </div>
                  <button 
                    onClick={() => selfAppraisalMutation.mutate({ academicYear: activeYear, selfEvaluation: 'Self-assessment content here...' })}
                    className="w-full py-4 bg-white text-primary-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                     Finalize Self-Appraisal
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* ── Research & Feedback Details ── */}
      <div className="grid grid-cols-12 gap-8">
         <div className="col-span-12 lg:col-span-7 dash-card p-0 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
               <h3 className="font-black italic text-slate-800">Verified Publications</h3>
               <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">View All Repository</button>
            </div>
            <div className="divide-y divide-slate-50">
               {[1, 2].map((_, i) => (
                  <div key={i} className="p-8 hover:bg-slate-50/50 transition-all flex items-center gap-6">
                     <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black italic text-xl">{i+1}</div>
                     <div className="flex-1">
                        <h5 className="text-sm font-black text-slate-800 mb-1">Impact of Neural-Link Architectures on Distributed CMS</h5>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">IEEE Journal of Educational Tech • Impact Factor: 4.82</p>
                     </div>
                     <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        +8.2 pts
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="col-span-12 lg:col-span-5 dash-card p-8">
            <h3 className="font-black italic text-slate-800 mb-10">Student Feedback Matrix</h3>
            <div className="space-y-8">
               {[
                 { label: 'Teaching Quality', val: 4.8 },
                 { label: 'Course Materials', val: 4.2 },
                 { label: 'Accessibility', val: 4.9 }
               ].map((item, i) => (
                  <div key={i} className="space-y-3">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                        <span>{item.label}</span>
                        <span className="text-slate-800">{item.val}/5.0</span>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(item.val / 5) * 100}%` }} className="h-full bg-emerald-500" />
                     </div>
                  </div>
               ))}
            </div>
            <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-[11px] text-slate-600 leading-relaxed font-medium">
               "The professor uses innovative digital tools that make complex CMS architecture easy to understand."
            </div>
         </div>
      </div>

    </DashboardLayout>
  );
};

export default FacultyDashboard;
