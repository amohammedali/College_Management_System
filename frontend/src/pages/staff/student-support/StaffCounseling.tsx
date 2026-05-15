import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MessageSquare, Plus, Search, Filter, 
  Heart, AlertCircle, CheckCircle, Clock, 
  UserPlus, History, Info, ChevronRight, BarChart,
  Smile, Meh, Frown, Save, RefreshCw, X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffCounseling = () => {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState('');
  const [student, setStudent] = useState('');
  const [sentiment, setSentiment] = useState('Neutral');
  const [isLogging, setIsLogging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initially Empty - Pulling from Database
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['staff-counseling'],
    queryFn: () => axios.get(`${API}/staff/counseling`).then(r => r.data),
    initialData: []
  });

  // Fetch students for selection (using staff students list)
  const { data: students } = useQuery({
    queryKey: ['staff-students'],
    queryFn: () => axios.get(`${API}/staff/students`).then(r => r.data),
    initialData: []
  });

  const logSessionMutation = useMutation({
    mutationFn: (newSession: any) => axios.post(`${API}/staff/counseling`, newSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-counseling'] });
      setIsLogging(false);
      setShowSuccess(true);
      setTopic('');
      setStudent('');
      setSentiment('Neutral');
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !topic) return;
    setIsLogging(true);
    logSessionMutation.mutate({
      studentId: student,
      topic,
      sentiment,
      date: new Date().toISOString(),
      nextAction: 'Regular Follow-up'
    });
  };

  const tones = [
    { id: 'Positive', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { id: 'Neutral', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { id: 'Concerned', icon: Frown, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' }
  ];

  return (
    <DashboardLayout title="Student Counseling Log" subtitle="Structured Mentorship Tracking, Wellness Sentiment Analysis, and Academic Intervention Logs">
      
      <div className="grid grid-cols-12 gap-10">
        {/* ── New Session Composer (4 columns) ── */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="dash-card p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-none shadow-2xl shadow-rose-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none"><Heart size={120} /></div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-rose-500/20 text-rose-400 rounded-[24px] border border-white/5 backdrop-blur-md shadow-xl"><MessageSquare size={28} /></div>
                    <div>
                       <h2 className="text-xl font-black italic">New Session</h2>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Mentorship Module</p>
                    </div>
                 </div>
                 
                 <form onSubmit={handleLogSession} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Select Student</label>
                       <select 
                         required
                         value={student}
                         onChange={e => setStudent(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-rose-400 transition-all appearance-none cursor-pointer"
                       >
                          <option value="" className="bg-slate-900">Choose Student...</option>
                          {students?.map((s: any) => (
                            <option key={s._id} value={s._id} className="bg-slate-900">{s.name} ({s.studentId})</option>
                          ))}
                       </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Session Topic</label>
                       <input 
                         required
                         type="text" 
                         value={topic}
                         onChange={e => setTopic(e.target.value)}
                         placeholder="e.g. Mental Health, Career..." 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-rose-400 transition-all placeholder:text-slate-600" 
                       />
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Sentiment Tone</label>
                       <div className="grid grid-cols-3 gap-3">
                          {tones.map(t => (
                            <button 
                              key={t.id}
                              type="button"
                              onClick={() => setSentiment(t.id)}
                              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${sentiment === t.id ? `${t.bg} ${t.border} ${t.color} scale-105 shadow-lg` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                            >
                               <t.icon size={20} />
                               <span className="text-[9px] font-black uppercase tracking-widest">{t.id}</span>
                            </button>
                          ))}
                       </div>
                    </div>

                    <button 
                      disabled={isLogging || !student || !topic}
                      className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-rose-600/40 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isLogging ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                       {isLogging ? 'Logging...' : 'Log Session'}
                    </button>
                 </form>
              </div>
           </div>

           <div className="p-8 bg-rose-50 rounded-[32px] border border-rose-100/50 flex items-start gap-5">
              <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm border border-rose-50"><AlertCircle size={20} /></div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-1">Wellness Alert</p>
                 <p className="text-[11px] text-rose-700/70 font-medium leading-relaxed">System auto-flags students with high absence rates coupled with 'Concerned' sentiments for intervention.</p>
              </div>
           </div>
        </div>

        {/* ── Timeline (8 columns) ── */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-8 bg-rose-500 rounded-full" />
                 <h3 className="text-xl font-black text-slate-800 italic tracking-tight">Mentorship Timeline</h3>
              </div>
              <div className="flex gap-3">
                 <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 transition-all cursor-pointer shadow-sm"><Search size={18} /></div>
                 <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 transition-all cursor-pointer text-[10px] font-black uppercase px-6 shadow-sm flex items-center gap-2">Filter <Filter size={16} /></div>
              </div>
           </div>

           <div className="space-y-5">
              {sessions?.length > 0 ? sessions.map((s: any, i: number) => (
                <motion.div 
                  key={s._id || i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="dash-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-rose-200 transition-all relative overflow-hidden"
                >
                   <div className="flex items-center gap-8 lg:w-1/3 relative z-10">
                      <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-all shadow-inner border border-slate-100">
                         <Users size={28} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800 text-base group-hover:text-rose-700 transition-colors">{s.student?.name || 'Academic Scholar'}</h4>
                         <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(s.date).toLocaleDateString('en-GB')}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{s.topic}</span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-10 flex-1 relative z-10">
                      <div className="space-y-1.5">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wellness Tone</p>
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 w-fit
                           ${s.sentiment === 'Concerned' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                             s.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                             'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            {s.sentiment === 'Concerned' ? <Frown size={10} /> : s.sentiment === 'Positive' ? <Smile size={10} /> : <Meh size={10} />}
                            {s.sentiment || 'Neutral'}
                         </span>
                      </div>
                      <div className="space-y-1.5">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Action</p>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Clock size={12} className="text-indigo-500" /> {s.nextAction || 'Regular Follow-up'}
                         </div>
                      </div>
                   </div>

                   <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-300 group-hover:text-rose-600 group-hover:border-rose-200 transition-all shadow-sm relative z-10">
                      <ChevronRight size={22} />
                   </button>
                </motion.div>
              )) : (
                <div className="py-32 text-center bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
                   <div className="p-6 bg-white text-slate-300 rounded-[32px] border border-slate-100 shadow-sm">
                      <Heart size={48} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-400 italic">No Counseling Records Found</h4>
                      <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2">Begin your first mentorship session to populate the timeline</p>
                   </div>
                </div>
              )}
           </div>

           <div className="mt-12 flex items-center justify-between p-10 bg-slate-900 rounded-[48px] border-none text-white shadow-2xl shadow-rose-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none"><BarChart size={120} /></div>
              <div className="flex items-center gap-8 relative z-10">
                 <div className="p-5 bg-white/10 rounded-[28px] text-rose-400 border border-white/5 backdrop-blur-md shadow-xl"><History size={32} /></div>
                 <div>
                    <h4 className="text-lg font-black italic">Intervention Success Rate</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">Metrics will populate as sessions are logged and outcomes analyzed</p>
                 </div>
              </div>
              <button className="px-10 py-5 bg-rose-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all font-black relative z-10">
                 View Analytics
              </button>
           </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 right-10 px-8 py-4 bg-emerald-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 z-[100]"
          >
             <div className="p-1.5 bg-white/20 rounded-lg"><CheckCircle size={16} /></div>
             Counseling Session Logged Successfully
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default StaffCounseling;
