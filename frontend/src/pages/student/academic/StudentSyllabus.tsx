import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, CheckCircle2, Clock, 
  BookOpen, ListChecks, Target,
  ChevronRight, ArrowLeft, 
  Loader2, Calendar, FileText,
  LayoutGrid, Activity, BookMarked,
  Check, Lock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentSyllabus = () => {
  const { id: subjectId } = useParams();
  const navigate = useNavigate();
  
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

  // 1. Fetch Subject Detail
  const { data: subject, isLoading: isSubjectLoading } = useQuery({
    queryKey: ['student-subject', subjectId],
    queryFn: () => axios.get(`${API}/student/profile`).then(async (profile) => {
        // We actually need the subject detail, but student might only have access through specific routes
        // For now, let's assume there's a subject detail route or we fetch from the units
        return { name: "Current Course" }; // Placeholder or specific fetch
    }),
  });

  // 2. Fetch Analysis
  const { data: analysis, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['syllabus-analysis-student', subjectId],
    queryFn: () => axios.get(`${API}/student/syllabus/analysis/${subjectId}`).then(r => r.data),
  });

  // 3. Fetch Units
  const { data: units, isLoading: isUnitsLoading } = useQuery({
    queryKey: ['syllabus-units-student', subjectId],
    queryFn: () => axios.get(`${API}/student/syllabus/units/${subjectId}`).then(r => r.data),
    onSuccess: (data) => {
        if (data.length > 0 && !activeUnitId) setActiveUnitId(data[0]._id);
    }
  });

  // 4. Fetch Topics for Active Unit
  const { data: topics, isLoading: isTopicsLoading } = useQuery({
    queryKey: ['syllabus-topics-student', activeUnitId],
    queryFn: () => axios.get(`${API}/student/syllabus/topics/${activeUnitId}`).then(r => r.data),
    enabled: !!activeUnitId
  });

  if (isUnitsLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Academic Progress...</p>
        </div>
    </div>
  );

  const activeUnit = units?.find((u: any) => u._id === activeUnitId);

  return (
    <DashboardLayout title="Academic Progress" subtitle="Track your syllabus coverage and access learning resources">
      <div className="max-w-[1400px] mx-auto pb-32">
        
        <div className="flex justify-between items-center mb-12">
            <button 
              onClick={() => navigate(-1)}
              className="group flex items-center gap-4 px-8 py-4 bg-white text-slate-400 rounded-[28px] hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100 shadow-sm"
            >
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
               <span className="font-black text-[10px] uppercase tracking-widest">Back</span>
            </button>
            <div className="px-6 py-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                <Lock size={16} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Read-Only Access</span>
            </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
            
            <div className="col-span-12 lg:col-span-4 space-y-10">
                
                {/* Coverage Summary */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dash-card p-10 bg-indigo-900 text-white border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Activity size={180} /></div>
                    
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-4">Current Coverage</p>
                        <h3 className="text-4xl font-black italic mb-8">{analysis?.actualProgress || 0}% Complete</h3>
                        
                        <div className="space-y-3">
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 p-[2px]">
                                <motion.div 
                                  initial={{ width: 0 }} animate={{ width: `${analysis?.actualProgress || 0}%` }} 
                                  className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                                />
                            </div>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest text-right">
                                {analysis?.completedTopics} of {analysis?.totalTopics} Topics Finished
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Units List */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-6">Course Structure</h4>
                    {units?.map((unit: any) => (
                        <button 
                            key={unit._id} 
                            onClick={() => setActiveUnitId(unit._id)}
                            className={`w-full p-8 rounded-[32px] text-left transition-all border flex items-center justify-between group ${activeUnitId === unit._id ? 'bg-white border-indigo-200 shadow-xl shadow-slate-200/50 translate-x-2' : 'bg-slate-50/50 border-transparent hover:border-slate-200'}`}
                        >
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center font-black italic text-sm transition-all ${activeUnitId === unit._id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                                    U{unit.unitNumber}
                                </div>
                                <div>
                                    <h5 className="text-base font-black italic text-slate-800">{unit.unitName}</h5>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unit.totalHours} Hours</span>
                                </div>
                            </div>
                            <ChevronRight size={20} className={activeUnitId === unit._id ? 'text-indigo-600' : 'text-slate-300'} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Topics & Resources */}
            <div className="col-span-12 lg:col-span-8">
                <AnimatePresence mode="wait">
                    {activeUnitId ? (
                        <motion.div 
                            key={activeUnitId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="dash-card p-12 space-y-12"
                        >
                            <div>
                                <h4 className="text-3xl font-black text-slate-800 italic tracking-tight">Unit {activeUnit?.unitNumber}: {activeUnit?.unitName}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Planned Coverage: {activeUnit?.expectedWeekRange}</p>
                            </div>

                            <div className="space-y-6">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                    <ListChecks size={16} /> Completion Checklist
                                </h5>

                                <div className="grid grid-cols-1 gap-4">
                                    {isTopicsLoading ? (
                                        [1,2,3].map(i => <div key={i} className="skeleton h-20 w-full rounded-[24px]" />)
                                    ) : topics?.map((topic: any) => (
                                        <div key={topic._id} className={`p-8 rounded-[32px] flex items-center justify-between border ${topic.isCompleted ? 'bg-emerald-50/30 border-emerald-100/50' : 'bg-slate-50/50 border-transparent'}`}>
                                            <div className="flex items-center gap-8">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${topic.isCompleted ? 'bg-emerald-600 text-white' : 'bg-white text-slate-200 border border-slate-100'}`}>
                                                    {topic.isCompleted ? <Check size={18} strokeWidth={3} /> : <Clock size={18} />}
                                                </div>
                                                <div>
                                                    <h5 className={`text-base font-bold italic ${topic.isCompleted ? 'text-emerald-900' : 'text-slate-700'}`}>{topic.topicName}</h5>
                                                    <div className="flex gap-2 mt-1">
                                                        {topic.coMapping?.map((co: string) => (
                                                            <span key={co} className="px-2 py-0.5 bg-white text-[9px] font-black text-indigo-500 rounded border border-indigo-100">{co}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {topic.isCompleted && (
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed On</p>
                                                    <p className="text-[11px] font-black text-emerald-600">{new Date(topic.completedDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resources Section */}
                            <div className="pt-12 border-t border-slate-100">
                                <div className="flex items-center gap-3 text-indigo-600 mb-8">
                                    <BookMarked size={20} /> <span className="text-[10px] font-black uppercase tracking-[0.2em]">Learning Resources</span>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <button className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-indigo-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm"><FileText size={20} /></div>
                                            <div className="text-left">
                                                <h6 className="text-sm font-black text-slate-700 italic">Lecture Notes</h6>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PDF • 4.2 MB</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
                                    </button>
                                    <button className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-indigo-100 group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm"><Activity size={20} /></div>
                                            <div className="text-left">
                                                <h6 className="text-sm font-black text-slate-700 italic">Topic Simulations</h6>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Interactive Web</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[500px] bg-slate-50/50 rounded-[48px] border-2 border-dashed border-slate-100 text-center">
                            <div>
                                <BookOpen size={48} className="mx-auto text-slate-200 mb-6" />
                                <h4 className="text-lg font-black text-slate-400 italic">Select a Unit</h4>
                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-2">Pick a unit to view topics and download resources</p>
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

export default StudentSyllabus;
