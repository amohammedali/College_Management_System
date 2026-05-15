import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Users, Mail, MessageSquare, Phone, Send, 
  Search, Filter, CheckCircle, AlertTriangle, 
  History, Clock, Info, ChevronRight, BarChart3
} from 'lucide-react';

const StaffParentComm = () => {
  const [logs] = useState([]);

  return (
    <DashboardLayout title="Parent Communication" subtitle="Omnichannel Parent Engagement: Academic Alerts, Meeting Schedulers, and Performance Reports">
      
      <div className="grid grid-cols-12 gap-8">
        {/* Composer (7 columns) */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <div className="dash-card p-8">
            <div className="flex items-center gap-4 mb-10">
               <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20"><MessageSquare size={24} /></div>
               <div>
                  <h2 className="text-xl font-black text-slate-800">Comm Composer</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Parent Engagement</p>
               </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Select Audience</label>
                <div className="flex flex-wrap gap-2">
                  {['Specific Student', 'Entire Batch', 'Low Attendance Group', 'Late Fee Group'].map(tag => (
                    <button key={tag} className="px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Student Name</label>
                   <input type="text" placeholder="Search student..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Alert Category</label>
                   <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500">
                      <option>Academic Performance</option>
                      <option>Attendance Deficit</option>
                      <option>Behavioral Remark</option>
                      <option>General Announcement</option>
                   </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Message Template</label>
                <textarea rows={4} placeholder="Dear Parent, This is to inform you that..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500" />
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white">
                 <div className="flex gap-4">
                    <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20"><Mail size={18} /></button>
                    <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20"><Phone size={18} /></button>
                 </div>
                 <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30">
                    <Send size={16} /> Dispatch Alert
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comm Logs (5 columns) */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
           <div className="dash-card p-8">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-lg font-black text-slate-800 italic">Engagement Logs</h3>
                 <div className="flex gap-2">
                    <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100"><Search size={16} /></button>
                 </div>
              </div>

              <div className="space-y-4">
                {logs.map((log, i) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 transition-all cursor-pointer group"
                  >
                     <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{log.type}</span>
                        <span className="text-[10px] font-bold text-slate-400">{log.date}</span>
                     </div>
                     <h4 className="font-bold text-slate-800 text-sm mb-1">{log.student}</h4>
                     <p className="text-[10px] font-bold text-slate-400 mb-4">Parent: {log.parent}</p>
                     <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase">
                           <CheckCircle size={12} /> {log.status}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                           <Info size={12} /> {log.channel} Channel
                        </div>
                     </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="flex items-center gap-3 mb-4">
                    <BarChart3 size={18} className="text-indigo-600" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700">Response Rate</h4>
                 </div>
                 <div className="h-2 bg-white rounded-full overflow-hidden mb-2">
                    <div className="w-[92%] h-full bg-indigo-600" />
                 </div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">92% Parent acknowledgement via App</p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffParentComm;
