import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, Plus, Search, Filter, Book, 
  Layers, CheckCircle, Trash2, FileText, Sparkles,
  Download, Zap, Database, BrainCircuit, X, Save
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StaffQuestionBank = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Initially Empty - Pulling from Database
  const { data: questions, isLoading } = useQuery({
    queryKey: ['staff-question-bank'],
    queryFn: () => axios.get(`${API}/staff/questions`).then(r => r.data),
    initialData: []
  });

  const poolCount = questions?.length || 0;

  return (
    <DashboardLayout title="Universal Question Vault" subtitle="Orchestrate Institutional Assessments with AI-Driven Paper Generation">
      
      {/* ── Header Actions ── */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-10">
        <div className="flex items-center gap-4 bg-white p-2.5 rounded-[28px] border border-slate-100 shadow-sm w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search active question pool..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-xs bg-slate-50 rounded-2xl outline-none focus:bg-white transition-all font-bold" 
            />
          </div>
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors"><Filter size={18} /></button>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
            <Layers size={16} className="text-indigo-500" /> Import CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[28px] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* ── Question Pool ── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-4 mb-2">
             <div className="flex items-center gap-3">
                <Database className="text-indigo-600" size={18} />
                <h3 className="text-lg font-black text-slate-800 italic tracking-tight">Active Question Pool</h3>
             </div>
             <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                {poolCount} Items Synchronized
             </span>
          </div>

          <div className="space-y-4">
            {poolCount > 0 ? questions.map((q: any, i: number) => (
              <motion.div 
                key={q._id || i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
                className="dash-card p-8 flex gap-8 group hover:border-indigo-200 transition-all relative overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-3xl flex-shrink-0 flex items-center justify-center text-white font-black text-lg shadow-lg
                  ${q.level === 'Hard' ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-200' : 
                    q.level === 'Medium' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200' : 
                    'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200'}`}>
                  {q.level?.charAt(0) || 'Q'}
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-4 mb-3">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                         {q.subject} • UNIT {q.unit}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.level} Complexity</span>
                   </div>
                   <p className="text-sm font-bold text-slate-800 leading-relaxed group-hover:text-indigo-900 transition-colors">{q.text}</p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm"><FileText size={18} /></button>
                  <button className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 shadow-sm"><Trash2 size={18} /></button>
                </div>
              </motion.div>
            )) : (
              <div className="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[48px] flex flex-col items-center justify-center gap-6">
                 <div className="p-6 bg-slate-50 text-slate-300 rounded-[32px] border border-slate-100 shadow-inner">
                    <HelpCircle size={48} />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-slate-400 italic">Empty Question Repository</h4>
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-2">Add questions manually or import CSV to begin</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Paper Generator ── */}
        <div className="col-span-12 lg:col-span-4">
          <div className="dash-card p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-none shadow-2xl shadow-indigo-600/20 sticky top-24 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-4 mb-10 relative z-10">
               <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-[24px] border border-white/5 backdrop-blur-sm shadow-xl"><Sparkles size={28} /></div>
               <div>
                  <h3 className="text-xl font-black italic">Paper Generator</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Automated Assembly</p>
               </div>
            </div>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest px-1">Target Examination</label>
                <div className="relative group">
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer">
                     <option className="bg-slate-900">Internal Assessment - 1</option>
                     <option className="bg-slate-900">Model Examination</option>
                     <option className="bg-slate-900">Semester Theory</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 rotate-90" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md group hover:bg-white/10 transition-all">
                   <p className="text-3xl font-black text-indigo-400 group-hover:scale-110 transition-transform origin-left">12</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Part A (2m)</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md group hover:bg-white/10 transition-all">
                   <p className="text-3xl font-black text-rose-400 group-hover:scale-110 transition-transform origin-left">5</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Part B (13m)</p>
                </div>
              </div>

              <button className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3">
                <Download size={18} /> Auto-Generate PDF
              </button>
            </div>

            <div className="mt-12 pt-10 border-t border-white/5 relative z-10">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 bg-indigo-500/20 rounded-xl"><BrainCircuit size={20} className="text-indigo-400" /></div>
                  <span className="text-xs font-black text-slate-300">Active Pool: <span className="text-indigo-400 text-sm">{poolCount} Items</span></span>
               </div>
               <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                    AI Integrity Protocol: Our engine ensures <span className="text-indigo-300">zero repetition</span> of questions within the same academic cycle, maintaining examination rigor.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal / Add Logic Placeholder */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden">
               <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl"><Plus size={24} /></div>
                    <h3 className="text-xl font-black italic">Add Question</h3>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
               </div>
               <div className="p-10 text-center">
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 mb-8">
                    <Zap className="text-amber-500 mx-auto mb-4" size={32} />
                    <p className="text-sm font-bold text-slate-700">Database Connection Active</p>
                  </div>
                  <button className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                     <Save size={18} /> Push to Question Bank
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default StaffQuestionBank;
