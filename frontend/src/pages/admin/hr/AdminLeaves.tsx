import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  ClipboardList, Check, X, Eye, 
  Search, Filter, User, Calendar
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminLeaves = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('Pending');

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['admin-leaves', filter],
    queryFn: () => axios.get(`${API}/leaves/admin/all?status=${filter}`).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/leaves/approve`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leaves'] });
      alert('Action recorded successfully.');
    }
  });

  return (
    <DashboardLayout title="Leave Approvals" subtitle="Institutional Workflow Orchestration • Dual-Authorization Queue">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 px-2">
         <div className="flex items-center gap-4 bg-white p-2 rounded-[30px] border border-slate-100 shadow-sm w-full md:w-auto">
            {['Pending', 'Approved', 'Rejected'].map((status) => (
               <button 
                 key={status}
                 onClick={() => setFilter(status)}
                 className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${filter === status ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  {status}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search applicant..." className="w-full pl-10 pr-4 py-3 text-xs bg-white border border-slate-100 rounded-2xl outline-none" />
            </div>
            <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 transition-colors"><Filter size={18}/></button>
         </div>
      </div>

      <div className="dash-card overflow-hidden border-none shadow-2xl">
         <table className="w-full">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Applicant</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Leave Type</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Duration</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
               {isLoading ? (
                 <tr><td colSpan={4} className="text-center py-20 animate-pulse text-indigo-600 font-black">Syncing Queue...</td></tr>
               ) : leaves?.length === 0 ? (
                 <tr><td colSpan={4} className="text-center py-20 text-slate-400 italic font-medium">No requests in this queue.</td></tr>
               ) : (
                 leaves?.map((leave: any) => (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-all group">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><User size={20}/></div>
                             <div>
                                <p className="text-sm font-black text-slate-800">{leave.user?.name || 'Faculty Member'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {leave.user?.studentId || 'FAC-102'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border
                            ${leave.type === 'Medical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                             {leave.type}
                          </span>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <Calendar size={14} className="text-slate-400"/>
                             <p className="text-xs font-bold text-slate-600">
                                {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                             </p>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          {leave.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                               <button 
                                 onClick={() => approveMutation.mutate({ leaveId: leave._id, status: 'Approved' })}
                                 className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                               >
                                  <Check size={18}/>
                               </button>
                               <button 
                                 onClick={() => approveMutation.mutate({ leaveId: leave._id, status: 'Rejected' })}
                                 className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                               >
                                  <X size={18}/>
                               </button>
                               <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                  <Eye size={18}/>
                               </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] italic">Processed</span>
                          )}
                       </td>
                    </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>

    </DashboardLayout>
  );
};

export default AdminLeaves;
