import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Briefcase, Search, Filter, Globe, Building2, 
  DollarSign, MapPin, Calendar, ArrowRight, CheckCircle2,
  Trophy, Star, Award, TrendingUp
} from 'lucide-react';

const StudentPlacement = () => {
  const [drives] = useState([]);

  return (
    <DashboardLayout title="Placement & Internship Board" subtitle="Accelerate Your Career with Exclusive Institutional Tie-ups and Real-time Application Tracking">
      
      {/* ── Career Readiness Metrics ── */}
      <div className="grid grid-cols-12 gap-8 mb-8">
         <div className="col-span-12 lg:col-span-8 dash-card p-8 bg-slate-900 text-white border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-white/5"><Trophy size={180} /></div>
            <div className="relative">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white"><TrendingUp size={24} /></div>
                  <h3 className="text-xl font-black italic">Placement Eligibility Portal</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        <span>Profile Completeness</span>
                        <span className="text-white">85%</span>
                     </div>
                     <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-indigo-400" />
                     </div>
                     <p className="text-[10px] text-slate-400 font-medium italic">Add 2 more projects to reach 100%.</p>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Aptitude Score</p>
                        <p className="text-3xl font-black">740<span className="text-sm text-indigo-400 ml-1">/800</span></p>
                     </div>
                     <Star size={32} className="text-amber-400 fill-amber-400 opacity-20" />
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Applied Drives</p>
                        <p className="text-3xl font-black">12</p>
                     </div>
                     <CheckCircle2 size={32} className="text-emerald-400 opacity-20" />
                  </div>
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 dash-card p-8 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-indigo-600 text-white rounded-2xl"><Award size={20} /></div>
               <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Premium Mentorship</h4>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed italic mb-8">
               "Your technical scores in DSA are exceptional. Focus on system design for the upcoming Google Cloud drive."
            </p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-xs font-black">CP</div>
               <div>
                  <p className="text-[11px] font-black text-slate-800">Cyrus Panthaki</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Industry Mentor</p>
               </div>
            </div>
         </div>
      </div>

      {/* ── Active Drives ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-2">
         <h3 className="text-lg font-black text-slate-800 leading-tight">Active Recruitment Drives</h3>
         <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search by company or role..." className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 rounded-xl outline-none" />
            </div>
            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><Filter size={16} /></button>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
         {drives.map((d, i) => (
           <motion.div 
             key={d.id} 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.1 }}
             className="dash-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:border-indigo-200 transition-all cursor-pointer"
           >
              <div className="flex items-center gap-6 lg:w-1/3">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <Building2 size={24} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{d.company}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-1">{d.role}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CTC / Stipend</p>
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-700"><DollarSign size={14} className="text-indigo-500" /> {d.salary}</div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-700"><MapPin size={14} className="text-indigo-500" /> {d.location}</div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Drive Date</p>
                    <div className="flex items-center gap-1 text-sm font-bold text-slate-700"><Calendar size={14} className="text-indigo-500" /> {d.date}</div>
                 </div>
                 <div className="flex items-center justify-end pr-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                      ${d.status === 'Applied' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : d.status === 'Active' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                       {d.status}
                    </span>
                 </div>
              </div>

              <div className="lg:w-48 flex justify-end">
                 <button className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                   ${d.status === 'Active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                    {d.status === 'Applied' ? 'Review Application' : d.status === 'Coming Soon' ? 'Set Reminder' : 'Apply Now'}
                 </button>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="mt-12 text-center p-12 bg-slate-50 rounded-[40px] border border-slate-100">
         <Globe size={40} className="mx-auto text-slate-200 mb-6" />
         <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Institutional Partners</p>
         <div className="flex flex-wrap justify-center gap-10 opacity-30 grayscale">
            {['MICROSOFT', 'TATA', 'INFOSYS', 'AMAZON', 'ADOBE'].map(brand => (
               <span key={brand} className="text-xl font-black italic">{brand}</span>
            ))}
         </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentPlacement;
