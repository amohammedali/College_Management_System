import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, AlertTriangle, CheckCircle, 
  Search, ArrowRight, BarChart3, Filter,
  TrendingUp, Clock, ShieldCheck, MapPin
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAttendance = () => {
  const { data: deptAttendance, isLoading } = useQuery({
    queryKey: ['admin-attendance-aggregate'],
    queryFn: () => axios.get(`${API}/admin/attendance/aggregate`).then(r => r.data)
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['admin-attendance-recent'],
    queryFn: () => axios.get(`${API}/attendance/history`).then(r => r.data)
  });

  const avgPresence = deptAttendance?.length > 0 
    ? Math.round(deptAttendance.reduce((acc: number, curr: any) => acc + curr.pct, 0) / deptAttendance.length)
    : 0;

  return (
    <DashboardLayout title="Attendance Control Center" subtitle="Institutional presence monitoring and compliance tracking">
      <div className="space-y-10">
        
        <div className="grid grid-cols-12 gap-10">
          {/* Chart (8 columns) */}
          <div className="col-span-full lg:col-span-8 dash-card p-10 bg-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-blue-600 rotate-12"><BarChart3 size={200} /></div>
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h2 className="text-2xl font-black italic text-slate-800 tracking-tight">Departmental Integrity</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Real-time presence distribution</p>
              </div>
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                Live Monitoring
              </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
              {isLoading ? (
                <div className="w-full h-full skeleton rounded-[40px]" />
              ) : deptAttendance?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptAttendance} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }} 
                      contentStyle={{ borderRadius: 24, border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="pct" radius={[12, 12, 0, 0]} barSize={45}>
                      {deptAttendance.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.pct < 75 ? '#ef4444' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/50">
                  <Calendar size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 font-black italic uppercase tracking-widest text-xs">No attendance data processed</p>
                </div>
              )}
            </div>
          </div>

          {/* Critical Alerts (4 columns) */}
          <div className="col-span-full lg:col-span-4 space-y-10">
            <motion.div 
              whileHover={{ y: -5 }}
              className="dash-card p-10 bg-rose-900 text-white border-none shadow-2xl shadow-rose-900/30 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform"><AlertTriangle size={180} /></div>
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl text-rose-300 backdrop-blur-md"><ShieldCheck size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tight">Compliance Guard</h3>
                    <p className="text-[10px] text-rose-300/60 font-black uppercase tracking-widest">Attendance Threshold Check</p>
                  </div>
                </div>
                <p className="text-xs text-rose-100 leading-relaxed font-medium">
                  Institutional standard is set to <span className="font-black text-white">75%</span>. Automatic warnings are triggered for students trending below this level.
                </p>
                <button className="w-full py-5 bg-white text-rose-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-all shadow-xl flex items-center justify-center gap-3">
                  Analyze Shortage List <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>

            <div className="dash-card p-10 bg-white border-none shadow-2xl shadow-slate-200/50 space-y-8">
              <h3 className="text-sm font-black text-slate-800 italic uppercase tracking-tight">Daily Pulse</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Presence</p>
                  <p className="text-3xl font-black text-slate-800 italic">{avgPresence}%</p>
                  <div className="flex items-center gap-1 mt-3 text-emerald-500 font-black text-[9px] uppercase">
                    <TrendingUp size={10} /> Optimal
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Units</p>
                  <p className="text-3xl font-black text-slate-800 italic">{deptAttendance?.length || 0}</p>
                  <div className="flex items-center gap-1 mt-3 text-blue-500 font-black text-[9px] uppercase">
                    <Clock size={10} /> Synced
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions Table */}
        <div className="dash-card p-0 overflow-hidden bg-white shadow-2xl shadow-slate-200/50 border-none rounded-[48px]">
          <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-50/20">
            <div>
              <div className="flex items-center gap-4 mb-3">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-inner"><MapPin size={18} /></div>
                 <h2 className="text-2xl font-black italic text-slate-800 tracking-tight">Active Sessions</h2>
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Institutional roll-call audit log</p>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/20">
                <ShieldCheck size={16} /> Verify All Logs
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Session Config</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Faculty</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Attendance</th>
                  <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentSessions?.length > 0 ? recentSessions.map((sess: any) => (
                  <tr key={sess._id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-10 py-8">
                      <p className="text-sm font-bold text-slate-800 italic">{sess.subject?.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Section {sess.section} • Hour {sess.hour}</p>
                    </td>
                    <td className="px-10 py-8 text-sm font-bold text-slate-600 italic">
                      {sess.faculty?.name}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end w-40">
                           <span className="text-[10px] font-black text-slate-400 uppercase">Presence</span>
                           <span className="text-sm font-black text-slate-800">{Math.round((sess.presentCount / sess.totalStudents) * 100)}%</span>
                        </div>
                        <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-1000 ${sess.presentCount/sess.totalStudents < 0.75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${(sess.presentCount / sess.totalStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        sess.presentCount/sess.totalStudents < 0.75 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {sess.presentCount/sess.totalStudents < 0.75 ? 'Critical' : 'Verified'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center opacity-30">
                      <Search size={48} className="mx-auto text-slate-400 mb-6" />
                      <p className="text-lg font-black italic text-slate-800">No Session Logs Found</p>
                      <p className="text-[10px] font-black uppercase tracking-widest mt-2">Logs populate as faculty mark presence</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminAttendance;
