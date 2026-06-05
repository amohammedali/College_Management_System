import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Package, Activity, QrCode, HardDrive, 
  Search, Filter, Plus, Download, Wrench, 
  AlertTriangle, CheckCircle2, History 
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAssets = () => {
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['asset-stats'],
    queryFn: () => axios.get(`${API}/assets/stats`).then(r => r.data),
  });

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets-list'],
    queryFn: () => axios.get(`${API}/assets`).then(r => r.data),
  });

  const qrMutation = useMutation({
    mutationFn: (id: string) => axios.get(`${API}/assets/qr/${id}`).then(r => r.data),
    onSuccess: (data) => setShowQRModal(data.qr)
  });

  return (
    <DashboardLayout title="Asset Intel" subtitle="Industrial Asset Tracking, Health Analytics, and QR Inventory Management">
      
      {/* ── High-Fidelity Amber Metrics ── */}
      <div className="grid grid-cols-12 gap-8 mb-12">
         <div className="col-span-12 lg:col-span-4 dash-card p-8 bg-amber-500 text-white border-none shadow-xl shadow-amber-500/20 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-20 transform -rotate-12"><Package size={180} /></div>
            <div className="relative">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-amber-900/50">Total Institutional Assets</h3>
               <div className="flex items-end gap-4">
                  <p className="text-6xl font-black italic">{stats?.totalAssets || 0}</p>
                  <div className="mb-2">
                     <p className="text-[10px] font-black uppercase">+12 This Month</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 dash-card p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10 transform rotate-12"><Activity size={180} /></div>
            <div className="relative">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-slate-500">Infrastructure Health</h3>
               <div className="flex items-end gap-4">
                  <p className="text-6xl font-black italic text-amber-400">{stats?.healthRate || '0.0'}%</p>
                  <div className="mb-2">
                     <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase">
                        <CheckCircle2 size={12}/> Operational
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 dash-card p-8 bg-white border-amber-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quick Actions</h3>
               <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Wrench size={16}/></div>
            </div>
            <div className="space-y-3">
               <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg">
                  Register New Asset
               </button>
               <button className="w-full py-4 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all">
                  Bulk QR Generation
               </button>
            </div>
         </div>
      </div>

      {/* ── Asset Inventory Grid ── */}
      <div className="dash-card p-0 overflow-hidden bg-white shadow-xl border-slate-100">
         <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-xl font-black text-slate-800 italic">Inventory Master</h2>
            <div className="flex items-center gap-4">
               <div className="relative w-full md:w-64">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search by ID or Name..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none outline-none text-xs font-bold focus:ring-2 focus:ring-amber-500 transition-all" />
               </div>
               <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-amber-600 transition-all"><Filter size={18}/></button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="p-5 pl-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset ID</th>
                     <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Specifications</th>
                     <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                     <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Health</th>
                     <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="p-5 pr-8"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {assets?.map((asset: any) => (
                     <tr key={asset._id} className="group hover:bg-amber-50/30 transition-all cursor-pointer">
                        <td className="p-6 pl-8">
                           <span className="font-mono text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{asset.assetId}</span>
                        </td>
                        <td className="p-6">
                           <p className="text-sm font-black text-slate-800 mb-1">{asset.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{asset.location || 'Central Stores'}</p>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-amber-100 group-hover:text-amber-600 transition-all"><HardDrive size={12}/></div>
                              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{asset.category}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <span className={`text-xs font-black ${asset.health > 80 ? 'text-emerald-500' : asset.health > 50 ? 'text-amber-500' : 'text-rose-500'}`}>{asset.health}%</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }} 
                                   animate={{ width: `${asset.health}%` }} 
                                   className={`h-full ${asset.health > 80 ? 'bg-emerald-500' : asset.health > 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                 />
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                             ${asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                               asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                               'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {asset.status}
                           </span>
                        </td>
                        <td className="p-6 pr-8 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); qrMutation.mutate(asset._id); }}
                                className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-amber-500 transition-all shadow-lg"
                              >
                                 <QrCode size={14}/>
                              </button>
                              <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 transition-all"><History size={14}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* ── QR Label Modal ── */}
      <AnimatePresence>
         {showQRModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => setShowQRModal(null)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 20 }}
                 className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden"
               >
                  <div className="p-10 text-center">
                     <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/10">
                        <QrCode size={40} />
                     </div>
                     <h4 className="text-xl font-black text-slate-800 italic mb-2">Asset QR Label Generated</h4>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Unique Digital Identity for Physical Tagging</p>
                     
                     <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 inline-block mb-10">
                        <img src={showQRModal} alt="Asset QR" className="w-48 h-48 mix-blend-multiply" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <button className="py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
                           <Download size={14}/> Save PNG
                        </button>
                        <button className="py-4 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                           Print Label
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default AdminAssets;
