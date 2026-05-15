import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, CheckCircle2, XCircle, Clock, 
  MessageSquare, User, BookOpen, Layers,
  ChevronRight, X, Save, ShieldCheck, 
  AlertCircle, Edit3, Sparkles
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminApprovalQueue = () => {
  const queryClient = useQueryClient();
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['admin-subject-proposals'],
    queryFn: () => axios.get(`${API}/admin/subjects/proposals`).then(r => r.data),
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, status, data }: any) => axios.put(`${API}/admin/subjects/proposals/${id}`, { status, ...data }),
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['admin-subject-proposals'] });
       queryClient.invalidateQueries({ queryKey: ['admin-subjects'] });
       setSelectedProposal(null);
       setAdminNote('');
       setRejectionReason('');
    }
  });

  return (
    <DashboardLayout title="Approval Queue" subtitle="Review Faculty Subject Proposals & Curriculum Innovation Requests">
      <div className="max-w-7xl mx-auto pb-32">
        
        <div className="grid grid-cols-12 gap-8">
           {/* Left: Proposal List */}
           <div className="col-span-12 lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Inbox size={16} className="text-indigo-600" /> Pending Requests
                 </h3>
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {proposals?.length || 0} In Queue
                 </span>
              </div>

              <div className="space-y-4">
                 {isLoading ? (
                    [1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-[32px]" />)
                 ) : proposals?.map((p: any, i: number) => (
                    <motion.div 
                      key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedProposal(p)}
                      className={`dash-card p-6 flex items-center justify-between cursor-pointer transition-all border group ${selectedProposal?._id === p._id ? 'border-indigo-600 shadow-2xl shadow-indigo-100' : 'hover:border-indigo-200'}`}
                    >
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                             {p.code}
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-800">{p.name}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Proposed by {p.proposedBy?.name}</p>
                          </div>
                       </div>
                       <ChevronRight size={20} className={`transition-all ${selectedProposal?._id === p._id ? 'text-indigo-600 translate-x-2' : 'text-slate-200'}`} />
                    </motion.div>
                 ))}

                 {(!proposals || proposals.length === 0) && (
                    <div className="py-24 text-center dash-card border-dashed bg-slate-50/30">
                       <ShieldCheck className="mx-auto text-slate-200 mb-6" size={48} />
                       <h4 className="text-xl font-black text-slate-400 italic">Queue is Empty</h4>
                       <p className="text-xs font-medium text-slate-400 mt-2">All curriculum proposals have been processed.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Right: Detail View */}
           <div className="col-span-12 lg:col-span-5">
              <AnimatePresence mode="wait">
                 {selectedProposal ? (
                    <motion.div 
                      key={selectedProposal._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="dash-card p-8 space-y-8 sticky top-32"
                    >
                       <div className="flex justify-between items-start">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BookOpen size={24} /></div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Proposed Credits</p>
                             <h3 className="text-2xl font-black text-slate-800 italic">{selectedProposal.credits.total} Units</h3>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div>
                             <h4 className="text-lg font-black text-slate-800">{selectedProposal.name}</h4>
                             <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedProposal.department}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester {selectedProposal.semester}</span>
                             </div>
                          </div>

                          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MessageSquare size={14} /> Faculty Justification</p>
                             <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{selectedProposal.justification}"</p>
                          </div>
                       </div>

                       <div className="space-y-6 pt-8 border-t border-slate-100">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Note</label>
                             <textarea 
                               value={adminNote} onChange={e => setAdminNote(e.target.value)}
                               placeholder="Add a note for the faculty..."
                               className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-xs font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all h-24"
                             />
                          </div>

                          <div className="flex gap-4">
                             <button 
                               onClick={() => decisionMutation.mutate({ id: selectedProposal._id, status: 'approved', data: { adminNote } })}
                               disabled={decisionMutation.isPending}
                               className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                             >
                                <CheckCircle2 size={16} /> Approve Subject
                             </button>
                             <button 
                               onClick={() => decisionMutation.mutate({ id: selectedProposal._id, status: 'rejected', data: { rejectionReason: adminNote } })}
                               disabled={decisionMutation.isPending}
                               className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                             >
                                <XCircle size={16} /> Reject
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center dash-card border-dashed bg-slate-50/20">
                       <Sparkles className="text-slate-200 mb-6" size={48} />
                       <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Selection Required</h4>
                       <p className="text-[10px] font-medium text-slate-400 mt-2">Select a proposal from the queue to review details.</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminApprovalQueue;
