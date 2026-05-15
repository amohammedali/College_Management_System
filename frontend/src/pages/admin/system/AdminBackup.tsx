import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, RefreshCw, HardDrive, ShieldCheck, 
  Settings, Clock, History, Cloud, Download, 
  AlertTriangle, CheckCircle, Info, ChevronRight, Play
} from 'lucide-react';

const AdminBackup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backups, setBackups] = useState<any[]>([
    { id: '1', name: 'Full System Snapshot - Final Q3', date: '2024-03-24', type: 'Differential', size: '1.2 GB', status: 'Healthy' },
    { id: '2', name: 'Master Database Replicated', date: '2024-03-22', type: 'Full Archive', size: '4.8 GB', status: 'Healthy' }
  ]);
  const [destination, setDestination] = useState('AWS S3');

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    await new Promise(r => setTimeout(r, 3000));
    const newBackup = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Manual Backup - ${new Date().toLocaleTimeString()}`,
      date: new Date().toLocaleDateString(),
      type: 'Incremental',
      size: '420 MB',
      status: 'Healthy'
    };
    setBackups([newBackup, ...backups]);
    setIsBackingUp(false);
  };

  return (
    <DashboardLayout title="Automated Backup Scheduler" subtitle="Enterprise-Grade Data Resilience, Point-in-Time Recovery, and Cloud Sync Management">
      
      <div className="grid grid-cols-12 gap-8">
        {/* Backup Configuration (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5"><Database size={120} /></div>
              <h2 className="text-xl font-black mb-8 italic text-indigo-400">Scheduler Config</h2>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Storage Destination</label>
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                         onClick={() => setDestination('AWS S3')}
                         className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${destination === 'AWS S3' ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10 opacity-60'}`}
                       >
                          <Cloud size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">AWS S3</span>
                       </button>
                       <button 
                         onClick={() => setDestination('Local NAS')}
                         className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${destination === 'Local NAS' ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10 opacity-60'}`}
                       >
                          <HardDrive size={20} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Local NAS</span>
                       </button>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Backup Frequency</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 text-white">
                       <option className="bg-slate-900">Daily at 04:00 AM</option>
                       <option className="bg-slate-900">Weekly on Sundays</option>
                       <option className="bg-slate-900">Real-time Replication</option>
                    </select>
                 </div>

                 <button 
                   onClick={handleManualBackup}
                   disabled={isBackingUp}
                   className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30"
                 >
                    {isBackingUp ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                    {isBackingUp ? 'Compiling Archive...' : 'Trigger Manual Backup'}
                 </button>
              </div>
           </div>

           <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl text-emerald-500 shadow-sm"><ShieldCheck size={16} /></div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">System Health</p>
                 <p className="text-[11px] text-emerald-700/70 font-medium">All database shards are synchronized. No data corruption detected in the last 30 backup cycles.</p>
              </div>
           </div>
        </div>

        {/* Backup Logs (8 columns) */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-lg font-black text-slate-800 leading-tight italic">Point-in-Time Recovery Points</h3>
              <div className="flex gap-2">
                 <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"><RefreshCw size={16} /></button>
                 <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer text-[10px] font-black uppercase flex items-center gap-2">Settings <Settings size={14} /></button>
              </div>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {backups.map((b, i) => (
                  <motion.div 
                    key={b.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="dash-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-6 lg:w-1/2">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                          <Database size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate max-w-[200px] md:max-w-xs">{b.name}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{b.date} • {b.type}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Archive Size</p>
                          <p className="text-sm font-black text-slate-700">{b.size}</p>
                        </div>
                        <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                          <CheckCircle size={14} /> {b.status}
                        </span>
                        <div className="flex gap-2">
                          <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"><Download size={16} /></button>
                          <button className="p-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10 opacity-0 group-hover:opacity-100 transition-all"><RefreshCw size={16} /></button>
                        </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           <div className="mt-12 p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100/50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-white rounded-3xl shadow-sm text-indigo-600"><AlertTriangle size={24} /></div>
                 <div>
                    <h4 className="text-sm font-black text-slate-800 italic">Disaster Recovery Protocol</h4>
                    <p className="text-xs text-indigo-600/70 font-medium leading-relaxed">
                       In case of critical failure, the system can be rolled back to any recovery point within 15 minutes. Cold storage archives are maintained for 7 years.
                    </p>
                 </div>
              </div>
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30">
                 Configure Policies
              </button>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBackup;
