import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/shared/StatCard';
import { SkeletonGrid, ChartSkeleton } from '../../../components/shared/Skeletons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
  GraduationCap, Users, UserCheck, AlertTriangle, DollarSign, BookOpen,
  Plus, Trash2, Edit, Eye, Shield, Cpu
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = ['#0ea5e9', '#6366f1', '#a855f7', '#f43f5e'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => axios.get(`${API}/admin/stats`).then(r => r.data),
  });

  if (statsLoading) return (
    <DashboardLayout title="Universal Control" subtitle="Commanding Institution Intelligence">
      <SkeletonGrid count={4} />
      <div className="grid grid-cols-12 gap-8 mt-8">
        <div className="col-span-8"><ChartSkeleton height={300} /></div>
        <div className="col-span-4"><ChartSkeleton height={300} /></div>
      </div>
    </DashboardLayout>
  );

  const attendanceData = statsData?.attendanceTrend || [];
  const deptData = statsData?.departmentDistribution || [];
  const gradeData = statsData?.gradeDistribution || [];

  return (
    <DashboardLayout title="Universal Control" subtitle="Institutional Command Center">
      
      {/* ── Dynamic Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Enrollment" value={statsData?.students || 0} icon={GraduationCap} 
          accent="blue" delay={0} onClick={() => navigate('/admin/students')}
        />
        <StatCard 
          title="Active Faculty" value={statsData?.staff || 0} icon={Users} 
          accent="indigo" delay={0.08} onClick={() => navigate('/admin/staff')}
        />
        <StatCard 
          title="Campus Presence" value={`${statsData?.campusPresence || 0}%`} icon={UserCheck} 
          accent="emerald" delay={0.16} onClick={() => navigate('/admin/attendance')}
        />
        <StatCard 
          title="Revenue (Net)" value={`₹${(statsData?.feeCollection || 0).toLocaleString()}`} icon={DollarSign} 
          accent="purple" delay={0.24} onClick={() => navigate('/admin/fees')}
        />
      </div>

      <div className="grid grid-cols-12 gap-8 mb-8">
        
        {/* Predictive Intelligence Section */}
        <div className="col-span-12 dash-card p-8 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-indigo-100 opacity-20 pointer-events-none">
            <Cpu size={120} />
          </div>
          <div className="relative flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20"><Cpu size={24} /></div>
                <div>
                   <h2 className="text-xl font-black text-slate-800">AI Analytics Engine</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Predictive Neural Insights</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="p-5 bg-white rounded-3xl border border-indigo-100 shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Predictive Dropout Risk</p>
                   <div className="flex items-end gap-4">
                      <p className="text-4xl font-black text-rose-500">{statsData?.dropoutRisk || '0%'}</p>
                      <div className="mb-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">Stable</div>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-2 italic">Based on attendance & score patterns.</p>
                </div>
                <div className="p-5 bg-white rounded-3xl border border-indigo-100 shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Enrollment Forecast</p>
                   <div className="flex items-end gap-4">
                      <p className="text-4xl font-black text-indigo-600">{statsData?.enrollmentForecast || 'N/A'}</p>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-h-[300px]">
               <h3 className="text-sm font-black text-slate-700 mb-6 uppercase tracking-widest">Revenue & Performance Projection</h3>
               {statsData?.projections?.length > 0 ? (
                 <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={statsData.projections}>
                      <defs>
                        <linearGradient id="gProj" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: 20, border: 'none', boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="real" stroke="#6366f1" strokeWidth={4} fill="url(#gProj)" dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} />
                      <Area type="monotone" dataKey="proj" stroke="#6366f1" strokeWidth={3} strokeDasharray="8 8" fill="transparent" />
                    </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    No Projection Data Available
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Academic Grading Index (8 columns) */}
        <div className="col-span-full lg:col-span-8 dash-card p-8">
           <div className="flex items-center justify-between mb-8">
             <div>
               <h2 className="text-lg font-black text-slate-800 leading-tight">Academic Grading Index</h2>
               <p className="text-xs text-slate-400 font-medium">Performance distribution across core faculties</p>
             </div>
             <button className="px-4 py-2 bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors">Download Matrix</button>
           </div>
           {gradeData?.length > 0 ? (
             <ResponsiveContainer width="100%" height={280}>
               <BarChart data={gradeData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                 <Bar dataKey="excellent" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={20} />
                 <Bar dataKey="good" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
                 <Bar dataKey="average" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="flex flex-col items-center justify-center h-[280px] text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                No Academic Grading Data Available
             </div>
           )}
        </div>

        {/* System Intelligence (4 columns) */}
        <div className="col-span-full lg:col-span-4 space-y-8">
          
          {/* System Logs / Timeline */}
          <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20">
            <h2 className="text-lg font-black mb-1">System Intelligence</h2>
            <p className="text-xs text-slate-400 font-medium mb-8">Recent administrative activities</p>
            
            <div className="space-y-6">
              {statsData?.recentLogs?.length > 0 ? statsData.recentLogs.map((log: any, i: number) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Users size={18} />
                    </div>
                    {i !== statsData.recentLogs.length - 1 && <div className="w-0.5 h-10 bg-slate-800 my-1" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{log.event}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No recent activity</p>
                </div>
              )}
            </div>
            
            <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors">
              View Full Audit Trail
            </button>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default AdminDashboard;
