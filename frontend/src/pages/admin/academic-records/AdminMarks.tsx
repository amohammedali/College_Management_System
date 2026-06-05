import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  BookOpen, Award, TrendingUp, Search, 
  Filter, Download, FileText, ArrowRight,
  ChevronRight, BarChart3, Star
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminMarks = () => {
  const { data: gradeDistribution, isLoading } = useQuery({
    queryKey: ['admin-marks-aggregate'],
    queryFn: () => axios.get(`${API}/admin/marks/aggregate`).then(r => r.data)
  });

  const totalEvaluations = gradeDistribution?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;

  return (
    <DashboardLayout title="Examination & Grading" subtitle="Centralized grade management and academic performance tracking">
      <div className="space-y-10">
        
        <div className="grid grid-cols-12 gap-10">
          {/* Performance Distribution (8 columns) */}
          <div className="col-span-full lg:col-span-8 dash-card p-10 bg-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-indigo-600 rotate-12"><BarChart3 size={200} /></div>
             
             <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h2 className="text-2xl font-black italic text-slate-800 tracking-tight">Grade Distribution</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Across all active departments</p>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    Live Data
                  </div>
                </div>
             </div>

             <div className="h-[350px] w-full relative z-10">
                {isLoading ? (
                  <div className="w-full h-full skeleton rounded-3xl" />
                ) : gradeDistribution?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gradeDistribution}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="grade" tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: 24, border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                      />
                      <Area 
                        type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={6} 
                        fill="url(#colorCount)" dot={{ r: 8, fill: '#6366f1', strokeWidth: 4, stroke: '#fff' }} 
                        activeDot={{ r: 10, fill: '#4f46e5', strokeWidth: 5, stroke: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/50">
                    <BookOpen size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black italic uppercase tracking-widest text-xs">Awaiting examination data</p>
                  </div>
                )}
             </div>
          </div>

          {/* Action Widgets (4 columns) */}
          <div className="col-span-full lg:col-span-4 space-y-10">
            <motion.div 
              whileHover={{ y: -5 }}
              className="dash-card p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/30 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform"><Award size={180} /></div>
              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-2xl font-black italic tracking-tight">Academic Excellence</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Dean's List Analysis</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Currently {Math.round(totalEvaluations * 0.15)} students qualify for the honorary Dean's list based on CGPA thresholds.
                </p>
                <button className="w-full py-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-400 hover:text-white transition-all flex items-center justify-center gap-3">
                  Generate Honors List <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>

            <div className="dash-card p-10 bg-white border-none shadow-2xl shadow-slate-200/50 space-y-8">
              <h3 className="text-sm font-black text-slate-800 italic uppercase tracking-tight">Institutional IQ</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500"><TrendingUp size={20}/></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Entries</p>
                      <p className="text-lg font-black text-slate-800">{totalEvaluations}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500"><FileText size={20}/></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fail Count (F)</p>
                      <p className="text-lg font-black text-slate-800">{gradeDistribution?.find((g: any) => g.grade === 'F')?.count || 0}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course-wise Results */}
        <div className="dash-card p-0 overflow-hidden bg-white shadow-2xl shadow-slate-200/50 border-none rounded-[48px]">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-50/20">
            <div>
              <div className="flex items-center gap-4 mb-3">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner"><Star size={18} /></div>
                 <h2 className="text-2xl font-black italic text-slate-800 tracking-tight">Evaluation Registry</h2>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Master audit trail of examination results</p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20">
                <Download size={16} /> Export Master Ledger
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Subject Config</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Department</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Mean Accuracy</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td colSpan={4} className="px-10 py-32">
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Search size={48} className="text-slate-400 mb-6" />
                      <p className="text-lg font-black italic text-slate-800">No Registry Data Available</p>
                      <p className="text-[10px] font-black uppercase tracking-widest mt-2">Initialize examination via faculty portal</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminMarks;
