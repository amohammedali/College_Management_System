import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Send, Plus, FileText, CheckCircle, Clock, 
  AlertCircle, Download, ExternalLink, Info, Trash2,
  Calendar, Users, BookOpen, Search, Filter, ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentSubmissions = () => {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: () => axios.get(`${API}/student/assignments`).then(r => r.data),
  });

  return (
    <DashboardLayout title="Submission Hub" subtitle="Active Academic Assignments, Project Deliverables, and Real-time Graded Feedback">
      
      <div className="grid grid-cols-12 gap-8">
        
        {/* Active Assignments (8 columns) */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-lg font-black text-slate-800 leading-tight">My Assignments</h3>
              <div className="flex gap-2">
                 <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"><Search size={16} /></div>
                 <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer text-[10px] font-black uppercase flex items-center gap-2">Filter <Filter size={14} /></div>
              </div>
           </div>

           <div className="space-y-4">
              {assignments?.length > 0 ? assignments.map((task: any, i: number) => (
                <motion.div 
                  key={task._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="dash-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-200 transition-all cursor-pointer"
                >
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                        ${task.status === 'Graded' ? 'bg-emerald-50 text-emerald-500' : task.status === 'Submitted' ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'}`}>
                         <FileText size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{task.subject} • {task.points} Points Max</p>
                         <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                         <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1"><Clock size={10} /> {new Date(task.deadline).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      {task.status === 'Graded' && (
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade</p>
                           <p className="text-lg font-black text-emerald-600">{task.grade || 'A'}</p>
                        </div>
                      )}
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                        ${task.status === 'Graded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : task.status === 'Submitted' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                         {task.status || 'Pending'}
                      </span>
                      <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                        <ArrowRight size={18} />
                      </button>
                   </div>
                </motion.div>
              )) : (
                <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No assignments assigned yet</p>
                </div>
              )}
           </div>
        </div>

        {/* Action Sidebar (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/30">
              <div className="p-4 bg-white/10 rounded-3xl w-fit mb-8"><Send size={28} className="text-indigo-400" /></div>
              <h2 className="text-xl font-black mb-6 italic">Active Submission</h2>
              
              <div className="space-y-6">
                 <div className="border-2 border-dashed border-white/10 rounded-[32px] p-8 text-center hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="p-4 bg-white/5 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                    <p className="text-xs font-bold text-slate-300">Upload Project Artifacts</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">PDF, ZIP, DOCX (Max 20MB)</p>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Task</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500">
                          <option value="">Select Assignment</option>
                          {assignments?.map((a: any) => (
                            <option key={a._id} value={a._id}>{a.title}</option>
                          ))}
                       </select>
                    </div>
                    <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Deploy Submission
                    </button>
                 </div>
              </div>
           </div>

           <div className="dash-card p-8 border-indigo-100 bg-indigo-50/50">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 bg-white rounded-2xl text-indigo-600 shadow-sm"><Info size={20} /></div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Submission Guidelines</h4>
              </div>
              <ul className="space-y-4">
                {[
                  'Ensure your filename includes Roll Number.',
                  'Plagiarism check will be auto-triggered.',
                  'Late submissions incur 10% penalty per day.'
                ].map((rule, i) => (
                  <li key={i} className="flex gap-3 text-xs font-medium text-slate-600 leading-tight">
                     <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                     {rule}
                  </li>
                ))}
              </ul>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentSubmissions;
