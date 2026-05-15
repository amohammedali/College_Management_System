import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { 
  Cpu, TrendingUp, AlertTriangle, Users, 
  BrainCircuit, Zap, Target, Search,
  Filter, ChevronRight, Activity, ShieldAlert
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAnalytics = () => {
  const [activeSegment, setActiveSegment] = useState<'dropout' | 'enrollment'>('dropout');

  const { data: dropoutData, isLoading: loadingDropout } = useQuery({
    queryKey: ['analytics-dropout'],
    queryFn: () => axios.get(`${API}/analytics/dropout-risk`).then(r => r.data),
  });

  const { data: enrollmentData, isLoading: loadingEnrollment } = useQuery({
    queryKey: ['analytics-enrollment'],
    queryFn: () => axios.get(`${API}/analytics/forecast/enrollment`).then(r => r.data),
  });

  return (
    <DashboardLayout title="AI Intelligence Hub" subtitle="Predictive Institutional Analytics • Neural Decision Support System">
      
      {/* ── AI Header Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         {[
           { label: 'Neural Score', val: '94.2', unit: '%', icon: BrainCircuit, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           { label: 'Dropout Risk', val: dropoutData?.filter((p:any) => p.riskLevel === 'High').length || '0', unit: 'Critical', icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50' },
           { label: 'Growth Forecast', val: '+12', unit: '%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
           { label: 'Processing', val: 'Realtime', unit: 'Sync', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
         ].map((s, i) => (
           <motion.div 
             key={s.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="dash-card p-6 bg-white border border-slate-100 flex items-center gap-5"
           >
              <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
                 <s.icon size={28}/>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{s.label}</p>
                 <p className="text-2xl font-black italic text-slate-800">{s.val}<span className="text-xs ml-1 opacity-50">{s.unit}</span></p>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
         {/* ── Main Insight Engine ── */}
         <div className="col-span-12 lg:col-span-8">
            <div className="dash-card p-10 bg-slate-900 border-none shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><Cpu size={300}/></div>
               
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div>
                     <h2 className="text-2xl font-black text-white italic flex items-center gap-4">
                        Enrollment Growth Engine <Activity size={24} className="text-indigo-400"/>
                     </h2>
                     <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mt-2">5-Year Statistical Projection</p>
                  </div>
                  <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10">
                     <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">Yearly</button>
                     <button className="px-6 py-2.5 text-indigo-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Monthly</button>
                  </div>
               </div>

               <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={enrollmentData || []}>
                        <defs>
                           <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false}/>
                        <XAxis dataKey="year" stroke="#ffffff40" fontSize={10} fontWeight="900" tickLine={false} axisLine={false}/>
                        <YAxis stroke="#ffffff40" fontSize={10} fontWeight="900" tickLine={false} axisLine={false}/>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="dash-card p-8 bg-white border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                     <Target size={14} className="text-indigo-600"/> Resource Allocation Insight
                  </h4>
                  <div className="space-y-6">
                     {[
                       { label: 'Faculty Capacity', val: 88, color: 'bg-indigo-500' },
                       { label: 'Lab Utilization', val: 94, color: 'bg-emerald-500' },
                       { label: 'Budget Efficiency', val: 72, color: 'bg-amber-500' }
                     ].map(r => (
                        <div key={r.label}>
                           <div className="flex justify-between mb-2">
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{r.label}</span>
                              <span className="text-[10px] font-black text-slate-400">{r.val}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${r.val}%` }} className={`h-full ${r.color}`}/>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="dash-card p-8 bg-white border border-slate-100 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center mb-6">
                     <Zap size={32}/>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 italic uppercase tracking-widest">Efficiency Peak</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Optimal resource usage detected in CSE Dept.</p>
               </div>
            </div>
         </div>

         {/* ── Risk Monitoring Engine ── */}
         <div className="col-span-12 lg:col-span-4">
            <div className="dash-card p-8 bg-white border border-slate-100 h-full">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-lg font-black italic text-slate-800 flex items-center gap-3">
                     <AlertTriangle className="text-rose-600" size={20}/> Risk Monitor
                  </h3>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Search size={18}/></button>
               </div>

               <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                  {loadingDropout ? (
                    <div className="p-20 text-center animate-pulse text-slate-400 text-xs font-black italic uppercase">Syncing Neural Profiles...</div>
                  ) : dropoutData?.map((p: any, i: number) => (
                     <motion.div 
                       key={p.studentId}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-rose-100 hover:bg-white transition-all cursor-pointer group"
                     >
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
                                 <Users size={18}/>
                              </div>
                              <div>
                                 <h5 className="text-[11px] font-black text-slate-800">{p.name}</h5>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {p.studentId.slice(-8)}</p>
                              </div>
                           </div>
                           <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest 
                             ${p.riskLevel === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                              {p.riskLevel}
                           </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full ${p.riskLevel === 'High' ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${p.score}%` }}/>
                           </div>
                           <span className="text-[9px] font-black text-slate-400">{p.score}% Confidence</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all">
                           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Counsel Student</span>
                           <ChevronRight size={14} className="text-indigo-600"/>
                        </div>
                     </motion.div>
                  ))}
               </div>

               <button className="w-full mt-8 py-5 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all">
                  Generate Mitigation Report
               </button>
            </div>
         </div>
      </div>

    </DashboardLayout>
  );
};

export default AdminAnalytics;
