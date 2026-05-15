import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FileText, Download, Filter, Calendar, 
  ShieldCheck, ArrowRight, Loader2, CheckCircle,
  FileSpreadsheet, Database, Briefcase, GraduationCap
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminReports = () => {
  const [filters, setFilters] = useState({ from: '', to: '', dept: '' });
  const [lastReportUrl, setLastReportUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (config: { type: string, payload: any }) => 
      axios.post(`${API}/reports/${config.type}`, config.payload).then(r => r.data),
    onSuccess: (data) => {
      setLastReportUrl(data.url);
    }
  });

  const handleDownload = (url: string) => {
    window.open(`${API}/reports/download?path=${encodeURIComponent(url)}`, '_blank');
  };

  const reportTypes = [
    { 
      id: 'finance/audit', 
      title: 'Institutional Fee Audit', 
      desc: 'Complete ledger of all payments, UTR references, and modes.', 
      icon: FileSpreadsheet, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      id: 'compliance/ssr', 
      title: 'NAAC SSR Preliminary', 
      desc: 'Self-Study Report draft for departmental strength and compliance.', 
      icon: ShieldCheck, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      id: 'academic/marks', 
      title: 'Batch Performance Matrix', 
      desc: 'Consolidated marksheet analysis for the selected academic year.', 
      icon: GraduationCap, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    }
  ];

  return (
    <DashboardLayout title="Reporting Hub" subtitle="Institutional Data Synthesis • Official Audit Exports">
      
      <div className="grid grid-cols-12 gap-8">
         {/* ── Filter Sidebar ── */}
         <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="dash-card p-6 space-y-6">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Filter size={14} /> Report Filters
               </h4>
               <div className="space-y-4">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                     <input 
                       type="date" value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})}
                       className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                     <input 
                       type="date" value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})}
                       className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Scope / Dept</label>
                     <select 
                       value={filters.dept} onChange={e => setFilters({...filters, dept: e.target.value})}
                       className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none"
                     >
                        <option value="">All Institutional Units</option>
                        <option value="CSE">Computer Science</option>
                        <option value="ECE">Electronics</option>
                     </select>
                  </div>
               </div>
            </div>

            <AnimatePresence>
               {lastReportUrl && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="dash-card p-6 bg-indigo-600 text-white border-none shadow-2xl"
                  >
                     <CheckCircle className="mb-4 opacity-50" size={32}/>
                     <h5 className="text-sm font-black italic">Report Ready</h5>
                     <p className="text-[10px] text-indigo-100 font-medium mt-2 leading-relaxed">
                        Your synthesized document has been compiled and is ready for archival or distribution.
                     </p>
                     <button 
                       onClick={() => handleDownload(lastReportUrl)}
                       className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                     >
                        <Download size={14}/> Download Asset
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* ── Report Catalog ── */}
         <div className="col-span-12 lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {reportTypes.map((report, i) => (
                  <motion.div 
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="dash-card p-8 bg-white border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all group cursor-pointer"
                    onClick={() => mutation.mutate({ type: report.id, payload: filters })}
                  >
                     <div className="flex justify-between items-start mb-10">
                        <div className={`w-14 h-14 rounded-2xl ${report.bg} ${report.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                           <report.icon size={28}/>
                        </div>
                        {mutation.isPending && mutation.variables?.type === report.id ? (
                           <Loader2 size={20} className="text-indigo-600 animate-spin"/>
                        ) : (
                           <ArrowRight size={20} className="text-slate-200 group-hover:text-indigo-600 transition-colors"/>
                        )}
                     </div>
                     <h3 className="text-xl font-black text-slate-800 italic mb-2">{report.title}</h3>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        {report.desc}
                     </p>
                     <div className="mt-8 flex gap-3">
                        <span className="px-3 py-1 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-lg">
                           {report.id.includes('finance') ? 'XLSX' : 'PDF'}
                        </span>
                        <span className="px-3 py-1 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-lg">
                           NAAC COMPLIANT
                        </span>
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* ── Audit Logs / History ── */}
            <div className="mt-12">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <Database size={14}/> Recent Generation Activity
               </h4>
               <div className="dash-card p-0 overflow-hidden bg-white border border-slate-100">
                  <table className="w-full">
                     <thead className="bg-slate-50">
                        <tr>
                           <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Filename</th>
                           <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                           <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin</th>
                           <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {[
                          { name: 'audit_APR_2026.xlsx', type: 'Financial', admin: 'SuperAdmin', time: '10 mins ago' },
                          { name: 'compliance_SSR_v2.pdf', type: 'NAAC', admin: 'Registrar', time: '1h ago' }
                        ].map((log, i) => (
                           <tr key={i} className="hover:bg-slate-50/50 transition-all">
                              <td className="px-6 py-4 text-xs font-black text-slate-700">{log.name}</td>
                              <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.type}</td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-600">{log.admin}</td>
                              <td className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase">{log.time}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>

    </DashboardLayout>
  );
};

export default AdminReports;
