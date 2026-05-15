import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, CheckCircle2, AlertTriangle, Clock, 
  BookOpen, ListChecks, Target, Zap,
  ChevronRight, ArrowLeft, Plus, Sparkles,
  Info, History, BookMarked, Filter,
  Check, X, Loader2, Calendar, FileText,
  LayoutGrid, Activity, ChevronDown, Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffSyllabus = () => {
  const { id: subjectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [newUnit, setNewUnit] = useState({ unitNumber: 1, unitName: '', totalHours: 4, expectedWeekRange: 'Week 1-3' });
  const [editUnitData, setEditUnitData] = useState({ unitNumber: 1, unitName: '', totalHours: 4, expectedWeekRange: 'Week 1-3' });
  const [newTopic, setNewTopic] = useState({ topicName: '', plannedHours: 1, coMapping: '', poMapping: '' });
  const [editTopicData, setEditTopicData] = useState({ topicName: '', plannedHours: 1, coMapping: '', poMapping: '' });
  const [newResource, setNewResource] = useState({ type: 'PDF', title: '', url: '' });
  const [topicSearch, setTopicSearch] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  // 1. Fetch Subject Detail
  const { data: subject, isLoading: isSubjectLoading } = useQuery({
    queryKey: ['staff-subject', subjectId],
    queryFn: () => axios.get(`${API}/staff/subjects/${subjectId}`).then(r => r.data),
    enabled: !!subjectId && subjectId !== 'undefined'
  });

  // 2. Fetch Analysis (Gap Analysis)
  const { data: analysis, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['syllabus-analysis', subjectId],
    queryFn: () => axios.get(`${API}/staff/syllabus/analysis/${subjectId}`).then(r => r.data),
    enabled: !!subjectId && subjectId !== 'undefined'
  });

  // 3. Fetch Units
  const { data: units, isLoading: isUnitsLoading } = useQuery({
    queryKey: ['syllabus-units', subjectId],
    queryFn: () => axios.get(`${API}/staff/syllabus/units/${subjectId}`).then(r => r.data),
    onSuccess: (data) => {
        if (data.length > 0 && !activeUnitId) setActiveUnitId(data[0]._id);
    },
    enabled: !!subjectId && subjectId !== 'undefined'
  });

  // 4. Fetch Topics for Active Unit
  const { data: topics, isLoading: isTopicsLoading } = useQuery({
    queryKey: ['syllabus-topics', activeUnitId],
    queryFn: () => axios.get(`${API}/staff/syllabus/topics/${activeUnitId}`).then(r => r.data),
    enabled: !!activeUnitId && activeUnitId !== 'undefined'
  });

  useEffect(() => {
    if (analysis) {
        console.log('[Syllabus] Analysis Data:', analysis);
    }
  }, [analysis]);



  // Mutations
  const addUnitMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/staff/syllabus/units`, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-units'] });
        setShowAddUnit(false);
        setNewUnit(prev => ({ ...prev, unitNumber: prev.unitNumber + 1, unitName: '' }));
        toast.success('Unit created successfully');
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to create unit');
    }
  });


  const updateUnitMutation = useMutation({
    mutationFn: (data: any) => axios.put(`${API}/staff/syllabus/units/${editingUnitId}`, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-units'] });
        setEditingUnitId(null);
        toast.success('Unit updated');
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Update failed');
    }
  });


  const deleteUnitMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/staff/syllabus/units/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-units'] });
        if (activeUnitId) setActiveUnitId(null);
        toast.success('Unit deleted');
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Delete failed');
    }
  });


  const addTopicMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/staff/syllabus/topics`, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-topics'] });
        queryClient.invalidateQueries({ queryKey: ['syllabus-analysis'] });
        setShowAddTopic(false);
        setNewTopic({ topicName: '', plannedHours: 1, coMapping: '', poMapping: '' });
        toast.success('Module appended to registry');
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to add topic');
    }
  });


  const toggleTopicMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string, isCompleted: boolean }) => 
        axios.patch(`${API}/staff/syllabus/topics/${id}/complete`, { isCompleted }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-topics'] });
        queryClient.invalidateQueries({ queryKey: ['syllabus-analysis'] });
        toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  const updateTopicMutation = useMutation({
    mutationFn: (data: any) => axios.put(`${API}/staff/syllabus/topics/${editingTopicId}`, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-topics'] });
        queryClient.invalidateQueries({ queryKey: ['syllabus-analysis'] });
        setEditingTopicId(null);
        toast.success('Module details updated');
    },
    onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Update failed');
    }
  });


  const deleteTopicMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/staff/syllabus/topics/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-topics'] });
        queryClient.invalidateQueries({ queryKey: ['syllabus-analysis'] });
        toast.success('Module removed from registry');
    },
    onError: () => toast.error('Deletion failed')
  });


  const addResourceMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/staff/syllabus/units/${activeUnitId}/resources`, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-units'] });
        setShowAddResource(false);
        setNewResource({ type: 'PDF', title: '', url: '' });
        toast.success('Resource added');
    },
    onError: () => toast.error('Failed to add resource')
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (index: number) => axios.delete(`${API}/staff/syllabus/units/${activeUnitId}/resources/${index}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['syllabus-units'] });
        toast.success('Resource deleted');
    },
    onError: () => toast.error('Failed to delete resource')
  });


  if (!subjectId || subjectId === 'undefined') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-10">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-16 text-center space-y-8">
            <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto animate-bounce">
                <AlertTriangle size={48} />
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-black text-white italic">Subject Context Missing</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
                    To orchestrate a syllabus, you must first select a valid subject from your academic profile.
                </p>
            </div>
            <button 
                onClick={() => navigate('/staff/subjects')}
                className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl"
            >
                Go to My Subjects
            </button>
        </div>
    </div>
  );

  if (isSubjectLoading || isUnitsLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Academic Map...</p>
        </div>
    </div>
  );


  const activeUnit = units?.find((u: any) => u._id === activeUnitId);

  return (
    <DashboardLayout title="Syllabus Orchestration" subtitle={`NAAC Compliant Curriculum Tracking for ${subject?.name}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 -m-10 p-10 pb-32">
        
        {/* ── Top Control Bar ── */}
        <div className="flex justify-between items-center mb-12">
            <button 
              onClick={() => navigate('/staff/subjects')}
              className="group flex items-center gap-4 px-8 py-4 bg-white/80 backdrop-blur-md text-slate-500 rounded-[28px] hover:text-indigo-600 hover:bg-white transition-all border border-slate-200/50 shadow-sm"
            >
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
               <span className="font-black text-[10px] uppercase tracking-widest">Return to Subjects</span>
            </button>
            
            <div className="flex items-center gap-6">
                <div className="px-6 py-3 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl flex items-center gap-3 shadow-sm">
                    <History size={16} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Last Audit: Today, 10:45 AM</span>
                </div>
                <div className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center gap-3 shadow-xl shadow-indigo-600/20">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">NAAC Tier-1 Compliant</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
            
            {/* ── Left Side: Analysis & Units ── */}
            <div className="col-span-12 lg:col-span-4 space-y-10">
                
                {/* 1. Gap Analysis Dashboard */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="dash-card p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-none relative overflow-hidden group shadow-2xl shadow-indigo-900/20"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform -rotate-12"><Activity size={220} /></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">Coverage Dashboard</p>
                                <h3 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Syllabus Pace</h3>
                            </div>
                            <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-inner">
                                <Zap className="text-indigo-400" size={28} />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Actual Progress</span>
                                    <span className="text-2xl font-black">{analysis?.actualProgress || 0}%</span>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[3px]">
                                    <motion.div 
                                      initial={{ width: 0 }} animate={{ width: `${analysis?.actualProgress || 0}%` }} 
                                      className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.6)]" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Expected Pace (W10)</span>
                                    <span className="text-2xl font-black text-slate-500">{analysis?.expectedProgress || 0}%</span>
                                </div>
                                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[3px]">
                                    <motion.div 
                                      initial={{ width: 0 }} animate={{ width: `${analysis?.expectedProgress || 0}%` }} 
                                      className="h-full bg-slate-800 rounded-full" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`mt-10 p-6 rounded-3xl border backdrop-blur-md transition-all ${analysis?.isBehind ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${analysis?.isBehind ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${analysis?.isBehind ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {analysis?.isBehind ? `Critical: ${analysis.gap}% Behind Schedule` : 'Syllabus On-Track'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Unit Navigation & Management */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                           <LayoutGrid size={14} className="text-indigo-500" /> Course Units
                        </h4>
                        <button 
                            onClick={() => setShowAddUnit(true)}
                            className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="space-y-5 px-1">
                        {units?.map((unit: any, idx: number) => {
                            const unitColors = [
                                { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-500', gradient: 'from-indigo-600 to-violet-600', shadow: 'shadow-indigo-600/40', activeBg: 'bg-indigo-600' },
                                { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500', gradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-600/40', activeBg: 'bg-emerald-600' },
                                { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-500', gradient: 'from-amber-600 to-orange-600', shadow: 'shadow-amber-600/40', activeBg: 'bg-amber-600' },
                                { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-500', gradient: 'from-rose-600 to-pink-600', shadow: 'shadow-rose-600/40', activeBg: 'bg-rose-600' },
                                { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-500', gradient: 'from-violet-600 to-fuchsia-600', shadow: 'shadow-violet-600/40', activeBg: 'bg-violet-600' },
                            ];
                            const colors = unitColors[idx % unitColors.length];
                            const isActive = activeUnitId === unit._id;

                            return (
                                <motion.div 
                                    key={unit._id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    className="relative group/unit"
                                >
                                    {editingUnitId === unit._id ? (
                                        <div className={`p-8 bg-white/90 backdrop-blur-2xl border-2 ${colors.border} rounded-[32px] space-y-6 shadow-2xl z-20 relative`}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className={`p-2 ${colors.bg} ${colors.text} rounded-lg`}><Activity size={16} /></div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modify Unit {unit.unitNumber}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Unit #</label>
                                                    <input type="number" value={editUnitData.unitNumber} onChange={e => setEditUnitData({...editUnitData, unitNumber: parseInt(e.target.value)})} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20 transition-all" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Hours</label>
                                                    <input type="number" value={editUnitData.totalHours} onChange={e => setEditUnitData({...editUnitData, totalHours: parseInt(e.target.value)})} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20 transition-all" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Unit Title</label>
                                                <input type="text" value={editUnitData.unitName} onChange={e => setEditUnitData({...editUnitData, unitName: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20 transition-all" />
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button onClick={() => updateUnitMutation.mutate(editUnitData)} className={`flex-1 py-4 ${colors.activeBg} text-white rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg`}>Update</button>
                                                <button onClick={() => setEditingUnitId(null)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-[18px] text-[10px] font-black uppercase">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => setActiveUnitId(unit._id)}
                                                className={`w-full p-8 rounded-[40px] text-left transition-all border-2 flex items-center justify-between group relative overflow-hidden backdrop-blur-xl ${isActive ? `bg-white ${colors.border} shadow-2xl ${colors.shadow} translate-x-4 scale-[1.03]` : 'bg-white/40 border-white shadow-lg shadow-slate-200/20 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:translate-x-2'}`}
                                            >
                                                <div className={`absolute top-0 right-0 p-8 opacity-[0.03] ${colors.text} group-hover:scale-110 transition-transform`}><BookOpen size={100} /></div>
                                                
                                                <div className="flex items-center gap-6 relative z-10">
                                                    <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black italic text-base transition-all duration-500 ${isActive ? `bg-gradient-to-br ${colors.gradient} text-white shadow-xl rotate-12` : `bg-white text-slate-300 group-hover:${colors.bg} group-hover:${colors.text} shadow-sm border border-slate-100 group-hover:rotate-6`}`}>
                                                        {unit.unitNumber}
                                                    </div>
                                                    <div>
                                                        <h5 className={`text-lg font-black italic tracking-tight transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>{unit.unitName}</h5>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50/50 rounded-lg">
                                                                <Clock size={10} className="text-slate-300" />
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unit.totalHours} HR</span>
                                                            </div>
                                                            <div className={`w-1.5 h-1.5 ${colors.bg.replace('50', '200')} rounded-full`} />
                                                            <span className={`text-[10px] font-black ${colors.text.replace('600', '500/80')} uppercase tracking-[0.1em] italic`}>{unit.expectedWeekRange}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? `${colors.activeBg} text-white shadow-lg` : 'bg-slate-50 text-slate-300 group-hover:translate-x-1'}`}>
                                                    <ChevronRight size={20} />
                                                </div>
                                            </button>
                                            
                                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover/unit:opacity-100 group-hover/unit:translate-x-2 transition-all duration-500 z-10">
                                                <button onClick={(e) => { e.stopPropagation(); setEditingUnitId(unit._id); setEditUnitData(unit); }} className={`w-10 h-10 bg-white ${colors.text} rounded-2xl flex items-center justify-center hover:${colors.activeBg} hover:text-white transition-all shadow-xl border border-slate-50 active:scale-90`}><History size={16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete Unit?')) deleteUnitMutation.mutate(unit._id); }} className="w-10 h-10 bg-white text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-xl border border-slate-50 active:scale-90"><Trash2 size={16} /></button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}

                        {showAddUnit && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 bg-white border border-indigo-100 rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-indigo-600 rotate-12"><LayoutGrid size={120} /></div>
                                <div className="grid grid-cols-2 gap-6 relative z-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-indigo-600/60 px-2 tracking-widest">Unit #</label>
                                        <input type="number" value={newUnit.unitNumber} onChange={e => setNewUnit({...newUnit, unitNumber: parseInt(e.target.value)})} className="w-full bg-slate-50/50 rounded-2xl p-5 text-sm font-bold outline-none border border-transparent focus:border-indigo-400 transition-all" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-indigo-600/60 px-2 tracking-widest">Hours</label>
                                        <input type="number" value={newUnit.totalHours} onChange={e => setNewUnit({...newUnit, totalHours: parseInt(e.target.value)})} className="w-full bg-slate-50/50 rounded-2xl p-5 text-sm font-bold outline-none border border-transparent focus:border-indigo-400 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-3 relative z-10">
                                    <label className="text-[10px] font-black uppercase text-indigo-600/60 px-2 tracking-widest">Unit Name</label>
                                    <input type="text" placeholder="e.g. Protocol Architectures" value={newUnit.unitName} onChange={e => setNewUnit({...newUnit, unitName: e.target.value})} className="w-full bg-slate-50/50 rounded-2xl p-5 text-sm font-bold outline-none border border-transparent focus:border-indigo-400 transition-all" />
                                </div>
                                <div className="flex gap-4 relative z-10">
                                    <button 
                                        disabled={addUnitMutation.isPending}
                                        onClick={() => {
                                            if (!newUnit.unitName) return toast.error('Unit name is required');
                                            addUnitMutation.mutate({...newUnit, subject: subjectId});
                                        }} 
                                        className="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        {addUnitMutation.isPending ? 'Creating...' : 'Create Unit'}
                                    </button>
                                    <button onClick={() => setShowAddUnit(false)} className="px-8 py-5 bg-slate-100 text-slate-500 rounded-[24px] text-[10px] font-black uppercase hover:bg-slate-200 transition-all"><X size={18} /></button>
                                </div>

                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Right Side: Topics & Execution ── */}
            <div className="col-span-12 lg:col-span-8">
                <AnimatePresence mode="wait">
                    {activeUnitId ? (
                        <motion.div 
                            key={activeUnitId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="dash-card p-14 space-y-14 min-h-[850px] bg-white/80 backdrop-blur-xl border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-indigo-600 -rotate-6"><ListChecks size={300} /></div>
                                 {/* Unit Header & Controls */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-3 h-10 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-full" />
                                        <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em]">Execution Blueprint</p>
                                    </div>
                                    <h4 className="text-4xl font-black text-slate-800 italic tracking-tighter">Unit {activeUnit?.unitNumber}: {activeUnit?.unitName}</h4>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                            <Filter size={16} className="text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Search topic or outcome..." 
                                            value={topicSearch}
                                            onChange={e => setTopicSearch(e.target.value)}
                                            className="pl-14 pr-10 py-5 bg-slate-50 border-none rounded-[24px] text-[11px] font-bold text-slate-600 outline-none w-72 focus:ring-2 ring-indigo-500/20 focus:bg-white transition-all shadow-inner" 
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setShowAddTopic(true)}
                                        className="group relative px-10 py-5 bg-slate-900 text-white rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-900/30 active:scale-95 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-500" /> 
                                        <span className="relative z-10">Append Module</span>
                                    </button>
                                </div>
                            </div>

                            {showAddTopic && (
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-12 bg-white border border-indigo-100 rounded-[56px] shadow-2xl space-y-10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-indigo-600"><Sparkles size={180} /></div>
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Sparkles size={24} /></div>
                                        <h5 className="text-xl font-black italic text-slate-800 tracking-tight">Add Academic Module</h5>
                                    </div>
                                    <div className="grid grid-cols-12 gap-8 relative z-10">
                                        <div className="col-span-8 space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-[0.2em]">Topic Name</label>
                                            <input type="text" placeholder="e.g. TCP/IP Stack" value={newTopic.topicName} onChange={e => setNewTopic({...newTopic, topicName: e.target.value})} className="w-full bg-slate-50/50 rounded-[32px] p-6 text-base font-bold outline-none border border-transparent focus:border-indigo-400 transition-all" />
                                        </div>
                                        <div className="col-span-4 space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-[0.2em]">Hours</label>
                                            <input type="number" value={newTopic.plannedHours} onChange={e => setNewTopic({...newTopic, plannedHours: parseInt(e.target.value)})} className="w-full bg-slate-50/50 rounded-[32px] p-6 text-base font-bold outline-none border border-transparent focus:border-indigo-400 transition-all" />
                                        </div>
                                        <div className="col-span-6 space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-[0.2em]">CO Mapping</label>
                                            <input type="text" placeholder="CO1, CO2" value={newTopic.coMapping} onChange={e => setNewTopic({...newTopic, coMapping: e.target.value})} className="w-full bg-slate-50/50 rounded-[32px] p-6 text-base font-bold outline-none border border-transparent focus:border-indigo-400 transition-all" />
                                        </div>
                                        <div className="col-span-6 space-y-3">
                                            <label className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-[0.2em]">PO Mapping</label>
                                            <input type="text" placeholder="PO1, PO5" value={newTopic.poMapping} onChange={e => setNewTopic({...newTopic, poMapping: e.target.value})} className="w-full bg-slate-50/50 rounded-[32px] p-6 text-base font-bold outline-none border border-transparent focus:border-indigo-400 transition-all" />
                                        </div>
                                    </div>
                                    <div className="flex gap-5 pt-4 relative z-10">
                                        <button 
                                            disabled={addTopicMutation.isPending}
                                            onClick={() => {
                                                if (!newTopic.topicName) return toast.error('Topic name is required');
                                                addTopicMutation.mutate({
                                                    ...newTopic,
                                                    unit: activeUnitId,
                                                    coMapping: newTopic.coMapping.split(',').map(s => s.trim()).filter(s => s),
                                                    poMapping: newTopic.poMapping.split(',').map(s => s.trim()).filter(s => s)
                                                });
                                            }}
                                            className="flex-1 py-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {addTopicMutation.isPending ? 'Appending...' : 'Confirm & Append'}
                                        </button>
                                        <button onClick={() => setShowAddTopic(false)} className="px-12 py-6 bg-slate-100 text-slate-500 rounded-[32px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                                    </div>
                                </motion.div>
                            )}


                            {/* Topic Registry Table */}
                            <div className="dash-card overflow-visible border-slate-100/50 bg-white shadow-xl shadow-slate-200/40 p-0 relative z-10">
                            {/* Topic Registry Cards */}
                            <div className="space-y-6 relative z-10">
                                <AnimatePresence mode='popLayout'>
                                    {topics?.filter((t: any) => 
                                        t.topicName.toLowerCase().includes(topicSearch.toLowerCase()) ||
                                        t.coMapping?.some((co: string) => co.toLowerCase().includes(topicSearch.toLowerCase()))
                                    ).map((topic: any, idx: number) => {
                                        const isEditing = editingTopicId === topic._id;
                                        
                                        return (
                                            <motion.div 
                                                key={topic._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`group relative p-8 rounded-[36px] transition-all border-2 flex items-center justify-between gap-10 ${topic.isCompleted ? 'bg-emerald-50/30 border-emerald-100/50 shadow-sm' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/20 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/30'}`}
                                            >
                                                {/* Status Indicator Spine */}
                                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full transition-all duration-500 ${topic.isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-200 group-hover:bg-indigo-400'}`} />

                                                <div className="flex-1 flex items-center gap-10">
                                                    {/* Index & Module Info */}
                                                    <div className="flex items-center gap-8 min-w-[300px]">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black italic transition-all ${topic.isCompleted ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div className="space-y-2">
                                                            {isEditing ? (
                                                                <input 
                                                                    type="text" 
                                                                    value={editTopicData.topicName} 
                                                                    onChange={e => setEditTopicData({...editTopicData, topicName: e.target.value})}
                                                                    className="w-full bg-white border-b-2 border-indigo-500 py-1 text-lg font-black italic outline-none text-slate-800"
                                                                />
                                                            ) : (
                                                                <h6 className={`text-xl font-black italic tracking-tight transition-all ${topic.isCompleted ? 'text-slate-300 line-through decoration-emerald-500/30' : 'text-slate-800'}`}>
                                                                    {topic.topicName}
                                                                </h6>
                                                            )}
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                                    <Clock size={10} />
                                                                    {isEditing ? (
                                                                        <input 
                                                                            type="number" 
                                                                            value={editTopicData.plannedHours} 
                                                                            onChange={e => setEditTopicData({...editTopicData, plannedHours: parseInt(e.target.value)})}
                                                                            className="w-12 bg-slate-50 rounded px-1 text-[10px] font-black outline-none border border-slate-200"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-[10px] font-black uppercase tracking-widest">{topic.plannedHours} HR Execution</span>
                                                                    )}
                                                                </div>
                                                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                <div className="flex gap-1.5">
                                                                    {isEditing ? (
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder="CO1, CO2"
                                                                            value={typeof editTopicData.coMapping === 'string' ? editTopicData.coMapping : editTopicData.coMapping?.join(', ')} 
                                                                            onChange={e => setEditTopicData({...editTopicData, coMapping: e.target.value})}
                                                                            className="bg-slate-50 rounded px-2 py-0.5 text-[10px] font-black outline-none border border-slate-200 w-24"
                                                                        />
                                                                    ) : (
                                                                        topic.coMapping?.map((co: string) => (
                                                                            <span key={co} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black border border-indigo-100/50">{co}</span>
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Side: Actions */}
                                                    <div className="flex items-center gap-6">
                                                        {isEditing ? (
                                                            <div className="flex gap-2">
                                                                <button onClick={() => updateTopicMutation.mutate({
                                                                    ...editTopicData,
                                                                    coMapping: typeof editTopicData.coMapping === 'string' ? editTopicData.coMapping.split(',').map(s => s.trim()).filter(s => s) : editTopicData.coMapping
                                                                })} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-indigo-200 active:scale-95">Save</button>
                                                                <button onClick={() => setEditingTopicId(null)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase">Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-4">
                                                                <button 
                                                                    onClick={() => toggleTopicMutation.mutate({ id: topic._id, isCompleted: !topic.isCompleted })}
                                                                    className={`group/btn flex items-center gap-4 px-8 py-4 rounded-[24px] transition-all border-2 ${topic.isCompleted ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/20' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/30 shadow-sm'}`}
                                                                >
                                                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${topic.isCompleted ? 'bg-white border-white text-emerald-500' : 'border-slate-200 group-hover/btn:border-indigo-600 group-hover/btn:rotate-90'}`}>
                                                                        {topic.isCompleted ? <Check size={14} /> : <div className="w-1 h-1 bg-current rounded-full" />}
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{topic.isCompleted ? 'Module Completed' : 'Mark Done'}</span>
                                                                </button>

                                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                                    <button 
                                                                        onClick={() => { setEditingTopicId(topic._id); setEditTopicData(topic); }}
                                                                        className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-white hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all"
                                                                    >
                                                                        <History size={16} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => { if(confirm('Delete this module?')) deleteTopicMutation.mutate(topic._id); }}
                                                                        className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-600 hover:text-white hover:shadow-xl hover:shadow-rose-100 transition-all"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>


                                {topics?.length === 0 && (
                                    <div className="py-32 flex flex-col items-center justify-center opacity-40">
                                        <Map size={64} className="text-slate-300 mb-6" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Registry is currently empty</p>
                                    </div>
                                )}
                            </div>



                            {/* NAAC Metadata & Instructional Repository */}
                            <div className="pt-14 border-t border-slate-100 flex flex-col md:flex-row gap-16 relative z-10">
                                
                                {/* CO-PO Alignment Section (Dynamic) */}
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center gap-4 text-indigo-600">
                                        <Target size={22} className="p-1 bg-indigo-50 rounded-lg" /> 
                                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">Unit CO-PO Alignment</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {topics?.some((t: any) => t.coMapping?.length > 0) ? (
                                            Array.from(new Set(topics.flatMap((t: any) => t.coMapping))).map((co: any) => (
                                                <span key={co} className="px-6 py-3 bg-indigo-50/80 text-indigo-600 rounded-[20px] text-[10px] font-black uppercase tracking-tight border border-indigo-100 shadow-sm flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" /> {co}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[11px] font-bold text-slate-300 italic px-4">No outcomes mapped yet</span>
                                        )}
                                        {Array.from(new Set(topics?.flatMap((t: any) => t.poMapping) || [])).map((po: any) => (
                                            <span key={po} className="px-6 py-3 bg-slate-50 text-slate-500 rounded-[20px] text-[10px] font-black uppercase tracking-tight border border-slate-100 shadow-sm">{po}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Instructional Repository Section */}
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-emerald-600">
                                            <BookMarked size={22} className="p-1 bg-emerald-50 rounded-lg" /> 
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Instructional Repository</span>
                                        </div>
                                        <button 
                                            onClick={() => setShowAddResource(!showAddResource)}
                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {showAddResource && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <select 
                                                    value={newResource.type} 
                                                    onChange={e => setNewResource({...newResource, type: e.target.value})}
                                                    className="bg-white border-none rounded-xl p-3 text-[10px] font-bold outline-none"
                                                >
                                                    <option value="PDF">PDF Document</option>
                                                    <option value="Lab Manual">Lab Manual</option>
                                                    <option value="Video">Video Lecture</option>
                                                    <option value="Link">External Link</option>
                                                </select>
                                                <input 
                                                    type="text" placeholder="Resource Title" 
                                                    value={newResource.title} 
                                                    onChange={e => setNewResource({...newResource, title: e.target.value})}
                                                    className="bg-white border-none rounded-xl p-3 text-[10px] font-bold outline-none" 
                                                />
                                            </div>
                                            <input 
                                                type="text" placeholder="URL / Storage Path" 
                                                value={newResource.url} 
                                                onChange={e => setNewResource({...newResource, url: e.target.value})}
                                                className="w-full bg-white border-none rounded-xl p-3 text-[10px] font-bold outline-none" 
                                            />
                                            <div className="flex gap-3">
                                                <button 
                                                    disabled={!newResource.title || !newResource.url}
                                                    onClick={() => addResourceMutation.mutate(newResource)}
                                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50"
                                                >
                                                    Upload Resource
                                                </button>
                                                <button onClick={() => setShowAddResource(false)} className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase">Cancel</button>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="flex flex-wrap gap-4">
                                        {activeUnit?.resources?.length > 0 ? activeUnit.resources.map((res: any, idx: number) => (
                                            <div key={idx} className="group relative">
                                                <a 
                                                    href={res.url} target="_blank" rel="noreferrer"
                                                    className="flex items-center gap-4 px-8 py-4 bg-white border border-slate-100 rounded-[20px] text-[11px] font-black uppercase text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm group-hover:pr-12"
                                                >
                                                    <FileText size={18} /> {res.title}
                                                </a>
                                                <button 
                                                    onClick={() => deleteResourceMutation.mutate(idx)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-rose-50 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="w-full py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No resources added to this unit</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[700px] bg-white/40 backdrop-blur-md rounded-[80px] border-2 border-dashed border-slate-200/50 shadow-inner">
                            <div className="text-center space-y-8 max-w-sm px-10">
                                <div className="w-32 h-32 bg-white rounded-[48px] flex items-center justify-center text-slate-200 mx-auto shadow-2xl border border-slate-100 relative group">
                                    <div className="absolute inset-0 bg-indigo-50 rounded-[48px] scale-0 group-hover:scale-110 transition-transform duration-500 opacity-50" />
                                    <Map size={64} className="relative z-10 group-hover:text-indigo-400 transition-colors duration-500" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-400 italic tracking-tight">Map Selection Required</h4>
                                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-5 leading-loose">Initialize the academic execution tracker by selecting a unit from the course structure.</p>
                                </div>
                                <div className="pt-4 flex justify-center gap-2">
                                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-slate-200 rounded-full" />)}
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffSyllabus;
