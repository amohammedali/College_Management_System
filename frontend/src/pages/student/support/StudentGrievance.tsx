import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Ticket, Plus, Search, MessageSquare, Clock, 
  CheckCircle, AlertCircle, ArrowRight, User
} from 'lucide-react';

const StudentGrievance = () => {
  const [tickets] = useState([]);

  const getStatusColor = (s: string) => {
    if (s === 'Resolved') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'In Progress') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  return (
    <DashboardLayout title="Grievance Portal" subtitle="Submit Academic or Administrative Concerns for Institutional Resolution">
      
      <div className="grid grid-cols-12 gap-8">
        {/* Ticket Submission (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20">
             <div className="p-4 bg-white/10 rounded-3xl w-fit mb-8"><Ticket size={28} /></div>
             <h2 className="text-xl font-black mb-2 italic">New Grievance</h2>
             <p className="text-xs text-slate-400 mb-8 leading-relaxed">Our support cell typically responds to institutional concerns within 24 working hours.</p>
             
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Category</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 transition-all">
                     <option>Academic Affairs</option>
                     <option>Hostel & Infrastructure</option>
                     <option>Fee & Finance</option>
                     <option>Student Welfare</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Subject</label>
                  <input type="text" placeholder="Summary of issue..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 transition-all" />
                </div>
                <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20">
                  Open Ticket
                </button>
             </div>
          </div>

          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
             <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={18} className="text-indigo-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Urgent Support?</h4>
             </div>
             <p className="text-[11px] text-indigo-600/70 font-medium">For emergency counseling or safety concerns, please use the direct 24/7 hotline at the Security Desk.</p>
          </div>
        </div>

        {/* Ticket List (8 columns) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-8 px-2">
             <h3 className="text-lg font-black text-slate-800 leading-tight">Your Tracked Issues</h3>
             <div className="flex gap-2">
               <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"><Search size={16} /></div>
               <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer text-[10px] font-black uppercase flex items-center gap-2">Filter <Clock size={14} /></div>
             </div>
          </div>

          <div className="space-y-4">
            {tickets.map((t, i) => (
              <motion.div 
                key={t.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="dash-card p-6 flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <MessageSquare size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.id} • {t.category}</p>
                      <h4 className="font-bold text-slate-800 text-sm">{t.subject}</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">Submitted on {t.date}</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(t.status)}`}>
                      {t.status}
                   </span>
                   <ArrowRight size={18} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center p-12 border-2 border-dashed border-slate-100 rounded-[40px]">
             <User size={48} className="mx-auto text-slate-100 mb-4" />
             <p className="text-sm font-bold text-slate-400 italic">"Resolving concerns today, building excellence for tomorrow."</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentGrievance;
