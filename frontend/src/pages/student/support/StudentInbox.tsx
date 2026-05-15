import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Search, Filter, Mail, 
  Trash2, Archive, Star, Info, ChevronRight,
  User, Megaphone, Bell
} from 'lucide-react';

const StudentInbox = () => {
  const [messages] = useState([]);

  return (
    <DashboardLayout title="Universal Inbox" subtitle="Centralized Messaging: Institution Broadcasts, Faculty Alerts, and Peer Notifications">
      
      <div className="grid grid-cols-12 gap-8">
        {/* Inbox Categories (3 columns) */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
           {[
             { id: 'all', label: 'All Messages', icon: MessageSquare, count: 0 },
             { id: 'broadcasts', label: 'Broadcasts', icon: Megaphone, count: 0 },
             { id: 'faculty', label: 'Faculty Alerts', icon: User, count: 0 },
             { id: 'system', label: 'System Logs', icon: Bell, count: 0 },
             { id: 'archived', label: 'Archived', icon: Archive, count: 0 }
           ].map((cat, i) => (
             <button 
               key={cat.id}
               className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${i === 0 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
             >
                <div className="flex items-center gap-4">
                   <cat.icon size={18} />
                   <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                </div>
                {cat.count > 0 && <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[9px] font-black">{cat.count}</span>}
             </button>
           ))}
        </div>

        {/* Message List (9 columns) */}
        <div className="col-span-12 lg:col-span-9">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-2">
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search messages..." className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 rounded-xl outline-none" />
                 </div>
                 <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><Filter size={16} /></button>
              </div>
              <div className="flex gap-3">
                 <button className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Mark all as read</button>
              </div>
           </div>

           {/* Zero-Data Initial State */}
           <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-slate-100 rounded-[48px] bg-white/50">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                 <Mail size={48} />
              </div>
              <h4 className="text-sm font-black text-slate-800 italic mb-2">Your Inbox is Tranquil</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center max-w-xs leading-relaxed">
                 When the institution sends broadcasts or faculty provides feedback, they will appear here in high-fidelity.
              </p>
           </div>

           <div className="mt-12 p-10 bg-indigo-50/50 rounded-[48px] border border-indigo-100/50 flex items-start gap-8">
              <div className="p-4 bg-white rounded-3xl text-indigo-600 shadow-sm"><Info size={28} /></div>
              <div>
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2 italic">Institutional Reach</h4>
                 <p className="text-xs text-indigo-600/70 font-medium leading-relaxed max-w-lg">
                    The Universal Inbox aggregates communications across Email, SMS, and In-App Push. Urgent alerts are highlighted with high-priority visual markers.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentInbox;
