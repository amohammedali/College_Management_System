import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Calendar, Users, AlertTriangle, CheckCircle, 
  Search, ArrowRight, BarChart3, Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const deptAttendance: any[] = [];
const criticalStudents: any[] = [];

const AdminAttendance = () => {
  return (
    <DashboardLayout title="Attendance Control Center" subtitle="Monitor aggregate presence and manage critical enrollment thresholds">
      
      <div className="grid-dashboard mb-8">
        {/* Chart (8 columns) */}
        <div className="col-span-full lg:col-span-8 dash-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-bold text-slate-800">Department-wise Presence</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Academic Year 2024-25</p>
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-primary-500 hover:bg-primary-50 px-3 py-1.5 rounded-xl transition">
              <BarChart3 size={16} /> Detailed Analytics
            </button>
          </div>
          {deptAttendance.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={deptAttendance} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={40}>
                  {deptAttendance.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.pct < 75 ? '#ef4444' : '#0ea5e9'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-[2rem]">
              No attendance data processed yet
            </div>
          )}
        </div>

        {/* Critical Alerts (4 columns) */}
        <div className="col-span-full lg:col-span-4 space-y-6">
          <div className="dash-card p-6 border-t-4 border-t-red-500 bg-red-50/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-xl text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Critical Threshold</h3>
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Below 75% Requirement</p>
              </div>
            </div>
            <div className="space-y-4">
              {criticalStudents.length > 0 ? criticalStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-red-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-xs">{s.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{s.dept} • {s.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-red-600">{s.pct}%</span>
                    <p className="text-[8px] font-bold text-slate-300 uppercase">{s.trend}</p>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center text-slate-400 text-xs font-medium italic bg-white/50 rounded-2xl border border-dashed border-red-100">
                  No students below threshold
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition flex items-center justify-center gap-2">
              Send Mass Warning <ArrowRight size={14} />
            </button>
          </div>

          <div className="dash-card p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-slate-800">0%</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Avg Presence</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-2xl font-black text-slate-800">0</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Absentees Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Logs Table */}
      <div className="dash-card p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="font-bold text-slate-800">Recent Attendance Logs</h2>
          <div className="flex gap-2">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary-400" />
             </div>
             <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 transition"><Filter size={16}/></button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th className="pl-8">Date</th><th>Faculty In-Charge</th><th>Department</th><th>Status</th><th>Verification</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center py-20 text-slate-400 font-medium">
                No recent attendance logs available.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </DashboardLayout>
  );
};

export default AdminAttendance;
