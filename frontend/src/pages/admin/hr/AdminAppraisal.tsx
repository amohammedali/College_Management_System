import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Users, Award, AlertCircle, CheckCircle, 
  Search, Filter, ChevronRight, BarChart3,
  TrendingUp, ShieldCheck, History, Plus,
  FileText, Download, Send, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAppraisal = () => {
  const [activeTab, setActiveTab] = useState<'pool' | 'promotion' | 'rules'>('pool');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState<any>(null);
  const [initiateData, setInitiateData] = useState({ dept_id: '', cycle_year: '2024-25' });
  const [reviewForm, setReviewForm] = useState({ 
    scores: { pedagogy: 5, content: 5, engagement: 5, overall: 5 },
    strengths: '',
    improvements: '',
    class_observed: '',
    observation_date: new Date().toISOString().split('T')[0]
  });
  
  const queryClient = useQueryClient();

  // ── Queries ──
  const { data: performance } = useQuery({
    queryKey: ['performance-index'],
    queryFn: () => axios.get(`${API}/analytics/performance-index?year=2024-25`).then(r => r.data)
  });

  const { data: cycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['appraisal-cycles', activeTab],
    queryFn: () => {
      const url = activeTab === 'promotion' 
        ? `${API}/appraisal/promotion-eligible?year=2024-25`
        : `${API}/appraisal/cycles?year=2024-25`;
      return axios.get(url).then(r => r.data);
    }
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data)
  });

  // ── Mutations ──
  const initiateMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/appraisal/cycles/initiate`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisal-cycles'] });
      toast.success('Appraisal cycles initiated successfully');
      setShowInitiateModal(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to initiate cycles');
    }
  });

  const exportMatrixMutation = useMutation({
    mutationFn: () => axios.post(`${API}/appraisal/export/matrix`, { year: '2024-25' }),
    onSuccess: (res) => {
      toast.success('Matrix PDF generated!');
      window.open(res.data.pdf_url, '_blank');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to export matrix');
    }
  });

  const downloadReportMutation = useMutation({
    mutationFn: (facultyId: string) => axios.get(`${API}/appraisal/promotion/report/${facultyId}/2024-25`),
    onSuccess: (res) => {
      window.open(res.data.pdfUrl, '_blank');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate report');
    }
  });

  const peerReviewMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/appraisal/peer-review`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisal-cycles'] });
      toast.success('Peer review submitted successfully!');
      setShowReviewModal(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  });

  const saveRulesMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/appraisal/promotion/rules`, data),
    onSuccess: () => {
      toast.success('UGC Regulation Rules updated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update rules');
    }
  });

  const syncSystemMutation = useMutation({
    mutationFn: () => axios.post(`${API}/appraisal/cycles/sync-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appraisal-cycles'] });
      toast.success('System-wide appraisal sync complete!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Full sync failed');
    }
  });

  // ── Filtering ──
  const filteredCycles = cycles?.filter((c: any) => 
    c.faculty?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Appraisal Control" subtitle="Staff Performance Review • Promotion Management">
      
      {/* ── High Level Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="dash-card p-6 bg-slate-900 text-white border-none shadow-2xl flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
               <Users size={28}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg API Score</p>
               <p className="text-2xl font-black italic">{performance?.avgApi || '0.0'}</p>
            </div>
         </div>
         <div className="dash-card p-6 bg-white border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <Award size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Promotion Eligible</p>
               <p className="text-2xl font-black italic text-slate-800">{performance?.eligibleCount || 0}</p>
            </div>
         </div>
         <div className="dash-card p-6 bg-white border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
               <TrendingUp size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Research Papers</p>
               <p className="text-2xl font-black italic text-slate-800">{performance?.papers || 0}</p>
            </div>
         </div>
         <div className="dash-card p-6 bg-white border border-slate-100 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
               <BarChart3 size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg Student Rating</p>
               <p className="text-2xl font-black italic text-slate-800">{performance?.avgRating || '0.0'}/5</p>
            </div>
         </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
         <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 w-fit">
            {[
              { id: 'pool', label: 'Candidate Pool', icon: Users },
              { id: 'promotion', label: 'Promotion Eligible', icon: Award },
              { id: 'rules', label: 'UGC Rules', icon: ShieldCheck }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all
                  ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <tab.icon size={14}/> {tab.label}
              </button>
            ))}
         </div>
         <div className="flex gap-3">
            <button 
               onClick={() => syncSystemMutation.mutate()}
               disabled={syncSystemMutation.isPending}
               className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
            >
               <BarChart3 size={14}/>
               {syncSystemMutation.isPending ? 'Syncing...' : 'Synchronize System'}
            </button>
            <button 
               onClick={() => exportMatrixMutation.mutate()}
               className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
            >
               <Download size={14}/> Export Matrix
            </button>
            <button 
               onClick={() => setShowInitiateModal(true)}
               className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
               <Plus size={14}/> Initiate Cycle
            </button>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         <div className="col-span-12">
            <motion.div 
               layout
               className="dash-card p-0 bg-white border border-slate-100 overflow-hidden shadow-sm"
            >
               <div className="p-8 border-b border-slate-50 flex flex-wrap gap-4 justify-between items-center">
                  <h3 className="text-xl font-black text-slate-800 italic">
                     {activeTab === 'pool' ? 'Annual Appraisal Pool' : 'Promotion Eligibility List'}
                  </h3>
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/>
                     <input 
                        type="text" 
                        placeholder="Search Faculty..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-medium focus:ring-2 ring-indigo-500/20 w-64"
                     />
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  {activeTab === 'rules' ? (
                     <div className="p-12 max-w-4xl">
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <h4 className="text-lg font-black text-slate-800 italic">Universal Appraisal Configuration</h4>
                              <p className="text-slate-400 text-xs mt-1">Define UGC Regulation thresholds for automated career progression tracking.</p>
                           </div>
                           <button 
                              onClick={() => saveRulesMutation.mutate({ 
                                 rules: [
                                    { fromDesignation: 'Assistant Professor', toDesignation: 'Associate Professor', minApiScore: 75, minYearsService: 8, minResearchPapers: 10, minPhd: true },
                                    { fromDesignation: 'Associate Professor', toDesignation: 'Professor', minApiScore: 85, minYearsService: 12, minResearchPapers: 15, minPhd: true }
                                 ] 
                              })}
                              disabled={saveRulesMutation.isPending}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                           >
                              {saveRulesMutation.isPending ? 'Saving...' : 'Save Global Rules'}
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {[
                              { label: 'Assistant Professor → Associate', api: 75, papers: 10, service: 8 },
                              { label: 'Associate Professor → Professor', api: 85, papers: 15, service: 12 },
                              { label: 'Professor → Senior Professor', api: 95, papers: 25, service: 15 }
                           ].map((rule, idx) => (
                              <div key={idx} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden group hover:bg-white hover:shadow-xl transition-all">
                                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><ShieldCheck size={80}/></div>
                                 <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6">{rule.label}</h5>
                                 
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-slate-400 uppercase">Min API Score</span>
                                       <input type="number" defaultValue={rule.api} className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-center font-black italic text-indigo-600 outline-none" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-slate-400 uppercase">Research Papers</span>
                                       <input type="number" defaultValue={rule.papers} className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-center font-black italic text-indigo-600 outline-none" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-slate-400 uppercase">Service Years</span>
                                       <input type="number" defaultValue={rule.service} className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-center font-black italic text-indigo-600 outline-none" />
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                    <>
                      <table className="w-full">
                         <thead className="bg-slate-50/50">
                            <tr>
                               <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Details</th>
                               {activeTab === 'promotion' ? (
                                  <>
                                     <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Years in Grade</th>
                                     <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">PhD Status</th>
                                  </>
                               ) : (
                                  <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                               )}
                               <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">API Score</th>
                               <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
                               <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {filteredCycles?.map((c: any) => (
                               <tr key={c._id} className="hover:bg-slate-50/80 transition-all group">
                                  <td className="px-8 py-5">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black italic text-sm">
                                           {c.faculty?.name?.[0]}
                                        </div>
                                        <div>
                                           <h5 className="text-sm font-black text-slate-800">{c.faculty?.name}</h5>
                                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{c.faculty?.designation} • {c.faculty?.department}</p>
                                        </div>
                                     </div>
                                  </td>
                                  {activeTab === 'promotion' ? (
                                     <>
                                        <td className="px-8 py-5 text-center">
                                           <span className="text-xs font-black text-slate-800 italic">{Math.floor((new Date().getTime() - new Date(c.faculty?.dateOfJoining).getTime()) / (1000 * 3600 * 24 * 365.25))} Years</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                           {c.faculty?.hasPhd ? (
                                              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">PhD Verified</span>
                                           ) : (
                                              <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest">No PhD</span>
                                           )}
                                        </td>
                                     </>
                                  ) : (
                                     <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                                           ${c.status === 'closed' ? 'bg-emerald-50 text-emerald-600' : 
                                             c.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'}`}>
                                           {c.status.replace('_', ' ')}
                                        </span>
                                        <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">{c.daysInCycle} Days in Cycle</p>
                                     </td>
                                  )}
                                  <td className="px-8 py-5 text-center">
                                     <span className="text-sm font-black text-slate-800 italic">{c.apiScore?.toFixed(2)}</span>
                                  </td>
                                  <td className="px-8 py-5 text-center">
                                     <span className={`badge px-2 py-1 rounded-lg text-white text-[10px] font-black
                                        ${c.apiGrade === 'A+' ? 'bg-emerald-500' : 
                                          c.apiGrade === 'A' ? 'bg-indigo-500' : 
                                          c.apiGrade === 'B+' ? 'bg-amber-500' : 'bg-rose-500'}`}>
                                        {c.apiGrade || 'N/A'}
                                     </span>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                     <div className="flex justify-end gap-2">
                                        <button 
                                           onClick={() => {
                                              setShowReviewModal(c);
                                              setReviewForm({ ...reviewForm, class_observed: c.faculty?.department });
                                           }}
                                           className="px-3 py-1.5 bg-slate-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
                                        >
                                           Review
                                        </button>
                                        {activeTab === 'promotion' && (
                                           <button 
                                              onClick={() => downloadReportMutation.mutate(c.faculty._id)}
                                              className="p-2 bg-white text-slate-400 hover:text-indigo-600 border border-slate-100 rounded-lg transition-all"
                                              title="Download Report"
                                           >
                                              <FileText size={16}/>
                                           </button>
                                        )}
                                        <button className="p-2 bg-white text-slate-400 hover:text-slate-600 border border-slate-100 rounded-lg transition-all">
                                           <ChevronRight size={16}/>
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      {(!filteredCycles || filteredCycles.length === 0) && (
                         <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                               <Users size={32}/>
                            </div>
                            <p className="text-slate-400 text-sm font-medium italic">No appraisal records found.</p>
                         </div>
                      )}
                    </>
                  )}
               </div>
            </motion.div>
         </div>
      </div>

      {/* ── Peer Review Modal ── */}
      <AnimatePresence>
         {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReviewModal(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><ShieldCheck size={120}/></div>
                  <h3 className="text-2xl font-black text-slate-800 italic mb-2">HOD Peer Review</h3>
                  <p className="text-slate-400 text-sm mb-8 font-medium">Reviewing: <span className="text-slate-800 font-bold">{showReviewModal.faculty?.name}</span> • {showReviewModal.cycleYear}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        {Object.keys(reviewForm.scores).map((key) => (
                           <div key={key}>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block capitalize">{key}</label>
                              <div className="flex gap-2">
                                 {[1, 2, 3, 4, 5].map(val => (
                                    <button 
                                       key={val}
                                       onClick={() => setReviewForm({ ...reviewForm, scores: { ...reviewForm.scores, [key]: val } })}
                                       className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center
                                          ${(reviewForm.scores as any)[key] === val ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                                    >
                                       <Star size={14} fill={(reviewForm.scores as any)[key] === val ? 'currentColor' : 'none'}/>
                                    </button>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="space-y-6">
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Class Observed</label>
                           <input type="text" value={reviewForm.class_observed} onChange={(e) => setReviewForm({ ...reviewForm, class_observed: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Observation Date</label>
                           <input type="date" value={reviewForm.observation_date} onChange={(e) => setReviewForm({ ...reviewForm, observation_date: e.target.value })} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-emerald-600">Strengths</label>
                           <textarea value={reviewForm.strengths} onChange={(e) => setReviewForm({ ...reviewForm, strengths: e.target.value })} className="w-full p-4 bg-emerald-50/50 border-none rounded-2xl text-sm font-bold h-24" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-rose-600">Improvements</label>
                           <textarea value={reviewForm.improvements} onChange={(e) => setReviewForm({ ...reviewForm, improvements: e.target.value })} className="w-full p-4 bg-rose-50/50 border-none rounded-2xl text-sm font-bold h-24" />
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-3 pt-8 mt-8 border-t border-slate-50">
                     <button onClick={() => setShowReviewModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                     <button 
                        onClick={() => peerReviewMutation.mutate({ 
                           ...reviewForm, 
                           faculty_id: showReviewModal.faculty._id, 
                           cycle_year: showReviewModal.cycleYear 
                        })} 
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20"
                     >
                        {peerReviewMutation.isPending ? 'Submitting...' : 'Submit Peer Review'}
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* ── Initiate Cycle Modal ── */}
      <AnimatePresence>
         {showInitiateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowInitiateModal(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
               />
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><TrendingUp size={120}/></div>
                  <h3 className="text-2xl font-black text-slate-800 italic mb-2">Initiate Review Cycle</h3>
                  <p className="text-slate-400 text-sm mb-8 font-medium">Select a department to bulk-initiate draft appraisal records for the current academic year.</p>
                  
                  <div className="space-y-6">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Department</label>
                        <select 
                           value={initiateData.dept_id}
                           onChange={(e) => setInitiateData({ ...initiateData, dept_id: e.target.value })}
                           className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-indigo-500/20"
                        >
                           <option value="">Select Department...</option>
                           {departments?.map((d: any) => (
                              <option key={d._id} value={d._id}>{d.name}</option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Academic Year</label>
                        <input 
                           type="text" 
                           value={initiateData.cycle_year}
                           disabled
                           className="w-full p-4 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
                        />
                     </div>
                     <div className="flex gap-3 pt-4">
                        <button 
                           onClick={() => setShowInitiateModal(false)}
                           className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                           Cancel
                        </button>
                        <button 
                           onClick={() => initiateMutation.mutate(initiateData)}
                           disabled={!initiateData.dept_id || initiateMutation.isPending}
                           className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                           {initiateMutation.isPending ? 'Initiating...' : 'Start Cycle'}
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

export default AdminAppraisal;
