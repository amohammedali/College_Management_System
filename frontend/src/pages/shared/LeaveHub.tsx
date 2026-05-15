import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Calendar, FileText, CheckCircle, Clock, 
  Plus, ChevronRight, AlertCircle, Info, ShieldCheck
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LeaveHub = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'apply' | 'history'>('history');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['leave-summary'],
    queryFn: () => axios.get(`${API}/leaves/my-summary`).then(r => r.data),
  });

  const applyMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/leaves/apply`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-summary'] });
      setActiveTab('history');
      alert('Leave application submitted for approval.');
    }
  });

  const balances = summary?.balance?.balances || { sick: 0, casual: 0, duty: 0, earned: 0 };
  const history = summary?.history || [];

  return (
    <DashboardLayout title="Leave Hub" subtitle="Intelligent Workflow Automation • Dual-Authorization Approval Engine">
      
      {/* ── Balance Matrix ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         {[
           { label: 'Sick Leave', val: balances.sick, color: 'rose' },
           { label: 'Casual Leave', val: balances.casual, color: 'amber' },
           { label: 'Duty Leave', val: balances.duty, color: 'indigo' },
           { label: 'Earned Leave', val: balances.earned, color: 'emerald' }
         ].map((item, i) => (
            <div key={i} className={`dash-card p-6 bg-${item.color}-50 border-${item.color}-100 flex items-center justify-between`}>
               <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-600/70 mb-1`}>{item.label}</p>
                  <p className="text-3xl font-black text-slate-800 italic">{item.val}d</p>
               </div>
               <div className={`p-3 bg-white rounded-2xl text-${item.color}-600 shadow-sm`}><Calendar size={20}/></div>
            </div>
         ))}
      </div>

      <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-[30px] border border-slate-100 w-fit">
         <button 
           onClick={() => setActiveTab('history')}
           className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
         >
            My Requests
         </button>
         <button 
           onClick={() => setActiveTab('apply')}
           className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'apply' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
         >
            New Application
         </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
         <div className="col-span-12 lg:col-span-8">
            {activeTab === 'history' ? (
               <div className="space-y-6">
                  {history.length === 0 ? (
                    <div className="dash-card p-20 text-center text-slate-400 italic">No leave history found.</div>
                  ) : (
                    history.map((req: any, i: number) => (
                       <motion.div 
                         key={req._id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: i * 0.1 }}
                         className="dash-card p-8 group hover:border-slate-300 transition-all"
                       >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                             <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black italic
                                  ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : req.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                   {new Date(req.startDate).getDate()}
                                </div>
                                <div>
                                   <h4 className="text-sm font-black text-slate-800 mb-1">{req.type} Leave Request</h4>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}
                                   </p>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-6">
                                <div className="text-right">
                                   <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                                     ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                       req.status === 'Pending' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                       'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                      {req.status}
                                   </span>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                      {req.attendanceAdjusted ? 'Attendance Synced' : 'Sync Pending'}
                                   </p>
                                </div>
                                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 transition-all"><ChevronRight size={18}/></button>
                             </div>
                          </div>
                       </motion.div>
                    ))
                  )}
               </div>
            ) : (
               <div className="dash-card p-10 bg-white">
                  <h3 className="text-lg font-black italic text-slate-800 mb-10">Application Form</h3>
                  <div className="grid grid-cols-2 gap-8 mb-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Leave Type</label>
                        <select className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none text-xs font-bold focus:ring-2 focus:ring-slate-900 transition-all">
                           <option>Sick Leave</option>
                           <option>Casual Leave</option>
                           <option>Duty Leave</option>
                           <option>Medical Leave</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</label>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="date" className="p-4 bg-slate-50 rounded-2xl border-none outline-none text-[10px] font-bold" />
                           <input type="date" className="p-4 bg-slate-50 rounded-2xl border-none outline-none text-[10px] font-bold" />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-3 mb-10">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason for Absence</label>
                     <textarea className="w-full p-6 bg-slate-50 rounded-[30px] border-none outline-none text-xs font-medium h-32 focus:ring-2 focus:ring-slate-900 transition-all" placeholder="Provide a brief explanation..."></textarea>
                  </div>
                  <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[30px] flex items-center gap-6 mb-10">
                     <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><ShieldCheck size={20}/></div>
                     <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest leading-relaxed">
                        Leaves exceeding 3 days require Principal's approval in addition to HOD.
                     </p>
                  </div>
                  <button className="w-full py-5 bg-slate-900 text-white rounded-[30px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all hover:scale-[1.01] active:scale-[0.99]">
                     Submit Application
                  </button>
               </div>
            )}
         </div>

         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Approval Tracker</h4>
               <div className="space-y-10 relative">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-800"></div>
                  {[
                    { label: 'Application Submitted', date: 'Just now', status: 'done' },
                    { label: 'HOD Verification', date: 'Pending', status: 'active' },
                    { label: 'Attendance Adjustment', date: 'Automated', status: 'wait' }
                  ].map((step, i) => (
                    <div key={i} className="relative flex items-center gap-6 pl-10">
                       <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-slate-900 z-10 flex items-center justify-center
                         ${step.status === 'done' ? 'bg-emerald-500' : step.status === 'active' ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                          {step.status === 'done' && <CheckCircle size={14} className="text-white"/>}
                       </div>
                       <div>
                          <p className="text-[11px] font-black italic">{step.label}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{step.date}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="dash-card p-8 border-indigo-100 bg-indigo-50/50">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><Info size={20}/></div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Policy Note</h4>
               </div>
               <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Earned leaves must be applied at least 15 days in advance. Emergency sick leaves can be updated within 48h of return.
               </p>
            </div>
         </div>
      </div>

    </DashboardLayout>
  );
};

export default LeaveHub;
