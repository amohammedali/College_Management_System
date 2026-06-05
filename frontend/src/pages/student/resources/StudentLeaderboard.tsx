import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Trophy, Medal, Star, TrendingUp, Search, 
  Filter, User, Target, Award, Info, 
  ChevronRight, BarChart3, Shield
} from 'lucide-react';

const StudentLeaderboard = () => {
  const [topPerformers] = useState([
    { rank: 1, name: 'Cipher Sphinx', dept: 'CSE', gpa: '9.92', points: '14,250' },
    { rank: 2, name: 'Neon Architect', dept: 'ARCH', gpa: '9.88', points: '13,900' },
    { rank: 3, name: 'Quantum Pulse', dept: 'ECE', gpa: '9.81', points: '13,100' },
    { rank: 4, name: 'Shadow Matrix', dept: 'IT', gpa: '9.75', points: '12,840' },
    { rank: 5, name: 'Aero Vanguard', dept: 'MECH', gpa: '9.68', points: '12,500' },
    { rank: 6, name: 'Data Wraith', dept: 'CSE', gpa: '9.62', points: '11,920' },
    { rank: 7, name: 'Nova Forge', dept: 'EEE', gpa: '9.55', points: '11,400' },
    { rank: 8, name: 'Crimson Logic', dept: 'ECE', gpa: '9.48', points: '10,850' },
    { rank: 9, name: 'Stellar Code', dept: 'IT', gpa: '9.42', points: '10,200' },
    { rank: 10, name: 'Iron Catalyst', dept: 'CIVIL', gpa: '9.35', points: '9,850' }
  ]);

  return (
    <DashboardLayout title="Academic Leaderboard" subtitle="Gamified Academic Performance Tracking: Anonymous Peer Ranking and Institutional Achievements">
      
      {/* ── Personal Standing (Hero) ── */}
      <div className="grid grid-cols-12 gap-8 mb-8">
         <div className="col-span-12 lg:col-span-8 dash-card p-10 bg-slate-900 text-white border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 text-white/5"><Trophy size={200} /></div>
            <div className="relative">
               <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white"><Medal size={24} /></div>
                  <h3 className="text-xl font-black italic">My Institutional Standing</h3>
               </div>
               
               <div className="flex items-end gap-12 mb-10">
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">Current Rank</p>
                     <p className="text-7xl font-black italic text-indigo-400">#42<span className="text-xl text-slate-600 ml-2">/ 2,400</span></p>
                  </div>
                  <div className="pb-2">
                     <p className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-1">Top 2% Globally</p>
                     <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                        <TrendingUp size={14} className="text-emerald-500" /> +5 Positions this month
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/5">
                  {[
                    { label: 'Academic Points', value: '1,840' },
                    { label: 'Course Badges', value: '12' },
                    { label: 'Forum Credits', value: '450' },
                    { label: 'Percentile', value: '98.2' }
                  ].map((idx, i) => (
                    <div key={i}>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{idx.label}</p>
                       <p className="text-xl font-black">{idx.value}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 dash-card p-8 border-indigo-100 flex flex-col justify-between">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-600 text-white rounded-2xl"><Target size={20} /></div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Next Achievement</h4>
               </div>
               <div className="space-y-6">
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-slate-500">Scholar Badge</span>
                        <span className="text-[10px] font-black text-indigo-600">85% Complete</span>
                     </div>
                     <div className="h-2 bg-white rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-indigo-600" />
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    "Maintain a 9.0+ GPA in the upcoming internals to unlock the **Dean's List** digital badge."
                  </p>
               </div>
            </div>
            <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
               View Badge Gallery
            </button>
         </div>
      </div>

      {/* ── Anonymous Leaderboard ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-2">
         <div className="flex items-center gap-4">
            <h3 className="text-lg font-black text-slate-800 italic">Institutional Top Performers</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-widest">
               <Shield size={12} /> Anonymous Mode Active
            </div>
         </div>
         <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search by rank or points..." className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 rounded-xl outline-none" />
            </div>
            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><Filter size={16} /></button>
         </div>
      </div>

      <div className="dash-card overflow-hidden">
         <table className="w-full">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Rank</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Anonymous Alias</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Department</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Cumulative GPA</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">XP Points</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {topPerformers.map((user, i) => (
                  <tr key={i} className={`hover:bg-slate-50/50 transition-all group cursor-pointer ${i === 0 ? 'bg-indigo-50/20' : ''}`}>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           {i < 3 ? (
                             <Award size={20} className={i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : 'text-amber-700'} />
                           ) : (
                             <span className="text-sm font-black text-slate-400">#{user.rank}</span>
                           )}
                           <span className="text-lg font-black text-slate-800">0{user.rank}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-300">
                              <User size={18} />
                           </div>
                           <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.dept}</span>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-slate-800">{user.gpa}</span>
                           <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <span className="text-sm font-black text-indigo-600 italic">{user.points} XP</span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      <div className="mt-12 p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100/50 flex items-start gap-6">
         <div className="p-4 bg-white rounded-3xl shadow-sm text-indigo-600"><Info size={24} /></div>
         <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Privacy & Gamification Logic</h4>
            <p className="text-sm text-indigo-600/70 font-medium leading-relaxed">
               All names are anonymized in the public leaderboard to maintain student privacy while encouraging healthy competition. Real names are only visible to HODs and Principals for award distribution. XP Points are calculated based on CGPA (60%), Attendance (20%), and Extra-curricular participation (20%).
            </p>
         </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentLeaderboard;
