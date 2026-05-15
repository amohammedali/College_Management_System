import React from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  BookOpen, Award, TrendingUp, Search, 
  Filter, MoreHorizontal, Download, FileText, ArrowRight 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const gradeDistribution: any[] = [];

const AdminMarks = () => {
  return (
    <DashboardLayout title="Examination & Grading" subtitle="Centralized grade management and academic performance tracking">
      
      <div className="grid-dashboard mb-8">
        {/* Performance Distribution (8 columns) */}
        <div className="col-span-full lg:col-span-8 dash-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-bold text-slate-800">Aggregate Grade Distribution</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Semester 5 - Mid-term Results</p>
            </div>
            <div className="flex gap-2">
              <span className="badge badge-blue">S5-2024</span>
              <span className="badge bg-slate-100 text-slate-500">Overall</span>
            </div>
          </div>
          {gradeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={gradeDistribution}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fill="url(#colorCount)" dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-[2rem]">
              No grade distribution data available
            </div>
          )}
        </div>

        {/* Action Widgets (4 columns) */}
        <div className="col-span-full lg:col-span-4 space-y-6">
          <div className="dash-card p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
            <Award className="text-yellow-400 mb-4" size={32} />
            <h3 className="font-bold text-lg mb-2">Dean's List Analysis</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">Currently 0 students qualify for the honorary Dean's list based on CGPA thresholds.</p>
            <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
              Generate Honors List <ArrowRight size={14} />
            </button>
          </div>

          <div className="dash-card p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp size={16}/></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Avg GPA</span>
                </div>
                <span className="font-black text-slate-800 text-sm">0.00</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><FileText size={16}/></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Arrears</span>
                </div>
                <span className="font-black text-slate-800 text-sm">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course-wise Results */}
      <div className="dash-card p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
          <div>
            <h2 className="font-bold text-slate-800">Active Course Evaluations</h2>
            <p className="text-xs text-slate-400 font-medium">Verification status for internal and external marks</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition">
              <Download size={14} /> Export All
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th className="pl-8">Course Code</th><th>Course Title</th><th>Instructor</th><th>Evaluation</th><th>Mean Score</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="text-center py-20 text-slate-400 font-medium">
                No course evaluations recorded.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </DashboardLayout>
  );
};

export default AdminMarks;
