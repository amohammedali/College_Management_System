import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FileText, TrendingUp, Award, BookOpen, 
  Plus, CheckCircle, Clock, ChevronRight,
  BarChart3, Target, ShieldCheck, Zap,
  ExternalLink, Trash2, Search, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FacultyAppraisal = () => {
  const [showPubModal, setShowPubModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pubForm, setPubForm] = useState({ title: '', pubType: 'journal', yearPublished: 2024, doi: '', impactFactor: 0 });
  const [adminForm, setAdminForm] = useState({ title: '', contribution_type: 'committee', hours_invested: 0 });
  
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => axios.get(`${API}/auth/profile`).then(r => r.data)
  });

  const { data: cycle, isLoading } = useQuery({
    queryKey: ['my-appraisal', profile?.staff?._id],
    queryFn: () => axios.get(`${API}/appraisal/cycles/${profile?.staff?._id}/2024-25`).then(r => r.data),
    enabled: !!profile?.staff?._id
  });

  const verifyDoiMutation = useMutation({
    mutationFn: (doi: string) => axios.post(`${API}/appraisal/research/verify-doi`, { doi }),
    onSuccess: (res) => {
      setPubForm({ ...pubForm, title: res.data.title, impactFactor: res.data.impactFactor || 0 });
      toast.success('DOI Verified!');
    }
  });

  const addPubMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/appraisal/research`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appraisal'] });
      setShowPubModal(false);
      toast.success('Publication added for review');
    }
  });

  const addAdminMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/appraisal/admin`, { ...data, faculty_id: profile?.staff?._id, cycle_year: '2024-25' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appraisal'] });
      setShowAdminModal(false);
      toast.success('Admin contribution logged');
    }
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => axios.post(`${API}/appraisal/cycles/${id}/compute`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-appraisal'] });
      toast.success('Scores re-calculated successfully');
    }
  });

  if (isLoading) return <div className="p-8">Loading Appraisal Profile...</div>;

  const currentCycle = cycle?.appraisal;

  return (
    <DashboardLayout title="Faculty Appraisal" subtitle="Annual Career Progression • Performance Metrics">
      
      {!currentCycle ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-xl text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
            <Clock size={40}/>
          </div>
          <h3 className="text-xl font-black text-slate-800 italic mb-2">No Active Cycle</h3>
          <p className="text-slate-400 text-sm max-w-md">Your annual appraisal cycle has not been initiated by your HOD yet. Please contact the department office for more information.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          
          {/* ── API Score Overview ── */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Zap size={100}/></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current API Grade</p>
              <h2 className="text-5xl font-black italic mb-6">{currentCycle.apiGrade || 'TBD'}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="font-bold text-slate-400">Total Score</span>
                   <span className="font-black italic text-indigo-400">{currentCycle.apiScore.toFixed(2)} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${currentCycle.apiScore}%` }}
                     className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                   />
                </div>
              </div>
              
              {currentCycle.promotionEligible && (
                <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                      <Target size={16}/>
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Promotion Eligible</p>
                </div>
              )}

              <button 
                onClick={() => syncMutation.mutate(currentCycle._id)}
                disabled={syncMutation.isPending}
                className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {syncMutation.isPending ? 'Calculating...' : 'Sync Live Metrics'}
              </button>
            </div>

            <div className="dash-card p-8 bg-white border border-slate-100">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Weighted Components</h4>
               <div className="space-y-6">
                  {[
                    { label: 'Academic (40%)', score: currentCycle.academicScore, color: 'bg-indigo-500' },
                    { label: 'Research (30%)', score: currentCycle.researchScore, color: 'bg-emerald-500' },
                    { label: 'Feedback (20%)', score: currentCycle.feedbackScore, color: 'bg-amber-500' },
                    { label: 'Admin (10%)', score: currentCycle.adminScore, color: 'bg-rose-500' }
                  ].map(item => (
                    <div key={item.label}>
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="text-slate-800">{item.label}</span>
                          <span className="text-slate-400">{item.score.toFixed(1)}%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }}/>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* ── Evaluation Details ── */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="dash-card p-8 bg-white border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <div>
                   <h3 className="text-xl font-black text-slate-800 italic">Self Evaluation</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {currentCycle.status.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={() => setShowPubModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                   >
                      <Plus size={14}/> Research
                   </button>
                   <button 
                    onClick={() => setShowAdminModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                   >
                      <Plus size={14}/> Admin Role
                   </button>
                </div>
              </div>

              <div className="space-y-12">
                 {/* Research Timeline */}
                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <BookOpen size={14}/> Research Timeline
                    </h4>
                    <div className="space-y-4">
                       {cycle.pubs?.map((pub: any) => (
                          <div key={pub._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                   <FileText size={18}/>
                                </div>
                                <div>
                                   <h5 className="text-sm font-black text-slate-800">{pub.title}</h5>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{pub.pubType} • {pub.yearPublished} • IF: {pub.impactFactor || 'N/A'}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest
                                   ${pub.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                   {pub.isVerified ? 'Verified' : 'Pending'}
                                </span>
                                <button className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                                   <Trash2 size={14}/>
                                </button>
                             </div>
                          </div>
                       ))}
                       {!cycle.pubs?.length && <p className="p-10 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-3xl">No publications added yet.</p>}
                    </div>
                 </div>

                 {/* Admin Roles */}
                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                       <ShieldCheck size={14}/> Admin Contributions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {cycle.admin?.map((adm: any) => (
                          <div key={adm._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                             <div>
                                <h5 className="text-xs font-black text-slate-800">{adm.title}</h5>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{adm.contributionType.replace('_', ' ')} • {adm.hoursInvested} Hours</p>
                             </div>
                             {adm.verifiedBy ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                   <CheckCircle size={14}/>
                                </div>
                             ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                   <Clock size={14}/>
                                </div>
                             )}
                          </div>
                       ))}
                       {!cycle.admin?.length && <p className="col-span-2 p-10 text-center text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-3xl">No admin roles logged.</p>}
                    </div>
                 </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
         {showPubModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPubModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10">
                  <h3 className="text-xl font-black text-slate-800 italic mb-6">Add Research Publication</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">DOI (Optional)</label>
                        <div className="flex gap-2">
                           <input type="text" value={pubForm.doi} onChange={(e) => setPubForm({ ...pubForm, doi: e.target.value })} className="flex-1 p-3 bg-slate-50 border-none rounded-xl text-sm font-bold" placeholder="10.1000/xyz..." />
                           <button onClick={() => verifyDoiMutation.mutate(pubForm.doi)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase">Verify</button>
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Title</label>
                        <input type="text" value={pubForm.title} onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Type</label>
                           <select value={pubForm.pubType} onChange={(e) => setPubForm({ ...pubForm, pubType: e.target.value as any })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold">
                              <option value="journal">Journal</option>
                              <option value="conference">Conference</option>
                              <option value="book_chapter">Book Chapter</option>
                              <option value="patent">Patent</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Year</label>
                           <input type="number" value={pubForm.yearPublished} onChange={(e) => setPubForm({ ...pubForm, yearPublished: parseInt(e.target.value) })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold" />
                        </div>
                     </div>
                     <button onClick={() => addPubMutation.mutate(pubForm)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest mt-4 shadow-lg shadow-indigo-500/20">Add Publication</button>
                  </div>
               </motion.div>
            </div>
         )}

         {showAdminModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdminModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10">
                  <h3 className="text-xl font-black text-slate-800 italic mb-6">Log Administrative Role</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Role Title</label>
                        <input type="text" value={adminForm.title} onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold" placeholder="e.g. Exam Cell Member" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contribution Type</label>
                        <select value={adminForm.contribution_type} onChange={(e) => setAdminForm({ ...adminForm, contribution_type: e.target.value as any })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold">
                           <option value="committee">Committee</option>
                           <option value="exam_duty">Exam Duty</option>
                           <option value="event_coord">Event Coordination</option>
                           <option value="mentor">Mentor</option>
                           <option value="dept_role">Department Role</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hours Invested</label>
                        <input type="number" value={adminForm.hours_invested} onChange={(e) => setAdminForm({ ...adminForm, hours_invested: parseInt(e.target.value) })} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold" />
                     </div>
                     <button onClick={() => addAdminMutation.mutate(adminForm)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest mt-4 shadow-lg shadow-indigo-500/20">Log Contribution</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default FacultyAppraisal;
