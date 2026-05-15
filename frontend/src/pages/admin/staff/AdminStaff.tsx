import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, Plus, Eye, Edit, Trash2, Filter, 
  Briefcase, Mail, Phone, X, User, Shield, Lock,
  Building2, GraduationCap, ChevronRight, CheckCircle2, Download, Calendar, Users
} from 'lucide-react';
import { exportToCSV } from '../../../utils/export';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminStaff = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const { data: staff, isLoading } = useQuery({
    queryKey: ['admin-staff-list'],
    queryFn: () => axios.get(`${API}/admin/staff`).then(r => r.data),
  });

  const createStaffMutation = useMutation({
    mutationFn: (newStaff: any) => axios.post(`${API}/admin/staff`, newStaff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-list'] });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsModalOpen(false);
        setFormData({
          name: '', email: '', password: 'password123', staffId: '',
          type: 'teaching', department: 'Computer Science & Eng', designation: 'Asst. Professor', phone: ''
        });
      }, 2000);
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/admin/staff/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-staff-list'] }),
  });

  const filteredStaff = staff?.filter((s: any) => {
    const search = searchTerm.toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(search);
    const idMatch = s.staffId?.toLowerCase().includes(search);
    const deptMatch = s.department?.toLowerCase().includes(search);
    const emailMatch = s.user?.email?.toLowerCase().includes(search);
    const designMatch = s.designation?.toLowerCase().includes(search);
    
    const matchesSearch = nameMatch || idMatch || deptMatch || emailMatch || designMatch;
    const matchesDept = filterDept === 'All' || s.department === filterDept;
    
    return matchesSearch && matchesDept;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffMutation.mutate(formData);
  };

  const departments = ['All', ...new Set((staff || []).map((s: any) => s.department))];

  return (
    <DashboardLayout title="Faculty & Staff Directory" subtitle="Manage university human resources across all administrative units">
      
      <div className="dash-card p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50">
        <div className="p-8 bg-white border-b border-slate-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
              <div className="relative flex-1 md:w-96 group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search faculty by name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="appearance-none pl-11 pr-12 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm outline-none cursor-pointer focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-600 min-w-[240px]"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'All' ? 'All University Units' : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full xl:w-auto">
              <button 
                onClick={() => exportToCSV(filteredStaff || [], 'Faculty_Registry')}
                className="flex items-center gap-3 px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
              >
                <Download size={18} /> Export Registry
              </button>
              <button 
              onClick={() => navigate('/admin/staff/register')}
              className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 hover:shadow-indigo-600/30 active:scale-95"
            >
              <div className="p-1 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-500">
                <Plus size={18} />
              </div>
              <span className="font-bold text-sm">Register New Faculty</span>
            </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-24 w-full rounded-3xl" />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-8 py-5">Faculty Identity</th>
                  <th>Core Department</th>
                  <th>Academic Designation</th>
                  <th>Communication</th>
                  <th>Status</th>
                  <th className="pr-8 text-right">Operations</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff?.map((s: any, i: number) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={s._id}
                    className="hover:bg-indigo-50/30 transition-colors group border-b border-slate-50 last:border-0"
                  >
                    <td className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
                            {s.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{s.name}</span>
                          <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.staffId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] uppercase font-black tracking-widest border border-indigo-100">
                        {s.department}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400"><Briefcase size={14} /></div>
                        {s.designation}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                        <Calendar size={12} className="text-slate-300" /> {s.assignedYear || 'All'}
                        <span className="w-1 h-1 rounded-full bg-slate-200 mx-1" />
                        <Users size={12} className="text-slate-300" /> {s.assignedSection || 'All'}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <Mail size={12} className="text-slate-300" /> {s.user?.email}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <Phone size={12} className="text-slate-300" /> {s.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      {s.onboardingStatus === 'incomplete' ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-amber-600 font-black text-[10px] uppercase tracking-tighter">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            Incomplete Profile
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Fast-tracked</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-tighter">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Active Service
                        </div>
                      )}
                    </td>
                    <td className="pr-8 py-6 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-100"><Eye size={18} /></button>
                        <button 
                          onClick={() => navigate(`/admin/staff/edit/${s._id}`)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-green-500 hover:text-white transition-all shadow-sm border border-slate-100"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Terminate staff records?')) deleteStaffMutation.mutate(s._id) }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {(!filteredStaff || filteredStaff.length === 0) && (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-slate-400 font-medium">
                      No faculty records found in the directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStaff;
