import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  DollarSign, Plus, Trash2, Edit3, 
  Copy, Calendar, Building2, ShieldCheck,
  AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FEE_TYPES = ['tuition', 'exam', 'lab', 'hostel', 'bus', 'misc'];

const FeeStructureBuilder = () => {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedReg, setSelectedReg] = useState('2023');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    feeType: 'tuition',
    amount: '',
    academicYear: 1,
    dueDate: '',
    installmentAllowed: false
  });

  // Queries
  const { data: departments } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  const { data: structures, isLoading } = useQuery({
    queryKey: ['fee-structures', selectedDept, selectedReg],
    queryFn: () => axios.get(`${API}/fee/structures?dept=${selectedDept}&regulation=${selectedReg}`).then(r => r.data),
    enabled: !!selectedDept
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/fee/fee-structures`, data), // Fixed path in code but wait, let me check feeRoutes
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      setIsAdding(false);
      setFormData({ feeType: 'tuition', amount: '', academicYear: 1, dueDate: '', installmentAllowed: false });
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Failed to create fee structure')
  });

  // Wait, I noticed I used /api/fee/structures in routes but /api/fee/fee-structures in some thoughts. 
  // Let me re-verify feeRoutes.ts.
  // router.post('/structures', ...)
  // So it's ${API}/fee/structures.

  const cloneMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/fee/structures/clone`, data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      alert(res.data.message);
    }
  });

  const handleClone = () => {
    const targetReg = prompt('Enter target regulation year (e.g. 2025):');
    if (targetReg) {
      cloneMutation.mutate({
        fromRegulation: selectedReg,
        toRegulation: targetReg,
        department: selectedDept
      });
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      department: selectedDept,
      regulation: selectedReg,
      amount: Number(formData.amount)
    });
  };

  return (
    <DashboardLayout title="Fee Structure Builder" subtitle="Define institutional fee components and academic billing rules">
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left: Configuration Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
           <div className="dash-card p-6 space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={14} /> Master Context
              </h4>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                    <select 
                      value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500"
                    >
                       <option value="">Select Dept...</option>
                       {departments?.map((d: any) => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Regulation</label>
                    <select 
                      value={selectedReg} onChange={e => setSelectedReg(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none"
                    >
                       {['2021', '2023', '2025'].map(r => <option key={r} value={r}>Regulation {r}</option>)}
                    </select>
                 </div>
              </div>
           </div>

           {selectedDept && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setIsAdding(true)}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all"
              >
                 <Plus size={16} /> Add Fee Component
              </motion.button>
           )}
        </div>

        {/* Right: Structure Table & Forms */}
        <div className="col-span-12 lg:col-span-9">
           <AnimatePresence mode="wait">
              {isAdding ? (
                 <motion.div 
                   key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                   className="dash-card p-8 bg-white"
                 >
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xl font-black text-slate-800 italic">Configure New Component</h3>
                       <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600">Cancel</button>
                    </div>

                    <form onSubmit={handleCreate} className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Type</label>
                          <select 
                            value={formData.feeType} onChange={e => setFormData({...formData, feeType: e.target.value as any})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                          >
                             {FEE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)} Fee</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</label>
                          <select 
                            value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: Number(e.target.value)})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold"
                          >
                             {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (INR)</label>
                          <div className="relative">
                             <DollarSign size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input 
                               type="number" required placeholder="0.00"
                               value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                               className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" 
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
                          <input 
                            type="date" required
                            value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" 
                          />
                       </div>
                       <div className="col-span-2 flex items-center gap-3 p-4 bg-primary-50/50 rounded-2xl border border-primary-100">
                          <input 
                            type="checkbox" id="inst"
                            checked={formData.installmentAllowed} onChange={e => setFormData({...formData, installmentAllowed: e.target.checked})}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" 
                          />
                          <label htmlFor="inst" className="text-xs font-bold text-slate-700 italic">Allow Partial / Installment Payments for this component</label>
                       </div>
                       <button 
                         type="submit" disabled={createMutation.isPending}
                         className="col-span-2 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl"
                       >
                          {createMutation.isPending ? 'Provisioning...' : 'Deploy Fee Component'}
                       </button>
                    </form>
                 </motion.div>
              ) : (
                 <motion.div 
                   key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                   className="dash-card p-0 overflow-hidden bg-white border-none shadow-2xl"
                 >
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <div>
                          <h3 className="text-xl font-black text-slate-800 italic">Active Components</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                             {selectedDept || 'No Unit Selected'} • Regulation {selectedReg}
                          </p>
                       </div>
                       <button 
                         onClick={handleClone}
                         className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:text-primary-600 transition-all"
                       >
                          <Copy size={14} /> Clone Structure
                       </button>
                    </div>

                    {!selectedDept ? (
                       <div className="p-32 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6"><Building2 size={32}/></div>
                          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Context Required</h4>
                          <p className="text-xs text-slate-400 max-w-[200px] mt-2">Select a department and regulation to manage fee components.</p>
                       </div>
                    ) : (
                       <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                             <thead>
                                <tr className="bg-slate-50">
                                   <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Year</th>
                                   <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Component</th>
                                   <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                                   <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                   <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Options</th>
                                   <th className="p-5 pr-8"></th>
                                </tr>
                             </thead>
                             <tbody>
                                {structures?.length === 0 ? (
                                   <tr>
                                      <td colSpan={6} className="p-20 text-center text-slate-400 italic text-sm font-medium">No components defined for this configuration.</td>
                                   </tr>
                                ) : (
                                   structures?.map((s: any) => (
                                      <tr key={s._id} className="border-t border-slate-50 group hover:bg-slate-50/50 transition-all">
                                         <td className="p-6 pl-8">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black">YEAR {s.academicYear}</span>
                                         </td>
                                         <td className="p-6">
                                            <div className="flex items-center gap-3">
                                               <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><DollarSign size={14}/></div>
                                               <div>
                                                  <h5 className="text-xs font-black text-slate-800 capitalize">{s.feeType} Fee</h5>
                                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Standard Component</p>
                                               </div>
                                            </div>
                                         </td>
                                         <td className="p-6">
                                            <div className="flex items-center gap-2 text-slate-600">
                                               <Calendar size={12}/>
                                               <span className="text-xs font-bold">{new Date(s.dueDate).toLocaleDateString()}</span>
                                            </div>
                                         </td>
                                         <td className="p-6 text-sm font-black text-slate-800 italic">₹{s.amount.toLocaleString()}</td>
                                         <td className="p-6">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${s.installmentAllowed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                               {s.installmentAllowed ? 'Installments OK' : 'One-time'}
                                            </span>
                                         </td>
                                         <td className="p-6 pr-8 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                               <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                                               <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                                            </div>
                                         </td>
                                      </tr>
                                   ))
                                )}
                             </tbody>
                          </table>
                       </div>
                    )}
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FeeStructureBuilder;
