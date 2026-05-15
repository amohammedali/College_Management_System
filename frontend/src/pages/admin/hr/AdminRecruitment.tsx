import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, Filter, Calendar, 
  FileText, Mail, ArrowRight, CheckCircle, 
  Clock, XCircle, Info, ChevronRight, Briefcase, Plus, X, Save, RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminRecruitment = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Faculty', stage: 'Inquiry', phone: ''
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['admin-recruitment'],
    queryFn: () => axios.get(`${API}/admin/recruitment`).then(r => r.data),
  });

  const createCandidateMutation = useMutation({
    mutationFn: (newCandidate: any) => axios.post(`${API}/admin/recruitment`, newCandidate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-recruitment'] });
      setShowAddModal(false);
      setFormData({ name: '', email: '', role: 'Faculty', stage: 'Inquiry', phone: '' });
    },
  });

  const stages = [
    { label: 'Inquiries', key: 'inquiry', color: 'bg-slate-100 text-slate-600' },
    { label: 'Shortlisted', key: 'screening', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Technical', key: 'technical interview', color: 'bg-blue-50 text-blue-600' },
    { label: 'Management', key: 'management round', color: 'bg-purple-50 text-purple-600' },
    { label: 'Offered', key: 'offer letter', color: 'bg-emerald-50 text-emerald-600' }
  ];

  const getStageCount = (key: string) => {
    return candidates?.filter((c: any) => c.stage?.toLowerCase() === key || c.status?.toLowerCase() === key)?.length || 0;
  };

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    createCandidateMutation.mutate({ ...formData, status: formData.stage });
  };

  return (
    <DashboardLayout title="Recruitment Pipeline" subtitle="End-to-End Talent Acquisition: From Inquiry Capture to Offer Letter Generation">
      
      {/* ── Pipeline Visualization ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
         {stages.map((stage, i) => (
           <div key={i} className={`p-6 rounded-3xl border border-transparent hover:border-slate-200 transition-all ${stage.color}`}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">{stage.label}</p>
              <p className="text-3xl font-black italic">{getStageCount(stage.key)}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Active Applications (8 columns) */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-lg font-black text-slate-800 italic">Candidate Pool</h3>
              <div className="flex gap-2">
                 <button 
                   onClick={() => setShowAddModal(true)}
                   className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                 >
                    <Plus size={16} /> Add Candidate
                 </button>
                 <div className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"><Search size={16} /></div>
              </div>
           </div>

           <div className="space-y-4">
              {candidates?.length > 0 ? candidates.map((can: any, i: number) => (
                <motion.div 
                  key={can._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="dash-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-200 transition-all cursor-pointer"
                >
                   <div className="flex items-center gap-6 lg:w-1/3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all font-black">
                         {can.name.charAt(0)}
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{can.name}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{can.email}</p>
                      </div>
                   </div>

                   <div className="flex-1 grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied Role</p>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Briefcase size={12} className="text-indigo-500" /> {can.role}
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Clock size={12} className="text-indigo-500" /> {can.stage || can.status}
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-2">
                      <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"><Mail size={16} /></button>
                      <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"><FileText size={16} /></button>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                   </div>
                </motion.div>
              )) : (
                <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No recruitment candidates in database</p>
                </div>
              )}
           </div>
        </div>

        {/* Quick Actions (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20">
              <div className="p-4 bg-white/10 rounded-3xl w-fit mb-8"><UserPlus size={28} className="text-indigo-400" /></div>
              <h2 className="text-xl font-black mb-8 italic">Talent Search</h2>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Post a Job Opening</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 transition-all">
                       <option>Full-time Faculty (Engineering)</option>
                       <option>Lab Assistant (Physics)</option>
                       <option>Admin Staff</option>
                    </select>
                 </div>
                 <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20">
                    Publish to Portal
                 </button>
              </div>

              <div className="mt-10 pt-10 border-t border-white/5">
                 <div className="flex items-center gap-3 mb-4">
                    <CheckCircle size={18} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Offer Engine Active</span>
                 </div>
                 <p className="text-[11px] text-slate-500 font-medium">Auto-generate offer letters using institutional templates once management round is cleared.</p>
              </div>
           </div>

           <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                 <Briefcase size={18} className="text-indigo-600" />
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Interview Mode</h4>
              </div>
              <p className="text-[11px] text-indigo-600/70 font-medium leading-relaxed">Integrated Google Meet & Zoom hooks are active for remote technical assessments.</p>
           </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
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
                    <div className="p-3 bg-indigo-600 rounded-2xl"><UserPlus size={24} /></div>
                    <div>
                       <h3 className="text-xl font-black italic">Enroll Candidate</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Talent Acquisition Pipeline</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddCandidate} className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Candidate Name</label>
                       <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" placeholder="e.g. Dr. Robert Wilson" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Institutional Email</label>
                       <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input" placeholder="robert.w@talent.com" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Applied Role</label>
                       <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="form-input appearance-none">
                          <option>Faculty</option>
                          <option>HOD</option>
                          <option>Lab Technician</option>
                          <option>Admin Executive</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Initial Stage</label>
                       <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="form-input appearance-none">
                          {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                    <button 
                      disabled={createCandidateMutation.isPending}
                      type="submit"
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center gap-3"
                    >
                       {createCandidateMutation.isPending ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                       {createCandidateMutation.isPending ? 'Enrolling...' : 'Enroll Candidate'}
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

export default AdminRecruitment;
