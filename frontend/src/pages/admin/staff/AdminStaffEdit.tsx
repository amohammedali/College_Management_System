import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Phone, Lock, Building2, 
  GraduationCap, Shield, ChevronRight, CheckCircle2, ShieldAlert,
  Eye, EyeOff, DollarSign, Users, Save, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminStaffEdit = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', type: 'teaching', department: '', designation: '', phone: '',
    counselorForClass: '', 
    assignedYear: 'All',
    assignedSection: 'All',
    salary: { base: '', allowances: '', deductions: '' }
  });

  // Fetch real departments from the governance module
  const { data: departmentList } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => axios.get(`${API}/admin/departments`).then(r => r.data),
  });

  // Fetch current staff data
  const { data: staff, isLoading } = useQuery({
    queryKey: ['admin-staff', id],
    queryFn: () => axios.get(`${API}/admin/staff`).then(r => {
        const found = r.data.find((s: any) => s._id === id);
        return found;
    }),
    enabled: !!id
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        type: staff.type || 'teaching',
        department: staff.department || '',
        designation: staff.designation || '',
        phone: staff.phone || '',
        counselorForClass: staff.counselorForClass || '',
        assignedYear: staff.assignedYear || 'All',
        assignedSection: staff.assignedSection || 'All',
        salary: {
          base: staff.salary?.base?.toString() || '',
          allowances: staff.salary?.allowances?.toString() || '',
          deductions: staff.salary?.deductions?.toString() || '',
        }
      });
    }
  }, [staff]);

  const departments = departmentList?.map((d: any) => d.name) || [];

  const updateStaffMutation = useMutation({
    mutationFn: (updates: any) => axios.put(`${API}/admin/staff/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-list'] });
      setIsSuccess(true);
      setTimeout(() => navigate('/admin/staff'), 2000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStaffMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-8"><div className="skeleton h-96 w-full rounded-3xl" /></div>;

  if (isSuccess) {
    return (
      <DashboardLayout title="Update Status" subtitle="Finalizing institutional modifications">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="dash-card p-12 text-center max-w-md w-full"
          >
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Updated!</h2>
            <p className="text-slate-500 font-medium mb-8">Faculty records have been updated successfully. Redirecting...</p>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }}
                className="h-full bg-indigo-500" 
              />
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Faculty Profile" subtitle="Modify institutional records and academic roles">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/admin/staff')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm group"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-indigo-50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            Back to Directory
          </button>
          <div className="px-4 py-1 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest">
            ID: {staff?.staffId}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Identity Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="dash-card p-8 md:col-span-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Profile Identity</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Legal Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input required type="text" className="form-input pl-11" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Dr. Jane Doe" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Designation</label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input required type="text" className="form-input pl-11" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} placeholder="Asst. Professor" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="dash-card p-8 md:col-span-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Phone size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Contact Details</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="text" className="form-input pl-11" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Email</label>
                    <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input disabled type="email" className="form-input pl-11 bg-slate-50 cursor-not-allowed" value={staff?.user?.email} />
                    </div>
                </div>
              </div>
            </motion.div>

            {/* Deployment Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="dash-card p-8 md:col-span-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Building2 size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Academic Deployment</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department / Unit</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <select 
                      required 
                      className="form-input pl-11 appearance-none" 
                      value={formData.department} 
                      onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                      <option value="">Select Unit</option>
                      {departments.map((dept: string) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Staff Role</label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    <select className="form-input pl-11 appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="teaching">Teaching (Faculty)</option>
                      <option value="non-teaching">Non-Teaching (Staff)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Academic Year</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    <select className="form-input pl-11 appearance-none" value={formData.assignedYear} onChange={e => setFormData({...formData, assignedYear: e.target.value})}>
                      <option value="All">All Years</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Section</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    <select className="form-input pl-11 appearance-none" value={formData.assignedSection} onChange={e => setFormData({...formData, assignedSection: e.target.value})}>
                      <option value="All">All Sections</option>
                      {departmentList?.find((d: any) => d.name === formData.department)
                        ? Array.from({ length: departmentList.find((d: any) => d.name === formData.department).totalSections || 1 }).map((_, i) => {
                            const sectionLetter = String.fromCharCode(65 + i);
                            return <option key={sectionLetter} value={sectionLetter}>Section {sectionLetter}</option>;
                          })
                        : <option value="A">Section A</option>
                      }
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Salary & Counseling Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="dash-card p-8 md:col-span-full"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Financial & Academic Setup</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Base Salary (Monthly)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="number" className="form-input pl-11" value={formData.salary.base} onChange={e => setFormData({...formData, salary: {...formData.salary, base: e.target.value}})} placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Counselor Assignment</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="text" className="form-input pl-11" value={formData.counselorForClass} onChange={e => setFormData({...formData, counselorForClass: e.target.value})} placeholder="e.g. B.Tech CSE - A" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button 
              type="button" onClick={() => navigate('/admin/staff')}
              className="px-8 py-4 bg-white text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors border border-slate-100"
            >
              Discard Changes
            </button>
            <button 
              disabled={updateStaffMutation.isPending}
              type="submit" 
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2 disabled:opacity-50"
            >
              {updateStaffMutation.isPending ? 'Saving...' : (
                <>Save Changes <Save size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminStaffEdit;
