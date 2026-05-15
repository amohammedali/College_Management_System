import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Search, Filter, 
  Layers, CheckCircle2, Bookmark,
  ChevronRight, X, Save, MessageSquare,
  Sparkles, BookMarked, Map, ArrowRight,
  Info, Clock, Target, Zap, Send, RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffSubjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalSubmitSuccess, setProposalSubmitSuccess] = useState(false);
  const [proposalError, setProposalError] = useState('');
  const [proposalData, setProposalData] = useState({
    name: '', code: '', semester: 1, type: 'Theory', 
    regulation: '2023', credits: { lecture: 3, tutorial: 0, practical: 0, total: 3 },
    justification: ''
  });

  const { data: mySubjects, isLoading, error, refetch } = useQuery({
    queryKey: ['staff-subjects'],
    queryFn: () => axios.get(`${API}/staff/subjects`).then(r => r.data),
  });

  const proposalMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/staff/subjects/proposals`, data),
    onSuccess: () => {
      setProposalSubmitSuccess(true);
      setProposalError('');
      setProposalData({ name: '', code: '', semester: 1, type: 'Theory', regulation: '2023', credits: { lecture: 3, tutorial: 0, practical: 0, total: 3 }, justification: '' });
      setTimeout(() => {
        setShowProposalModal(false);
        setProposalSubmitSuccess(false);
      }, 2500);
    },
    onError: (err: any) => {
      setProposalError(err?.response?.data?.message || 'Failed to submit proposal. Please try again.');
    }
  });

  const closeProposalModal = () => {
    setShowProposalModal(false);
    setProposalSubmitSuccess(false);
    setProposalError('');
  };

  const handleLTPCChange = (field: string, val: number) => {
     const newCredits = { ...proposalData.credits, [field]: val };
     newCredits.total = newCredits.lecture + newCredits.tutorial + newCredits.practical;
     setProposalData({ ...proposalData, credits: newCredits });
  };

  return (
    <DashboardLayout title="Academic Curriculum" subtitle="Manage Assigned Subjects, Syllabus Progress & Educational Innovation">
      <div className="max-w-7xl mx-auto pb-32">
        
        {/* Top Actions */}
        <div className="flex justify-between items-center mb-12">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BookOpen size={24} /></div>
              <div>
                 <h3 className="text-xl font-black text-slate-800 italic">
                    My Assigned Subjects {mySubjects?.length > 0 && `(${mySubjects.length})`}
                 </h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Current Academic Cycle • {new Date().getFullYear()}</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => refetch()}
                className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                title="Force Refresh Data"
              >
                 <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => setShowProposalModal(true)}
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20"
              >
                 <Plus size={18} /> <span className="font-bold text-sm">Propose New Subject</span>
              </button>
           </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {isLoading ? (
             [1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-[40px]" />)
           ) : error ? (
              <div className="col-span-full py-20 text-center bg-rose-50 rounded-[40px] border border-rose-100">
                 <Info className="mx-auto text-rose-500 mb-4" size={32} />
                 <h4 className="text-lg font-black text-rose-900">
                    {(error as any)?.response?.status === 503 ? 'Maintenance Mode' : 'Academic Profile Mismatch'}
                 </h4>
                 <p className="text-xs text-rose-600 mt-2 max-w-xs mx-auto">
                    {(error as any)?.response?.status === 503 
                      ? 'System is currently under maintenance. Please check back later.' 
                      : `We couldn't link your account (${user?.email}) to a faculty profile. Please contact admin.`}
                 </p>
                 <p className="text-[9px] font-mono text-rose-400 mt-4 uppercase tracking-tighter">Status: {(error as any)?.response?.status || 'Query Error'}</p>
              </div>
           ) : mySubjects?.map((sub: any, i: number) => (
              <motion.div 
                key={sub._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="dash-card p-8 group hover:border-indigo-200 transition-all cursor-pointer"
              >
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm italic group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                       {sub.code}
                    </div>
                    <div className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                       Sem {sub.semester}
                    </div>
                 </div>

                 <div className="space-y-1 mb-10">
                    <h4 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{sub.name}</h4>
                    <div className="flex items-center gap-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sub.type} • {sub.credits?.total || 0} Credits</p>
                       {sub.isSectionSpecific && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-bold">
                             {sub.year} Yr - Sec {sub.section}
                          </span>
                       )}
                    </div>
                 </div>

                 {/* Syllabus Progress */}
                 <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">Syllabus Coverage</span>
                       <span className="text-indigo-600">0%</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '0%' }} className="h-full bg-indigo-600 rounded-full" />
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <Map size={14} className="text-slate-300" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{sub.syllabus?.length || 0} Units Defined</span>
                    </div>
                    <button 
                       onClick={() => navigate(`/staff/syllabus/${sub._id}`)}
                       className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                    >
                       Orchestrate Syllabus <ArrowRight size={14} />
                    </button>
                 </div>
              </motion.div>
           ))}
           
           {(!isLoading && !error && (!mySubjects || mySubjects.length === 0)) && (
              <div className="col-span-full py-32 text-center dash-card border-dashed bg-slate-50/20">
                 <Zap className="mx-auto text-slate-200 mb-6" size={48} />
                 <h4 className="text-xl font-black text-slate-400 italic">No Active Assignments</h4>
                 <p className="text-xs font-medium text-slate-400 mt-2 max-w-xs mx-auto">Contact your departmental administrator to assign subjects for the current academic cycle.</p>
              </div>
           )}
        </div>

        {/* Proposal Modal */}
        <AnimatePresence>
           {showProposalModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeProposalModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="p-10">
                       <div className="flex justify-between items-center mb-10">
                          <div>
                             <h3 className="text-2xl font-black text-slate-800 italic">Propose New Subject</h3>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Academic Innovation Portal</p>
                          </div>
                          <button type="button" onClick={closeProposalModal} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"><X size={20} /></button>
                       </div>

                       {proposalSubmitSuccess ? (
                         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center">
                           <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8"><CheckCircle2 size={40} /></div>
                           <h4 className="text-2xl font-black text-slate-800 italic mb-3">Proposal Submitted!</h4>
                           <p className="text-sm text-slate-500 max-w-sm mx-auto">Your subject proposal has been sent for administrative review. You'll be notified once it's approved.</p>
                         </motion.div>
                       ) : (
                       <form onSubmit={(e) => { e.preventDefault(); setProposalError(''); proposalMutation.mutate(proposalData); }} className="space-y-8">
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                                <input type="text" required value={proposalData.name} onChange={e => setProposalData({...proposalData, name: e.target.value})} placeholder="e.g. Machine Learning" className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proposed Code</label>
                                <input type="text" required value={proposalData.code} onChange={e => setProposalData({...proposalData, code: e.target.value})} placeholder="e.g. CS401" className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all uppercase" />
                             </div>
                          </div>

                          <div className="grid grid-cols-3 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                                <select value={proposalData.semester} onChange={e => setProposalData({...proposalData, semester: Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold">
                                   {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                <select value={proposalData.type} onChange={e => setProposalData({...proposalData, type: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold">
                                   <option value="Theory">Theory</option>
                                   <option value="Lab/Practical">Lab / Practical</option>
                                   <option value="Elective">Elective</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Regulation</label>
                                <select value={proposalData.regulation} onChange={e => setProposalData({...proposalData, regulation: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 outline-none transition-all">
                                    <option value="2023">Regulation 2023</option>
                                    <option value="2021">Regulation 2021</option>
                                    <option value="2025">Regulation 2025</option>
                                </select>
                             </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                             {(['lecture', 'tutorial', 'practical'] as const).map(field => (
                                <div key={field} className="space-y-2">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 capitalize">{field} hrs</label>
                                   <input type="number" min={0} value={(proposalData.credits as any)[field]} onChange={e => handleLTPCChange(field, Number(e.target.value))} className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold" />
                                </div>
                             ))}
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Total</label>
                                <div className="w-full px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-black">{proposalData.credits.total}</div>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Justification</label>
                             <textarea required value={proposalData.justification} onChange={e => setProposalData({...proposalData, justification: e.target.value})} placeholder="Why is this subject needed in the curriculum? How does it align with industry needs?" className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-600 outline-none transition-all h-28 resize-none" />
                          </div>

                          {proposalError && (
                            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3">
                              <Info size={16} className="shrink-0" />{proposalError}
                            </div>
                          )}

                          <button 
                            type="submit"
                            disabled={proposalMutation.isPending}
                            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-900/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {proposalMutation.isPending ? (
                              <><RefreshCw size={18} className="animate-spin" /> Submitting...</>
                            ) : (
                              <><Send size={18} /> Submit Proposal for Review</>
                            )}
                          </button>
                       </form>
                       )}
                    </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default StaffSubjects;
