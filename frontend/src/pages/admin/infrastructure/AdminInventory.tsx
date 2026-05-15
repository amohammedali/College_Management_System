import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, QrCode, Search, Filter, HardDrive, 
  Book, Monitor, AlertTriangle, ArrowRight, CheckCircle,
  Plus, History, RefreshCcw, X, Save
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminInventory = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'IT Hardware', status: 'Available', location: '', assignedTo: '', serialNumber: ''
  });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => axios.get(`${API}/admin/inventory`).then(r => r.data),
  });

  const { data: config } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => axios.get(`${API}/admin/settings`).then(r => r.data),
  });

  const createAssetMutation = useMutation({
    mutationFn: (newAsset: any) => axios.post(`${API}/admin/inventory`, newAsset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      setShowAddModal(false);
      setFormData({ name: '', category: 'IT Hardware', status: 'Available', location: '', assignedTo: '', serialNumber: '' });
    },
  });

  const metrics = config?.inventoryMetrics || {
    totalAssets: inventory?.length || '0',
    healthRate: '98.5%',
    maintenanceDue: []
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    createAssetMutation.mutate(formData);
  };

  return (
    <DashboardLayout title="Asset & Inventory" subtitle="QR-Based Tracking for Institutional Hardware, Lab Equipment, and Library Resources">
      
      <div className="grid grid-cols-12 gap-8">
        {/* Statistics & Quick Actions (3 columns) */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
           <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5"><Package size={80} /></div>
              <h3 className="text-lg font-black italic mb-8">Asset Intel</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Assets</p>
                       <p className="text-3xl font-black italic">{inventory?.length || '0'}</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center"><HardDrive size={18} /></div>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Health Rate</p>
                       <p className="text-3xl font-black italic">{metrics.healthRate || '0.0%'}</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><CheckCircle size={18} /></div>
                 </div>
              </div>
              <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                Generate QR Labels
              </button>
           </div>

           <div className="dash-card p-6 border-amber-100 bg-amber-50/30">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20"><AlertTriangle size={16} /></div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Maintenance Due</h4>
              </div>
              <div className="space-y-3">
                 {metrics.maintenanceDue?.length > 0 ? metrics.maintenanceDue.map((m: any, i: number) => (
                   <div key={i} className="p-3 bg-white border border-amber-100 rounded-xl">
                      <p className="text-xs font-bold text-slate-700 leading-tight">{m.name}</p>
                      <p className="text-[9px] font-black text-amber-500 uppercase mt-1">Due in {m.days} days</p>
                   </div>
                 )) : (
                   <p className="text-[10px] text-slate-400 font-medium italic">No immediate maintenance</p>
                 )}
              </div>
           </div>
        </div>

        {/* Inventory Master List (9 columns) */}
        <div className="col-span-12 lg:col-span-9">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 px-2">
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                   <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="text" placeholder="Scan QR or search asset..." className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 rounded-xl outline-none" />
                </div>
                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"><QrCode size={16} /></button>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                 <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-300 transition-all">
                    <History size={14} /> Log History
                 </button>
                 <button 
                   onClick={() => setShowAddModal(true)}
                   className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                 >
                    <Plus size={14} /> Register Asset
                 </button>
              </div>
           </div>

           <div className="dash-card overflow-hidden">
              <table className="w-full">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Asset Identity</th>
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status / User</th>
                       <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Location</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {inventory?.length > 0 ? inventory.map((item: any, i: number) => (
                       <tr key={item._id || i} className="hover:bg-slate-50/50 transition-all group cursor-pointer">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white
                                  ${item.category === 'IT Hardware' ? 'bg-indigo-500' : item.category === 'Library' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                   {item.category === 'IT Hardware' ? <Monitor size={18} /> : item.category === 'Library' ? <Book size={18} /> : <Package size={18} />}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.serialNumber || 'ASSET-ID'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.category}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter w-fit mb-1
                                  ${item.status === 'In Use' ? 'bg-indigo-50 text-indigo-600' : item.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                   {item.status}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">{item.assignedTo || 'Unassigned'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2 text-slate-500 group-hover:text-indigo-600 transition-colors">
                                <span className="text-xs font-black italic">{item.location}</span>
                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                             </div>
                          </td>
                       </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                          No assets registered in database
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Register Asset Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl"><Plus size={24} /></div>
                    <div>
                       <h3 className="text-xl font-black italic">Register Asset</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Add to Institutional Inventory</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddAsset} className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Asset Name</label>
                       <input 
                         required
                         type="text" 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="form-input" 
                         placeholder="e.g. Dell Latitude 5420" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Category</label>
                       <select 
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value})}
                         className="form-input appearance-none"
                       >
                          <option>IT Hardware</option>
                          <option>Lab Equipment</option>
                          <option>Library</option>
                          <option>Furniture</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Serial Number / Tag</label>
                       <input 
                         type="text" 
                         value={formData.serialNumber}
                         onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                         className="form-input" 
                         placeholder="e.g. SN-98234-X" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Location</label>
                       <input 
                         required
                         type="text" 
                         value={formData.location}
                         onChange={e => setFormData({...formData, location: e.target.value})}
                         className="form-input" 
                         placeholder="e.g. Lab 4 / Block A" 
                       />
                    </div>
                 </div>

                 <div className="flex justify-end gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={createAssetMutation.isPending}
                      type="submit"
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center gap-3"
                    >
                       {createAssetMutation.isPending ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                       {createAssetMutation.isPending ? 'Registering...' : 'Register Asset'}
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminInventory;
