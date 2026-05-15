import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Search, Plus, Eye, Edit, Trash2, Filter, GraduationCap, 
  ArrowRight, Download, Briefcase, CheckCircle2, XCircle
} from 'lucide-react';
import { exportToCSV } from '../../../utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminStudents = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterEligible, setFilterEligible] = useState('All');

  const { data: departmentList } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  const departments = departmentList?.map((d: any) => d.name) || [];

  // Use the new advanced filtering API
  const { data: students, isLoading } = useQuery({
    queryKey: ['admin-students-list', filterDept, filterEligible, searchTerm],
    queryFn: () => {
      let url = `${API}/admin/students?`;
      if (filterDept !== 'All') url += `department=${filterDept}&`;
      if (filterEligible !== 'All') url += `placementEligible=${filterEligible === 'Eligible'}&`;
      if (searchTerm) url += `search=${searchTerm}&`;
      return axios.get(url).then(r => r.data);
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`${API}/admin/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students-list'] });
      alert('Student record deleted successfully.');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${name}'s record and portal access?`)) {
      deleteStudentMutation.mutate(id);
    }
  };

  const exportPlacementList = async () => {
    try {
      const res = await axios.get(`${API}/admin/students/placement-ready`);
      const data = res.data.map((s: any) => ({
        Name: s.name,
        ID: s.studentId,
        RegNo: s.registerNumber,
        Dept: s.department,
        CGPA: s.performance?.currentCGPA,
        Skills: s.placementDetails?.skills?.join(', '),
        Email: s.user?.email,
        LinkedIn: s.placementDetails?.linkedInProfile
      }));
      exportToCSV(data, 'Placement_Ready_Scholars');
    } catch (e) {
      alert('Failed to generate placement list');
    }
  };

  return (
    <DashboardLayout title="Student Information System" subtitle="Institutional directory with placement and academic tracking">
      
      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="dash-card p-6 bg-white">
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Enrolled</p>
           <p className="text-3xl font-black text-slate-800">{students?.length || 0}</p>
        </div>
        <div className="dash-card p-6 bg-white border-emerald-100">
           <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">Placement Ready</p>
           <p className="text-3xl font-black text-emerald-600">
             {students?.filter((s: any) => s.placementDetails?.placementEligibilityStatus && s.performance?.currentCGPA >= 6).length || 0}
           </p>
        </div>
        <div className="dash-card p-6 bg-white border-amber-100">
           <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Avg CGPA</p>
           <p className="text-3xl font-black text-amber-600">
             {students?.length > 0 ? (students.reduce((acc: number, s: any) => acc + (s.performance?.currentCGPA || 0), 0) / students.length).toFixed(2) : '0.00'}
           </p>
        </div>
        <div className="dash-card p-6 bg-white">
           <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1">Departments</p>
           <p className="text-3xl font-black text-indigo-600">{departments.length}</p>
        </div>
      </div>

      <div className="dash-card p-0 overflow-hidden shadow-2xl shadow-slate-200/50">
        {/* Header/Toolbar Area */}
        <div className="p-8 bg-white border-b border-slate-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, ID or Reg No..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}
                  className="pl-6 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none cursor-pointer font-bold text-slate-600 min-w-[180px]"
                >
                  <option value="All">All Departments</option>
                  {departments.map((dept: string) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  value={filterEligible}
                  onChange={e => setFilterEligible(e.target.value)}
                  className="pl-6 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none cursor-pointer font-bold text-slate-600 min-w-[180px]"
                >
                  <option value="All">All Status</option>
                  <option value="Eligible">Placement Eligible</option>
                  <option value="Not Eligible">Not Eligible</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full xl:w-auto">
              <button 
                onClick={exportPlacementList}
                className="flex items-center gap-3 px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group"
              >
                <Briefcase size={16} className="group-hover:animate-bounce" /> Placement List
              </button>
              <button 
                onClick={() => navigate('/admin/students/register')}
                className="flex-1 xl:flex-none px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
              >
                <Plus size={16} /> Register Student
              </button>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-20 w-full rounded-2xl" />)}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="pl-8 py-5">Student Identity</th>
                  <th>Department</th>
                  <th>Placement Status</th>
                  <th>Performance</th>
                  <th>Status</th>
                  <th className="pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students?.map((s: any, i: number) => (
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    key={s._id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="pl-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                          <GraduationCap size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{s.name}</span>
                          <span className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-tight">{s.studentId}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                         <span className="badge badge-blue text-[9px] uppercase font-bold tracking-widest mb-1">{s.department}</span>
                         <span className="text-[10px] font-bold text-slate-500">{s.class}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {s.placementDetails?.placementEligibilityStatus ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                            <CheckCircle2 size={14} /> Eligible
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-400 font-black text-[10px] uppercase tracking-widest">
                            <XCircle size={14} /> Deferred
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-slate-700">CGPA: {s.performance?.currentCGPA || '0.00'}</span>
                         <span className="text-[9px] text-slate-400 font-bold uppercase">{s.performance?.activeBacklogs} Backlogs</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-green text-[10px] font-black uppercase tracking-widest">Active</span>
                    </td>
                    <td className="pr-8 py-6 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/student/profile/${s._id}`)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-primary-500 hover:text-white transition-all shadow-sm border border-slate-100"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/students/edit/${s._id}`)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-green-500 hover:text-white transition-all shadow-sm border border-slate-100"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(s._id, s.name)}
                          disabled={deleteStudentMutation.isPending}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-slate-100 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStudents;
