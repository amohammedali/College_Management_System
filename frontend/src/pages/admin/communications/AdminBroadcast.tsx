import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Send, Megaphone, Users, Mail, MessageSquare, 
  Clock, CheckCircle, AlertCircle, Trash2, Layout,
  Search, Filter, ChevronRight, BarChart3, Archive
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminBroadcast = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'composer' | 'history'>('composer');
  
  const { data: history, isLoading } = useQuery({
    queryKey: ['broadcast-history'],
    queryFn: () => axios.get(`${API}/broadcast/history`).then(r => r.data),
  });

  const sendMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/broadcast/send`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-history'] });
      setActiveTab('history');
      alert('Broadcast dispatched successfully!');
    }
  });

  return (
    <DashboardLayout title="Broadcast Center" subtitle="Institutional Communication Gateway • Multi-Channel Messaging Hub">
      
      {/* ── Action Bar ── */}
      <div className="flex items-center gap-4 mb-10 bg-white p-2 rounded-[30px] border border-slate-100 w-fit shadow-sm">
         <button 
           onClick={() => setActiveTab('composer')}
           className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'composer' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
         >
            Message Composer
         </button>
         <button 
           onClick={() => setActiveTab('history')}
           className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
         >
            Broadcast History
         </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
         {activeTab === 'composer' ? (
            <>
               <div className="col-span-12 lg:col-span-8">
                  <div className="dash-card p-10 bg-white">
                     <h3 className="text-lg font-black italic text-slate-800 mb-8 flex items-center gap-3">
                        <Layout className="text-indigo-600" size={24}/> New Announcement
                     </h3>
                     
                     <div className="space-y-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Announcement Title</label>
                           <input type="text" placeholder="e.g. Semester Exam Schedule Update" className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Content</label>
                           <textarea className="w-full p-6 bg-slate-50 rounded-[30px] border-none outline-none text-xs font-medium h-48 focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Enter the official announcement details here..."></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery Channels</label>
                              <div className="flex flex-wrap gap-3">
                                 {[
                                   { id: 'in-app', label: 'In-App', icon: Megaphone },
                                   { id: 'email', label: 'Email', icon: Mail },
                                   { id: 'sms', label: 'SMS', icon: MessageSquare }
                                 ].map(ch => (
                                    <button key={ch.id} className="px-5 py-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 hover:border-indigo-500 transition-all group">
                                       <ch.icon size={14} className="text-slate-400 group-hover:text-indigo-600"/>
                                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{ch.label}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</label>
                              <div className="flex gap-3">
                                 {['Standard', 'Urgent', 'Critical'].map(p => (
                                    <button key={p} className="px-5 py-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                                       {p}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-12 flex items-center gap-6">
                        <button className="flex-1 py-5 bg-slate-900 text-white rounded-[30px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                           <Send size={16}/> Dispatch Broadcast
                        </button>
                        <button className="px-10 py-5 bg-slate-50 text-slate-400 rounded-[30px] text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">
                           Save Draft
                        </button>
                     </div>
                  </div>
               </div>

               <div className="col-span-12 lg:col-span-4 space-y-8">
                  <div className="dash-card p-8 bg-indigo-600 text-white border-none shadow-2xl">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-8">Audience Segments</h4>
                     <div className="space-y-4">
                        <div className="p-5 bg-white/10 rounded-2xl border border-white/10 group cursor-pointer hover:bg-white/20 transition-all">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black italic">Target Audience</span>
                              <Users size={14}/>
                           </div>
                           <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-bold">Role: Students</p>
                           <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-bold mt-1">Dept: All</p>
                        </div>
                        <div className="p-5 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between opacity-50 italic cursor-not-allowed">
                           <span className="text-[10px] font-black uppercase tracking-widest">Apply Segment Filters</span>
                           <Filter size={14}/>
                        </div>
                     </div>
                     <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-200 leading-relaxed">
                           Selected audience includes approx. 2,400 active accounts across selected channels.
                        </p>
                     </div>
                  </div>

                  <div className="dash-card p-8">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Delivery Schedule</h4>
                     <div className="space-y-4">
                        <button className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-slate-600">
                           <div className="flex items-center gap-3">
                              <Clock size={16} className="text-indigo-600"/>
                              <span className="text-[10px] font-black uppercase tracking-widest">Send Now</span>
                           </div>
                           <CheckCircle size={16} className="text-emerald-500"/>
                        </button>
                        <button className="w-full p-5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between text-slate-400 hover:bg-slate-50 transition-all">
                           <div className="flex items-center gap-3">
                              <Clock size={16}/>
                              <span className="text-[10px] font-black uppercase tracking-widest">Schedule Later</span>
                           </div>
                        </button>
                     </div>
                  </div>
               </div>
            </>
         ) : (
            <div className="col-span-12">
               <div className="dash-card p-0 overflow-hidden bg-white border-none shadow-2xl">
                  <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <h2 className="text-xl font-black text-slate-800 italic flex items-center gap-3">
                        <Archive size={24} className="text-indigo-600"/> Dispatch Log
                     </h2>
                     <div className="flex items-center gap-4">
                        <div className="relative w-full md:w-64">
                           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input type="text" placeholder="Search broadcasts..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none outline-none text-xs font-bold focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="bg-slate-50/50">
                              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Broadcast Details</th>
                              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Channels</th>
                              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Reach</th>
                              <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                              <th className="px-8 py-5 pr-8"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {isLoading ? (
                             <tr><td colSpan={5} className="text-center py-20 animate-pulse text-indigo-600 font-black italic">Syncing History...</td></tr>
                           ) : history?.length === 0 ? (
                             <tr><td colSpan={5} className="text-center py-20 text-slate-400 italic font-medium">No broadcast history found.</td></tr>
                           ) : (
                             history?.map((msg: any, i: number) => (
                                <motion.tr 
                                  key={msg._id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="group hover:bg-slate-50/50 transition-all"
                                >
                                   <td className="px-8 py-6">
                                      <p className="text-sm font-black text-slate-800 mb-1">{msg.title}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent {new Date(msg.createdAt).toLocaleDateString()}</p>
                                   </td>
                                   <td className="px-8 py-6">
                                      <div className="flex gap-2">
                                         {msg.channels.map((ch: string) => (
                                            <div key={ch} className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                                               {ch === 'email' ? <Mail size={12}/> : ch === 'sms' ? <MessageSquare size={12}/> : <Megaphone size={12}/>}
                                            </div>
                                         ))}
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-3">
                                         <span className="text-xs font-black text-slate-800 italic">{msg.stats.readCount} / {msg.stats.targetCount}</span>
                                         <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${(msg.stats.readCount / msg.stats.targetCount) * 100}%` }}></div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                                        ${msg.status === 'Sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                         {msg.status}
                                      </span>
                                   </td>
                                   <td className="px-8 py-6 pr-8 text-right">
                                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                         <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-indigo-600 shadow-sm"><BarChart3 size={16}/></button>
                                         <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-rose-600 shadow-sm"><Trash2 size={16}/></button>
                                         <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 shadow-xl transition-all"><ChevronRight size={16}/></button>
                                      </div>
                                   </td>
                                </motion.tr>
                             ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}
      </div>

    </DashboardLayout>
  );
};

export default AdminBroadcast;
