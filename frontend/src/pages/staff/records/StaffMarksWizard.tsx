import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle, 
  AlertTriangle, Trash2, Search, Filter, 
  Plus, History, Info, ChevronRight, Wand2
} from 'lucide-react';

const StaffMarksWizard = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [data] = useState([]);

  return (
    <DashboardLayout title="Marks Entry Wizard" subtitle="Mass Grade Import Engine: Drag-and-Drop CSV Processing with Real-time Data Validation">
      
      <div className="grid grid-cols-12 gap-8">
        {/* Upload Hub (4 columns) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           <div className="dash-card p-8 bg-slate-900 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-white/5"><FileSpreadsheet size={120} /></div>
              <h2 className="text-xl font-black mb-8 italic">Import Engine</h2>
              
              <div className="space-y-6">
                 <div className="border-2 border-dashed border-white/10 rounded-[32px] p-8 text-center hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="p-4 bg-white/5 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform"><Upload size={24} className="text-indigo-400" /></div>
                    <p className="text-xs font-bold text-slate-300">Drop Grade CSV Here</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Max 1,000 Rows per Import</p>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Assessment</label>
                       <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-indigo-500">
                          <option>Internal Assessment - 2 (Theory)</option>
                          <option>Model Practical Exam</option>
                          <option>Seminar / OD Marks</option>
                       </select>
                    </div>
                    <button 
                      onClick={() => { setIsUploading(true); setTimeout(() => setIsUploading(false), 2000); }}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                    >
                      {isUploading ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />} 
                      {isUploading ? 'Validating...' : 'Process & Preview'}
                    </button>
                 </div>
              </div>

              <div className="mt-10 pt-10 border-t border-white/10">
                 <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                    <Download size={14} /> Download Template
                 </button>
              </div>
           </div>

           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-white rounded-xl text-amber-500 shadow-sm"><AlertTriangle size={16} /></div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Data Constraints</h4>
              </div>
              <ul className="space-y-3">
                 {['Internal Marks: 0 - 20 range', 'Model Marks: 0 - 100 range', 'Roll Numbers must exist in DB'].map((rule, i) => (
                    <li key={i} className="flex gap-2 text-[10px] font-bold text-amber-700/70">
                       <div className="w-1 h-1 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                       {rule}
                    </li>
                 ))}
              </ul>
           </div>
        </div>

        {/* Validation Preview (8 columns) */}
        <div className="col-span-12 lg:col-span-8">
           <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-lg font-black text-slate-800 leading-tight italic">Processing Preview</h3>
              <div className="flex gap-2">
                 <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"><Search size={16} /></button>
                 <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">Final Commit to DB</button>
              </div>
           </div>

           <div className="dash-card overflow-hidden">
              <table className="w-full">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Roll / Name</th>
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">IA-2 (20)</th>
                       <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Model (100)</th>
                       <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Validation</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {data.map((row, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-slate-800">{row.name}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{row.roll}</p>
                          </td>
                          <td className="px-8 py-6">
                             <div className="w-16 p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-black text-center">{row.internal}</div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="w-16 p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-black text-center">{row.model}</div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                <CheckCircle size={12} /> {row.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="mt-12 p-8 bg-slate-900 rounded-[40px] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-white/5"><History size={100} /></div>
              <h4 className="text-sm font-black italic mb-2">Institutional Grade Integrity</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-lg">
                The wizard cross-references marks with attendance data. Significant outliers (e.g., 90%+ marks with &lt;50% attendance) are flagged for HOD vetting before final DB commitment.
              </p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const RefreshCw = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
  </svg>
);

export default StaffMarksWizard;
