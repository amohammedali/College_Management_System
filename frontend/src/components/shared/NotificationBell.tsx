import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Megaphone, Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => axios.get(`${API}/broadcast/notifications/my`).then(r => r.data),
    refetchInterval: 30000 // Poll every 30s
  });

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm relative group"
      >
         <Bell size={20} className="group-hover:rotate-12 transition-transform" />
         {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
               {unreadCount}
            </span>
         )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-[400px] bg-white rounded-[32px] shadow-2xl border border-slate-100 z-50 overflow-hidden"
            >
               <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="text-sm font-black italic text-slate-800">Recent Alerts</h4>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">
                     {unreadCount} New
                  </span>
               </div>

               <div className="max-h-[450px] overflow-y-auto">
                  {isLoading ? (
                     <div className="p-10 text-center text-slate-400 animate-pulse text-xs font-bold italic uppercase tracking-widest">
                        Syncing Notifications...
                     </div>
                  ) : notifications?.length === 0 ? (
                     <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                           <CheckCircle size={32}/>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">You're all caught up!</p>
                     </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                       {notifications.map((n: any) => (
                          <div key={n._id} className={`p-6 hover:bg-slate-50 transition-all cursor-pointer group flex gap-4 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 
                               ${n.type === 'alert' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                <Megaphone size={18}/>
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                   <p className="text-xs font-black text-slate-800 truncate">{n.title}</p>
                                   <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                      <Clock size={10}/> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">{n.content}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                  )}
               </div>

               <button className="w-full py-5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all">
                  View All Notifications
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
