import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  ShieldCheck, AlertTriangle, Calendar, FileText, 
  TrendingUp, CheckCircle, Clock, Search,
  Filter, ChevronRight, BarChart3, Target,
  Award, Layers, History
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAccreditation = () => {
  const [activeTab, setActiveTab] = useState<'naac' | 'nba' | 'audit' | 'gaps'>('naac');
  const queryClient = useQueryClient();

  const { data: criteria } = useQuery({
    queryKey: ['accr-criteria'],
    queryFn: () => axios.get(`${API}/accr/criteria`).then(r => r.data),
  });

  const { data: gaps } = useQuery({
    queryKey: ['accr-gaps'],
    queryFn: () => axios.get(`${API}/accr/gap-analysis`).then(r => r.data),
  });

  const { data: audits } = useQuery({
    queryKey: ['accr-audits'],
    queryFn: () => axios.get(`${API}/accr/audit-schedule`).then(r => r.data),
  });

  const computeMutation = useMutation({
    mutationFn: () => axios.post(`${API}/accr/scores/compute`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accr-criteria'] });
      queryClient.invalidateQueries({ queryKey: ['accr-gaps'] });
      alert('Institutional Score Aggregation Completed!');
    }
  });

  return (
    <DashboardLayout title="Accreditation Control" subtitle="NAAC & NBA Compliance • Institutional Quality Assurance">
      
      {/* ── High-Level Snapshots ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="dash-card p-6 bg-slate-900 text-white border-none shadow-2xl flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
               <Award size={28}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current CGPA</p>
               <p className="text-2xl font-black italic">3.68 <span className="text-xs text-emerald-400">A++</span></p>
            </div>
         </div>
         <div className="dash-card p-6 bg-white border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
               <AlertTriangle size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Open Gaps</p>
               <p className="text-2xl font-black italic text-slate-800">{gaps?.length || 0}</p>
            </div>
         </div>
         <div className="dash-card p-6 bg-white border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <CheckCircle size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Verified Evidence</p>
               <p className="text-2xl font-black italic text-slate-800">84%</p>
            </div>
         </div>
         <div className="dash-card p-6 bg-white border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
               <Calendar size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Next Visit</p>
               <p className="text-sm font-black italic text-slate-800">14 Jan 2027</p>
            </div>
         </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 mb-8 w-fit">
         {[
           { id: 'naac', label: 'NAAC Criteria', icon: ShieldCheck },
           { id: 'nba', label: 'NBA Mapping', icon: Layers },
           { id: 'gaps', label: 'Gap Analysis', icon: Target },
           { id: 'audit', label: 'Audit Calendar', icon: Clock }
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all
               ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
           >
              <tab.icon size={14}/> {tab.label}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
         <div className="col-span-12 lg:col-span-8">
            <AnimatePresence mode="wait">
               {activeTab === 'naac' && (
                  <motion.div 
                    key="naac" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    className="dash-card p-0 bg-white border border-slate-100 overflow-hidden"
                  >
                     <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-800 italic">Criteria Compliance</h3>
                        <button 
                          onClick={() => computeMutation.mutate()}
                          disabled={computeMutation.isPending}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                           {computeMutation.isPending ? 'Computing...' : 'Run Snapshot'}
                        </button>
                     </div>
                     <div className="divide-y divide-slate-50">
                        {criteria?.map((c: any) => (
                           <div key={c._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group cursor-pointer">
                              <div className="flex items-center gap-6">
                                 <div className="w-12 h-12 bg-slate-50 text-slate-400 font-black flex items-center justify-center rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    {c.criterionCode}
                                 </div>
                                 <div>
                                    <h5 className="text-sm font-black text-slate-800">{c.criterionName}</h5>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Weight: {c.weightPercent}% • Max Score: {c.maxScore}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-8">
                                 <div className="text-right">
                                    <p className="text-xs font-black text-slate-800 italic">88%</p>
                                    <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                       <div className="h-full bg-emerald-500" style={{ width: '88%' }}/>
                                    </div>
                                 </div>
                                 <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-600 transition-all"/>
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               )}

               {activeTab === 'gaps' && (
                  <motion.div 
                    key="gaps" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                     {gaps?.map((gap: any) => (
                        <div key={gap._id} className="dash-card p-8 bg-white border border-rose-100 shadow-lg shadow-rose-500/5 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 text-rose-500/10 pointer-events-none"><AlertTriangle size={60}/></div>
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                 <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100">Critical Gap</span>
                                 <h4 className="text-lg font-black text-slate-800 italic mt-3">{gap.criterion?.criterionName}</h4>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deficit</p>
                                 <p className="text-xl font-black text-rose-600 italic">-{gap.gap}</p>
                              </div>
                           </div>
                           <div className="p-4 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Remediation Plan</p>
                              <p className="text-xs font-medium text-slate-600 leading-relaxed">{gap.actionRequired}</p>
                           </div>
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">JD</div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned to: HOD, CSE</p>
                              </div>
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Deadline: {new Date(gap.dueDate).toLocaleDateString()}</p>
                           </div>
                        </div>
                     ))}
                  </motion.div>
               )}

               {activeTab === 'audit' && (
                  <motion.div 
                    key="audit" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                    className="dash-card p-8 bg-white border border-slate-100"
                  >
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-slate-800 italic">Planned Audits</h3>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                           <History size={14}/> Audit History
                        </button>
                     </div>
                     <div className="relative pl-8 border-l-2 border-slate-100 space-y-12">
                        {audits?.map((audit: any) => (
                           <div key={audit._id} className="relative">
                              <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-indigo-600 shadow-xl"/>
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">{new Date(audit.scheduledDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">{audit.auditType.replace('_', ' ')}</h4>
                                    <p className="text-xs text-slate-400 font-medium mt-1">{audit.notes}</p>
                                 </div>
                                 <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-100">
                                    {audit.status}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="dash-card p-8 bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><BarChart3 size={100}/></div>
               <h4 className="text-lg font-black italic mb-6">Compliance Target</h4>
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-indigo-200">
                        <span>NAAC Cycle-4</span>
                        <span>3.68 / 4.00</span>
                     </div>
                     <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white" style={{ width: '92%' }}/>
                     </div>
                  </div>
                  <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Simulate Cycle</button>
               </div>
            </div>

            <div className="dash-card p-8">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Evidence Quick-Links</h4>
               <div className="space-y-4">
                  {[
                    { label: 'Strategic Plan 2024', type: 'Policy', icon: FileText },
                    { label: 'Governing Council Minutes', type: 'Minutes', icon: Clock },
                    { label: 'IQAC Meeting Report', type: 'Report', icon: TrendingUp }
                  ].map(doc => (
                     <div key={doc.label} className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-100 transition-all group">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-all">
                           <doc.icon size={18}/>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{doc.label}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{doc.type}</p>
                        </div>
                        <ChevronRight size={14} className="ml-auto text-slate-300"/>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

    </DashboardLayout>
  );
};

export default AdminAccreditation;
