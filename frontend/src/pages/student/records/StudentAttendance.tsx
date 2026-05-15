import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentAttendance = () => {
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['student-attendance'],
    queryFn: () => axios.get(`${API}/student/attendance`).then(r => r.data),
  });

  if (isLoading) return <div className="p-8"><div className="skeleton h-96 w-full rounded-3xl" /></div>;

  const attendance = Math.round(attendanceData?.summary?.percentage || 0);
  const isLow = attendance < 75;
  const radialData = [{ name: 'Attendance', value: attendance, fill: isLow ? '#ef4444' : '#22c55e' }];

  return (
    <DashboardLayout title="My Attendance" subtitle="Track your daily and subject-wise attendance">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Radial Overview */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dash-card p-6 flex flex-col items-center">
          <h2 className="font-bold text-slate-800 text-sm self-start mb-6">Overall Percentage</h2>
          <div className="relative w-full flex items-center justify-center" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius={60} outerRadius={90} data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className={`text-4xl font-black ${isLow ? 'text-red-500' : 'text-green-600'}`}>{attendance}%</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Present</span>
            </div>
          </div>
          {isLow && (
            <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-[10px] font-bold">
              <AlertTriangle size={14} /> BELOW 75% THRESHOLD
            </div>
          )}
        </motion.div>

        {/* Monthly Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-slate-800">Attendance Trend</h2>
              <p className="text-xs text-slate-400">Your presence over the semester</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
              <Calendar size={20} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceData?.monthly || []}>
              <defs>
                <linearGradient id="gAtt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isLow ? '#ef4444' : '#22c55e'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isLow ? '#ef4444' : '#22c55e'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }} />
              <Area type="monotone" dataKey="pct" stroke={isLow ? '#ef4444' : '#22c55e'} strokeWidth={3} fill="url(#gAtt)" dot={{ r: 5, fill: isLow ? '#ef4444' : '#22c55e', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Daily records breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="dash-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recent Daily Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData?.records?.length > 0 ? attendanceData?.records?.map((r: any, i: number) => (
                <tr key={i}>
                  <td className="font-bold text-slate-800">{new Date(r.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge text-[10px] font-black uppercase tracking-widest ${r.status === 'present' ? 'badge-green' : 'badge-red'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="text-slate-400 text-xs italic">N/A</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-center py-20 text-slate-400 font-medium">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
