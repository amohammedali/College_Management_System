import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, Search, Filter, 
  Settings2, UserCheck, ShieldCheck, History,
  AlertCircle, CheckCircle2, ChevronRight, X,
  Trash2, Edit3, Power, ExternalLink, Briefcase
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDepartments = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [showAudit, setShowAudit] = useState(false);

  const [formData, setFormData] = useState({
    name: '', code: '', degreeType: 'B.E.', totalSemesters: 8,
    totalSections: 1,
    regulations: ['2023'], hod: ''
  });

  const { data: departments, isLoading } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  const { data: faculty } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: () => axios.get(`${API}/admin/staff`).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = { ...data };
      if (!payload.hod) delete payload.hod; // Don't send empty string for ObjectId
      return axios.post(`${API}/admin/departments`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || '';
      if (msg.includes('E11000')) {
        alert('Error: A department with this Name or Code already exists.');
      } else {
        alert(msg || 'Failed to connect to server. Please try again.');
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => {
      const payload = { ...data };
      if (!payload.hod) delete payload.hod;
      return axios.put(`${API}/admin/departments/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || '';
      if (msg.includes('E11000')) {
        alert('Error: Name or Code is already taken by another unit.');
      } else {
        alert(msg || 'Failed to update department record.');
      }
    }
  });

  const resetForm = () => {
    setFormData({ name: '', code: '', degreeType: 'B.E.', totalSemesters: 8, totalSections: 1, regulations: ['2023'], hod: '' });
    setSelectedDept(null);
  };

  const filteredDepts = departments?.filter((d: any) => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Department Governance" subtitle="Manage Institutional Units, Regulation Cycles & Academic Leadership">
      <div className="max-w-7xl mx-auto pb-32">
        
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input 
                type="text" placeholder="Search by name or code..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:border-indigo-600 shadow-xl shadow-slate-200/20"
              />
           </div>
           <button 
             onClick={() => { resetForm(); setIsModalOpen(true); }}
             className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20"
           >
              <Plus size={18} /> <span className="font-bold text-sm">Provision Department</span>
           </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {isLoading ? (
             [1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-[32px]" />)
           ) : filteredDepts?.map((dept: any, i: number) => (
              <motion.div 
                key={dept._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="dash-card p-8 group hover:border-indigo-200 transition-all"
              >
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                       <Building2 size={28} />
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={() => { setSelectedDept(dept); setFormData(dept); setIsModalOpen(true); }}
                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                       >
                          <Edit3 size={18} />
                       </button>
                       <button 
                         onClick={() => { setSelectedDept(dept); setShowAudit(true); }}
                         className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                       >
                          <History size={18} />
                       </button>
                    </div>
                 </div>

                 <div className="space-y-1 mb-8">
                    <h3 className="text-xl font-black text-slate-800 italic">{dept.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{dept.code}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-200" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dept.degreeType}</span>
                    </div>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400 flex items-center gap-2"><UserCheck size={14} /> Head of Dept</span>
                       <span className="text-slate-800">{dept.hod?.name || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400 flex items-center gap-2"><ShieldCheck size={14} /> Regulation</span>
                       <div className="flex gap-1">
                          {dept.regulations?.map((r: string) => (
                             <span key={r} className="px-2 py-0.5 bg-slate-100 rounded-md">{r}</span>
                          ))}
                       </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400 flex items-center gap-2"><Briefcase size={14} /> Total Sections</span>
                       <span className="text-slate-800">{dept.totalSections || 1} Section(s)</span>
                    </div>
                 </div>

                 <button 
                   onClick={() => updateMutation.mutate({ id: dept._id, data: { status: dept.status === 'active' ? 'inactive' : 'active', details: `Status toggled to ${dept.status === 'active' ? 'inactive' : 'active'}` } })}
                   className={`mt-8 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${dept.status === 'active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                 >
                    <Power size={14} /> {dept.status === 'active' ? 'Active Unit' : 'Discontinued'}
                 </button>
              </motion.div>
           ))}
        </div>
      </div>

      {/* Provisioning Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh]">
                  <div className="p-10">
                     <div className="flex justify-between items-center mb-10">
                        <div>
                           <h3 className="text-2xl font-black text-slate-800 italic">{selectedDept ? 'Edit Governance' : 'Provision Department'}</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Structure Configuration</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"><X size={20} /></button>
                     </div>

                     <form onSubmit={(e) => { e.preventDefault(); selectedDept ? updateMutation.mutate({ id: selectedDept._id, data: formData }) : createMutation.mutate(formData); }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Name</label>
                              <input 
                                type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Computer Science & Eng"
                                className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept Code</label>
                              <input 
                                type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                                placeholder="e.g. CSE"
                                className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all uppercase"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Degree Type</label>
                              <select 
                                value={formData.degreeType} onChange={e => setFormData({...formData, degreeType: e.target.value})}
                                className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                              >
                                 <option value="B.E.">B.E.</option>
                                 <option value="B.Tech">B.Tech</option>
                                 <option value="B.Sc.">B.Sc.</option>
                                 <option value="M.E.">M.E.</option>
                                 <option value="M.B.A.">M.B.A.</option>
                              </select>
                           </div>
                           {/* HOD Assignment - Only shown if staff exists in this department */}
                           {selectedDept && faculty?.some((f: any) => f.department === selectedDept.name) && (
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HOD Assignment</label>
                                 <select 
                                    value={formData.hod} onChange={e => setFormData({...formData, hod: e.target.value})}
                                    className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                 >
                                    <option value="">Select HOD...</option>
                                    {faculty
                                       ?.filter((f: any) => f.department === selectedDept.name)
                                       .map((f: any) => <option key={f._id} value={f._id}>{f.name}</option>)}
                                 </select>
                              </div>
                           )}
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Sections</label>
                              <input 
                                type="number" required min="1" max="10" value={formData.totalSections} onChange={e => setFormData({...formData, totalSections: Number(e.target.value)})}
                                className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Semesters</label>
                              <input 
                                type="number" required min="1" max="10" value={formData.totalSemesters} onChange={e => setFormData({...formData, totalSemesters: Number(e.target.value)})}
                                className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Regulations (Comma separated)</label>
                           <input 
                             type="text" value={formData.regulations.join(', ')} onChange={e => setFormData({...formData, regulations: e.target.value.split(',').map(s => s.trim())})}
                             placeholder="e.g. 2021, 2023"
                             className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all"
                           />
                        </div>

                        <button 
                          type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                          className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-900/20 flex items-center justify-center gap-3"
                        >
                           {selectedDept ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                           {selectedDept ? 'Update Governance Record' : 'Provision Department Now'}
                        </button>
                     </form>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Audit Log Slide-over */}
      <AnimatePresence>
         {showAudit && (
            <div className="fixed inset-0 z-[110] flex justify-end">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAudit(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
               <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                     <div>
                        <h4 className="text-xl font-black text-slate-800 italic">Governance Audit</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedDept?.name}</p>
                     </div>
                     <button onClick={() => setShowAudit(false)} className="p-3 text-slate-400 hover:text-rose-600 transition-all"><X size={24} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                     {selectedDept?.auditLog?.map((log: any, i: number) => (
                        <div key={i} className="flex gap-6 relative">
                           {i !== selectedDept.auditLog.length - 1 && <div className="absolute left-4 top-10 bottom-[-32px] w-0.5 bg-slate-50" />}
                           <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 z-10">
                              <History size={16} />
                           </div>
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.action}</span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed">{log.details}</p>
                              <div className="mt-3 flex items-center gap-2">
                                 <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-400 italic">A</div>
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">By {log.user}</span>
                              </div>
                           </div>
                        </div>
                     )).reverse()}
                     {(!selectedDept?.auditLog || selectedDept.auditLog.length === 0) && (
                        <div className="py-20 text-center">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200"><ShieldCheck size={32} /></div>
                           <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No audit records found.</p>
                        </div>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default AdminDepartments;
