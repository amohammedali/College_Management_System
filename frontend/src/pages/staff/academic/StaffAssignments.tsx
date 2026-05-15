import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  FileText, Plus, Search, Filter, BookOpen, 
  Calendar, Users, CheckCircle, Clock, Info, 
  ChevronRight, BarChart3, Settings, ClipboardList
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffAssignments = () => {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['staff-assignments'],
    queryFn: () => axios.get(`${API}/staff/assignments`).then(r => r.data),
  });

  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/staff/profile`).then(r => r.data),
  });

  return (
    <DashboardLayout title="Assignment Manager" subtitle="Curate Academic Tasks, Define Grading Rubrics, and Monitor Real-time Submission Pipelines">
      
      <div className="grid grid-cols-12 gap-8">
        {/* Task Creation (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5"><ClipboardList size={100} /></div>
              <h2 className="text-xl font-black mb-8 italic">New Task</h2>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Assignment Title</label>
                    <input type="text" placeholder="e.g. Unit 3 Case Study..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Subject</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none">
                          <option value="">Select Subject</option>
                          {profile?.assignedClasses?.map((c: any) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Points</label>
                       <input type="number" placeholder="20" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Submission Deadline</label>
                    <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none" />
                 </div>
                 <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Deploy Assignment
                 </button>
              </div>
           </div>

           <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm"><Settings size={16} /></div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-1">Rubric Intelligence</p>
                 <p className="text-[11px] text-indigo-600/70 font-medium">Auto-Plagiarism check and AI-based sentiment scoring are enabled for this batch.</p>
              </div>
           </div>
        </div>

        {/* Active Pipeline (8 columns) */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-lg font-black text-slate-800 leading-tight italic">Active Pipelines</h3>
              <div className="flex gap-2">
                 <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"><Search size={16} /></div>
                 <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer text-[10px] font-black uppercase flex items-center gap-2">Analytics <BarChart3 size={14} /></div>
              </div>
           </div>

           <div className="space-y-4">
              {assignments?.length > 0 ? assignments.map((task: any, i: number) => (
                <motion.div 
                  key={task._id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="dash-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-200 transition-all cursor-pointer"
                >
                   <div className="flex items-center gap-6 lg:w-1/3">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                         <BookOpen size={24} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{task.subject} • {task.status}</p>
                      </div>
                   </div>

                   <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</p>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Calendar size={12} className="text-indigo-500" /> {new Date(task.deadline).toLocaleDateString()}
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submissions</p>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Users size={12} className="text-indigo-500" /> {task.submissionCount || 0}
                         </div>
                      </div>
                      <div className="hidden md:flex items-center justify-center pr-8">
                         <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${(task.submissionCount / 60) * 100}%` }} />
                         </div>
                      </div>
                   </div>

                   <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                     <ChevronRight size={18} />
                   </button>
                </motion.div>
              )) : (
                <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No assignments found in database</p>
                </div>
              )}
           </div>

           <div className="mt-12 text-center p-12 border-2 border-dashed border-slate-100 rounded-[40px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                 <CheckCircle size={32} />
              </div>
              <p className="text-sm font-bold text-slate-400 italic">"Academic excellence is a result of consistent assessment and feedback."</p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffAssignments;
