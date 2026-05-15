import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Plus, Search, Filter, Calendar, MapPin, 
  CheckCircle, History, Info, ChevronRight, Briefcase,
  Zap, Save, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffDuty = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    purpose: '', date: '', hours: '', location: 'Main Campus'
  });

  // Initially Empty - Fetching from Database
  const { data: duties, isLoading } = useQuery({
    queryKey: ['staff-duties'],
    queryFn: () => axios.get(`${API}/staff/duty`).then(r => r.data),
    initialData: []
  });

  const dutyMutation = useMutation({
    mutationFn: (newDuty: any) => axios.post(`${API}/staff/duty`, newDuty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-duties'] });
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ purpose: '', date: '', hours: '', location: 'Main Campus' });
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    dutyMutation.mutate({
      event: formData.purpose,
      location: formData.location,
      date: formData.date,
      hours: `${formData.hours} Hours`,
      status: 'Pending'
    });
  };

  const totalHours = duties?.reduce((acc: number, curr: any) => {
    const h = parseInt(curr.hours) || 0;
    return acc + h;
  }, 0) || 0;

  return (
    <DashboardLayout title="OD & Duty Tracker" subtitle="Log On-Duty Hours for Events, Seminars, and Industrial Visits with Automated Approval Routing">
      
      <div className="grid grid-cols-12 gap-10">
        {/* ── Quick Log (4 columns) ── */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="dash-card p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none"><Clock size={120} /></div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-3xl border border-white/5 backdrop-blur-md shadow-xl"><Zap size={28} /></div>
                    <div>
                       <h2 className="text-xl font-black italic">New OD Entry</h2>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Institutional Service</p>
                    </div>
                 </div>
                 
                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Event Purpose</label>
                       <input 
                         required
                         type="text" 
                         value={formData.purpose}
                         onChange={e => setFormData({...formData, purpose: e.target.value})}
                         placeholder="e.g. Workshop, Seminar, Guest Lecture" 
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-indigo-400 transition-all placeholder:text-slate-600" 
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Date</label>
                          <input 
                            required
                            type="date" 
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-indigo-400 transition-all" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">Duration (Hrs)</label>
                          <input 
                            required
                            type="number" 
                            value={formData.hours}
                            onChange={e => setFormData({...formData, hours: e.target.value})}
                            placeholder="0" 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-indigo-400 transition-all placeholder:text-slate-600" 
                          />
                       </div>
                    </div>
                    <button 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3"
                    >
                       {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                       {isSubmitting ? 'Processing...' : 'Submit OD Log'}
                    </button>
                 </form>
              </div>
           </div>

           <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 flex items-start gap-5">
              <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm border border-amber-50"><Info size={20} /></div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Approval Protocol</p>
                 <p className="text-[11px] text-amber-700/70 font-medium leading-relaxed">Duty logs are auto-routed to HOD for vetting and then to Admin for institutional attendance offset.</p>
              </div>
           </div>
        </div>

        {/* ── History (8 columns) ── */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex items-center justify-between mb-10 px-4">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                 <h3 className="text-xl font-black text-slate-800 italic tracking-tight">Duty History</h3>
              </div>
              <div className="flex gap-3">
                 <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all cursor-pointer shadow-sm"><Search size={18} /></div>
                 <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all cursor-pointer text-[10px] font-black uppercase px-6 shadow-sm flex items-center gap-2">Filter <Filter size={16} /></div>
              </div>
           </div>

           <div className="space-y-5">
              {duties?.length > 0 ? duties.map((log: any, i: number) => (
                <motion.div 
                  key={log._id || i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="dash-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-indigo-200 transition-all relative overflow-hidden"
                >
                   <div className="flex items-center gap-8 lg:w-1/2 relative z-10">
                      <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner border border-slate-100">
                         <Briefcase size={28} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">{log.event}</h4>
                         <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-tight"><MapPin size={12} className="text-indigo-400" /> {log.location}</div>
                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-tight"><Calendar size={12} className="text-indigo-400" /> {log.date}</div>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-10 relative z-10">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Impact</p>
                         <p className="text-base font-black text-slate-800">{log.hours}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm
                          ${log.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                           {log.status}
                        </span>
                      </div>
                      <ChevronRight size={22} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                   </div>
                </motion.div>
              )) : (
                <div className="py-32 text-center bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
                   <div className="p-6 bg-white text-slate-300 rounded-[32px] border border-slate-100 shadow-sm">
                      <Clock size={48} />
                   </div>
                   <div>
                      <h4 className="text-lg font-black text-slate-400 italic">No Duty Logs Registered</h4>
                      <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2">Log your first On-Duty event to begin tracking</p>
                   </div>
                </div>
              )}
           </div>

           <div className="mt-12 flex items-center justify-between p-10 bg-indigo-900 rounded-[48px] border-none text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 text-white/5 pointer-events-none"><ShieldCheck size={120} /></div>
              <div className="flex items-center gap-8 relative z-10">
                 <div className="p-5 bg-white/10 rounded-[28px] text-indigo-300 border border-white/5 backdrop-blur-md shadow-xl"><History size={32} /></div>
                 <div>
                    <h4 className="text-lg font-black italic">Cumulative Academic Service</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1.5">Academic Cycle 2024: <span className="text-indigo-400">{totalHours} Hours</span> Synchronized</p>
                 </div>
              </div>
              <button className="px-10 py-5 bg-white text-indigo-900 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all font-black relative z-10">
                 Verify & Export
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
             Duty Log Submitted Successfully
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default StaffDuty;
